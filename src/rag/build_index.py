from __future__ import annotations

import pickle
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer

from src.config import EMBEDDING_DIMENSION, INDEX_DIR, SENTENCE_MODEL_NAME
from src.rag.kb_loader import load_kb_chunks
from src.rag.store import ensure_schema, get_engine, insert_chunks, reset_chunks

try:
    from sentence_transformers import SentenceTransformer

    SENTENCE_TRANSFORMERS_AVAILABLE = True
except Exception:
    SENTENCE_TRANSFORMERS_AVAILABLE = False


@dataclass
class EmbeddingArtifacts:
    model_type: str
    dimension: int


class Embedder:
    def __init__(self) -> None:
        self.backend = "hashing"
        self.vectorizer = HashingVectorizer(n_features=EMBEDDING_DIMENSION, alternate_sign=False, norm="l2")
        self.model = None
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.model = SentenceTransformer(SENTENCE_MODEL_NAME, local_files_only=True)
                self.backend = "sentence_transformer"
            except Exception:
                self.model = None

    def encode(self, texts: List[str]) -> np.ndarray:
        if self.model is not None:
            return np.asarray(self.model.encode(texts, normalize_embeddings=True), dtype="float32")
        sparse = self.vectorizer.transform(texts)
        return sparse.astype(np.float32).toarray()


def build_index(output_dir: Optional[Path] = None, database_url: Optional[str] = None) -> Path:
    output = INDEX_DIR if output_dir is None else output_dir
    output.mkdir(parents=True, exist_ok=True)
    chunks = load_kb_chunks()
    embedder = Embedder()
    embeddings = embedder.encode([chunk.text for chunk in chunks]).astype("float32")
    engine = get_engine(database_url)
    ensure_schema(engine)
    reset_chunks(engine)
    rows = []
    for chunk, embedding in zip(chunks, embeddings.tolist()):
        rows.append(
            {
                "chunk_id": chunk.chunk_id,
                "source_document": chunk.source,
                "chunk_text": chunk.text,
                "metadata_json": {"source": chunk.source},
                "embedding": embedding,
            }
        )
    insert_chunks(engine, rows)
    with (output / "metadata.pkl").open("wb") as handle:
        pickle.dump({"chunks_indexed": len(chunks), "backend": embedder.backend}, handle)
    return output


if __name__ == "__main__":
    build_index()
