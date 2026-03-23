import { useState } from "react";

import api from "../api/client";
import SafetyResultPanel from "../components/SafetyResultPanel";

export default function VoiceCheck() {
  const [audioFile, setAudioFile] = useState(null);
  const [transcriptHint, setTranscriptHint] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Voice check</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Is this voice note risky?</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Upload a voice note and we’ll look for pressure, urgency, threats, or other scam-style language. If automatic transcription is not available, you can paste what you heard.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <form
          className="glass-panel rounded-[30px] p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!audioFile) {
              setError("Please choose a voice file first.");
              return;
            }
            try {
              setLoading(true);
              setError("");
              const formData = new FormData();
              formData.append("audio_file", audioFile);
              if (transcriptHint.trim()) {
                formData.append("transcript_hint", transcriptHint.trim());
              }
              const response = await api.post("/api/safety/voice", formData);
              setResult(response.data);
            } catch (err) {
              setError(err.response?.data?.detail || "Voice check failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Voice file</label>
              <input
                type="file"
                accept="audio/*"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Optional: paste what you heard</label>
              <textarea
                className="min-h-52 w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                placeholder="Example: They said my account would be locked today unless I paid immediately."
                value={transcriptHint}
                onChange={(event) => setTranscriptHint(event.target.value)}
              />
            </div>
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <button className="rounded-2xl bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-5 py-3 font-semibold text-white" disabled={loading}>
              {loading ? "Checking voice note..." : "Check voice note"}
            </button>
          </div>
        </form>
        <SafetyResultPanel result={result} />
      </div>
    </div>
  );
}
