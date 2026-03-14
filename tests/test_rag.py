from __future__ import annotations

from pathlib import Path

from src.rag.build_index import build_index
from src.rag.retriever import LocalRetriever


def test_rag_returns_chunks() -> None:
    database_url = "sqlite:///./test_rag.db"
    build_index(database_url=database_url)
    retriever = LocalRetriever(database_url=database_url)
    result = retriever.retrieve("Why is urgent credential verification suspicious?", top_k=2)
    assert len(result["retrieved_chunks"]) >= 1
    assert "synthesized_explanation" in result
    db_path = Path("test_rag.db")
    if db_path.exists():
        db_path.unlink()
