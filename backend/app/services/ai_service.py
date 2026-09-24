"""app/services/ai_service.py"""
import json
import logging
import httpx
from rank_bm25 import BM25Okapi

from app.config import get_settings
from app.services.emission_factor_service import get_emission_factor_service
from app.models.activity import Activity
from app.schemas.ai import Source

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        self.settings = get_settings()
        self.factors_svc = get_emission_factor_service()
        self._build_bm25_index()

    def _build_bm25_index(self):
        """Creates a simple in-memory BM25 index over the emission factors data."""
        self.documents = []
        self.source_metadata = []
        
        for category in self.factors_svc.list_categories():
            for factor in self.factors_svc.list_activities(category):
                # Create a search document
                doc_text = (
                    f"Category: {category}. Activity: {factor.activity_type}. "
                    f"Label: {factor.label}. Description: {factor.description}. "
                    f"Emission Factor: {factor.factor} {factor.unit}. "
                    f"Source: {factor.source} ({factor.source_year})."
                )
                self.documents.append(doc_text)
                self.source_metadata.append({
                    "id": f"{category}/{factor.activity_type}",
                    "text": doc_text,
                    "url": factor.source_url
                })
        
        tokenized_corpus = [doc.lower().split(" ") for doc in self.documents]
        self.bm25 = BM25Okapi(tokenized_corpus)

    def _search(self, query: str, top_k: int = 3) -> list[Source]:
        tokenized_query = query.lower().split(" ")
        scores = self.bm25.get_scores(tokenized_query)
        
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
        
        sources = []
        for i in top_indices:
            if scores[i] > 0:  # Only include relevant hits
                meta = self.source_metadata[i]
                sources.append(Source(
                    id=meta["id"],
                    text=meta["text"],
                    url=meta["url"]
                ))
        return sources

    async def get_answer(self, question: str, user_footprint_kg: float) -> tuple[str, list[Source]]:
        """Queries the LLM with the context to answer the question."""
        sources = self._search(question)
        
        context_str = "\n".join([f"- {s.text}" for s in sources])
        
        system_prompt = f"""You are the PlanetPulse AI Assistant, a climate-tech domain expert.
Your goal is to help users understand their carbon footprint, explain emission factors, and suggest reductions.

USER CONTEXT:
The user's current total carbon footprint is {user_footprint_kg} kg CO2e.

KNOWLEDGE BASE:
{context_str}

RULES:
1. Use the provided Knowledge Base to answer the user's question.
2. If you state a fact from the knowledge base, cite the Source and Year.
3. DO NOT invent emission factors. If the exact answer is missing, suggest they estimate based on a similar activity in the knowledge base.
4. Keep the answer friendly, concise, and actionable. Do not use markdown headers unless necessary, keep it conversational.
"""

        if not self.settings.LLM_API_KEY or self.settings.LLM_API_KEY == "your_api_key_here" or self.settings.LLM_API_KEY == "gsk_your_groq_api_key_here":
            return "AI is not configured. Please add an LLM_API_KEY to your backend/.env file to enable the AI assistant.", []

        headers = {
            "Authorization": f"Bearer {self.settings.LLM_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.settings.MODEL_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }

        url = f"{self.settings.LLM_BASE_URL.rstrip('/')}/chat/completions"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                answer = data["choices"][0]["message"]["content"]
                return answer, sources
        except Exception as e:
            logger.error(f"LLM API Error: {e}")
            return "Sorry, I'm having trouble connecting to the AI brain right now. Please try again later.", sources


_rag_service = None

def get_rag_service() -> RAGService:
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
