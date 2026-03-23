import { useMemo, useState } from "react";

import { INPUT_TYPES } from "../services/safety";
import AssistantLoadingCard from "./AssistantLoadingCard";
import DropzoneCard from "./DropzoneCard";
import FilePreviewCard from "./FilePreviewCard";
import HighlightedText from "./HighlightedText";
import ImagePrivacyPreview from "./ImagePrivacyPreview";
import ResultTabs from "./ResultTabs";
import SafetyResultPanel from "./SafetyResultPanel";
import SegmentedControl from "./SegmentedControl";

const quickExamples = [
  { label: "Urgent payment", mode: "message", text: "This is your manager. Send the payment now and keep it confidential." },
  { label: "Link warning", mode: "link", text: "https://verify-bonus-login.top/reset-password" },
  { label: "Suspicious email", mode: "email", text: "From: alerts@example.com\nReply-To: help@other-site.com\nSubject: Verify now\n\nYour mailbox will be suspended today." },
  { label: "Hash check", mode: "hash", text: "44d88612fea8a8f36de82e1278abb02f" },
];

function toneSummary(result) {
  const analysis = result?.metadata?.acoustic_analysis;
  if (!analysis) return [];
  return [
    { label: "Urgency", value: Math.round((analysis.urgency_score || 0) * 100) },
    { label: "Stress", value: Math.round((analysis.stress_score || 0) * 100) },
    { label: "Intensity", value: Math.round((analysis.intensity_score || 0) * 100) },
  ];
}

export default function AnalysisWorkspace({
  assistant,
  title = "Analyze something safely",
  subtitle = "Paste text or upload a file and get a clear, human-readable answer.",
}) {
  const [resultTab, setResultTab] = useState("overview");
  const imageBoxes = assistant.result?.metadata?.boxes || [];
  const highlightedSource = assistant.result?.transcript || assistant.result?.parsed_email?.body || assistant.result?.input_text || assistant.text;
  const previewMode = assistant.file ? assistant.mode : null;
  const canSubmit = assistant.mode === "message" || assistant.mode === "email" || assistant.mode === "link" || assistant.mode === "hash"
    ? Boolean(assistant.text.trim() || assistant.file)
    : Boolean(assistant.file);
  const loadingTitle = useMemo(() => assistant.loadingMessage, [assistant.loadingMessage]);

  return (
    <div className="space-y-8">
      <section className="panel-surface relative overflow-hidden rounded-[36px] px-6 py-8 md:px-8">
        <div className="absolute inset-x-10 top-0 h-28 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-90px] top-8 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-700">Multimodal command surface</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[color:var(--seer-text)]">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--seer-text-soft)]">{subtitle}</p>
            </div>
            <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[color:var(--seer-text-soft)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                checked={assistant.smartDetect}
                onChange={(event) => assistant.setSmartDetect(event.target.checked)}
              />
              Auto-detect input type
            </label>
          </div>

          <SegmentedControl items={INPUT_TYPES} value={assistant.mode} onChange={(next) => {
            assistant.setSmartDetect(false);
            assistant.setMode(next);
          }} />

          <div className="grid gap-4 lg:grid-cols-4">
            {[
              { label: "Input status", value: assistant.file ? "Upload ready" : assistant.text.trim() ? "Text staged" : "Waiting", tone: "cyan" },
              { label: "Detection", value: assistant.smartDetect ? "Auto" : "Manual", tone: "violet" },
              { label: "Primary mode", value: assistant.mode, tone: "cyan" },
              { label: "Action", value: assistant.result ? "Result ready" : "Awaiting analysis", tone: "amber" },
            ].map((item) => (
              <div key={item.label} className="metric-tile rounded-[24px] px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--seer-text-muted)]">{item.label}</div>
                <div className="mt-3 text-xl font-bold capitalize text-[color:var(--seer-text)]">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!canSubmit) {
                  assistant.setError("Add some text or choose a file before analyzing.");
                  return;
                }
                await assistant.submit();
              }}
            >
              <div className="panel-surface rounded-[30px] p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-[color:var(--seer-text)]">What would you like us to check?</label>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-soft)]">{assistant.mode}</span>
                </div>
                <textarea
                  className="min-h-56 w-full resize-y rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-[color:var(--seer-text)] outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  placeholder={
                    assistant.mode === "email"
                      ? "Paste the email, including headers if you have them."
                      : assistant.mode === "link"
                        ? "Paste a website link."
                        : assistant.mode === "hash"
                          ? "Paste an MD5, SHA1, or SHA256 hash."
                          : "Paste the message here."
                  }
                  value={assistant.text}
                  onChange={(event) => assistant.setText(event.target.value)}
                />

                {assistant.mode === "message" ? (
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-[color:var(--seer-text-soft)]">Where did you get it?</label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[color:var(--seer-text)] outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                      value={assistant.channel}
                      onChange={(event) => assistant.setChannel(event.target.value)}
                    >
                      <option value="message">Message</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="chat">Chat</option>
                    </select>
                  </div>
                ) : null}

                {assistant.mode === "voice" ? (
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-[color:var(--seer-text-soft)]">Optional transcript hint</label>
                    <textarea
                      className="min-h-28 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-[color:var(--seer-text)] outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                      placeholder="If automatic transcription fails, paste what you heard here."
                      value={assistant.transcriptHint}
                      onChange={(event) => assistant.setTranscriptHint(event.target.value)}
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {quickExamples.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200"
                      onClick={() => {
                        assistant.setSmartDetect(false);
                        assistant.setMode(item.mode);
                        assistant.setText(item.text);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {INPUT_TYPES.find((item) => item.id === assistant.mode)?.acceptsFile ? (
                <DropzoneCard
                  accept={INPUT_TYPES.find((item) => item.id === assistant.mode)?.accept}
                  label={`Upload ${assistant.mode === "email" ? "an .eml file" : assistant.mode === "voice" ? "a voice note" : assistant.mode === "image" ? "an image" : "a file"}`}
                  hint="Drag and drop here or choose a file manually."
                  onFileSelect={(file) => assistant.setFile(file)}
                />
              ) : null}

              {assistant.preview ? (
                <FilePreviewCard preview={assistant.preview} mode={previewMode} onRemove={() => assistant.setFile(null)} />
              ) : null}

              {assistant.error ? (
                <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {assistant.error}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={assistant.isLoading}
                  className="rounded-[22px] bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-6 py-3.5 font-semibold text-white shadow-[0_24px_44px_rgba(8,21,42,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assistant.isLoading ? "Analyzing..." : "Analyze"}
                </button>
                <button
                  type="button"
                  className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-3 font-semibold text-[color:var(--seer-text-soft)]"
                  onClick={assistant.reset}
                >
                  Clear
                </button>
              </div>
            </form>

            <div className="space-y-5">
              {assistant.isLoading ? <AssistantLoadingCard message={loadingTitle} /> : <SafetyResultPanel result={assistant.result} />}

              {assistant.result?.scan_type === "image_privacy" && assistant.preview?.objectUrl ? (
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Sensitive regions</div>
                  <ImagePrivacyPreview previewUrl={assistant.preview.objectUrl} boxes={imageBoxes} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {assistant.result ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Decision intelligence</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[color:var(--seer-text)]">See what influenced the decision</h2>
            </div>
            <ResultTabs value={resultTab} onChange={setResultTab} />
          </div>

          {resultTab === "overview" ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
              <div className="panel-surface rounded-[30px] p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Highlighted source</div>
                <div className="mt-4">
                  <HighlightedText text={highlightedSource} highlights={assistant.result.findings || []} />
                </div>
              </div>
              <div className="panel-surface rounded-[30px] p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Signals that mattered most</div>
                <div className="mt-4 space-y-4">
                  {(assistant.result.findings || []).slice(0, 4).map((finding, index) => (
                    <div key={`${finding.label}-${index}`} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="text-sm font-semibold text-[color:var(--seer-text)]">{finding.label}</div>
                      <div className="mt-1 text-sm text-[color:var(--seer-text-soft)]">{finding.note}</div>
                    </div>
                  ))}
                  {toneSummary(assistant.result).length ? (
                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="text-sm font-semibold text-[color:var(--seer-text)]">Voice tone</div>
                      <div className="mt-3 space-y-3">
                        {toneSummary(assistant.result).map((metric) => (
                          <div key={metric.label}>
                            <div className="mb-1 flex items-center justify-between text-sm text-[color:var(--seer-text-soft)]">
                              <span>{metric.label}</span>
                              <span>{metric.value}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10">
                              <div className="h-2 rounded-full bg-[linear-gradient(90deg,#38bdf8,#8b5cf6)]" style={{ width: `${metric.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {resultTab === "details" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="panel-surface rounded-[30px] p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Detected tactics</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(assistant.result.tactics || []).map((tactic) => (
                    <div key={tactic.label} className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                      {tactic.label} • {Math.round(tactic.confidence * 100)}%
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel-surface rounded-[30px] p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Evidence and references</div>
                <div className="mt-4 space-y-3">
                  {(assistant.result.citations || []).map((citation, index) => (
                    <div key={`${citation.source}-${index}`} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="text-sm font-semibold text-[color:var(--seer-text)]">{citation.source}</div>
                      <div className="mt-2 text-sm leading-6 text-[color:var(--seer-text-soft)]">{citation.snippet}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {resultTab === "raw" ? (
            <div className="panel-surface rounded-[30px] p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Raw analysis payload</div>
              <pre className="mt-4 overflow-x-auto rounded-[24px] bg-[#050a12] p-4 text-xs leading-6 text-slate-200">
                {JSON.stringify(assistant.result, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
