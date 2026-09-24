"""app/models/map.py – Carbon Pulse Map models."""
from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class SessionProfile(Base):
    __tablename__ = "session_profiles"

    session_id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    region_id: Mapped[str] = mapped_column(String(64), nullable=True, index=True)
    share_to_map: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class SimulatedRegionDaily(Base):
    __tablename__ = "simulated_region_daily"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    region_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    kg_per_user: Mapped[float] = mapped_column(Float, nullable=False)
    n_users: Mapped[int] = mapped_column(Integer, nullable=False)

