"""app/api/target.py – Feature 4: Weekly Target API."""
import zoneinfo
from datetime import date, timedelta, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.database import get_db
from app.models.activity import Activity
from app.models.weekly_target import WeeklyTarget
from app.api.activities import get_session_id, get_timezone

router = APIRouter(prefix="/target", tags=["target"])


# ─── Config ───────────────────────────────────────────────────────────────────
WEEK_START_DOW = 0  # 0 = Monday (ISO 8601)
THRESHOLD_APPROACHING = Decimal("80")   # 80% → approaching
THRESHOLD_EXCEEDED    = Decimal("100")  # >100% → exceeded


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_week_start(d: date) -> date:
    """Return Monday of the ISO week containing d."""
    return d - timedelta(days=d.weekday())  # Monday=0


def get_active_target(session_id: str, week_start: date, db: Session) -> Optional[WeeklyTarget]:
    """Get the most recent target that was set on or before the given week_start."""
    row = db.scalars(
        select(WeeklyTarget)
        .where(WeeklyTarget.session_id == session_id)
        .where(WeeklyTarget.effective_week_start <= week_start)
        .order_by(WeeklyTarget.effective_week_start.desc())
        .limit(1)
    ).first()
    return row


def _compute_progress(
    session_id: str,
    week_start: date,
    tz: zoneinfo.ZoneInfo,
    db: Session
) -> dict:
    week_end = week_start + timedelta(days=6)
    today = datetime.now(tz).date()

    # Day of week 1=Monday, 7=Sunday
    day_of_week = (today - week_start).days + 1 if week_start <= today <= week_end else 7
    days_remaining = max(0, (week_end - today).days)

    # Total used this week (from activities)
    used_e4 = db.scalar(
        select(func.sum(Activity.co2e_e4))
        .where(Activity.session_id == session_id)
        .where(Activity.occurred_on >= week_start)
        .where(Activity.occurred_on <= week_end)
    ) or 0
    used_kg = Decimal(used_e4) / Decimal("10000")

    # Get active target
    target_row = get_active_target(session_id, week_start, db)

    if target_row is None:
        return {
            "week_start": week_start.isoformat(),
            "week_end": week_end.isoformat(),
            "day_of_week": day_of_week,
            "days_remaining": days_remaining,
            "target_kg": None,
            "used_kg": float(used_kg),
            "remaining_kg": None,
            "percent_used": None,
            "expected_kg_by_now": None,
            "pace": None,
            "status": "no_target",
            "exceeded_by_kg": 0.0,
            "top_contributor": _get_top_contributor(session_id, week_start, week_end, db),
            "suggestion": None,
            "budget_per_remaining_day_kg": None,
        }

    target_kg = Decimal(str(target_row.target_kg))
    remaining_kg = target_kg - used_kg
    percent_used = (used_kg / target_kg * Decimal("100")) if target_kg > 0 else Decimal("0")

    # Status thresholds
    if percent_used > THRESHOLD_EXCEEDED:
        status = "exceeded"
    elif percent_used >= THRESHOLD_APPROACHING:
        status = "approaching"
    else:
        status = "on_track"

    exceeded_by_kg = max(Decimal("0"), used_kg - target_kg)

    # Expected pace marker: target × day_of_week / 7
    expected_kg_by_now = (target_kg * Decimal(str(day_of_week)) / Decimal("7")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    # Pace chip
    if used_kg > expected_kg_by_now:
        pace = "behind"
    elif used_kg < expected_kg_by_now * Decimal("0.9"):
        pace = "ahead"
    else:
        pace = "on_pace"

    # Budget per remaining day
    budget_per_remaining_day_kg = None
    if days_remaining > 0:
        budget_per_remaining_day_kg = float(
            (remaining_kg / Decimal(str(days_remaining))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
        )

    # Suggestion for exceeded state (rule-based, no AI)
    suggestion = None
    if status == "exceeded":
        suggestion = _compute_suggestion(session_id, week_start, week_end, db)

    return {
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "day_of_week": day_of_week,
        "days_remaining": days_remaining,
        "target_kg": float(target_kg),
        "used_kg": float(used_kg),
        "remaining_kg": float(remaining_kg),
        "percent_used": float(percent_used.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
        "expected_kg_by_now": float(expected_kg_by_now),
        "pace": pace,
        "status": status,
        "exceeded_by_kg": float(exceeded_by_kg.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
        "top_contributor": _get_top_contributor(session_id, week_start, week_end, db),
        "suggestion": suggestion,
        "budget_per_remaining_day_kg": budget_per_remaining_day_kg,
    }


def _get_top_contributor(session_id: str, week_start: date, week_end: date, db: Session):
    """Get the top activity type by total co2e this week."""
    row = db.execute(
        select(Activity.activity_type, func.sum(Activity.co2e_e4).label("total"))
        .where(Activity.session_id == session_id)
        .where(Activity.occurred_on >= week_start)
        .where(Activity.occurred_on <= week_end)
        .group_by(Activity.activity_type)
        .order_by(func.sum(Activity.co2e_e4).desc())
        .limit(1)
    ).first()

    if row is None:
        return None

    return {"type": row.activity_type, "kg": round(row.total / 10000.0, 2)}


def _compute_suggestion(session_id: str, week_start: date, week_end: date, db: Session):
    """
    Generate one concrete deterministic suggestion based on this week's data.
    Rule: find top car trip total this week; suggest swapping for bus.
    """
    car_total = db.scalar(
        select(func.sum(Activity.co2e_e4))
        .where(Activity.session_id == session_id)
        .where(Activity.activity_type == "car")
        .where(Activity.occurred_on >= week_start)
        .where(Activity.occurred_on <= week_end)
    ) or 0

    if car_total > 0:
        car_qty_sum = db.scalar(
            select(func.sum(Activity.quantity))
            .where(Activity.session_id == session_id)
            .where(Activity.activity_type == "car")
            .where(Activity.occurred_on >= week_start)
            .where(Activity.occurred_on <= week_end)
        ) or 0
        # car = 0.20, bus = 0.08, saving = 0.12 per km
        saving_kg = round(car_qty_sum * 0.12, 2)
        return {
            "text": f"Swapping {car_qty_sum:.0f} km of car for bus would save {saving_kg} kg CO₂ this week.",
            "saving_kg": saving_kg
        }

    # Fallback: suggest veg meal swap
    non_veg_total = db.scalar(
        select(func.sum(Activity.co2e_e4))
        .where(Activity.session_id == session_id)
        .where(Activity.activity_type == "non_veg_meal")
        .where(Activity.occurred_on >= week_start)
        .where(Activity.occurred_on <= week_end)
    ) or 0

    if non_veg_total > 0:
        non_veg_qty = db.scalar(
            select(func.sum(Activity.quantity))
            .where(Activity.session_id == session_id)
            .where(Activity.activity_type == "non_veg_meal")
            .where(Activity.occurred_on >= week_start)
            .where(Activity.occurred_on <= week_end)
        ) or 0
        # non_veg = 2.0, veg = 0.5, saving = 1.5 per meal
        saving_kg = round(non_veg_qty * 1.5, 2)
        return {
            "text": f"Swapping {non_veg_qty:.0f} non-vegetarian meal(s) for vegetarian would save {saving_kg} kg CO₂ this week.",
            "saving_kg": saving_kg
        }

    return None


# ─── Endpoints ────────────────────────────────────────────────────────────────

class TargetSetRequest(BaseModel):
    target_kg: float = Field(..., gt=0, le=10000, description="Weekly CO₂ target in kg (2 decimal max)")


@router.put("")
def set_target(
    data: TargetSetRequest,
    session_id: str = Depends(get_session_id),
    tz: zoneinfo.ZoneInfo = Depends(get_timezone),
    db: Session = Depends(get_db)
):
    # Validate 2 decimal max
    d = Decimal(str(data.target_kg))
    if d.as_tuple().exponent < -2:
        raise HTTPException(status_code=422, detail="target_kg cannot have more than 2 decimal places.")

    today = datetime.now(tz).date()
    week_start = get_week_start(today)
    target_e4 = int((d * Decimal("10000")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    # Upsert for the current week
    existing = db.scalars(
        select(WeeklyTarget)
        .where(WeeklyTarget.session_id == session_id)
        .where(WeeklyTarget.effective_week_start == week_start)
    ).first()

    if existing:
        existing.target_e4 = target_e4
    else:
        db.add(WeeklyTarget(
            session_id=session_id,
            target_e4=target_e4,
            effective_week_start=week_start,
        ))

    db.commit()
    return {"target_kg": float(d), "effective_week_start": week_start.isoformat()}


@router.get("/progress")
def get_progress(
    week_start: Optional[str] = Query(None),
    session_id: str = Depends(get_session_id),
    tz: zoneinfo.ZoneInfo = Depends(get_timezone),
    db: Session = Depends(get_db)
):
    if week_start:
        try:
            ws = date.fromisoformat(week_start)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid week_start format. Use YYYY-MM-DD.")
    else:
        today = datetime.now(tz).date()
        ws = get_week_start(today)

    return _compute_progress(session_id, ws, tz, db)


@router.get("/weeks")
def get_past_weeks(
    count: int = Query(4, ge=1, le=52),
    session_id: str = Depends(get_session_id),
    tz: zoneinfo.ZoneInfo = Depends(get_timezone),
    db: Session = Depends(get_db)
):
    """Return recent weeks with used vs target for a trend chart."""
    today = datetime.now(tz).date()
    current_week_start = get_week_start(today)
    weeks = []

    for i in range(count):
        ws = current_week_start - timedelta(weeks=i)
        we = ws + timedelta(days=6)
        used_e4 = db.scalar(
            select(func.sum(Activity.co2e_e4))
            .where(Activity.session_id == session_id)
            .where(Activity.occurred_on >= ws)
            .where(Activity.occurred_on <= we)
        ) or 0
        used_kg = used_e4 / 10000.0

        target_row = get_active_target(session_id, ws, db)
        target_kg = target_row.target_kg if target_row else None

        weeks.append({
            "week_start": ws.isoformat(),
            "week_end": we.isoformat(),
            "used_kg": round(used_kg, 2),
            "target_kg": target_kg,
        })

    return {"weeks": weeks}
