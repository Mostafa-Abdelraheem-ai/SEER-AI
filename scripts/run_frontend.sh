#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR/frontend"

if [ ! -d node_modules ]; then
  npm install
fi

exec npm run dev -- --host 127.0.0.1 --port "${PORT:-5173}"
