from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

import pandas as pd
from sklearn.model_selection import train_test_split

from src.config import (
    ATTACK_BINARY_COLUMN,
    ATTACK_LABEL_COLUMN,
    PROCESSED_DATA_DIR,
    RANDOM_SEED,
    RAW_DATA_DIR,
    TACTIC_LABEL_COLUMN,
)
from src.preprocessing import clean_text


UNIFIED_COLUMNS = [
    "text",
    ATTACK_BINARY_COLUMN,
    ATTACK_LABEL_COLUMN,
    TACTIC_LABEL_COLUMN,
    "source",
    "channel",
]


def _safe_stratify(series: pd.Series) -> Optional[pd.Series]:
    counts = series.value_counts()
    return series if not counts.empty and counts.min() >= 2 else None


@dataclass
class DataPipeline:
    raw_dir: Optional[str] = None
    processed_dir: Optional[str] = None

    def __post_init__(self) -> None:
        self.raw_dir = str(RAW_DATA_DIR if self.raw_dir is None else self.raw_dir)
        self.processed_dir = str(PROCESSED_DATA_DIR if self.processed_dir is None else self.processed_dir)

    def _load_phishing_emails(self) -> pd.DataFrame:
        df = pd.read_csv(f"{self.raw_dir}/phishing_emails.csv")
        rename_map = {"body": "text", "attack_type": ATTACK_LABEL_COLUMN, "tactic": TACTIC_LABEL_COLUMN}
        df = df.rename(columns=rename_map)
        df["label_attack"] = 1
        df["source"] = df.get("source", "phishing_emails")
        df["channel"] = df.get("channel", "email")
        return df

    def _load_sms_spam(self) -> pd.DataFrame:
        df = pd.read_csv(f"{self.raw_dir}/sms_spam.csv")
        df = df.rename(columns={"message": "text"})
        label_map = {"spam": "smishing", "ham": "benign"}
        tactic_map = {
            "spam": "reward",
            "ham": "none",
        }
        df[ATTACK_LABEL_COLUMN] = df["label"].map(label_map).fillna("smishing")
        df[TACTIC_LABEL_COLUMN] = df["label"].map(tactic_map).fillna("urgency")
        df["label_attack"] = (df["label"] == "spam").astype(int)
        df["source"] = "sms_spam"
        df["channel"] = "sms"
        return df

    def _load_benign_emails(self) -> pd.DataFrame:
        df = pd.read_csv(f"{self.raw_dir}/benign_emails.csv")
        df = df.rename(columns={"body": "text"})
        df["label_attack"] = 0
        df[ATTACK_LABEL_COLUMN] = "benign"
        df[TACTIC_LABEL_COLUMN] = "none"
        df["source"] = "benign_emails"
        df["channel"] = "email"
        return df

    def _load_persuasion_labels(self) -> pd.DataFrame:
        df = pd.read_csv(f"{self.raw_dir}/persuasion_labels.csv")
        df["label_attack"] = df["label_attack"].fillna(1).astype(int)
        df[ATTACK_LABEL_COLUMN] = df[ATTACK_LABEL_COLUMN].fillna("phishing")
        df[TACTIC_LABEL_COLUMN] = df[TACTIC_LABEL_COLUMN].fillna("urgency")
        df["source"] = df.get("source", "persuasion_labels")
        df["channel"] = df.get("channel", "chat")
        return df

    def load_and_harmonize(self) -> pd.DataFrame:
        frames = [
            self._load_phishing_emails(),
            self._load_sms_spam(),
            self._load_benign_emails(),
            self._load_persuasion_labels(),
        ]
        combined = pd.concat(frames, ignore_index=True)
        combined["text"] = combined["text"].astype(str).map(clean_text)
        combined[TACTIC_LABEL_COLUMN] = combined[TACTIC_LABEL_COLUMN].fillna("none")
        combined[ATTACK_LABEL_COLUMN] = combined[ATTACK_LABEL_COLUMN].fillna("benign")
        combined["label_attack"] = combined["label_attack"].fillna(
            (combined[ATTACK_LABEL_COLUMN] != "benign").astype(int)
        )
        combined = combined[UNIFIED_COLUMNS].dropna(subset=["text"]).drop_duplicates()
        return combined

    def create_splits(self, df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
        stratify = _safe_stratify(df[ATTACK_LABEL_COLUMN])
        train_df, temp_df = train_test_split(
            df, test_size=0.3, random_state=RANDOM_SEED, stratify=stratify
        )
        val_df, test_df = train_test_split(
            temp_df,
            test_size=0.5,
            random_state=RANDOM_SEED,
            stratify=_safe_stratify(temp_df[ATTACK_LABEL_COLUMN]),
        )
        return {"train": train_df, "val": val_df, "test": test_df}

    def save_splits(self, splits: Dict[str, pd.DataFrame]) -> None:
        for split_name, split_df in splits.items():
            split_df.to_csv(f"{self.processed_dir}/{split_name}.csv", index=False)

    def run(self) -> Dict[str, pd.DataFrame]:
        unified = self.load_and_harmonize()
        splits = self.create_splits(unified)
        self.save_splits(splits)
        return splits


def build_dataset() -> Dict[str, pd.DataFrame]:
    return DataPipeline().run()


if __name__ == "__main__":
    build_dataset()
