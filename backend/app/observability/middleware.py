from __future__ import annotations

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.observability.context import request_id_var
from app.observability.logging import get_logger
from app.observability.metrics import record_pipeline_event, record_request


logger = get_logger(__name__)


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        request_id_var.set(request_id)
        request.state.request_id = request_id
        start = time.perf_counter()
        path_template = request.url.path
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception:
            status_code = 500
            record_pipeline_event("api", "unhandled_exception")
            logger.exception(
                "Unhandled request failure",
                extra={"event": "request.error", "extra_fields": {"path": path_template, "method": request.method}},
            )
            raise
        finally:
            duration = time.perf_counter() - start
            record_request(request.method, path_template, status_code, duration)
            logger.info(
                "Request completed",
                extra={
                    "event": "request.complete",
                    "extra_fields": {
                        "path": path_template,
                        "method": request.method,
                        "status_code": status_code,
                        "duration_ms": round(duration * 1000, 2),
                    },
                },
            )

