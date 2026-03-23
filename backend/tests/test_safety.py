from __future__ import annotations

from app.services.image_privacy_service import ImagePrivacyService
from app.services.voice_safety_service import VoiceTranscriptionResult, VoiceSafetyService


def _token(api):
    api.post("/api/auth/register", json={"full_name": "Safety User", "email": "safety@example.com", "password": "Secret123!"})
    login = api.post("/api/auth/login", data={"username": "safety@example.com", "password": "Secret123!"})
    return login.json()["access_token"]


def test_voice_check_endpoint(client, monkeypatch) -> None:
    def fake_transcribe(self, file_bytes: bytes, filename: str, transcript_hint: str | None = None):
        return VoiceTranscriptionResult(
            transcript="Caller said my account would be locked today unless I paid immediately.",
            limitations=["Stub transcription"],
            used_hint=False,
        )

    monkeypatch.setattr(VoiceSafetyService, "transcribe", fake_transcribe)
    token = _token(client)
    response = client.post(
        "/api/safety/voice",
        files={"audio_file": ("voice-note.wav", b"fake-audio-bytes", "audio/wav")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["scan_type"] == "voice"
    assert body["transcript"]


def test_email_parsing_endpoint(client) -> None:
    token = _token(client)
    raw_email = (
        "From: alerts@example.com\n"
        "Reply-To: payments@other-site.com\n"
        "Subject: Verify now\n\n"
        "Please click https://verify-bonus.example.top now."
    )
    response = client.post(
        "/api/safety/email",
        json={"raw_email_text": raw_email},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["scan_type"] == "email"
    assert body["parsed_email"]["sender"] == "alerts@example.com"
    assert body["parsed_email"]["extracted_links"]


def test_url_analysis_endpoint(client) -> None:
    token = _token(client)
    response = client.post(
        "/api/safety/link",
        json={"url": "http://192.168.1.5/reset-password-now.top"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["scan_type"] == "link"
    assert body["verdict"] in {"caution", "risky", "likely_scam"}


def test_attachment_metadata_endpoint(client) -> None:
    token = _token(client)
    response = client.post(
        "/api/safety/attachment",
        files={"attachment": ("invoice.pdf.exe", b"1234", "application/octet-stream")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["scan_type"] == "attachment"
    assert body["findings"]


def test_webhook_auth_and_payload(client) -> None:
    unauthorized = client.post("/api/safety/webhook", json={"message": "Check this urgent payment request"})
    assert unauthorized.status_code == 401

    authorized = client.post(
        "/api/safety/webhook",
        json={"url": "http://bit.ly/win-a-prize"},
        headers={"X-SEER-WEBHOOK-SECRET": "change-me-webhook-secret"},
    )
    assert authorized.status_code == 200
    assert authorized.json()["verdict"] in {"likely_safe", "caution", "suspicious"}


def test_hash_analysis_endpoint(client) -> None:
    token = _token(client)
    response = client.post(
        "/api/safety/hash",
        json={"hash_value": "44d88612fea8a8f36de82e1278abb02f"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["scan_type"] == "hash"
    assert body["metadata"]["hash_type"] == "md5"


def test_image_privacy_endpoint(client, monkeypatch) -> None:
    def fake_inspect(self, image_bytes: bytes, filename: str):
        return {
            "extracted_text": "Call me at 555-123-4567",
            "findings": [
                {
                    "label": "Phone number",
                    "value": "555-123-4567",
                    "note": "A phone number may be visible in this image.",
                    "severity": "warning",
                    "box": {"left": 10, "top": 20, "width": 120, "height": 30},
                }
            ],
            "score": 80,
            "verdict": "private_info_detected",
            "limitations": ["Stub OCR"],
            "metadata": {"filename": filename},
        }

    monkeypatch.setattr(ImagePrivacyService, "inspect", fake_inspect)
    token = _token(client)
    response = client.post(
        "/api/safety/image-privacy",
        files={"image_file": ("private-info.png", b"fake-image", "image/png")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["scan_type"] == "image_privacy"
    assert body["verdict"] == "private_info_detected"
