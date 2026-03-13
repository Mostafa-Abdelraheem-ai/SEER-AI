from __future__ import annotations

from typing import Dict, List


def evidence_summary(result: Dict[str, object]) -> List[str]:
    evidence = []
    if result.get("triggered_rules"):
        evidence.append("rule-based indicators")
    if result.get("retrieved_chunks"):
        evidence.append("retrieved knowledge-base context")
    if result.get("confidence", 0.0) >= 0.75:
        evidence.append("high classifier confidence")
    return evidence


def uncertainty_statement(result: Dict[str, object]) -> str:
    confidence = float(result.get("confidence", 0.0))
    if confidence < 0.6:
        return "Evidence is limited, so this should be treated as a lead rather than a confirmed incident."
    return "This assessment is based on message content only and does not confirm compromise."


def guardrail_footer(result: Dict[str, object]) -> str:
    return uncertainty_statement(result)
