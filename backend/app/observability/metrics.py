from __future__ import annotations

import time
from contextlib import contextmanager
from typing import Iterator

import psutil
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest


REQUEST_COUNT = Counter(
    "seer_http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)
REQUEST_LATENCY = Histogram(
    "seer_http_request_duration_seconds",
    "HTTP request latency",
    ["method", "path"],
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10),
)
INFERENCE_LATENCY = Histogram(
    "seer_model_inference_duration_seconds",
    "Latency for model and AI service calls",
    ["component", "provider"],
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20),
)
PIPELINE_EVENTS = Counter(
    "seer_pipeline_events_total",
    "Pipeline events and degraded-mode fallbacks",
    ["component", "event"],
)
MODEL_CONFIDENCE = Histogram(
    "seer_model_confidence",
    "Model confidence values",
    ["component"],
    buckets=(0.0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1.0),
)
RISK_SCORE = Histogram(
    "seer_risk_scores",
    "Final risk score distribution",
    ["scan_type"],
    buckets=(0, 10, 20, 35, 50, 65, 80, 90, 100),
)
OPENAI_TOKENS = Counter(
    "seer_openai_tokens_total",
    "OpenAI token usage",
    ["model", "kind"],
)
OPENAI_COST = Counter(
    "seer_openai_estimated_cost_usd_total",
    "Estimated OpenAI cost in USD",
    ["model"],
)
RETRIEVAL_TOP_SCORE = Histogram(
    "seer_retrieval_top_score",
    "Top retrieval score distribution",
    ["provider"],
    buckets=(0.0, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1.0),
)
SYSTEM_CPU = Gauge("seer_system_cpu_percent", "Process CPU usage percent")
SYSTEM_MEMORY = Gauge("seer_system_memory_mb", "Process RSS memory in MB")


OPENAI_PRICE_PER_1K_TOKENS = {
    "gpt-4o-mini": 0.0006,
    "gpt-4.1-mini": 0.0008,
}


@contextmanager
def track_duration(component: str, provider: str) -> Iterator[None]:
    start = time.perf_counter()
    try:
        yield
    finally:
        INFERENCE_LATENCY.labels(component=component, provider=provider).observe(time.perf_counter() - start)


def record_request(method: str, path: str, status_code: int, duration_seconds: float) -> None:
    REQUEST_COUNT.labels(method=method, path=path, status=str(status_code)).inc()
    REQUEST_LATENCY.labels(method=method, path=path).observe(duration_seconds)


def record_pipeline_event(component: str, event: str) -> None:
    PIPELINE_EVENTS.labels(component=component, event=event).inc()


def record_confidence(component: str, confidence: float) -> None:
    MODEL_CONFIDENCE.labels(component=component).observe(max(0.0, min(float(confidence), 1.0)))


def record_risk(scan_type: str, risk_score: int) -> None:
    RISK_SCORE.labels(scan_type=scan_type).observe(max(0, min(int(risk_score), 100)))


def record_openai_usage(model: str, prompt_tokens: int | None, completion_tokens: int | None) -> None:
    prompt = int(prompt_tokens or 0)
    completion = int(completion_tokens or 0)
    OPENAI_TOKENS.labels(model=model, kind="prompt").inc(prompt)
    OPENAI_TOKENS.labels(model=model, kind="completion").inc(completion)
    total_tokens = prompt + completion
    price = OPENAI_PRICE_PER_1K_TOKENS.get(model)
    if price is not None and total_tokens:
        OPENAI_COST.labels(model=model).inc((total_tokens / 1000.0) * price)


def record_retrieval_score(provider: str, score: float | None) -> None:
    if score is None:
        return
    RETRIEVAL_TOP_SCORE.labels(provider=provider).observe(max(0.0, min(float(score), 1.0)))


def metrics_payload() -> tuple[bytes, str]:
    process = psutil.Process()
    with process.oneshot():
        SYSTEM_CPU.set(psutil.cpu_percent(interval=None))
        SYSTEM_MEMORY.set(process.memory_info().rss / (1024 * 1024))
    return generate_latest(), CONTENT_TYPE_LATEST
