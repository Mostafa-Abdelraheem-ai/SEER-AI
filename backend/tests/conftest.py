from __future__ import annotations

import os

import pytest
os.environ["DATABASE_URL"] = "sqlite:///./backend_test.db"

from fastapi.testclient import TestClient

from app.ai.inference_pipeline import InferencePipeline
from app.core.database import Base, engine
from app.main import app
from app.models import analysis, audit_log, incident_report, knowledge_chunk, retrieved_chunk, triggered_rule, user  # noqa: F401


Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(autouse=True)
def stub_ai_pipeline(monkeypatch):
    def fake_init(self):
        return None

    def fake_analyze_message(self, text: str, channel: str):
        return {
            "attack_prediction": "phishing",
            "tactic_prediction": "urgency",
            "confidence": 0.91,
            "risk_score": 84,
            "explanation": "Stubbed analysis result for tests.",
            "recommended_action": "Escalate to SOC triage.",
            "triggered_rules": ["urgent language: urgent", "credential request: password"],
            "retrieved_chunks": [
                {"source": "phishing_examples.md", "text": "Example phishing indicator", "score": 0.88}
            ],
            "incident_report": {
                "incident_summary": "Stubbed phishing incident.",
                "indicators_observed": ["urgent language", "credential request"],
                "likely_tactic": "urgency",
                "severity": "high",
                "recommended_next_steps": "Reset credentials and notify the user.",
            },
            "analyst_summary": "Stubbed analyst summary.",
            "channel": channel,
            "explainability": {"plain_english": "Stub explanation"},
        }

    monkeypatch.setattr(InferencePipeline, "__init__", fake_init)
    monkeypatch.setattr(InferencePipeline, "analyze_message", fake_analyze_message)
