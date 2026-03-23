from __future__ import annotations

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.safety import (
    EmailTextCheckRequest,
    HashCheckRequest,
    LinkCheckRequest,
    MessageCheckRequest,
    SafetyScanHistoryResponse,
    SafetyScanResponse,
    WebhookCheckRequest,
)
from app.services.safety_scan_service import SafetyScanService


router = APIRouter(prefix="/api/safety", tags=["safety"])
settings = get_settings()


@router.post("/message", response_model=SafetyScanResponse)
def message_check(
    payload: MessageCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    return SafetyScanService(db).check_message(current_user, payload.message, payload.channel)


@router.post("/voice", response_model=SafetyScanResponse)
async def voice_check(
    audio_file: UploadFile = File(...),
    transcript_hint: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    return SafetyScanService(db).check_voice(current_user, await audio_file.read(), audio_file.filename or "voice-note", transcript_hint)


@router.post("/email", response_model=SafetyScanResponse)
def email_text_check(
    payload: EmailTextCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    return SafetyScanService(db).check_email_text(current_user, payload.raw_email_text)


@router.post("/email-upload", response_model=SafetyScanResponse)
async def email_upload_check(
    email_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    return SafetyScanService(db).check_email_upload(current_user, await email_file.read())


@router.post("/attachment", response_model=SafetyScanResponse)
async def attachment_check(
    attachment: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    content = await attachment.read()
    return SafetyScanService(db).check_attachment(current_user, attachment.filename or "attachment", attachment.content_type, len(content))


@router.post("/link", response_model=SafetyScanResponse)
def link_check(
    payload: LinkCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    return SafetyScanService(db).check_link(current_user, payload.url)


@router.post("/hash", response_model=SafetyScanResponse)
def hash_check(
    payload: HashCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    return SafetyScanService(db).check_hash(current_user, payload.hash_value)


@router.post("/image-privacy", response_model=SafetyScanResponse)
async def image_privacy_check(
    image_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    return SafetyScanService(db).check_image_privacy(current_user, await image_file.read(), image_file.filename or "image")


@router.get("/history", response_model=SafetyScanHistoryResponse)
def safety_history(
    limit: int | None = Query(default=None, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanHistoryResponse:
    return SafetyScanService(db).history(current_user, limit=limit)


@router.get("/{id}", response_model=SafetyScanResponse)
def get_safety_scan(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SafetyScanResponse:
    return SafetyScanService(db).get(current_user, id)


@router.post("/webhook")
def webhook_check(
    payload: WebhookCheckRequest,
    x_seer_webhook_secret: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    if not x_seer_webhook_secret or x_seer_webhook_secret != settings.webhook_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook secret")
    return SafetyScanService(db).webhook_check(payload.model_dump())
