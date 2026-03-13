from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from src.config import CHUNK_OVERLAP, KNOWLEDGE_BASE_DIR, MAX_CHUNK_SIZE


@dataclass
class KBChunk:
    chunk_id: str
    source: str
    text: str


def read_markdown_files(base_dir: Optional[Path] = None) -> Dict[str, str]:
    kb_dir = KNOWLEDGE_BASE_DIR if base_dir is None else base_dir
    documents = {}
    for path in sorted(kb_dir.glob("*.md")):
        documents[path.name] = path.read_text(encoding="utf-8")
    return documents


def chunk_document(name: str, text: str, chunk_size: int = MAX_CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[KBChunk]:
    chunks: List[KBChunk] = []
    start = 0
    idx = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append(KBChunk(chunk_id=f"{name}-{idx}", source=name, text=chunk_text))
        idx += 1
        start += max(1, chunk_size - overlap)
    return chunks


def load_kb_chunks(base_dir: Optional[Path] = None) -> List[KBChunk]:
    documents = read_markdown_files(base_dir)
    all_chunks: List[KBChunk] = []
    for name, text in documents.items():
        all_chunks.extend(chunk_document(name, text))
    return all_chunks
