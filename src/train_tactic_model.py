from __future__ import annotations

import argparse
from typing import Dict, List

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from src.config import MODELS_DIR, PROCESSED_DATA_DIR, TACTIC_LABEL_COLUMN, TACTIC_LABELS
from src.evaluate import evaluate_predictions, save_comparison_table


def load_splits() -> Dict[str, pd.DataFrame]:
    return {
        split: pd.read_csv(PROCESSED_DATA_DIR / f"{split}.csv")
        for split in ["train", "val", "test"]
    }


def build_tactic_model() -> Pipeline:
    return Pipeline(
        [
            ("vectorizer", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=4000)),
            ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )


def main() -> None:
    splits = load_splits()
    model = build_tactic_model()
    train_df, test_df = splits["train"], splits["test"]
    model.fit(train_df["text"], train_df[TACTIC_LABEL_COLUMN])
    predictions = model.predict(test_df["text"])
    confidences = model.predict_proba(test_df["text"]).max(axis=1).tolist()
    metrics = evaluate_predictions(
        texts=test_df["text"].tolist(),
        y_true=test_df[TACTIC_LABEL_COLUMN].tolist(),
        y_pred=predictions.tolist(),
        confidences=confidences,
        labels=TACTIC_LABELS,
        prefix="tactic_model",
    )
    joblib.dump(model, MODELS_DIR / "tactic_model.joblib")
    save_comparison_table(
        [
            {
                "model": "tactic_logreg",
                "accuracy": metrics["accuracy"],
                "precision_macro": metrics["precision_macro"],
                "recall_macro": metrics["recall_macro"],
                "f1_macro": metrics["f1_macro"],
            }
        ],
        "tactic_model_comparison.csv",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.parse_args()
    main()
