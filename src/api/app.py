from __future__ import annotations

import sys
from pathlib import Path

from pydantic import BaseModel


BACKEND_DIR = Path(__file__).resolve().parents[2] / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.ai.inference_pipeline import InferencePipeline


class PredictRequest(BaseModel):
    text: str
    channel: str = "message"


@app.post("/predict")
def predict(payload: PredictRequest) -> dict:
    return InferencePipeline().analyze_message(payload.text, payload.channel)
