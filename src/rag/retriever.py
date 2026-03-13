from __future__ import annotations

import pickle
from pathlib import Path
from typing import Dict, List, Optional

import faiss
import numpy as np

from src.config import INDEX_DIR
from src.rag.build_index import Embedder, build_index


class LocalRetriever:
    def __init__(self, index_dir: Optional[Path] = None) -> None:
        self.index_dir = INDEX_DIR if index_dir is None else index_dir
        if not (self.index_dir / "kb.faiss").exists():
            build_index(self.index_dir)
        self.index = faiss.read_index(str(self.index_dir / "kb.faiss"))
        with (self.index_dir / "metadata.pkl").open("rb") as handle:
            metadata = pickle.load(handle)
        self.chunks = metadata["chunks"]
        self.embedder = Embedder()

    def retrieve(self, query: str, top_k: int = 3) -> Dict[str, object]:
        query_embedding = self.embedder.encode([query]).astype("float32")
        scores, indices = self.index.search(query_embedding, top_k)
        retrieved = []
        for idx, score in zip(indices[0].tolist(), scores[0].tolist()):
            if idx < 0:
                continue
            chunk = self.chunks[idx]
            retrieved.append(
                {
                    "chunk_id": chunk.chunk_id,
                    "source": chunk.source,
                    "text": chunk.text,
                    "score": round(float(score), 4),
                }
            )
        explanation = " ".join(item["text"][:180] for item in retrieved[:2]).strip()
        return {
            "retrieved_chunks": retrieved,
            "relevance_scores": [item["score"] for item in retrieved],
            "synthesized_explanation": explanation,
        }
