from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.repositories.audit_repository import AuditRepository


class AuditService:
    def __init__(self, db: Session) -> None:
        self.repository = AuditRepository(db)

    def log(self, user_id: str | None, action: str, details: str) -> None:
        self.repository.create(AuditLog(user_id=user_id, action=action, details=details))
