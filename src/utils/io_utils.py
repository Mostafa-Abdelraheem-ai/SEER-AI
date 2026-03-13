from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def save_json(data: Any, path: Path) -> None:
    ensure_parent(path)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def save_dataframe(df: pd.DataFrame, path: Path) -> None:
    ensure_parent(path)
    df.to_csv(path, index=False)


def save_joblib(obj: Any, path: Path) -> None:
    ensure_parent(path)
    joblib.dump(obj, path)


def load_joblib(path: Path) -> Any:
    return joblib.load(path)
