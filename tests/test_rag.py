from __future__ import annotations

from src.rag.retriever import LocalRetriever


def test_rag_returns_chunks() -> None:
    retriever = LocalRetriever()
    result = retriever.retrieve("Why is urgent credential verification suspicious?", top_k=2)
    assert len(result["retrieved_chunks"]) >= 1
    assert "synthesized_explanation" in result
