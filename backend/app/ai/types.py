from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class TacticScore:
    label: str
    confidence: float


@dataclass
class SafetyModelOutput:
    attack_label: str
    confidence: float
    tactic_scores: list[TacticScore]
    provider: str
    reasoning: str
    fallback_used: bool = False
    token_usage: dict[str, int] = field(default_factory=dict)
    cost_estimate_usd: float | None = None


@dataclass
class RetrievalCitation:
    source: str
    snippet: str
    score: float


@dataclass
class RetrievalResult:
    citations: list[RetrievalCitation]
    synthesized_explanation: str
    provider: str
    fallback_used: bool = False
    top_score: float | None = None


@dataclass
class FusionEvidence:
    source: str
    score: float
    summary: str
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class FusionResult:
    risk_score: int
    confidence: float
    verdict: str
    explanation: str
    recommendation: str
    evidence: list[FusionEvidence]
    degraded_mode: bool
