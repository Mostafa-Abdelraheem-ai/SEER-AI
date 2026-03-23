from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.core.database import database_is_available


router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    if not database_is_available():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")
    return {"status": "ok", "service": "seer-ai-backend"}
