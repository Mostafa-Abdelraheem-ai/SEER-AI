from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.dashboard import AttackTypeBucket, DistributionBucket, OverviewResponse, RecentAnalysesResponse
from app.services.dashboard_service import DashboardService


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=OverviewResponse)
def overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OverviewResponse:
    return DashboardService(db).overview(current_user)


@router.get("/risk-distribution", response_model=list[DistributionBucket])
def risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DistributionBucket]:
    return DashboardService(db).risk_distribution(current_user)


@router.get("/attack-types", response_model=list[AttackTypeBucket])
def attack_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AttackTypeBucket]:
    return DashboardService(db).attack_types(current_user)


@router.get("/recent-analyses", response_model=RecentAnalysesResponse)
def recent_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecentAnalysesResponse:
    return DashboardService(db).recent_analyses(current_user)
