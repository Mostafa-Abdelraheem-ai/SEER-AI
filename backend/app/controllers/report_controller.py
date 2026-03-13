from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.report import ReportResponse
from app.services.report_service import ReportService


router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/{analysis_id}", response_model=ReportResponse)
def create_report(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportResponse:
    return ReportService(db).create(current_user, analysis_id)


@router.get("/{id}", response_model=ReportResponse)
def get_report(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportResponse:
    return ReportService(db).get(current_user, id)
