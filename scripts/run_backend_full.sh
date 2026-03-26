#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
VENV_DIR="${VENV_DIR:-$ROOT_DIR/.venv310}"

if [ ! -x "$VENV_DIR/bin/python" ]; then
  echo "Virtual environment not found at $VENV_DIR"
  echo "Create it first and install the full backend requirements."
  exit 1
fi

export DATABASE_URL="${DATABASE_URL:-postgresql+psycopg://seer:seer@localhost:5432/seer_ai_pp}"
export ENABLE_RAG="${ENABLE_RAG:-true}"
export ENABLE_OCR="${ENABLE_OCR:-true}"
export ENABLE_MONITORING="${ENABLE_MONITORING:-true}"
export ENABLE_HEAVY_MODELS="${ENABLE_HEAVY_MODELS:-false}"
export METRICS_ENABLED="${METRICS_ENABLED:-true}"
export PYTHONPATH="$ROOT_DIR/backend:$ROOT_DIR"

"$VENV_DIR/bin/python" -m app.core.bootstrap
exec "$VENV_DIR/bin/uvicorn" app.main:app --app-dir "$ROOT_DIR/backend" --host 127.0.0.1 --port "${PORT:-8000}" --reload
