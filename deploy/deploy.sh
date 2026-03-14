#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f backend/.env.production ]]; then
  cp backend/.env.production.example backend/.env.production
  echo "Created backend/.env.production. Edit it before re-running deploy."
  exit 1
fi

if [[ ! -f frontend/.env.production ]]; then
  cp frontend/.env.production.example frontend/.env.production
  echo "Created frontend/.env.production. Edit it if you need a custom VITE_API_BASE_URL, then re-run deploy."
fi

set -a
. backend/.env.production
. frontend/.env.production
set +a

git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T backend alembic -c backend/alembic.ini upgrade head
docker compose -f docker-compose.prod.yml ps
