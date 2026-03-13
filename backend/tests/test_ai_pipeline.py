from __future__ import annotations

from app.ai.inference_pipeline import InferencePipeline


def test_ai_pipeline_smoke() -> None:
    result = InferencePipeline().analyze_message(
        "This is the CEO. Send the gift cards now and keep it secret.",
        "email",
    )
    assert "attack_prediction" in result
    assert "incident_report" in result
