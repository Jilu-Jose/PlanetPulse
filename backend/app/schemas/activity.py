"""app/schemas/activity.py – Request/response schemas for activities."""
from __future__ import annotations

from datetime import date, datetime
from typing import Optional, Any

from pydantic import BaseModel, Field, field_validator


class ActivityCreate(BaseModel):
    # Only type is required in the brief now (and quantity)
    activity_type: str = Field(..., min_length=1, max_length=64)
    quantity: float = Field(..., gt=0)
    occurred_on: Optional[date] = None
    confirm_unusual: bool = False

    @field_validator("activity_type", mode="before")
    @classmethod
    def strip_whitespace(cls, v):
        return v.strip() if isinstance(v, str) else v


class ActivityResponse(BaseModel):
    id: int
    session_id: str
    category: str
    activity_type: str
    label: str
    quantity: float
    unit: str
    emission_factor_str: str
    factor_source: str
    co2e_kg: float
    formula_string: str
    flagged_unusual: bool
    occurred_on: date
    created_at: datetime
    
    target_status_change: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class ActivityListResponse(BaseModel):
    items: list[ActivityResponse]
    total: int
    page: int
    per_page: int
    total_kg: float
