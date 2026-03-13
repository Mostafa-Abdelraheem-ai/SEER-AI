from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[3]


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
    model_config = SettingsConfigDict(
        env_file=str(ROOT_DIR / "backend" / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.reports_dir).mkdir(parents=True, exist_ok=True)
    return settings
