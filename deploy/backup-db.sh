#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f backend/.env.production ]]; then
  echo "backend/.env.production is required."
  exit 1
fi

set -a
. backend/.env.production
set +a

BACKUP_DIR="${1:-$ROOT_DIR/backups}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/seer_ai_pp_${TIMESTAMP}.sql"

docker compose -f docker-compose.prod.yml exec -T \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BACKUP_FILE"

echo "Backup saved to $BACKUP_FILE"
