#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Stopping SEER-AI Docker services and removing project containers, networks, and named volumes..."
docker compose down --remove-orphans -v
echo "Full Docker reset complete. PostgreSQL data and frontend node_modules volume were deleted."
