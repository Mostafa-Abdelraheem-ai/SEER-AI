from __future__ import annotations

import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[4]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.rag.build_index import build_index  # noqa: E402
from src.rag.retriever import LocalRetriever  # noqa: E402

__all__ = ["build_index", "LocalRetriever"]
