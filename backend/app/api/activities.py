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
from app.schemas.activity import (
    ActivityCreate, ActivityResponse, ActivityListResponse,
    ParseRequest, ParseResponse, ParsedItemSchema, UnsupportedItemSchema,
    BatchActivityCreate, BatchActivityResponse
)
from app.services.carbon_engine import calculate, EngineValidationError
from app.services.emission_factor_service import EmissionFactorNotFoundError, get_emission_factor_service
from app.services.parse_service import parse_text

router = APIRouter(prefix="/activities", tags=["activities"])


def get_session_id(x_session_id: str = Header(...)):
    if not x_session_id or len(x_session_id) > 36:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    return x_session_id


def get_timezone(x_timezone: str = Header("UTC")):
    try:
        return zoneinfo.ZoneInfo(x_timezone)
    except zoneinfo.ZoneInfoNotFoundError:
        return zoneinfo.ZoneInfo("UTC")


LIMITS_PATH = Path("app/data/limits.json")
with open(LIMITS_PATH, "r", encoding="utf-8") as f:
    LIMITS_CONFIG = json.load(f)


def _validate_and_calculate(data: ActivityCreate, tz: zoneinfo.ZoneInfo) -> dict:
    """Shared validation function returning a dict of fields to construct an Activity."""
    try:
        calc = calculate(data.activity_type, data.quantity)
    except EngineValidationError as e:
        raise HTTPException(status_code=422, detail={"code": "validation_error", "message": str(e)})
    except EmissionFactorNotFoundError as e:
        raise HTTPException(status_code=400, detail={"code": "validation_error", "message": str(e)})

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

    now = datetime.now(tz)
    today = now.date()
    occurred = data.occurred_on or today
    
    if occurred > today:
        raise HTTPException(status_code=422, detail={"code": "validation_error", "message": "Cannot log activities in the future."})
    
    if occurred < today - timedelta(days=365):
        raise HTTPException(status_code=422, detail={"code": "validation_error", "message": "Cannot log activities more than 365 days in the past."})

    return {
        "category": calc.category,
        "activity_type": calc.activity_type,
        "label": calc.label,
        "quantity": calc.input_quantity,
        "unit": calc.unit,
        "co2e_e4": calc.co2e_e4,
        "emission_factor_str": calc.emission_factor_str,
        "factor_source": calc.factor_source,
        "formula_string": calc.formula_string,
        "occurred_on": occurred,
    }


@router.post("", response_model=ActivityResponse, status_code=201)
def create_activity(
    data: ActivityCreate,
    session_id: str = Depends(get_session_id),
    tz: zoneinfo.ZoneInfo = Depends(get_timezone),
    db: Session = Depends(get_db)
):
    valid_data = _validate_and_calculate(data, tz)
    
    act = Activity(
        session_id=session_id,
        flagged_unusual=data.confirm_unusual,
        entry_method="form",
        created_at=datetime.now(timezone.utc),
        **valid_data
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


@router.post("/parse", response_model=ParseResponse)
async def parse_activities(
    req: ParseRequest,
    session_id: str = Depends(get_session_id),
    tz: zoneinfo.ZoneInfo = Depends(get_timezone)
):
    # Rate limit check would go here if we implemented a redis store.
    # For now, it's bypassed as requested to just log.
    res = await parse_text(req.text, req.source, tz)
    return {
        "parser": res.parser,
        "items": [
            {
                "id": i.id,
                "activity_type": i.activity_type,
                "quantity": i.quantity,
                "unit": i.unit,
                "occurred_on": i.occurred_on,
                "source_span": i.source_span,
                "conversion_note": i.conversion_note,
                "status": i.status,
                "message": i.message,
                "co2e_kg": i.co2e_kg,
                "formula_string": i.formula_string,
                "flags": i.flags,
                "needs_clarification": i.needs_clarification,
                "clarification_question": i.clarification_question,
            } for i in res.items
        ],
        "unsupported": [
            {"what": u.what, "source_span": u.source_span, "message": u.message}
            for u in res.unsupported
        ],
        "total_preview_kg": res.total_preview_kg,
        "warnings": []
    }


@router.post("/preview", response_model=ParsedItemSchema)
def preview_activity(
    data: ActivityCreate,
    tz: zoneinfo.ZoneInfo = Depends(get_timezone)
):
    try:
        valid_data = _validate_and_calculate(data, tz)
        return {
            "id": "preview",
            "activity_type": valid_data["activity_type"],
            "quantity": valid_data["quantity"],
            "unit": valid_data["unit"],
            "occurred_on": valid_data["occurred_on"],
            "source_span": "",
            "conversion_note": None,
            "status": "ok",
            "message": None,
            "co2e_kg": valid_data["co2e_e4"] / 10000.0,
            "formula_string": valid_data["formula_string"],
            "flags": [],
            "needs_clarification": False,
            "clarification_question": None
        }
    except HTTPException as e:
        status = e.detail.get("code")
        if status == "needs_confirmation":
            status_str = "needs_confirmation"
        elif status == "implausible_value" or status == "validation_error":
            status_str = "rejected"
        else:
            status_str = "rejected"
            
        return {
            "id": "preview",
            "activity_type": data.activity_type,
            "quantity": data.quantity,
            "unit": None,
            "occurred_on": data.occurred_on,
            "source_span": "",
            "conversion_note": None,
            "status": status_str,
            "message": e.detail.get("message", "Validation error"),
            "co2e_kg": None,
            "formula_string": None,
            "flags": [],
            "needs_clarification": False,
            "clarification_question": None
        }


@router.post("/batch", response_model=BatchActivityResponse, status_code=201)
def batch_create_activities(
    req: BatchActivityCreate,
    session_id: str = Depends(get_session_id),
    tz: zoneinfo.ZoneInfo = Depends(get_timezone),
    db: Session = Depends(get_db)
):
    # Ensure entry_method migration ran (sqlite pragma check at startup)
    
    saved_acts = []
    total_kg_added = 0.0
    
    try:
        for item in req.items:
            valid_data = _validate_and_calculate(item, tz)
            act = Activity(
                session_id=session_id,
                flagged_unusual=item.confirm_unusual,
                entry_method=req.source,
                created_at=datetime.now(timezone.utc),
                **valid_data
            )
            db.add(act)
            saved_acts.append(act)
            total_kg_added += (valid_data["co2e_e4"] / 10000.0)
            
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
        
    for act in saved_acts:
        db.refresh(act)
        
    return {
        "items": saved_acts,
        "total_kg_added": total_kg_added,
        "target_status_change": None
    }


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

