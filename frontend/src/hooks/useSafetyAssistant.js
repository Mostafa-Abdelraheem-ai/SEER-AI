import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { createPreview, detectInputType, runSafetyAnalysis } from "../services/safety";
import { trackUiAction } from "../services/telemetry";

export function useSafetyAssistant(initialMode = "message", options = {}) {
  const { lockMode = false, initialSmartDetect = !lockMode } = options;
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("message");
  const [transcriptHint, setTranscriptHint] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartDetect, setSmartDetect] = useState(initialSmartDetect);
  const previousUrlRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (lockMode) {
      setMode(initialMode);
      setSmartDetect(false);
    }
  }, [initialMode, lockMode]);

  useEffect(() => {
    if (!lockMode && smartDetect) {
      setMode(detectInputType({ text, file }));
    }
  }, [text, file, smartDetect, lockMode]);

  useEffect(() => {
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current);
      previousUrlRef.current = null;
    }
    const nextPreview = createPreview(file);
    if (nextPreview?.objectUrl) {
      previousUrlRef.current = nextPreview.objectUrl;
    }
    setPreview(nextPreview);
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = null;
      }
    };
  }, [file]);

  const loadingMessage = useMemo(() => t(`workspace.loadingMessages.${mode}`, { defaultValue: t("workspace.loadingMessages.default") }), [mode, t]);

  const reset = () => {
    setText("");
    setChannel("message");
    setTranscriptHint("");
    setFile(null);
    setResult(null);
    setError("");
  };

  const submit = async () => {
    setError("");
    setIsLoading(true);
    trackUiAction("analysis.submit", { mode });
    try {
      const data = await runSafetyAnalysis({ mode, text, file, transcriptHint, channel });
      setResult(data);
      trackUiAction("analysis.success", { mode, verdict: data.verdict, riskScore: data.risk_score });
      return data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || t("common.somethingWentWrong");
      setError(message);
      trackUiAction("analysis.failure", { mode, message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mode,
    setMode,
    text,
    setText,
    channel,
    setChannel,
    transcriptHint,
    setTranscriptHint,
    file,
    setFile,
    preview,
    result,
    setResult,
    error,
    setError,
    isLoading,
    loadingMessage,
    smartDetect,
    setSmartDetect,
    lockMode,
    reset,
    submit,
  };
}
