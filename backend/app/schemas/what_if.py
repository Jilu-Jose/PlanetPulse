"""app/schemas/what_if.py"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel
from app.schemas.activity import ActivityResponse


class WhatIfRequest(BaseModel):
    current_category: str
    current_activity: str
    current_quantity: float
    current_unit: str

    alt_category: str
    alt_activity: str
    alt_quantity: float
    alt_unit: str


class WhatIfResponse(BaseModel):
    current_co2e_kg: float
    alt_co2e_kg: float
    saving_kg: float
    saving_pct: Optional[float]
    current_formula: str
    alt_formula: str
