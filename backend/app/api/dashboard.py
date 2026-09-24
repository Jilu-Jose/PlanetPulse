"""app/api/dashboard.py"""
import zoneinfo
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.database import get_db
from app.models.activity import Activity
from app.schemas.dashboard import DashboardResponse, CategoryTotals, Contributor, TrendPoint
from app.api.activities import get_session_id, get_timezone
from app.api import target as target_api

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _get_intensity(pct: float) -> str:
    if pct > 40:
        return "high"
    elif pct > 15:
        return "moderate"
    return "standard"


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    range_param: str = Query("week", alias="range", pattern="^(today|week|month)$"),
    session_id: str = Depends(get_session_id),
    tz: zoneinfo.ZoneInfo = Depends(get_timezone),
    db: Session = Depends(get_db)
):
    today = date.today()
    if range_param == "today":
        start_date = today
        prev_start = today - timedelta(days=1)
        prev_end = prev_start
        days = 1
    elif range_param == "week":
        start_date = today - timedelta(days=6)  # 7 days including today
        prev_start = start_date - timedelta(days=7)
        prev_end = start_date - timedelta(days=1)
        days = 7
    else:  # month
        start_date = today - timedelta(days=29) # 30 days
        prev_start = start_date - timedelta(days=30)
        prev_end = start_date - timedelta(days=1)
        days = 30

    # Current period total & categories
    query_curr = select(Activity.category, (func.sum(Activity.co2e_e4) / 10000.0).label("total"))\
        .where(Activity.session_id == session_id)\
        .where(Activity.occurred_on >= start_date)\
        .group_by(Activity.category)
    
    cat_totals = {row.category: row.total for row in db.execute(query_curr)}
    total_curr = sum(cat_totals.values())
    
    # Prev period total
    query_prev = select(func.sum(Activity.co2e_e4) / 10000.0)\
        .where(Activity.session_id == session_id)\
        .where(Activity.occurred_on.between(prev_start, prev_end))
    
    total_prev = db.scalar(query_prev) or 0.0
    
    # Comparison
    if total_prev == 0 and total_curr == 0:
        comparison_pct = 0.0
    elif total_prev == 0:
        comparison_pct = 100.0
    else:
        comparison_pct = ((total_curr - total_prev) / total_prev) * 100.0
        
    comp_label = "vs previous period"
    if range_param == "today":
        comp_label = "vs yesterday"
    elif range_param == "week":
        comp_label = "vs last week"
    elif range_param == "month":
        comp_label = "vs last month"

    # Category breakdown
    categories: List[CategoryTotals] = []
    for cat in ["travel", "food", "electricity"]:
        val = cat_totals.get(cat, 0.0)
        pct = (val / total_curr * 100) if total_curr > 0 else 0.0
        categories.append(CategoryTotals(
            category=cat,
            co2e_kg=round(val, 2),
            percentage=round(pct, 1)
        ))

    # Top contributors (all time for current session_id, or just current period?)
    # Brief says "Top contributors list". We'll do current period.
    query_top = select(Activity)\
        .where(Activity.session_id == session_id)\
        .where(Activity.occurred_on >= start_date)\
        .order_by(Activity.co2e_e4.desc())\
        .limit(5)
    
    top_activities = db.scalars(query_top).all()
    contributors: List[Contributor] = []
    
    # For intensity, we compare against daily average
    daily_avg = total_curr / days if days > 0 else 0
    
    for act in top_activities:
        # pct of daily average (as per mockup, "57% of daily")
        pct_of_daily = (act.co2e_kg / daily_avg * 100) if daily_avg > 0 else 0
        contributors.append(Contributor(
            id=act.id,
            category=act.category,
            activity_type=act.activity_type,
            label=act.label,
            co2e_kg=round(act.co2e_kg, 2),
            percentage_of_daily=round(pct_of_daily, 0),
            intensity_badge=_get_intensity(pct_of_daily),
            description=f"{act.quantity} {act.unit}"
        ))

    # Trend (last 7 days regardless of range, as per mockup "7-Day Footprint Trend")
    trend_start = today - timedelta(days=6)
    query_trend = select(Activity.occurred_on, func.sum(Activity.co2e_e4) / 10000.0)\
        .where(Activity.session_id == session_id)\
        .where(Activity.occurred_on >= trend_start)\
        .group_by(Activity.occurred_on)
        
    trend_data = {row[0]: row[1] for row in db.execute(query_trend)}
    
    trend: List[TrendPoint] = []
    for i in range(7):
        d = trend_start + timedelta(days=i)
        lbl = d.strftime("%a")
        if d == today:
            lbl = "Today"
        trend.append(TrendPoint(
            date=d.isoformat(),
            co2e_kg=round(trend_data.get(d, 0.0), 2),
            label=lbl
        ))

    # Inject weekly target progress
    weekly_progress = target_api._compute_progress(session_id, target_api.get_week_start(today), tz, db)

    return DashboardResponse(
        total_co2e_kg=round(total_curr, 2),
        comparison_vs_previous_pct=round(comparison_pct, 1),
        comparison_label=comp_label,
        categories=categories,
        top_contributors=contributors,
        trend=trend,
        daily_average_kg=round(daily_avg, 2),
        weekly_target_progress=weekly_progress
    )


@router.get("/footprint")
def get_footprint(
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
):
    """Just the totals, used by AI context."""
    total = db.scalar(
        select(func.sum(Activity.co2e_e4) / 10000.0).where(Activity.session_id == session_id)
    ) or 0.0
    return {"total_co2e_kg": round(total, 2)}
