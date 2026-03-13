from __future__ import annotations

from pathlib import Path
from typing import Dict, List

import pandas as pd

from src.config import METRICS_DIR, PLOTS_DIR
from src.utils.io_utils import save_dataframe, save_json
from src.utils.metrics import compute_metrics, misclassification_frame, save_confusion_matrix


def evaluate_predictions(
    texts: List[str],
    y_true: List[str],
    y_pred: List[str],
    confidences: List[float],
    labels: List[str],
    prefix: str,
) -> Dict[str, object]:
    metrics = compute_metrics(y_true, y_pred)
    save_json(metrics, METRICS_DIR / f"{prefix}_metrics.json")
    misclassified = misclassification_frame(texts, y_true, y_pred, confidences)
    save_dataframe(misclassified, METRICS_DIR / f"{prefix}_misclassified.csv")
    save_confusion_matrix(
        y_true,
        y_pred,
        labels,
        PLOTS_DIR / f"{prefix}_confusion_matrix.png",
        title=f"{prefix.replace('_', ' ').title()} Confusion Matrix",
    )
    return metrics


def save_comparison_table(rows: List[Dict[str, object]], output_name: str) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    output_path = METRICS_DIR / output_name
    save_dataframe(df, output_path)
    return df
