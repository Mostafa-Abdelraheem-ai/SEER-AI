from __future__ import annotations

from pathlib import Path
from typing import Dict, List

import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)


matplotlib.use("Agg")


def compute_metrics(y_true: List[str], y_pred: List[str]) -> Dict[str, object]:
    report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision_macro": precision_score(y_true, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_true, y_pred, average="macro", zero_division=0),
        "f1_macro": f1_score(y_true, y_pred, average="macro", zero_division=0),
        "per_class": report,
    }


def save_confusion_matrix(
    y_true: List[str], y_pred: List[str], labels: List[str], output_path: Path, title: str
) -> None:
    try:
        matrix = confusion_matrix(y_true, y_pred, labels=labels)
        fig, ax = plt.subplots(figsize=(10, 6))
        im = ax.imshow(matrix, cmap="Blues")
        ax.set_xticks(range(len(labels)))
        ax.set_yticks(range(len(labels)))
        ax.set_xticklabels(labels, rotation=45, ha="right")
        ax.set_yticklabels(labels)
        ax.set_title(title)
        ax.set_xlabel("Predicted")
        ax.set_ylabel("True")
        for i in range(len(labels)):
            for j in range(len(labels)):
                ax.text(j, i, str(matrix[i, j]), ha="center", va="center", color="black")
        fig.colorbar(im, ax=ax)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        fig.tight_layout()
        fig.savefig(output_path)
        plt.close(fig)
    except Exception:
        return


def misclassification_frame(
    texts: List[str], y_true: List[str], y_pred: List[str], confidences: List[float]
) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "text": texts,
            "true_label": y_true,
            "predicted_label": y_pred,
            "confidence": confidences,
        }
    ).query("true_label != predicted_label")
