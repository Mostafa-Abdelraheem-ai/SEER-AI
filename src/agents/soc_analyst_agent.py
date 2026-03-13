from __future__ import annotations

from typing import Dict

from src.agents.guardrails import guardrail_footer
from src.agents.llm_client import LLMClient


class SOCAnalystAgent:
    def __init__(self) -> None:
        self.llm = LLMClient()

    def summarize(self, text: str, analysis: Dict[str, object]) -> str:
        chunks = analysis.get("retrieved_chunks", [])
        citations = "; ".join(f"{chunk['source']} (score={chunk['score']})" for chunk in chunks[:2]) or "no KB citations"
        fallback = (
            f"Analyst summary: The message is assessed as {analysis['attack_prediction']} with "
            f"risk score {analysis['risk_score']}/100. Likely persuasion tactic: {analysis['tactic_prediction']}. "
            f"Observed indicators: {', '.join(analysis.get('triggered_rules', [])[:4]) or 'none prominent'}. "
            f"Supporting knowledge: {citations}. {guardrail_footer(analysis)}"
        )
        return self.llm.generate(
            system_prompt=(
                "You are a SOC analyst. Use only supplied evidence. State uncertainty explicitly and do not claim confirmed compromise."
            ),
            user_prompt=f"Message: {text}\nAnalysis: {analysis}\nCitations: {citations}",
            fallback=fallback,
        )
