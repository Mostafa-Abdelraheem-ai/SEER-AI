from __future__ import annotations

from typing import Dict

from src.agents.guardrails import guardrail_footer
from src.agents.llm_client import LLMClient


class IncidentReportAgent:
    def __init__(self) -> None:
        self.llm = LLMClient()

    def generate_report(self, text: str, analysis: Dict[str, object]) -> Dict[str, object]:
        severity = "low"
        if analysis["risk_score"] >= 80:
            severity = "high"
        elif analysis["risk_score"] >= 60:
            severity = "medium"
        fallback = {
            "incident_summary": (
                f"Suspected {analysis['attack_prediction']} detected in inbound {self._infer_channel(text)} message."
            ),
            "indicators_observed": analysis.get("triggered_rules", []),
            "likely_tactic": analysis["tactic_prediction"],
            "severity": severity,
            "recommended_next_steps": analysis["recommended_action"],
            "evidence_note": guardrail_footer(analysis),
        }
        generated = self.llm.generate(
            system_prompt=(
                "You are an incident reporting assistant. Use only provided facts and return concise structured prose."
            ),
            user_prompt=f"Message: {text}\nAnalysis: {analysis}\nFallback report: {fallback}",
            fallback="",
        )
        if generated:
            fallback["llm_summary"] = generated
        return fallback

    @staticmethod
    def _infer_channel(text: str) -> str:
        if "http" in text or "gift card" in text.lower():
            return "sms/chat-like"
        return "email"
