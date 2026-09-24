"""app/api/map.py"""
import json
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, List

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from pydantic import BaseModel, Field

from app.models.database import get_db
from app.models.map import SessionProfile, SimulatedRegionDaily
from app.models.activity import Activity
from app.config import get_settings
from app.services.forecast_service import forecast_region

router = APIRouter(prefix="", tags=["map"])

def get_session_id(x_session_id: str = Header(...)):
    if not x_session_id or len(x_session_id) > 36:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    return x_session_id

# Load regions
REGIONS_PATH = Path("app/data/regions.json")
with open(REGIONS_PATH, "r", encoding="utf-8") as f:
    REGIONS_DATA = json.load(f)
REGIONS_DICT = {r["id"]: r for r in REGIONS_DATA}


# ── Profile Schemas ──────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel, extra="forbid"):
    region_id: Optional[str] = Field(None)
    share_to_map: bool = False


class ProfileResponse(BaseModel):
    session_id: str
    region_id: Optional[str]
    share_to_map: bool


@router.put("/api/profile/region", response_model=ProfileResponse)
def update_profile(
    data: ProfileUpdate,
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
):
    if data.region_id and data.region_id not in REGIONS_DICT:
        raise HTTPException(status_code=422, detail="Invalid region_id")

    profile = db.get(SessionProfile, session_id)
    if not profile:
        profile = SessionProfile(session_id=session_id)
        db.add(profile)

    profile.region_id = data.region_id
    profile.share_to_map = data.share_to_map
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)

    return {
        "session_id": profile.session_id,
        "region_id": profile.region_id,
        "share_to_map": profile.share_to_map
    }


@router.get("/api/profile", response_model=ProfileResponse)
def get_profile(
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
):
    profile = db.get(SessionProfile, session_id)
    if not profile:
        return {"session_id": session_id, "region_id": None, "share_to_map": False}
    return {
        "session_id": profile.session_id,
        "region_id": profile.region_id,
        "share_to_map": profile.share_to_map
    }


# ── Map Aggregation & Forecasting ──────────────────────────────────────────────

_MAP_CACHE = {}

def get_actuals(db: Session, target_date: date, k_min: int):
    """Compute real aggregates for a given date. Returns dict {region_id: (mean_kg, n_users)}"""
    # Join Activity with SessionProfile where share_to_map=True
    stmt = (
        select(
            SessionProfile.region_id,
            func.count(func.distinct(Activity.session_id)).label("n_users"),
            func.sum(Activity.co2e_e4).label("total_e4")
        )
        .join(Activity, Activity.session_id == SessionProfile.session_id)
        .where(
            Activity.occurred_on == target_date,
            SessionProfile.share_to_map == True,
            SessionProfile.region_id != None
        )
        .group_by(SessionProfile.region_id)
    )
    results = db.execute(stmt).all()
    
    real_data = {}
    for region_id, n_users, total_e4 in results:
        if n_users >= k_min:
            real_data[region_id] = ((total_e4 / 10000.0) / n_users, n_users)
            
    return real_data

def build_timeseries_for_region(db: Session, region_id: str, end_date: date, days: int, k_min: int):
    """Get chronological timeseries up to end_date (inclusive). 
       Blends real and simulated (if real not k-anonymous)."""
    start_date = end_date - timedelta(days=days-1)
    
    # 1. Fetch real aggregates
    stmt = (
        select(
            Activity.occurred_on,
            func.count(func.distinct(Activity.session_id)).label("n_users"),
            func.sum(Activity.co2e_e4).label("total_e4")
        )
        .join(SessionProfile, Activity.session_id == SessionProfile.session_id)
        .where(
            SessionProfile.region_id == region_id,
            SessionProfile.share_to_map == True,
            Activity.occurred_on >= start_date,
            Activity.occurred_on <= end_date
        )
        .group_by(Activity.occurred_on)
        .order_by(Activity.occurred_on)
    )
    real_rows = db.execute(stmt).all()
    real_dict = {d: ((e4 / 10000.0) / n, n) for d, n, e4 in real_rows if n >= k_min}
    
    # 2. Fetch simulated
    sim_stmt = (
        select(SimulatedRegionDaily.date, SimulatedRegionDaily.kg_per_user)
        .where(
            SimulatedRegionDaily.region_id == region_id,
            SimulatedRegionDaily.date >= start_date,
            SimulatedRegionDaily.date <= end_date
        )
    )
    sim_rows = db.execute(sim_stmt).all()
    sim_dict = {d: kg for d, kg in sim_rows}
    
    # 3. Assemble chronological array
    ts = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        if d in real_dict:
            ts.append(real_dict[d][0])
        elif d in sim_dict:
            ts.append(sim_dict[d])
        else:
            # Fallback if seed data is missing for some reason
            ts.append(7.5) 
            
    return ts


@router.get("/api/map/regions")
def get_map_regions(
    offset: int = Query(0, ge=-7, le=7),
    db: Session = Depends(get_db)
):
    settings = get_settings()
    k_min = 5
    
    # Cache key
    today = datetime.now(timezone.utc).date()
    cache_key = f"{today.isoformat()}_{offset}"
    
    if cache_key in _MAP_CACHE:
        cache_time, cached_data = _MAP_CACHE[cache_key]
        if (datetime.now() - cache_time).total_seconds() < 60: # 60s cache
            return cached_data
            
    target_date = today + timedelta(days=offset)
    is_forecast = offset >= 0
    
    response_regions = []
    
    if not is_forecast:
        # Actuals: blend real and simulated per region
        real_data = get_actuals(db, target_date, k_min)
        
        sim_stmt = select(SimulatedRegionDaily).where(SimulatedRegionDaily.date == target_date)
        sim_data = {r.region_id: r for r in db.scalars(sim_stmt).all()}
        
        for reg in REGIONS_DATA:
            rid = reg["id"]
            if rid in real_data:
                val, n_users = real_data[rid]
                response_regions.append({
                    "region_id": rid, "name": reg["name"], "state": reg["state"],
                    "lat": reg["lat"], "lng": reg["lng"],
                    "value_kg_per_user_day": val,
                    "lower": val, "upper": val,
                    "source": "real",
                    "contributors": n_users,
                    "confidence": "actual"
                })
            else:
                sim = sim_data.get(rid)
                val = sim.kg_per_user if sim else 7.5
                n_users = sim.n_users if sim else 15
                response_regions.append({
                    "region_id": rid, "name": reg["name"], "state": reg["state"],
                    "lat": reg["lat"], "lng": reg["lng"],
                    "value_kg_per_user_day": val,
                    "lower": val, "upper": val,
                    "source": "simulated",
                    "contributors": n_users,
                    "confidence": "actual"
                })
    else:
        # Forecasts: for each region, build 60-day timeseries ending yesterday, run forecast
        yesterday = today - timedelta(days=1)
        horizon = offset
        
        for reg in REGIONS_DATA:
            rid = reg["id"]
            ts = build_timeseries_for_region(db, rid, yesterday, 60, k_min)
            
            # Use deterministic forecast_service
            forecasts = forecast_region(ts, horizon=horizon)
            fc = next((f for f in forecasts if f["offset"] == horizon), None)
            
            if fc:
                response_regions.append({
                    "region_id": rid, "name": reg["name"], "state": reg["state"],
                    "lat": reg["lat"], "lng": reg["lng"],
                    "value_kg_per_user_day": fc["point"],
                    "lower": fc["lower"], "upper": fc["upper"],
                    "source": "simulated", # Treat forecasts as simulated for UI badge
                    "contributors": 0,
                    "confidence": fc["confidence"]
                })
                
    vals = [r["value_kg_per_user_day"] for r in response_regions]
    legend_min = min(vals) if vals else 0
    legend_max = max(vals) if vals else 15
    national_mean = sum(vals) / len(vals) if vals else 0

    out = {
        "date": target_date.isoformat(),
        "kind": "forecast" if is_forecast else "actual",
        "k_min": k_min,
        "legend": {"min": legend_min, "max": legend_max},
        "national_mean": round(national_mean, 2),
        "regions": response_regions
    }
    
    _MAP_CACHE[cache_key] = (datetime.now(), out)
    return out


@router.get("/api/map/me")
def get_map_me(
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db)
):
    profile = db.get(SessionProfile, session_id)
    if not profile or not profile.share_to_map or not profile.region_id:
        raise HTTPException(status_code=400, detail="User not opted in to map sharing")
        
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=7)
    yesterday = today - timedelta(days=1)
    
    # User's 7-day mean
    user_stmt = select(func.sum(Activity.co2e_e4)).where(
        Activity.session_id == session_id,
        Activity.occurred_on >= start_date,
        Activity.occurred_on <= yesterday
    )
    user_total_e4 = db.scalar(user_stmt) or 0
    
    # Count distinct days user logged
    user_days_stmt = select(func.count(func.distinct(Activity.occurred_on))).where(
        Activity.session_id == session_id,
        Activity.occurred_on >= start_date,
        Activity.occurred_on <= yesterday
    )
    user_days = db.scalar(user_days_stmt) or 1
    
    my_mean = (user_total_e4 / 10000.0) / max(1, user_days)
    
    # Region's 7-day mean
    ts = build_timeseries_for_region(db, profile.region_id, yesterday, 7, 5)
    region_mean = sum(ts) / len(ts) if ts else 0
    
    return {
        "my_7d_mean": round(my_mean, 2),
        "region_7d_mean": round(region_mean, 2),
        "region_id": profile.region_id
    }

