from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


SafetyVerdict = Literal["safe", "caution", "risky", "likely_scam", "private_info_detected", "unknown"]


class MessageCheckRequest(BaseModel):
    message: str = Field(..., min_length=3)
    channel: str = "message"


class EmailTextCheckRequest(BaseModel):
    raw_email_text: str = Field(..., min_length=5)


class LinkCheckRequest(BaseModel):
    url: str = Field(..., min_length=4)


class HashCheckRequest(BaseModel):
    hash_value: str = Field(..., min_length=16)


class WebhookCheckRequest(BaseModel):
    message: str | None = None
    email_text: str | None = None
    url: str | None = None
    channel: str = "webhook"


class SafetyFinding(BaseModel):
    label: str
    value: str
    note: str
    severity: str = "info"


class SafetyTactic(BaseModel):
    label: str
    confidence: float


class SafetyCitation(BaseModel):
    source: str
    snippet: str
    score: float


class ParsedEmailResponse(BaseModel):
    sender: str | None = None
    subject: str | None = None
    reply_to: str | None = None
    body: str = ""
    extracted_links: list[str] = []
    attachments: list[dict[str, Any]] = []


class SafetyScanResponse(BaseModel):
    id: str
    scan_type: str
    title: str
    verdict: SafetyVerdict
    risk_score: int
    summary: str
    explanation: str
    advice: str
    confidence: float | None = None
    created_at: datetime
    input_text: str | None = None
    transcript: str | None = None
    extracted_urls: list[str] = []
    findings: list[SafetyFinding] = []
    tactics: list[SafetyTactic] = []
    citations: list[SafetyCitation] = []
    parsed_email: ParsedEmailResponse | None = None
    limitations: list[str] = []
    degraded_mode: bool = False
    metadata: dict[str, Any] | None = None


class SafetyScanHistoryResponse(BaseModel):
    items: list[SafetyScanResponse]
