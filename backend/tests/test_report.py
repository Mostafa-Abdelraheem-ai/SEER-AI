from __future__ import annotations

def test_report_endpoint(client) -> None:
    api = client
    api.post("/api/auth/register", json={"full_name": "User Two", "email": "user2@example.com", "password": "Secret123!"})
    login = api.post("/api/auth/login", data={"username": "user2@example.com", "password": "Secret123!"})
    token = login.json()["access_token"]
    analysis = api.post(
        "/api/analysis",
        json={"input_text": "Verify your account now or it will be suspended.", "channel": "email"},
        headers={"Authorization": f"Bearer {token}"},
    ).json()
    report = api.post(f"/api/reports/{analysis['id']}", headers={"Authorization": f"Bearer {token}"})
    assert report.status_code == 200
    assert "severity" in report.json()
