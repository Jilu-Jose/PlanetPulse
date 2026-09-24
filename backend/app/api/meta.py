"""app/api/meta.py"""
from fastapi import APIRouter
from app.services.emission_factor_service import get_emission_factor_service
from app.config import get_settings

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/factors")
def get_factors():
    """Returns all categories, activities, and factor metadata.
    
    This drives the frontend dropdowns and the Methodology page.
    All six factors are from Code2Career Track 2 official brief (fixed).
    """
    svc = get_emission_factor_service()
    
    categories = svc.list_categories()
    result = {}
    for cat in categories:
        activities = svc.list_activities(cat)
        result[cat] = [
            {
                "activity_type": act.activity_type,
                "label": act.label,
                "factor": act._d["factor"],  # return as string for precision
                "unit": act.unit,
                "source": act.source,
                "source_url": act.source_url,
                "status": act.status,
            }
            for act in activities
        ]
        
    return {
        "version": svc.version,
        "categories": result
    }
