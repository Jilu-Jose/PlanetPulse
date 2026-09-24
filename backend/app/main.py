"""app/main.py"""
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models.database import init_db
from app.services.emission_factor_service import get_emission_factor_service
from app.api import meta, activities, dashboard, target, map
# from app.api import what_if, ai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting PlanetPulse API")
    init_db()
    get_emission_factor_service()  # Loads and validates factors
    yield
    # Shutdown
    logger.info("Shutting down")


app = FastAPI(
    title="PlanetPulse API",
    version="1.0.0",
    lifespan=lifespan
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An internal server error occurred."}}
    )


@app.get("/api/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "db": "connected",
        "ai_configured": settings.ai_is_configured
    }


app.include_router(meta.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(target.router, prefix="/api")
app.include_router(map.router)
# app.include_router(what_if.router, prefix="/api")
# app.include_router(ai.router, prefix="/api")
