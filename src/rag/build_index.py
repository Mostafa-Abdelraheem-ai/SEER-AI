from __future__ import annotations

import pickle
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

import faiss
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer

from src.config import INDEX_DIR, SENTENCE_MODEL_NAME
from src.rag.kb_loader import KBChunk, load_kb_chunks

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
        self.vectorizer = HashingVectorizer(n_features=512, alternate_sign=False, norm="l2")
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


def build_index(output_dir: Optional[Path] = None) -> Path:
    output = INDEX_DIR if output_dir is None else output_dir
    output.mkdir(parents=True, exist_ok=True)
    chunks = load_kb_chunks()
    embedder = Embedder()
    embeddings = embedder.encode([chunk.text for chunk in chunks]).astype("float32")
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)
    faiss.write_index(index, str(output / "kb.faiss"))
    with (output / "metadata.pkl").open("wb") as handle:
        pickle.dump({"chunks": chunks, "backend": embedder.backend}, handle)
    return output


if __name__ == "__main__":
    build_index()
