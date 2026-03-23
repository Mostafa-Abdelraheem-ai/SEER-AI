from __future__ import annotations


def test_health_endpoint(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_liveness_and_readiness_endpoints(client) -> None:
    live = client.get("/health/live")
    ready = client.get("/health/ready")
    assert live.status_code == 200
    assert ready.status_code == 200
    assert ready.json()["checks"]["database"] == "ok"


def test_metrics_endpoint(client) -> None:
    response = client.get("/metrics")
    assert response.status_code == 200
    assert b"seer_http_requests_total" in response.content
