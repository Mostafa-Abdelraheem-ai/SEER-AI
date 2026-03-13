from __future__ import annotations

from typing import Dict, List

import pandas as pd

from src.config import PROCESSED_DATA_DIR, REPORTS_DIR
from src.risk_engine import RiskEngine
from src.utils.io_utils import save_dataframe


def run_ablation() -> pd.DataFrame:
    df = pd.read_csv(PROCESSED_DATA_DIR / "test.csv")
    engine = RiskEngine()
    rows: List[Dict[str, object]] = []
    for text in df["text"].tolist():
        result = engine.analyze(text)
        rule_density = len(result["triggered_rules"]) / 7
        classifier_only = round(result["confidence"] * 100, 2)
        classifier_rules = round((0.7 * result["confidence"] + 0.3 * rule_density) * 100, 2)
        classifier_rules_tactic = round(
            (0.55 * result["confidence"] + 0.25 * rule_density + 0.20 * result["retrieval_relevance_score"]) * 100,
            2,
        )
        rows.append(
            {
                "text": text,
                "attack_prediction": result["attack_prediction"],
                "classifier_only": classifier_only,
                "classifier_plus_rules": classifier_rules,
                "classifier_rules_tactic": classifier_rules_tactic,
                "classifier_rules_tactic_rag": result["risk_score"],
            }
        )
    output = pd.DataFrame(rows)
    save_dataframe(output, REPORTS_DIR / "ablation_scores.csv")
    summary = pd.DataFrame(
        [
            {"setting": "classifier only", "mean_score": output["classifier_only"].mean()},
            {"setting": "classifier + rules", "mean_score": output["classifier_plus_rules"].mean()},
            {"setting": "classifier + rules + tactic proxy", "mean_score": output["classifier_rules_tactic"].mean()},
            {"setting": "classifier + rules + tactic + RAG", "mean_score": output["classifier_rules_tactic_rag"].mean()},
        ]
    )
    save_dataframe(summary, REPORTS_DIR / "ablation_summary.csv")
    return summary


if __name__ == "__main__":
    run_ablation()
