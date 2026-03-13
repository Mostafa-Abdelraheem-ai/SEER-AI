from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analysis import Analysis


class AnalysisRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, analysis: Analysis) -> Analysis:
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def get_by_id(self, analysis_id: str) -> Analysis | None:
        return self.db.get(Analysis, analysis_id)

    def get_history(self, user_id: str) -> list[Analysis]:
        statement = select(Analysis).where(Analysis.user_id == user_id).order_by(Analysis.created_at.desc())
        return list(self.db.scalars(statement).all())

    def delete(self, analysis: Analysis) -> None:
        self.db.delete(analysis)
        self.db.commit()
