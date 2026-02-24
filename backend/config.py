"""
config.py
---------
Centralised, environment-aware configuration via Pydantic Settings.
All values can be overridden with environment variables or a .env file.

Usage
-----
    from backend.config import settings
    print(settings.csv_path)
"""

from __future__ import annotations

import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Resolve paths relative to this file so the app works from any cwd.
_BACKEND_DIR = Path(__file__).parent.resolve()
_DEFAULT_CSV = str(_BACKEND_DIR / "data" / "job_roles.csv")


class Settings(BaseSettings):
    # ── Application ──────────────────────────────────────────────────────────
    app_name: str = "AI Career Path Recommender API"
    app_version: str = "1.0.0"
    debug: bool = False

    # ── ML / Data ────────────────────────────────────────────────────────────
    csv_path: str = _DEFAULT_CSV
    tfidf_ngram_min: int = 1
    tfidf_ngram_max: int = 2

    # ── Server ───────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins; "*" allows all (fine for dev)
    cors_origins: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


# Singleton — import and use anywhere
settings = Settings()
