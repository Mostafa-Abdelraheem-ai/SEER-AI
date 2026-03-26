#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
VENV_DIR="${VENV_DIR:-$ROOT_DIR/.venv-local}"

if [ ! -x "$VENV_DIR/bin/python" ]; then
  echo "Virtual environment not found at $VENV_DIR"
  echo "Create it first with:"
  echo "  python3 -m venv .venv-local"
  echo "  .venv-local/bin/pip install -r backend/requirements-local.txt"
  exit 1
fi

export DATABASE_URL="${DATABASE_URL:-sqlite:///$ROOT_DIR/seer_ai_local.db}"
export ENABLE_RAG="${ENABLE_RAG:-false}"
export ENABLE_OCR="${ENABLE_OCR:-false}"
export ENABLE_MONITORING="${ENABLE_MONITORING:-false}"
export ENABLE_HEAVY_MODELS="${ENABLE_HEAVY_MODELS:-false}"
export METRICS_ENABLED="${METRICS_ENABLED:-false}"
export PYTHONPATH="$ROOT_DIR/backend:$ROOT_DIR"

"$VENV_DIR/bin/python" -m app.core.bootstrap
exec "$VENV_DIR/bin/uvicorn" app.main:app --app-dir "$ROOT_DIR/backend" --host 127.0.0.1 --port "${PORT:-8000}" --reload
