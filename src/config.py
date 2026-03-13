from __future__ import annotations

import os
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
KNOWLEDGE_BASE_DIR = DATA_DIR / "knowledge_base"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
MODELS_DIR = OUTPUTS_DIR / "models"
METRICS_DIR = OUTPUTS_DIR / "metrics"
PLOTS_DIR = OUTPUTS_DIR / "plots"
REPORTS_DIR = OUTPUTS_DIR / "reports"
INDEX_DIR = OUTPUTS_DIR / "index"

RANDOM_SEED = 42
DEFAULT_TEXT_COLUMN = "text"
ATTACK_LABEL_COLUMN = "label_attack_type"
TACTIC_LABEL_COLUMN = "label_tactic"
ATTACK_BINARY_COLUMN = "label_attack"

CHANNELS = ["email", "sms", "chat"]
ATTACK_LABELS = [
    "benign",
    "phishing",
    "spear phishing",
    "smishing",
    "authority impersonation",
    "urgency manipulation",
    "financial fraud",
    "credential harvesting",
]
TACTIC_LABELS = [
    "none",
    "urgency",
    "authority",
    "fear",
    "secrecy",
    "reward",
    "scarcity",
    "reciprocity",
    "social proof",
]

TRANSFORMER_MODEL_NAME = os.getenv("SEER_TRANSFORMER_MODEL", "distilbert-base-uncased")
SENTENCE_MODEL_NAME = os.getenv("SEER_SENTENCE_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
OPENAI_MODEL_NAME = os.getenv("SEER_OPENAI_MODEL", "gpt-4o-mini")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USE_OPENAI = bool(OPENAI_API_KEY)

MAX_CHUNK_SIZE = 450
CHUNK_OVERLAP = 60

for directory in [
    PROCESSED_DATA_DIR,
    MODELS_DIR,
    METRICS_DIR,
    PLOTS_DIR,
    REPORTS_DIR,
    INDEX_DIR,
]:
    directory.mkdir(parents=True, exist_ok=True)
