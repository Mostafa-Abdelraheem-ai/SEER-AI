from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from openai import OpenAI

from app.core.config import get_settings
from app.observability.metrics import record_openai_usage, track_duration


@dataclass
class OpenAICompletionResult:
    data: dict[str, Any]
    prompt_tokens: int = 0
    completion_tokens: int = 0
    raw_text: str = ""


class OpenAIProvider:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = OpenAI(api_key=self.settings.openai_api_key) if self.settings.openai_api_key else None

    @property
    def enabled(self) -> bool:
        return self.client is not None

    def complete_json(self, *, system_prompt: str, user_prompt: str, model: str | None = None) -> OpenAICompletionResult:
        if self.client is None:
            raise RuntimeError("OpenAI provider is not configured")
        model_name = model or self.settings.openai_generation_model
        with track_duration("openai_chat", model_name):
            response = self.client.chat.completions.create(
                model=model_name,
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
        content = response.choices[0].message.content or "{}"
        usage = getattr(response, "usage", None)
        prompt_tokens = getattr(usage, "prompt_tokens", 0) or 0
        completion_tokens = getattr(usage, "completion_tokens", 0) or 0
        record_openai_usage(model_name, prompt_tokens, completion_tokens)
        return OpenAICompletionResult(
            data=json.loads(content),
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            raw_text=content,
        )
