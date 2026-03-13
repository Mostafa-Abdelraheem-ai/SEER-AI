from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.analysis import AnalysisResponse
from app.schemas.dashboard import AttackTypeBucket, DistributionBucket, OverviewResponse, RecentAnalysesResponse
from app.services.analysis_service import AnalysisService


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.repository = DashboardRepository(db)
        self.analysis_service = AnalysisService(db)

    def overview(self, current_user: User) -> OverviewResponse:
        analyses = self.repository.analyses_for_user(current_user.id)
        reports = self.repository.reports_for_user(current_user.id)
        return OverviewResponse(
            total_analyses=len(analyses),
            total_reports=len(reports),
            high_risk_count=len([item for item in analyses if item.risk_score >= 70]),
        )

    def risk_distribution(self, current_user: User) -> list[DistributionBucket]:
        analyses = self.repository.analyses_for_user(current_user.id)
        return [DistributionBucket(**item) for item in self.repository.risk_distribution(analyses)]

    def attack_types(self, current_user: User) -> list[AttackTypeBucket]:
        analyses = self.repository.analyses_for_user(current_user.id)
        return [AttackTypeBucket(**item) for item in self.repository.attack_types(analyses)]

    def recent_analyses(self, current_user: User) -> RecentAnalysesResponse:
        history = self.analysis_service.history(current_user)
        return RecentAnalysesResponse(items=history.items[:5])
