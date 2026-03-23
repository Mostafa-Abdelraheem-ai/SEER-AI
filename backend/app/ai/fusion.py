from __future__ import annotations

from app.ai.types import FusionEvidence, FusionResult, RetrievalResult, SafetyModelOutput
from app.services.safety_language_service import build_user_advice, risk_to_verdict, verdict_label


class MultimodalFusionService:
    def fuse_text_and_retrieval(
        self,
        *,
        text: str,
        channel: str,
        model_output: SafetyModelOutput,
        retrieval_result: RetrievalResult,
        triggered_rules: list[str],
    ) -> FusionResult:
        tactic_confidence = max((item.confidence for item in model_output.tactic_scores), default=0.0)
        rule_density = min(1.0, len(triggered_rules) / 5.0)
        retrieval_signal = float(retrieval_result.top_score or 0.0)
        attack_bias = 0.65 if model_output.attack_label != "benign" else 0.25
        combined = (
            0.42 * model_output.confidence
            + 0.20 * tactic_confidence
            + 0.18 * rule_density
            + 0.20 * max(retrieval_signal, attack_bias * 0.4)
        )
        risk_score = int(round(max(0.0, min(combined, 1.0)) * 100))
        verdict = risk_to_verdict(risk_score)
        top_tactics = ", ".join(item.label for item in model_output.tactic_scores[:3] if item.label != "none") or "no dominant persuasion tactic"
        explanation = (
            f"This {channel} looks {verdict_label(verdict).lower()} because the language pattern points to "
            f"{model_output.attack_label.replace('_', ' ')}, the strongest tactics were {top_tactics}, and the retrieved guidance "
            f"matches similar risky behaviors. {model_output.reasoning} {retrieval_result.synthesized_explanation}".strip()
        )
        recommendation = build_user_advice(verdict, channel)
        evidence = [
            FusionEvidence(
                source="text_classifier",
                score=model_output.confidence,
                summary=f"Attack label: {model_output.attack_label}",
                details={"provider": model_output.provider},
            ),
            FusionEvidence(
                source="tactic_detector",
                score=tactic_confidence,
                summary=f"Detected tactics: {top_tactics}",
                details={"tactics": [item.__dict__ for item in model_output.tactic_scores]},
            ),
            FusionEvidence(
                source="retrieval",
                score=retrieval_signal,
                summary="Retrieved policy and scam-pattern references were used to ground the explanation.",
                details={"provider": retrieval_result.provider, "citations": [item.__dict__ for item in retrieval_result.citations]},
            ),
        ]
        if triggered_rules:
            evidence.append(
                FusionEvidence(
                    source="rules",
                    score=rule_density,
                    summary="Heuristic rules fired on suspicious language and indicators.",
                    details={"rules": triggered_rules},
                )
            )
        return FusionResult(
            risk_score=risk_score,
            confidence=round(min(0.99, max(model_output.confidence, tactic_confidence, retrieval_signal)), 4),
            verdict=verdict,
            explanation=explanation,
            recommendation=recommendation,
            evidence=evidence,
            degraded_mode=model_output.fallback_used or retrieval_result.fallback_used,
        )
