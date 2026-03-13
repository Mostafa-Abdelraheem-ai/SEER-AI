from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.analysis import AnalysisCreate, AnalysisHistoryResponse, AnalysisResponse
from app.services.analysis_service import AnalysisService


router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("", response_model=AnalysisResponse)
def create_analysis(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisResponse:
    return AnalysisService(db).create(current_user, payload)


@router.get("/history", response_model=AnalysisHistoryResponse)
def analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisHistoryResponse:
    return AnalysisService(db).history(current_user)


@router.get("/{id}", response_model=AnalysisResponse)
def get_analysis(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisResponse:
    return AnalysisService(db).get(current_user, id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    AnalysisService(db).delete(current_user, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
