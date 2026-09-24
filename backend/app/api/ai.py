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

    # Fetch breakdown by category
    cat_totals = db.execute(
        select(Activity.category, func.sum(Activity.co2e_e4))
        .where(Activity.session_id == session_id)
        .group_by(Activity.category)
    ).all()
    breakdown = ", ".join([f"{cat}: {val/10000.0:.2f} kg CO2e" for cat, val in cat_totals]) or "None"

    # Fetch recent activities
    recent = db.execute(
        select(Activity.activity_type, Activity.quantity, Activity.unit, Activity.co2e_e4)
        .where(Activity.session_id == session_id)
        .order_by(Activity.created_at.desc())
        .limit(15)
    ).all()
    recent_str = "; ".join([f"{r.activity_type} ({r.quantity} {r.unit}) -> {r.co2e_e4/10000.0:.2f} kg" for r in recent]) or "None"
    
    context_data = f"Category Totals: {breakdown}\nRecent Logged Activities (latest first): {recent_str}"

    rag = get_rag_service()
    answer, sources = await rag.get_answer(req.question, total, context_data)

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
