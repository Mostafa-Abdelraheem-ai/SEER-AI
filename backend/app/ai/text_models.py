from __future__ import annotations

from collections import Counter

from app.ai.risk_engine import RiskEngine
from app.ai.types import SafetyModelOutput, TacticScore
from app.observability.metrics import record_confidence, record_pipeline_event, track_duration
from app.ai.providers.openai_provider import OpenAIProvider


TACTIC_HINTS = {
    "urgency": ["urgent", "immediately", "today", "now", "asap", "final notice"],
    "fear": ["locked", "suspended", "closed", "problem", "fraud alert", "terminated"],
    "authority": ["manager", "ceo", "bank", "support", "security team", "government"],
    "scarcity": ["limited", "expires", "last chance", "only today"],
    "reward bait": ["prize", "bonus", "gift", "reward", "won"],
    "impersonation": ["this is", "speaking on behalf", "reply-to", "official"],
}


class HybridTextSafetyModels:
    def __init__(self) -> None:
        self.engine = RiskEngine()
        self.openai = OpenAIProvider()

    def analyze(self, text: str) -> SafetyModelOutput:
        with track_duration("text_classifier", "hybrid"):
            baseline = self.engine.analyze(text)
        local_tactics = self._local_tactics(text, baseline["tactic_prediction"])
        provider = "local_hybrid"
        fallback_used = False
        reasoning = baseline["explanation"]
        confidence = float(baseline["confidence"])
        attack_label = baseline["attack_prediction"]
        token_usage: dict[str, int] = {}
        cost_estimate = None

        if self.openai.enabled:
            try:
                model_result = self.openai.complete_json(
                    system_prompt=(
                        "You classify scam-risky content for a digital safety assistant. "
                        "Return JSON with keys: attack_label, confidence, tactics, reasoning. "
                        "tactics must be an array of objects with label and confidence."
                    ),
                    user_prompt=f"Analyze this text:\n{text}",
                )
                data = model_result.data
                provider = "openai_plus_local"
                attack_label = str(data.get("attack_label") or attack_label)
                confidence = max(confidence, float(data.get("confidence") or confidence))
                reasoning = str(data.get("reasoning") or reasoning)
                remote_tactics = [
                    TacticScore(label=str(item.get("label", "unknown")), confidence=float(item.get("confidence", 0.0)))
                    for item in data.get("tactics", [])
                    if isinstance(item, dict)
                ]
                local_tactics = self._merge_tactics(local_tactics, remote_tactics)
                token_usage = {
                    "prompt_tokens": model_result.prompt_tokens,
                    "completion_tokens": model_result.completion_tokens,
                }
                cost_estimate = None
            except Exception:
                fallback_used = True
                record_pipeline_event("text_classifier", "openai_fallback")

        record_confidence("text_classifier", confidence)
        return SafetyModelOutput(
            attack_label=attack_label,
            confidence=min(max(confidence, 0.0), 1.0),
            tactic_scores=local_tactics,
            provider=provider,
            reasoning=reasoning,
            fallback_used=fallback_used,
            token_usage=token_usage,
            cost_estimate_usd=cost_estimate,
        )

    def _local_tactics(self, text: str, baseline_tactic: str) -> list[TacticScore]:
        lowered = text.lower()
        counts = Counter()
        for label, tokens in TACTIC_HINTS.items():
            counts[label] += sum(1 for token in tokens if token in lowered)
        scores = [
            TacticScore(label=label, confidence=min(1.0, 0.2 + (hits * 0.22)))
            for label, hits in counts.items()
            if hits > 0
        ]
        if baseline_tactic and baseline_tactic != "none":
            scores.append(TacticScore(label=baseline_tactic.replace("_", " "), confidence=0.58))
        if not scores:
            scores.append(TacticScore(label="none", confidence=0.6))
        scores.sort(key=lambda item: item.confidence, reverse=True)
        return scores[:4]

    @staticmethod
    def _merge_tactics(local: list[TacticScore], remote: list[TacticScore]) -> list[TacticScore]:
        merged: dict[str, float] = {}
        for item in local + remote:
            merged[item.label] = max(merged.get(item.label, 0.0), item.confidence)
        ordered = [TacticScore(label=label, confidence=confidence) for label, confidence in merged.items()]
        ordered.sort(key=lambda item: item.confidence, reverse=True)
        return ordered[:5]
