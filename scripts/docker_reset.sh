#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Stopping SEER-AI Docker services and removing project containers/networks..."
docker compose down --remove-orphans
echo "Soft Docker reset complete. PostgreSQL data volume was preserved."
