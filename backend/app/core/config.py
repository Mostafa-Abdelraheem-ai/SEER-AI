from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[3]


def _resolve_path(path_value: str, default: Path) -> str:
    path = Path(path_value)
    if path.is_absolute():
        return str(path)
    return str((ROOT_DIR / path) if path_value else default)


class Settings(BaseSettings):
    app_name: str = "SEER-AI++ Backend"
    environment: str = "development"
    api_prefix: str = "/api"
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = "postgresql+psycopg://seer:seer@localhost:5432/seer_ai_pp"
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    uploads_dir: str = str(ROOT_DIR / "uploads")
    reports_dir: str = str(ROOT_DIR / "outputs" / "reports")
    webhook_secret: str = "change-me-webhook-secret"
    audio_transcription_model: str = "whisper-1"
    openai_generation_model: str = "gpt-4o-mini"
    openai_api_key: str | None = None
    metrics_enabled: bool = True
    log_level: str = "INFO"
    text_model_provider: str = "hybrid"
    rag_generation_provider: str = "openai"
    ocr_provider: str = "tesseract"
    voice_acoustic_provider: str = "signal"
    enable_rag: bool = True
    enable_ocr: bool = True
    enable_monitoring: bool = True
    enable_heavy_models: bool = False
    model_config = SettingsConfigDict(
        env_file=str(ROOT_DIR / "backend" / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.metrics_enabled = settings.metrics_enabled and settings.enable_monitoring
    settings.uploads_dir = _resolve_path(settings.uploads_dir, ROOT_DIR / "uploads")
    settings.reports_dir = _resolve_path(settings.reports_dir, ROOT_DIR / "outputs" / "reports")
    Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.reports_dir).mkdir(parents=True, exist_ok=True)
    return settings
