"""app/api/what_if.py"""
from fastapi import APIRouter, HTTPException
from app.schemas.what_if import WhatIfRequest, WhatIfResponse
from app.services.carbon_engine import compare, EngineValidationError
from app.services.emission_factor_service import EmissionFactorNotFoundError

router = APIRouter(prefix="/what-if", tags=["what-if"])


@router.post("", response_model=WhatIfResponse)
def calculate_what_if(req: WhatIfRequest):
    try:
        res = compare(
            req.current_category, req.current_activity, req.current_quantity, req.current_unit,
            req.alt_category, req.alt_activity, req.alt_quantity, req.alt_unit
        )
    except EngineValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except EmissionFactorNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    return WhatIfResponse(
        current_co2e_kg=res.current.co2e_kg,
        alt_co2e_kg=res.alt.co2e_kg,
        saving_kg=res.saving_kg,
        saving_pct=res.saving_pct,
        current_formula=res.current.formula_string,
        alt_formula=res.alt.formula_string
    )
