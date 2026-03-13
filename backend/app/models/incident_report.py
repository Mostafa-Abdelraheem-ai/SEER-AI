from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    analysis_id: Mapped[str] = mapped_column(ForeignKey("analyses.id"), nullable=False, unique=True, index=True)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    report_text: Mapped[str] = mapped_column(Text, nullable=False)

    analysis = relationship("Analysis", back_populates="incident_report")
