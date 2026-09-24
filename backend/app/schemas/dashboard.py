"""app/schemas/dashboard.py"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class CategoryTotals(BaseModel):
    category: str
    co2e_kg: float
    percentage: float


class Contributor(BaseModel):
    id: int
    category: str
    activity_type: str
    label: str
    co2e_kg: float
    percentage_of_daily: float
    intensity_badge: str  # "high" | "moderate" | "standard"
    description: str


class TrendPoint(BaseModel):
    date: str
    co2e_kg: float
    label: str  # "Mon", "Tue", etc.


class DashboardResponse(BaseModel):
    total_co2e_kg: float
    comparison_vs_previous_pct: float
    comparison_label: str
    categories: List[CategoryTotals]
    top_contributors: List[Contributor]
    trend: List[TrendPoint]
    daily_average_kg: float
    weekly_target_progress: Optional[dict] = None  # injected from target API
