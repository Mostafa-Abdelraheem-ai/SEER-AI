from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import JSON, Column, DateTime, MetaData, String, Table, Text, create_engine, delete, func, insert, select

from src.config import DATABASE_URL, EMBEDDING_DIMENSION

try:
    from pgvector.sqlalchemy import Vector
except Exception:  # pragma: no cover
    Vector = None


metadata = MetaData()
knowledge_chunks = Table(
    "knowledge_chunks",
    metadata,
    Column("id", String, primary_key=True, default=lambda: str(uuid.uuid4())),
    Column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False),
    Column("chunk_id", String(255), unique=True, index=True, nullable=False),
    Column("source_document", String(255), index=True, nullable=False),
    Column("chunk_text", Text, nullable=False),
    Column("metadata_json", JSON, nullable=True),
    Column("embedding", Vector(EMBEDDING_DIMENSION) if Vector is not None else JSON, nullable=False),
)


def get_engine(database_url: str | None = None):
    return create_engine(database_url or DATABASE_URL, future=True, pool_pre_ping=True)


def ensure_schema(engine) -> None:
    if engine.dialect.name == "postgresql":
        return
    metadata.create_all(engine, tables=[knowledge_chunks], checkfirst=True)


def reset_chunks(engine) -> None:
    with engine.begin() as connection:
        connection.execute(delete(knowledge_chunks))


def insert_chunks(engine, rows: list[dict[str, Any]]) -> None:
    if not rows:
        return
    with engine.begin() as connection:
        connection.execute(insert(knowledge_chunks), rows)


def fetch_all_chunks(engine) -> list[dict[str, Any]]:
    with engine.connect() as connection:
        return [dict(row._mapping) for row in connection.execute(select(knowledge_chunks))]
