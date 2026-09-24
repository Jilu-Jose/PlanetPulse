"""app/schemas/activity.py – Request/response schemas for activities."""
from __future__ import annotations

from datetime import date, datetime
from typing import Optional, Any

from pydantic import BaseModel, Field, field_validator


class ActivityCreate(BaseModel):
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
    entry_method: str
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


# ── Phase 8A: Quick Log Schemas ──────────────────────────────────────────────

class ParseRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    source: str = Field(..., pattern="^(text|voice)$")


class ParsedItemSchema(BaseModel):
    id: str
    activity_type: Optional[str]
    quantity: Optional[float]
    unit: Optional[str]
    occurred_on: Optional[date]
    source_span: str
    conversion_note: Optional[str]
    status: str
    message: Optional[str]
    co2e_kg: Optional[float]
    formula_string: Optional[str]
    flags: list[str] = Field(default_factory=list)
    needs_clarification: bool = False
    clarification_question: Optional[str] = None


class UnsupportedItemSchema(BaseModel):
    what: str
    source_span: str
    message: str


class ParseResponse(BaseModel):
    parser: str
    items: list[ParsedItemSchema]
    unsupported: list[UnsupportedItemSchema]
    total_preview_kg: float
    warnings: list[str] = Field(default_factory=list)


class BatchActivityCreate(BaseModel):
    source: str = Field(..., pattern="^(text|voice)$")
    items: list[ActivityCreate] = Field(..., max_length=10)


class BatchActivityResponse(BaseModel):
    items: list[ActivityResponse]
    total_kg_added: float
    target_status_change: Optional[dict[str, Any]] = None

