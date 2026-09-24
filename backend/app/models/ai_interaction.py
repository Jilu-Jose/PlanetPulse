"""app/models/ai_interaction.py – AI interaction log."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class AIInteraction(Base):
    __tablename__ = "ai_interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)  # "insight" | "ask"
    prompt_summary: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    response: Mapped[str] = mapped_column(Text, nullable=False, default="")
    sources_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="ok")  # "ok" | "unavailable"
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
