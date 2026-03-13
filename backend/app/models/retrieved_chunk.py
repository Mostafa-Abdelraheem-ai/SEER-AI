from __future__ import annotations

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class RetrievedChunk(Base):
    __tablename__ = "retrieved_chunks"

    analysis_id: Mapped[str] = mapped_column(ForeignKey("analyses.id"), nullable=False, index=True)
    source_document: Mapped[str] = mapped_column(String(255), nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    relevance_score: Mapped[float] = mapped_column(Float, nullable=False)

    analysis = relationship("Analysis", back_populates="retrieved_chunks")
