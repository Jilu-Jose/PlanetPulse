"""app/api/ai.py"""
import json
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.database import get_db
from app.models.activity import Activity
from app.models.ai_interaction import AIInteraction
from app.schemas.ai import AskRequest, AIResponse
from app.api.activities import get_session_id
from app.services.ai_service import get_rag_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/ask", response_model=AIResponse)
async def ask_ai(
    req: AskRequest,
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
):
    # Calculate user's total footprint for context
    total_e4 = db.scalar(
        select(func.sum(Activity.co2e_e4)).where(Activity.session_id == session_id)
    ) or 0
    total = total_e4 / 10000.0

    rag = get_rag_service()
    answer, sources = await rag.get_answer(req.question, total)

    status = "ok" if "AI is not configured" not in answer else "ai_unavailable"

    # Log interaction
    interaction = AIInteraction(
        session_id=session_id,
        kind="ask",
        prompt_summary=req.question[:500],
        response=answer,
        sources_json=json.dumps([s.model_dump() for s in sources]),
        status=status
    )
    db.add(interaction)
    db.commit()

    return AIResponse(
        status=status,
        text=answer,
        sources=sources,
        is_estimate=False
    )
