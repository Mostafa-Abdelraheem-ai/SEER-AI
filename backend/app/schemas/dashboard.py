from __future__ import annotations

from typing import List

from pydantic import BaseModel

from app.schemas.analysis import AnalysisResponse


class OverviewResponse(BaseModel):
    total_analyses: int
    total_reports: int
    high_risk_count: int


class DistributionBucket(BaseModel):
    label: str
    value: int


class AttackTypeBucket(BaseModel):
    attack_type: str
    count: int


class RecentAnalysesResponse(BaseModel):
    items: List[AnalysisResponse]
