#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Cleaning project-local caches and generated artifacts..."

find . \
  \( -path './.git' -o -path './.venv' -o -path './.venv310' \) -prune \
  -o -type d -name '__pycache__' -exec rm -rf {} +

rm -rf .pytest_cache frontend/dist frontend/node_modules
rm -f backend_test.db test_rag.db

echo "Local cleanup complete."
