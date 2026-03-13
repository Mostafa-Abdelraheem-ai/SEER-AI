from __future__ import annotations

import re
from typing import Iterable, List

import nltk


def ensure_nltk() -> None:
    """Best-effort downloader for tokenizers used in optional analysis."""
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        try:
            nltk.download("punkt", quiet=True)
        except Exception:
            pass


URL_PATTERN = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
NON_WORD_PATTERN = re.compile(r"[^a-zA-Z0-9\s:/._-]")
WHITESPACE_PATTERN = re.compile(r"\s+")


def clean_text(text: str) -> str:
    normalized = NON_WORD_PATTERN.sub(" ", text or "")
    normalized = WHITESPACE_PATTERN.sub(" ", normalized)
    return normalized.strip().lower()


def extract_urls(text: str) -> List[str]:
    return URL_PATTERN.findall(text or "")


def tokenize(text: str) -> List[str]:
    ensure_nltk()
    try:
        return nltk.word_tokenize(text)
    except LookupError:
        return text.split()


def contains_any(text: str, keywords: Iterable[str]) -> bool:
    text_lower = text.lower()
    return any(keyword.lower() in text_lower for keyword in keywords)


def highlight_terms(text: str, keywords: Iterable[str]) -> str:
    highlighted = text
    for keyword in sorted(set(keywords), key=len, reverse=True):
        if not keyword:
            continue
        pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        highlighted = pattern.sub(lambda m: f"[{m.group(0)}]", highlighted)
    return highlighted
