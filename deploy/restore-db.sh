#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /path/to/backup.sql"
  exit 1
fi

BACKUP_FILE="$1"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

set -a
. backend/.env.production
set +a

cat "$BACKUP_FILE" | docker compose -f docker-compose.prod.yml exec -T \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "Restore completed from $BACKUP_FILE"
