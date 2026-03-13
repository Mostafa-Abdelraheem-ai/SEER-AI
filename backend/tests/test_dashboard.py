from __future__ import annotations

def test_dashboard_overview(client) -> None:
    api = client
    api.post("/api/auth/register", json={"full_name": "User Three", "email": "user3@example.com", "password": "Secret123!"})
    login = api.post("/api/auth/login", data={"username": "user3@example.com", "password": "Secret123!"})
    token = login.json()["access_token"]
    api.post(
        "/api/analysis",
        json={"input_text": "Immediate password verification required.", "channel": "email"},
        headers={"Authorization": f"Bearer {token}"},
    )
    overview = api.get("/api/dashboard/overview", headers={"Authorization": f"Bearer {token}"})
    assert overview.status_code == 200
    assert "total_analyses" in overview.json()
