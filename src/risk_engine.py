from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

import joblib
import numpy as np

from src.config import MODELS_DIR
from src.explainability import build_plain_english_explanation
from src.preprocessing import contains_any, extract_urls
from src.rag.retriever import LocalRetriever


RULE_SETS = {
    "urgent language": ["urgent", "immediately", "asap", "today", "now", "final notice"],
    "authority terms": ["ceo", "cfo", "manager", "hr", "bank", "microsoft", "it desk"],
    "credential request": ["password", "verify account", "login", "otp", "credential", "username"],
    "payment request": ["wire", "gift card", "payment", "invoice", "bank transfer", "crypto"],
    "secrecy language": ["keep this confidential", "do not tell", "secret", "private request"],
    "account closure threat": ["suspended", "closed", "disabled", "terminate", "locked"],
}


def _normalize(probability: float) -> float:
    return max(0.0, min(1.0, float(probability)))


@dataclass
class RiskEngine:
    attack_model_path: Optional[Path] = None
    tactic_model_path: Optional[Path] = None

    def __post_init__(self) -> None:
        attack_path = self.attack_model_path or MODELS_DIR / "tfidf_logreg.joblib"
        tactic_path = self.tactic_model_path or MODELS_DIR / "tactic_model.joblib"
        self.attack_model = joblib.load(attack_path) if attack_path.exists() else None
        self.tactic_model = joblib.load(tactic_path) if tactic_path.exists() else None
        self.retriever = LocalRetriever()

    def _predict_attack(self, text: str) -> Dict[str, object]:
        if self.attack_model is None:
            return {"label": "benign", "confidence": 0.5}
        label = self.attack_model.predict([text])[0]
        confidence = float(self.attack_model.predict_proba([text]).max())
        return {"label": label, "confidence": confidence}

    def _predict_tactic(self, text: str) -> Dict[str, object]:
        if self.tactic_model is None:
            return {"label": "none", "confidence": 0.5}
        label = self.tactic_model.predict([text])[0]
        confidence = float(self.tactic_model.predict_proba([text]).max())
        return {"label": label, "confidence": confidence}

    def _rule_score(self, text: str) -> Dict[str, object]:
        triggered_rules: List[str] = []
        normalized_hits = 0
        for rule_name, keywords in RULE_SETS.items():
            matches = [keyword for keyword in keywords if keyword in text.lower()]
            if matches:
                triggered_rules.append(f"{rule_name}: {', '.join(matches)}")
                normalized_hits += 1
        urls = extract_urls(text)
        if urls:
            suspicious = [url for url in urls if any(token in url for token in ["bit.ly", "@", "login", "verify"])]
            if suspicious:
                triggered_rules.append(f"suspicious links/domains: {', '.join(suspicious)}")
                normalized_hits += 1
        score = normalized_hits / (len(RULE_SETS) + 1)
        return {"score": _normalize(score), "triggered_rules": triggered_rules}

    def analyze(self, text: str) -> Dict[str, object]:
        attack = self._predict_attack(text)
        tactic = self._predict_tactic(text)
        rules = self._rule_score(text)
        retrieval = self.retriever.retrieve(text, top_k=3)
        retrieval_score = retrieval["relevance_scores"][0] if retrieval["relevance_scores"] else 0.0
        final_risk = (
            0.50 * _normalize(attack["confidence"])
            + 0.20 * _normalize(tactic["confidence"])
            + 0.20 * _normalize(rules["score"])
            + 0.10 * _normalize(retrieval_score)
        )
        risk_score = int(round(final_risk * 100))
        recommended_action = self._recommended_action(attack["label"], risk_score)
        result = {
            "attack_prediction": attack["label"],
            "tactic_prediction": tactic["label"],
            "confidence": round(float(attack["confidence"]), 4),
            "risk_score": risk_score,
            "triggered_rules": rules["triggered_rules"],
            "retrieved_chunks": retrieval["retrieved_chunks"],
            "retrieval_relevance_score": round(float(retrieval_score), 4),
            "recommended_action": recommended_action,
        }
        result["explanation"] = build_plain_english_explanation(result)
        return result

    @staticmethod
    def _recommended_action(attack_label: str, risk_score: int) -> str:
        if attack_label == "benign" and risk_score < 45:
            return "Log as benign, keep for analyst spot-checking, and monitor for repeated patterns."
        if risk_score >= 80:
            return "Escalate to SOC triage, block sender or URL, and notify the affected user immediately."
        if risk_score >= 60:
            return "Queue for analyst review, enrich with sender metadata, and isolate any linked artifacts."
        return "Monitor and request user verification before any action involving credentials or payment."
