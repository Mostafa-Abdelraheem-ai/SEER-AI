from __future__ import annotations

from dataclasses import dataclass

from src.config import OPENAI_API_KEY, OPENAI_MODEL_NAME

try:
    from openai import OpenAI

    OPENAI_AVAILABLE = True
except Exception:
    OPENAI_AVAILABLE = False


@dataclass
class LLMClient:
    """OpenAI-compatible wrapper with deterministic fallback."""

    def __post_init__(self) -> None:
        self.client = None
        if OPENAI_AVAILABLE and OPENAI_API_KEY:
            try:
                self.client = OpenAI(api_key=OPENAI_API_KEY)
            except Exception:
                self.client = None

    def generate(self, system_prompt: str, user_prompt: str, fallback: str) -> str:
        if self.client is None:
            return fallback
        try:
            response = self.client.chat.completions.create(
                model=OPENAI_MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
            )
            return response.choices[0].message.content or fallback
        except Exception:
            return fallback
