# EC2 Deployment Guide

This project is designed for a single Ubuntu EC2 instance using Docker Compose.
The RAG subsystem stores knowledge-base chunks and embeddings inside PostgreSQL using `pgvector`.

## 1. Launch the EC2 instance

- Ubuntu 22.04 or newer
- Instance size: at least `t3.medium` recommended for a light demo
- Storage: at least 20 GB

## 2. Security group

Open these inbound ports:

- `22` for SSH
- `80` for the frontend and proxied backend API

Keep these closed to the public unless you explicitly need them:

- `5432` PostgreSQL
- `8000` backend container port

## 3. Connect and install Docker

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
sudo apt-get update
sudo apt-get install -y git
git clone https://github.com/Mostafa-Abdelraheem-ai/SEER-AI.git
cd SEER-AI
bash deploy/ec2-setup.sh
```

Log out and SSH back in after the Docker group change.

## 4. Configure production env files

```bash
cd ~/SEER-AI
cp backend/.env.production.example backend/.env.production
cp frontend/.env.production.example frontend/.env.production
```

Edit `backend/.env.production`:

- set a strong `SECRET_KEY`
- set a strong `POSTGRES_PASSWORD`
- update `DATABASE_URL` to match the same password
- set `CORS_ORIGINS` to your EC2 public URL or domain
- keep `SEER_EMBEDDING_DIMENSION=384` unless you intentionally change the embedding model and migration strategy

Edit `frontend/.env.production` only if you want the frontend bundle to call a different backend URL directly. For the default EC2 setup, leave `VITE_API_BASE_URL` empty so Nginx proxies `/api` and `/health` to the backend container.

## 5. Deploy

```bash
cd ~/SEER-AI
bash deploy/deploy.sh
```

Or run the production compose commands directly:

```bash
cd ~/SEER-AI
set -a
. backend/.env.production
. frontend/.env.production
set +a
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T backend alembic -c backend/alembic.ini upgrade head
docker compose -f docker-compose.prod.yml exec -T backend python -m src.rag.build_index
```

## 6. Verify

- Frontend: `http://YOUR_EC2_PUBLIC_IP/`
- Health: `http://YOUR_EC2_PUBLIC_IP/health`
- API docs: `http://YOUR_EC2_PUBLIC_IP/docs`
- KB indexing: `docker compose -f docker-compose.prod.yml exec -T backend python -m src.rag.build_index`

## 7. Logs and operations

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f db
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml down
```

## 8. Update after a new push

```bash
cd ~/SEER-AI
bash deploy/deploy.sh
```

## 9. Back up PostgreSQL

```bash
cd ~/SEER-AI
bash deploy/backup-db.sh
```

Restore:

```bash
cd ~/SEER-AI
bash deploy/restore-db.sh /path/to/backup.sql
```

## Troubleshooting

Backend cannot connect to DB:

- confirm `backend/.env.production` has the same `POSTGRES_*` values used by the DB container
- check `docker compose -f docker-compose.prod.yml logs db`
- check `docker compose -f docker-compose.prod.yml logs backend`

Frontend cannot reach backend:

- confirm `http://YOUR_EC2_PUBLIC_IP/health` works
- keep `VITE_API_BASE_URL` empty if you want the bundled Nginx proxy path
- confirm port `80` is open in the EC2 security group

pgvector or KB retrieval issues:

- confirm the DB container is `pgvector/pgvector:pg16`
- rerun `docker compose -f docker-compose.prod.yml exec -T backend alembic -c backend/alembic.ini upgrade head`
- rerun `docker compose -f docker-compose.prod.yml exec -T backend python -m src.rag.build_index`

Containers exit immediately:

- run `docker compose -f docker-compose.prod.yml ps`
- inspect service logs with `docker compose -f docker-compose.prod.yml logs SERVICE_NAME`

Migrations fail:

- inspect the backend logs
- rerun `docker compose -f docker-compose.prod.yml exec -T backend alembic -c backend/alembic.ini upgrade head`
