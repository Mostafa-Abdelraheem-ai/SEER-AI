from __future__ import annotations

from src.risk_engine import RiskEngine


def test_risk_engine_flags_suspicious_message() -> None:
    engine = RiskEngine()
    result = engine.analyze(
        "Urgent: this is the CEO, keep this secret and send a gift card payment now."
    )
    assert result["risk_score"] >= 40
    assert isinstance(result["triggered_rules"], list)
