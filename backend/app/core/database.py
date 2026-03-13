from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, create_engine, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.core.config import get_settings


settings = get_settings()
engine = create_engine(settings.database_url, future=True, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
