from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from src.config import ATTACK_LABEL_COLUMN, ATTACK_LABELS, MODELS_DIR, PROCESSED_DATA_DIR
from src.evaluate import evaluate_predictions, save_comparison_table

try:
    import torch
    from datasets import Dataset
    from transformers import (
        AutoModelForSequenceClassification,
        AutoTokenizer,
        DataCollatorWithPadding,
        Trainer,
        TrainingArguments,
    )

    TRANSFORMERS_AVAILABLE = True
except Exception:
    TRANSFORMERS_AVAILABLE = False


def load_splits() -> Dict[str, pd.DataFrame]:
    return {
        split: pd.read_csv(PROCESSED_DATA_DIR / f"{split}.csv")
        for split in ["train", "val", "test"]
    }


def build_baselines() -> Dict[str, Pipeline]:
    return {
        "tfidf_logreg": Pipeline(
            [
                ("vectorizer", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=5000)),
                ("classifier", LogisticRegression(max_iter=1200, class_weight="balanced")),
            ]
        ),
        "tfidf_rf": Pipeline(
            [
                ("vectorizer", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=5000)),
                ("classifier", RandomForestClassifier(n_estimators=200, random_state=42)),
            ]
        ),
    }


def evaluate_sklearn_model(name: str, model: Pipeline, splits: Dict[str, pd.DataFrame]) -> Dict[str, object]:
    train_df, test_df = splits["train"], splits["test"]
    model.fit(train_df["text"], train_df[ATTACK_LABEL_COLUMN])
    predictions = model.predict(test_df["text"])
    probabilities = model.predict_proba(test_df["text"]).max(axis=1).tolist()
    metrics = evaluate_predictions(
        texts=test_df["text"].tolist(),
        y_true=test_df[ATTACK_LABEL_COLUMN].tolist(),
        y_pred=predictions.tolist(),
        confidences=probabilities,
        labels=ATTACK_LABELS,
        prefix=name,
    )
    joblib.dump(model, MODELS_DIR / f"{name}.joblib")
    return {
        "model": name,
        "accuracy": metrics["accuracy"],
        "precision_macro": metrics["precision_macro"],
        "recall_macro": metrics["recall_macro"],
        "f1_macro": metrics["f1_macro"],
    }


@dataclass
class TransformerArtifacts:
    name: str
    model_dir: Path
    labels: List[str]


def train_transformer_if_available(
    splits: Dict[str, pd.DataFrame]
) -> Tuple[Optional[TransformerArtifacts], Optional[Dict[str, object]]]:
    if not TRANSFORMERS_AVAILABLE:
        return None, None

    label_list = sorted(splits["train"][ATTACK_LABEL_COLUMN].unique().tolist())
    label_to_id = {label: idx for idx, label in enumerate(label_list)}
    id_to_label = {idx: label for label, idx in label_to_id.items()}

    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

    def to_dataset(df: pd.DataFrame) -> Dataset:
        dataset = Dataset.from_pandas(df[["text", ATTACK_LABEL_COLUMN]])
        dataset = dataset.map(
            lambda batch: tokenizer(batch["text"], truncation=True),
            batched=True,
        )
        dataset = dataset.map(lambda batch: {"labels": [label_to_id[x] for x in batch[ATTACK_LABEL_COLUMN]]}, batched=True)
        return dataset

    train_ds = to_dataset(splits["train"])
    val_ds = to_dataset(splits["val"])
    test_df = splits["test"]

    model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert-base-uncased",
        num_labels=len(label_list),
        id2label=id_to_label,
        label2id=label_to_id,
    )

    training_args = TrainingArguments(
        output_dir=str(MODELS_DIR / "attack_transformer_checkpoints"),
        num_train_epochs=1,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        learning_rate=3e-5,
        logging_steps=5,
        eval_strategy="epoch",
        save_strategy="no",
        report_to=[],
        seed=42,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer),
    )
    trainer.train()
    predictions = trainer.predict(to_dataset(test_df))
    probs = torch.tensor(predictions.predictions).softmax(dim=-1).numpy()
    pred_ids = probs.argmax(axis=1).tolist()
    pred_labels = [id_to_label[idx] for idx in pred_ids]
    confidences = probs.max(axis=1).tolist()
    model_dir = MODELS_DIR / "attack_transformer"
    trainer.save_model(str(model_dir))
    tokenizer.save_pretrained(str(model_dir))
    metrics = evaluate_predictions(
        texts=test_df["text"].tolist(),
        y_true=test_df[ATTACK_LABEL_COLUMN].tolist(),
        y_pred=pred_labels,
        confidences=confidences,
        labels=ATTACK_LABELS,
        prefix="attack_transformer",
    )
    return TransformerArtifacts(name="attack_transformer", model_dir=model_dir, labels=label_list), {
        "model": "attack_transformer",
        "accuracy": metrics["accuracy"],
        "precision_macro": metrics["precision_macro"],
        "recall_macro": metrics["recall_macro"],
        "f1_macro": metrics["f1_macro"],
    }


def main() -> None:
    splits = load_splits()
    rows = []
    for name, model in build_baselines().items():
        rows.append(evaluate_sklearn_model(name, model, splits))
    try:
        _, transformer_row = train_transformer_if_available(splits)
        if transformer_row:
            rows.append(transformer_row)
    except Exception as exc:
        rows.append(
            {
                "model": "attack_transformer_failed",
                "accuracy": 0.0,
                "precision_macro": 0.0,
                "recall_macro": 0.0,
                "f1_macro": 0.0,
                "notes": str(exc),
            }
        )
    save_comparison_table(rows, "attack_model_comparison.csv")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.parse_args()
    main()
