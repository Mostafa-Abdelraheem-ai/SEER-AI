from __future__ import annotations

from app.core.config import get_settings
from src.rag.retriever import LocalRetriever

from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.types import RetrievalCitation, RetrievalResult
from app.observability.metrics import record_pipeline_event, record_retrieval_score, track_duration


class EnhancedRAGService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.retriever = LocalRetriever() if self.settings.enable_rag else None
        self.openai = OpenAIProvider()

    def explain(self, query: str, top_k: int = 4) -> RetrievalResult:
        if not self.settings.enable_rag or self.retriever is None:
            return RetrievalResult(
                citations=[],
                synthesized_explanation="Knowledge retrieval is disabled in lightweight mode.",
                provider="disabled",
                fallback_used=False,
                top_score=None,
            )

        with track_duration("retrieval", "pgvector"):
            result = self.retriever.retrieve(query, top_k=top_k)
        citations = [
            RetrievalCitation(
                source=item["source"],
                snippet=item["text"][:220],
                score=float(item["score"]),
            )
            for item in result["retrieved_chunks"]
        ]
        top_score = citations[0].score if citations else None
        record_retrieval_score("pgvector", top_score)

        explanation = result["synthesized_explanation"]
        fallback_used = False
        provider = "local_retriever"
        if self.openai.enabled and citations:
            try:
                citation_text = "\n".join(f"- [{item.source}] {item.snippet}" for item in citations[:3])
                response = self.openai.complete_json(
                    system_prompt=(
                        "You explain scam risk using only the provided citations. "
                        "Return JSON with one key: grounded_explanation."
                    ),
                    user_prompt=f"Query:\n{query}\n\nCitations:\n{citation_text}",
                )
                explanation = str(response.data.get("grounded_explanation") or explanation)
                provider = "openai_grounded_rag"
            except Exception:
                fallback_used = True
                record_pipeline_event("retrieval", "generation_fallback")

        return RetrievalResult(
            citations=citations,
            synthesized_explanation=explanation,
            provider=provider,
            fallback_used=fallback_used,
            top_score=top_score,
        )
