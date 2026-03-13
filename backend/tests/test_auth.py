from __future__ import annotations

def test_register_and_login(client) -> None:
    api = client
    register_response = api.post(
        "/api/auth/register",
        json={"full_name": "Mostafa", "email": "mostafa@example.com", "password": "Secret123!"},
    )
    assert register_response.status_code == 200
    login_response = api.post(
        "/api/auth/login",
        data={"username": "mostafa@example.com", "password": "Secret123!"},
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
