"""app/models/activity.py – Activity ORM model."""
from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)

    category: Mapped[str] = mapped_column(String(64), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    label: Mapped[str] = mapped_column(String(256), nullable=False, default="")

    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(16), nullable=False)
    
    # Store CO2e in units of 0.0001 kg to avoid float drift (e.g., 20000 = 2.0000 kg)
    co2e_e4: Mapped[int] = mapped_column(Integer, nullable=False)

    emission_factor_str: Mapped[str] = mapped_column(String(64), nullable=False)
    factor_source: Mapped[str] = mapped_column(String(512), nullable=False, default="")

    formula_string: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    
    # DP2 requirement
    flagged_unusual: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    # Phase 8A
    entry_method: Mapped[str] = mapped_column(String(16), nullable=False, default="form")

    occurred_on: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    @property
    def co2e_kg(self) -> float:
        return self.co2e_e4 / 10000.0
