from __future__ import annotations

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TriggeredRule(Base):
    __tablename__ = "triggered_rules"

    analysis_id: Mapped[str] = mapped_column(ForeignKey("analyses.id"), nullable=False, index=True)
    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rule_score: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    matched_text: Mapped[str] = mapped_column(Text, nullable=False)

    analysis = relationship("Analysis", back_populates="triggered_rules")
