from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.incident_report import IncidentReport


class ReportRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, report: IncidentReport) -> IncidentReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_by_id(self, report_id: str) -> IncidentReport | None:
        return self.db.get(IncidentReport, report_id)

    def get_by_analysis_id(self, analysis_id: str) -> IncidentReport | None:
        return self.db.scalar(select(IncidentReport).where(IncidentReport.analysis_id == analysis_id))

    def count(self) -> int:
        return len(list(self.db.scalars(select(IncidentReport.id)).all()))
