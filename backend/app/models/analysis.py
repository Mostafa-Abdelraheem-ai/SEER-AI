from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[str] = mapped_column(String(50), nullable=False)
    attack_prediction: Mapped[str] = mapped_column(String(100), nullable=False)
    tactic_prediction: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)

    user = relationship("User", back_populates="analyses")
    triggered_rules = relationship("TriggeredRule", back_populates="analysis", cascade="all, delete-orphan")
    retrieved_chunks = relationship("RetrievedChunk", back_populates="analysis", cascade="all, delete-orphan")
    incident_report = relationship("IncidentReport", back_populates="analysis", uselist=False, cascade="all, delete-orphan")
