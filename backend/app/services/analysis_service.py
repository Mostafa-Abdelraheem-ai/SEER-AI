from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai.inference_pipeline import InferencePipeline
from app.models.analysis import Analysis
from app.models.incident_report import IncidentReport
from app.models.retrieved_chunk import RetrievedChunk
from app.models.triggered_rule import TriggeredRule
from app.models.user import User
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import AnalysisCreate, AnalysisHistoryResponse, AnalysisResponse
from app.services.audit_service import AuditService


class AnalysisService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = AnalysisRepository(db)
        self.audit = AuditService(db)
        self.pipeline = InferencePipeline()

    def create(self, current_user: User, payload: AnalysisCreate) -> AnalysisResponse:
        ai_result = self.pipeline.analyze_message(payload.input_text, payload.channel)
        analysis = Analysis(
            user_id=current_user.id,
            input_text=payload.input_text,
            channel=payload.channel,
            attack_prediction=ai_result["attack_prediction"],
            tactic_prediction=ai_result["tactic_prediction"],
            confidence=ai_result["confidence"],
            risk_score=ai_result["risk_score"],
            explanation=ai_result["explanation"],
            recommended_action=ai_result["recommended_action"],
        )
        analysis.triggered_rules = [
            TriggeredRule(rule_name=rule.split(":")[0], rule_score=1.0, matched_text=rule)
            for rule in ai_result["triggered_rules"]
        ]
        analysis.retrieved_chunks = [
            RetrievedChunk(
                source_document=chunk["source"],
                chunk_text=chunk["text"],
                relevance_score=chunk["score"],
            )
            for chunk in ai_result["retrieved_chunks"]
        ]
        analysis.incident_report = IncidentReport(
            severity=ai_result["incident_report"]["severity"],
            report_text=(
                f"{ai_result['incident_report']['incident_summary']}\n"
                f"{ai_result['incident_report']['recommended_next_steps']}"
            ),
        )
        saved = self.repository.create(analysis)
        self.audit.log(current_user.id, "analysis.create", f"Created analysis {saved.id}")
        return self._serialize(saved, saved.incident_report.report_text if saved.incident_report else None)

    def get(self, current_user: User, analysis_id: str) -> AnalysisResponse:
        analysis = self.repository.get_by_id(analysis_id)
        if not analysis or analysis.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
        incident_report = analysis.incident_report.report_text if analysis.incident_report else None
        return self._serialize(analysis, incident_report)

    def history(self, current_user: User) -> AnalysisHistoryResponse:
        items = [self._serialize(item, item.incident_report.report_text if item.incident_report else None) for item in self.repository.get_history(current_user.id)]
        return AnalysisHistoryResponse(items=items)

    def delete(self, current_user: User, analysis_id: str) -> None:
        analysis = self.repository.get_by_id(analysis_id)
        if not analysis or analysis.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
        self.repository.delete(analysis)
        self.audit.log(current_user.id, "analysis.delete", f"Deleted analysis {analysis_id}")

    @staticmethod
    def _serialize(analysis: Analysis, incident_report: str | None) -> AnalysisResponse:
        return AnalysisResponse(
            id=analysis.id,
            user_id=analysis.user_id,
            input_text=analysis.input_text,
            channel=analysis.channel,
            attack_prediction=analysis.attack_prediction,
            tactic_prediction=analysis.tactic_prediction,
            confidence=analysis.confidence,
            risk_score=analysis.risk_score,
            explanation=analysis.explanation,
            recommended_action=analysis.recommended_action,
            created_at=analysis.created_at,
            triggered_rules=list(analysis.triggered_rules),
            retrieved_chunks=list(analysis.retrieved_chunks),
            incident_report=incident_report,
        )
