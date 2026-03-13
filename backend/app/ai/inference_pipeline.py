from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class InferencePipeline:
    engine: Any = None
    analyst_agent: Any = None
    report_agent: Any = None

    def _ensure_components(self) -> None:
        if self.engine is None:
            from app.ai.risk_engine import RiskEngine

            self.engine = RiskEngine()
        if self.analyst_agent is None or self.report_agent is None:
            from app.ai.agents import IncidentReportAgent, SOCAnalystAgent

            if self.analyst_agent is None:
                self.analyst_agent = SOCAnalystAgent()
            if self.report_agent is None:
                self.report_agent = IncidentReportAgent()

    def analyze_message(self, text: str, channel: str) -> Dict[str, Any]:
        from app.ai.explainability import explain_message

        self._ensure_components()
        prediction = self.engine.analyze(text)
        explanation = explain_message(text, prediction)
        analyst_summary = self.analyst_agent.summarize(text, prediction)
        incident_report = self.report_agent.generate_report(text, prediction)
        return {
            "attack_prediction": prediction["attack_prediction"],
            "tactic_prediction": prediction["tactic_prediction"],
            "confidence": prediction["confidence"],
            "risk_score": prediction["risk_score"],
            "explanation": prediction["explanation"],
            "recommended_action": prediction["recommended_action"],
            "triggered_rules": prediction["triggered_rules"],
            "retrieved_chunks": prediction["retrieved_chunks"],
            "incident_report": incident_report,
            "analyst_summary": analyst_summary,
            "channel": channel,
            "explainability": explanation,
        }
