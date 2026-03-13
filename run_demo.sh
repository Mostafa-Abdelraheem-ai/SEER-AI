#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
export PYTHONPATH=.

python -m src.data_pipeline
python -m src.rag.build_index
python -m src.train_classifier
python -m src.train_tactic_model

echo "Starting FastAPI on http://127.0.0.1:8000"
echo "Run Streamlit separately with: streamlit run app/streamlit_app.py"
uvicorn src.api.app:app --host 127.0.0.1 --port 8000
