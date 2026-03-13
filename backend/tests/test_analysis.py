from __future__ import annotations

def _token(api):
    api.post("/api/auth/register", json={"full_name": "User One", "email": "user1@example.com", "password": "Secret123!"})
    login = api.post("/api/auth/login", data={"username": "user1@example.com", "password": "Secret123!"})
    return login.json()["access_token"]


def test_analysis_endpoint(client) -> None:
    api = client
    token = _token(api)
    response = api.post(
        "/api/analysis",
        json={"input_text": "This is the CEO, send the payment now and keep it confidential.", "channel": "email"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert "risk_score" in response.json()
