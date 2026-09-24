"""app/models/weekly_target.py – Weekly target ORM model."""
from datetime import date
from sqlalchemy import Date, Float, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class WeeklyTarget(Base):
    __tablename__ = "weekly_targets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    
    # Store target as exact int in units of 0.0001 kg just like co2e_e4
    target_e4: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # The week this target takes effect
    effective_week_start: Mapped[date] = mapped_column(Date, nullable=False)

    __table_args__ = (
        UniqueConstraint('session_id', 'effective_week_start', name='uix_session_week'),
    )

    @property
    def target_kg(self) -> float:
        return self.target_e4 / 10000.0
