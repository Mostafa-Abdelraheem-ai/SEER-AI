from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text

from app.core.config import get_settings
from app.core.database import database_is_available, engine


router = APIRouter()
settings = get_settings()


def _vector_store_ready() -> bool:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT COUNT(*) FROM knowledge_chunks"))
        return True
    except Exception:
        return False


@router.get("/health/live")
def liveness() -> dict[str, str]:
    return {"status": "ok", "service": "seer-ai-backend"}


@router.get("/health/ready")
def readiness() -> dict[str, object]:
    if not database_is_available():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")
    vector_ready = True
    if settings.enable_rag:
        vector_ready = _vector_store_ready()
    if settings.enable_rag and not vector_ready:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Vector store unavailable")
    checks = {"database": "ok", "vector_store": "ok" if settings.enable_rag else "disabled"}
    return {"status": "ok", "service": "seer-ai-backend", "checks": checks}


@router.get("/health")
def health() -> dict[str, object]:
    return readiness()
