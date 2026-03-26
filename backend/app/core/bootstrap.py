from __future__ import annotations

import logging
import subprocess
import time

from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import SessionLocal, database_is_available
from app.core.database import Base
from app.models.knowledge_chunk import KnowledgeChunk
from app.models import analysis, audit_log, incident_report, knowledge_chunk, retrieved_chunk, safety_scan, triggered_rule, user  # noqa: F401
from src.rag.build_index import build_index


logger = logging.getLogger(__name__)


def _is_sqlite(database_url: str) -> bool:
    return database_url.startswith("sqlite")


def wait_for_database(max_attempts: int = 30, delay_seconds: int = 2) -> None:
    settings = get_settings()
    if _is_sqlite(settings.database_url):
        logger.info("SQLite detected, skipping database wait loop")
        return
    for attempt in range(1, max_attempts + 1):
        if database_is_available():
            logger.info("Database connection ready after %s attempt(s)", attempt)
            return
        logger.info("Waiting for database (%s/%s)", attempt, max_attempts)
        time.sleep(delay_seconds)
    raise RuntimeError("Database did not become available in time")


def run_migrations() -> None:
    settings = get_settings()
    if _is_sqlite(settings.database_url):
        logger.info("SQLite detected, creating tables directly for lightweight local mode")
        Base.metadata.create_all(bind=SessionLocal.kw["bind"])
        return
    subprocess.run(["alembic", "-c", "backend/alembic.ini", "upgrade", "head"], check=True)


def ensure_knowledge_base_index() -> None:
    settings = get_settings()
    if not settings.enable_rag:
        logger.info("RAG disabled, skipping knowledge base indexing")
        return
    with SessionLocal() as session:
        chunk_count = session.scalar(select(KnowledgeChunk.id).limit(1))
    if chunk_count:
        logger.info("Knowledge base already indexed")
        return
    logger.info("Knowledge base is empty, building pgvector index")
    build_index(database_url=settings.database_url)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    wait_for_database()
    run_migrations()
    ensure_knowledge_base_index()


if __name__ == "__main__":
    main()
