import axios from "axios";

import { trackApiError, trackApiMetric } from "../services/telemetry";

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured;
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "127.0.0.1";
    return `http://${host}:8000`;
  }
  return "http://127.0.0.1:8000";
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("seer_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-Request-Id"] = crypto.randomUUID();
  config.metadata = { startedAt: performance.now() };
  return config;
});

api.interceptors.response.use(
  (response) => {
    const durationMs = Math.round(performance.now() - (response.config.metadata?.startedAt || performance.now()));
    trackApiMetric({
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      durationMs,
      status: response.status,
      ok: true,
    });
    return response;
  },
  (error) => {
    const durationMs = Math.round(performance.now() - (error.config?.metadata?.startedAt || performance.now()));
    trackApiMetric({
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      durationMs,
      status: error.response?.status || 0,
      ok: false,
    });
    trackApiError({
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status || 0,
      message: error.response?.data?.detail || error.message,
    });
    return Promise.reject(error);
  }
);

export default api;
