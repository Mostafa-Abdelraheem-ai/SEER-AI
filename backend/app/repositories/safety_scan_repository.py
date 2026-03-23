from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.safety_scan import SafetyScan


class SafetyScanRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, scan: SafetyScan) -> SafetyScan:
        self.db.add(scan)
        self.db.commit()
        self.db.refresh(scan)
        return scan

    def get_by_id(self, scan_id: str) -> SafetyScan | None:
        return self.db.get(SafetyScan, scan_id)

    def get_history(self, user_id: str, limit: int | None = None) -> list[SafetyScan]:
        statement = select(SafetyScan).where(SafetyScan.user_id == user_id).order_by(SafetyScan.created_at.desc())
        if limit is not None:
            statement = statement.limit(limit)
        return list(self.db.scalars(statement).all())
