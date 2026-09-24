"""app/schemas/ai.py"""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class AskRequest(BaseModel):
    question: str


class Source(BaseModel):
    id: str
    text: str
    url: str


class AIResponse(BaseModel):
    status: str  # "ok" | "ai_unavailable"
    text: str
    sources: List[Source]
    is_estimate: bool
