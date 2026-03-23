import { useEffect, useMemo, useRef, useState } from "react";

import { createPreview, detectInputType, runSafetyAnalysis } from "../services/safety";
import { trackUiAction } from "../services/telemetry";

const loadingMessages = {
  message: "Analyzing text and persuasion signals...",
  email: "Reading the email structure and checking links...",
  link: "Checking the link and looking for warning signs...",
  image: "Running OCR and scanning for private information...",
  voice: "Transcribing audio and evaluating voice tone...",
  attachment: "Inspecting file metadata and risky patterns...",
  hash: "Validating the hash and checking local indicators...",
};

export function useSafetyAssistant(initialMode = "message") {
  const [mode, setMode] = useState(initialMode);
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("message");
  const [transcriptHint, setTranscriptHint] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartDetect, setSmartDetect] = useState(true);
  const previousUrlRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (smartDetect) {
      setMode(detectInputType({ text, file }));
    }
  }, [text, file, smartDetect]);

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

  const loadingMessage = useMemo(() => loadingMessages[mode] || "Running your safety check...", [mode]);

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
      const message = err.response?.data?.detail || err.message || "We couldn’t complete the check.";
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
    reset,
    submit,
  };
}
