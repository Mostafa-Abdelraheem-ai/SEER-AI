from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
from sqlalchemy import text

from src.config import INDEX_DIR
from src.rag.build_index import Embedder, build_index
from src.rag.store import ensure_schema, fetch_all_chunks, get_engine


class LocalRetriever:
    def __init__(self, index_dir: Optional[Path] = None, database_url: Optional[str] = None) -> None:
        self.index_dir = INDEX_DIR if index_dir is None else index_dir
        self.engine = get_engine(database_url)
        ensure_schema(self.engine)
        if not fetch_all_chunks(self.engine):
            build_index(self.index_dir, database_url=str(self.engine.url))
        self.embedder = Embedder()

    @staticmethod
    def _cosine_score(lhs: List[float], rhs: List[float]) -> float:
        lhs_array = np.asarray(lhs, dtype="float32")
        rhs_array = np.asarray(rhs, dtype="float32")
        lhs_norm = np.linalg.norm(lhs_array)
        rhs_norm = np.linalg.norm(rhs_array)
        if lhs_norm == 0.0 or rhs_norm == 0.0:
            return 0.0
        return float(np.dot(lhs_array, rhs_array) / (lhs_norm * rhs_norm))

    def retrieve(self, query: str, top_k: int = 3) -> Dict[str, object]:
        query_embedding = self.embedder.encode([query]).astype("float32")[0].tolist()
        retrieved = []
        if self.engine.dialect.name == "postgresql":
            vector_literal = "[" + ",".join(f"{value:.8f}" for value in query_embedding) + "]"
            query_sql = text(
                """
                SELECT chunk_id, source_document, chunk_text,
                       1 - (embedding <=> CAST(:embedding AS vector)) AS score
                FROM knowledge_chunks
                ORDER BY embedding <=> CAST(:embedding AS vector)
                LIMIT :top_k
                """
            )
            with self.engine.connect() as connection:
                rows = connection.execute(query_sql, {"embedding": vector_literal, "top_k": top_k}).mappings().all()
            for row in rows:
                retrieved.append(
                    {
                        "chunk_id": row["chunk_id"],
                        "source": row["source_document"],
                        "text": row["chunk_text"],
                        "score": round(float(row["score"]), 4),
                    }
                )
        else:
            rows = fetch_all_chunks(self.engine)
            scored = []
            for row in rows:
                scored.append((self._cosine_score(query_embedding, row["embedding"]), row))
            scored.sort(key=lambda item: item[0], reverse=True)
            for score, row in scored[:top_k]:
                retrieved.append(
                    {
                        "chunk_id": row["chunk_id"],
                        "source": row["source_document"],
                        "text": row["chunk_text"],
                        "score": round(float(score), 4),
                    }
                )
        explanation = " ".join(item["text"][:180] for item in retrieved[:2]).strip()
        return {
            "retrieved_chunks": retrieved,
            "relevance_scores": [item["score"] for item in retrieved],
            "synthesized_explanation": explanation,
        }
