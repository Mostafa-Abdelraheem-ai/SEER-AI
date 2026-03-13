from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai.inference_pipeline import InferencePipeline
from app.models.analysis import Analysis
from app.models.incident_report import IncidentReport
from app.models.user import User
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportResponse
from app.services.audit_service import AuditService


class ReportService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.analysis_repository = AnalysisRepository(db)
        self.report_repository = ReportRepository(db)
        self.audit = AuditService(db)
        self.pipeline = InferencePipeline()

    def create(self, current_user: User, analysis_id: str) -> ReportResponse:
        analysis = self.analysis_repository.get_by_id(analysis_id)
        if not analysis or analysis.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
        existing = self.report_repository.get_by_analysis_id(analysis_id)
        if existing:
            return ReportResponse.model_validate(existing)
        ai_result = self.pipeline.analyze_message(analysis.input_text, analysis.channel)
        incident = ai_result["incident_report"]
        report = IncidentReport(
            analysis_id=analysis_id,
            severity=incident["severity"],
            report_text=incident["incident_summary"] + "\n" + incident["recommended_next_steps"],
        )
        created = self.report_repository.create(report)
        self.audit.log(current_user.id, "report.create", f"Created report {created.id} for analysis {analysis_id}")
        return ReportResponse.model_validate(created)

    def get(self, current_user: User, report_id: str) -> ReportResponse:
        report = self.report_repository.get_by_id(report_id)
        if not report or report.analysis.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        return ReportResponse.model_validate(report)
