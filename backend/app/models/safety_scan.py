from __future__ import annotations

from typing import Any

from sqlalchemy import ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SafetyScan(Base):
    __tablename__ = "safety_scans"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    scan_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    verdict: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    advice: Mapped[str] = mapped_column(Text, nullable=False)
    input_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    findings_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    extracted_urls_json: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    parsed_email_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    limitations_json: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    user = relationship("User", back_populates="safety_scans")
