from __future__ import annotations

from src.risk_engine import RULE_SETS

from app.ai.fusion import MultimodalFusionService
from app.ai.rag.reasoning import EnhancedRAGService
from app.ai.text_models import HybridTextSafetyModels
from app.observability.metrics import record_pipeline_event
from src.preprocessing import extract_urls


class SafetyAIRuntime:
    def __init__(self) -> None:
        self.text_models = HybridTextSafetyModels()
        self.rag = EnhancedRAGService()
        self.fusion = MultimodalFusionService()

    def analyze_message(self, text: str, channel: str) -> dict:
        model_output = self.text_models.analyze(text)
        retrieval = self.rag.explain(text)
        triggered_rules = self._triggered_rules(text)
        fusion = self.fusion.fuse_text_and_retrieval(
            text=text,
            channel=channel,
            model_output=model_output,
            retrieval_result=retrieval,
            triggered_rules=triggered_rules,
        )
        if fusion.degraded_mode:
            record_pipeline_event("ai_runtime", "degraded_mode")
        return {
            "attack_prediction": model_output.attack_label,
            "tactic_prediction": model_output.tactic_scores[0].label if model_output.tactic_scores else "none",
            "tactics": [item.__dict__ for item in model_output.tactic_scores],
            "confidence": fusion.confidence,
            "risk_score": fusion.risk_score,
            "explanation": fusion.explanation,
            "recommended_action": fusion.recommendation,
            "triggered_rules": triggered_rules,
            "retrieved_chunks": [
                {"source": citation.source, "text": citation.snippet, "score": citation.score}
                for citation in retrieval.citations
            ],
            "citations": [citation.__dict__ for citation in retrieval.citations],
            "evidence_summary": [item.__dict__ for item in fusion.evidence],
            "degraded_mode": fusion.degraded_mode,
            "provider_path": {
                "text": model_output.provider,
                "retrieval": retrieval.provider,
            },
            "token_usage": model_output.token_usage,
            "urls": extract_urls(text),
        }

    @staticmethod
    def _triggered_rules(text: str) -> list[str]:
        lowered = text.lower()
        triggered: list[str] = []
        for rule_name, keywords in RULE_SETS.items():
            matches = [keyword for keyword in keywords if keyword in lowered]
            if matches:
                triggered.append(f"{rule_name}: {', '.join(matches)}")
        urls = extract_urls(text)
        if urls:
            suspicious = [url for url in urls if any(token in url for token in ["bit.ly", "login", "verify", "@"])]
            if suspicious:
                triggered.append(f"suspicious links/domains: {', '.join(suspicious)}")
        return triggered
