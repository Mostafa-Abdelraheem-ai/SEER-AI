const listeners = new Set();

function emit(event) {
  listeners.forEach((listener) => listener(event));
}

export function subscribeTelemetry(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function logFrontendEvent(type, payload = {}) {
  const event = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
  console.info("[seer-frontend]", event);
  emit(event);
}

export function trackApiMetric({ url, method, durationMs, status, ok }) {
  logFrontendEvent("api.metric", { url, method, durationMs, status, ok });
}

export function trackApiError({ url, method, status, message }) {
  logFrontendEvent("api.error", { url, method, status, message });
}

export function trackUiAction(action, payload = {}) {
  logFrontendEvent("ui.action", { action, ...payload });
}

export function trackRenderMetric(metric, payload = {}) {
  logFrontendEvent("ui.performance", { metric, ...payload });
}
