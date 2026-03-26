#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
DB_NAME="${POSTGRES_DB:-seer_ai_pp}"
DB_USER="${POSTGRES_USER:-seer}"
DB_PASSWORD="${POSTGRES_PASSWORD:-seer}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql was not found on PATH."
  echo "Install PostgreSQL client/server first, then rerun this script."
  echo "Suggested macOS/Homebrew commands:"
  echo "  brew install postgresql@16 pgvector"
  echo "  brew services start postgresql@16"
  exit 1
fi

if ! command -v createdb >/dev/null 2>&1; then
  echo "createdb was not found on PATH."
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
  :
else
  echo "Cannot connect to PostgreSQL as user '$DB_USER' on $DB_HOST:$DB_PORT."
  echo "Make sure PostgreSQL is running and the user exists."
  exit 1
fi

if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  echo "Database ${DB_NAME} already exists."
else
  createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
  echo "Created database ${DB_NAME}."
fi

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<'SQL'
CREATE EXTENSION IF NOT EXISTS vector;
SQL

echo "pgvector extension is ready in database ${DB_NAME}."
echo "Next steps:"
echo "  cp backend/.env.example backend/.env"
echo "  ./scripts/run_backend_full.sh"
