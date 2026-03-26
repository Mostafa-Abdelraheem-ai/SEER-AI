FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

ARG INSTALL_AI_EXTRAS=false

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements-core.txt /tmp/backend-requirements-core.txt
COPY backend/requirements-ai.txt /tmp/backend-requirements-ai.txt
RUN pip install --no-cache-dir -r /tmp/backend-requirements-core.txt \
    && if [ "$INSTALL_AI_EXTRAS" = "true" ]; then pip install --no-cache-dir -r /tmp/backend-requirements-ai.txt; fi

COPY . /app

ENV PYTHONPATH=/app/backend:/app
EXPOSE 8000

CMD ["sh", "/app/backend/scripts/docker-entrypoint.sh"]
