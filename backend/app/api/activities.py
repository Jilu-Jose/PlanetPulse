"""app/api/activities.py"""
import json
import zoneinfo
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.database import get_db
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityResponse, ActivityListResponse
from app.services.carbon_engine import calculate, EngineValidationError
from app.services.emission_factor_service import EmissionFactorNotFoundError, get_emission_factor_service

router = APIRouter(prefix="/activities", tags=["activities"])


def get_session_id(x_session_id: str = Header(...)):
    """Extract session ID from headers; used to isolate users."""
    if not x_session_id or len(x_session_id) > 36:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    return x_session_id


def get_timezone(x_timezone: str = Header("UTC")):
    """Extract timezone from headers and validate against zoneinfo."""
    try:
        return zoneinfo.ZoneInfo(x_timezone)
    except zoneinfo.ZoneInfoNotFoundError:
        return zoneinfo.ZoneInfo("UTC")


# Load limits.json for DP2
LIMITS_PATH = Path("app/data/limits.json")
with open(LIMITS_PATH, "r", encoding="utf-8") as f:
    LIMITS_CONFIG = json.load(f)


@router.post("", response_model=ActivityResponse, status_code=201)
def create_activity(
    data: ActivityCreate,
    session_id: str = Depends(get_session_id),
    tz: zoneinfo.ZoneInfo = Depends(get_timezone),
    db: Session = Depends(get_db)
):
    # Calculate will handle unit parsing and precision validation
    try:
        calc = calculate(data.activity_type, data.quantity)
    except EngineValidationError as e:
        raise HTTPException(status_code=422, detail={"code": "validation_error", "message": str(e)})
    except EmissionFactorNotFoundError as e:
        raise HTTPException(status_code=400, detail={"code": "validation_error", "message": str(e)})

    # DP2 Limit checks
    limit_cfg = LIMITS_CONFIG.get(data.activity_type)
    if limit_cfg:
        soft_limit = limit_cfg["soft"]
        hard_limit = limit_cfg["hard"]
        hard_message = limit_cfg["hard_message"].format(quantity=data.quantity, unit=calc.unit, hard=hard_limit)

        if data.quantity > hard_limit:
            raise HTTPException(
                status_code=422,
                detail={"code": "implausible_value", "message": hard_message}
            )
        
        if data.quantity > soft_limit and not data.confirm_unusual:
            raise HTTPException(
                status_code=409,
                detail={"code": "needs_confirmation", "message": f"That's a lot for one entry. Is {data.quantity} {calc.unit} correct?"}
            )

    # Date Validation
    now = datetime.now(tz)
    today = now.date()
    occurred = data.occurred_on or today
    
    if occurred > today:
        raise HTTPException(status_code=422, detail={"code": "validation_error", "message": "Cannot log activities in the future."})
    
    if occurred < today - timedelta(days=365):
        raise HTTPException(status_code=422, detail={"code": "validation_error", "message": "Cannot log activities more than 365 days in the past."})

    act = Activity(
        session_id=session_id,
        category=calc.category,
        activity_type=calc.activity_type,
        label=calc.label,
        quantity=calc.input_quantity,
        unit=calc.unit,
        co2e_e4=calc.co2e_e4,
        emission_factor_str=calc.emission_factor_str,
        factor_source=calc.factor_source,
        formula_string=calc.formula_string,
        flagged_unusual=data.confirm_unusual,
        occurred_on=occurred,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(act)
    db.commit()
    db.refresh(act)
    
    # Feature 4: target_status_change will be injected later when implementing Weekly Target
    
    return act


@router.get("", response_model=ActivityListResponse)
def list_activities(
    types: Optional[str] = Query(None, description="Comma separated list of activity types"),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
):
    if date_from and date_to and date_from > date_to:
        raise HTTPException(status_code=422, detail="date_from cannot be after date_to")

    query = select(Activity).where(Activity.session_id == session_id)
    
    if types:
        type_list = [t.strip() for t in types.split(",") if t.strip()]
        
        # Validate types
        svc = get_emission_factor_service()
        valid_types = list(svc._type_map.keys())
        for t in type_list:
            if t not in valid_types:
                raise HTTPException(status_code=422, detail=f"Unknown activity type: {t}")
                
        if type_list:
            query = query.where(Activity.activity_type.in_(type_list))

    if date_from:
        query = query.where(Activity.occurred_on >= date_from)
    if date_to:
        query = query.where(Activity.occurred_on <= date_to)
        
    query = query.order_by(Activity.occurred_on.desc(), Activity.created_at.desc())
    
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(query.offset((page - 1) * per_page).limit(per_page)).all()
    
    # Calculate total kg for the filtered list
    total_e4 = db.scalar(select(func.sum(Activity.co2e_e4)).select_from(query.subquery())) or 0
    total_kg = total_e4 / 10000.0
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_kg": total_kg
    }


@router.delete("/{activity_id}", status_code=204)
def delete_activity(
    activity_id: int,
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
):
    act = db.get(Activity, activity_id)
    if not act or act.session_id != session_id:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    db.delete(act)
    db.commit()
    return None
