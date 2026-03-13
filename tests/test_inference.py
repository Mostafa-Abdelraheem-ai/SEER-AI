from __future__ import annotations

from fastapi.testclient import TestClient

from src.api.app import app


def test_predict_endpoint() -> None:
    client = TestClient(app)
    response = client.post("/predict", json={"text": "Verify your account now or it will be suspended."})
    assert response.status_code == 200
    payload = response.json()
    assert "attack_prediction" in payload
    assert "risk_score" in payload
