from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.analysis_controller import router as analysis_router
from app.controllers.auth_controller import router as auth_router
from app.controllers.dashboard_controller import router as dashboard_router
from app.controllers.health_controller import router as health_router
from app.controllers.observability_controller import router as observability_router
from app.controllers.report_controller import router as report_router
from app.controllers.safety_controller import router as safety_router
from app.core.config import get_settings
from app.observability.logging import configure_logging
from app.observability.middleware import RequestContextMiddleware
from app.models import analysis, audit_log, incident_report, knowledge_chunk, retrieved_chunk, safety_scan, triggered_rule, user  # noqa: F401


settings = get_settings()
configure_logging(settings.log_level)


app = FastAPI(title=settings.app_name)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(report_router)
app.include_router(dashboard_router)
app.include_router(safety_router)
if settings.metrics_enabled and settings.enable_monitoring:
    app.include_router(observability_router)
