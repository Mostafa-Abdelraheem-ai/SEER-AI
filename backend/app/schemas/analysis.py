from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class AnalysisCreate(BaseModel):
    input_text: str = Field(..., min_length=3)
    channel: str = "email"


class TriggeredRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    rule_name: str
    rule_score: float
    matched_text: str


class RetrievedChunkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_document: str
    chunk_text: str
    relevance_score: float


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    input_text: str
    channel: str
    attack_prediction: str
    tactic_prediction: str
    confidence: float
    risk_score: int
    explanation: str
    recommended_action: str
    created_at: datetime
    triggered_rules: List[TriggeredRuleResponse] = []
    retrieved_chunks: List[RetrievedChunkResponse] = []
    incident_report: str | None = None


class AnalysisHistoryResponse(BaseModel):
    items: List[AnalysisResponse]
