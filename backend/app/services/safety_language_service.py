from __future__ import annotations

from app.schemas.safety import SafetyVerdict


def risk_to_verdict(risk_score: int) -> SafetyVerdict:
    if risk_score >= 80:
        return "likely_scam"
    if risk_score >= 60:
        return "risky"
    if risk_score >= 35:
        return "caution"
    return "safe"


def verdict_label(verdict: SafetyVerdict) -> str:
    labels = {
        "safe": "Safe",
        "caution": "Caution",
        "risky": "Risky",
        "likely_scam": "Likely scam",
        "private_info_detected": "Private info detected",
        "unknown": "Needs review",
    }
    return labels[verdict]


def build_user_advice(verdict: SafetyVerdict, kind: str) -> str:
    advice = {
        "safe": f"This {kind} does not show strong warning signs, but stay alert if anything feels unusual.",
        "caution": f"This {kind} has some warning signs. Verify it using another trusted channel before you act.",
        "risky": f"This {kind} shows several warning signs. Do not trust it yet, and avoid clicking, replying, or sharing more information.",
        "likely_scam": f"This {kind} strongly resembles a scam. Do not engage with it, and verify the request independently.",
        "private_info_detected": "This image may expose private information. Consider hiding those details before you share it.",
        "unknown": f"We could not fully assess this {kind}. Treat it carefully and verify it another way.",
    }
    return advice[verdict]
