"""
app/config.py  –  single source of truth for all settings.
Reads from environment variables / .env file using pydantic-settings.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── LLM ───────────────────────────────────────────────────────────────────
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.groq.com/openai/v1"
    MODEL_NAME: str = "gpt OSS 120b"
    LLM_TIMEOUT: float = 15.0
    LLM_RETRIES: int = 1

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./planetpulse.db"

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:4173"

    # ── Server ────────────────────────────────────────────────────────────────
    PORT: int = 8000

    # ── Data ──────────────────────────────────────────────────────────────────
    EMISSION_FACTORS_PATH: Path = (
        Path(__file__).parent / "data" / "emission_factors.json"
    )
    KNOWLEDGE_BASE_PATH: Path = Path(__file__).parent.parent.parent / "knowledge_base"

    # ── Rate limiting (AI endpoints) ──────────────────────────────────────────
    AI_RATE_LIMIT_RPM: int = 20  # requests per minute per session

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def ai_is_configured(self) -> bool:
        return bool(self.LLM_API_KEY)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
