import SafetyVerdictBadge from "./SafetyVerdictBadge";

export default function SafetyResultPanel({ result }) {
  if (!result) {
    return (
      <div className="panel-surface rounded-[30px] px-6 py-8 text-sm leading-6 text-[color:var(--seer-text-soft)]">
        Run a check and the result will appear here with a plain-language summary and next steps.
      </div>
    );
  }

  return (
    <div className="panel-surface space-y-6 rounded-[32px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">{result.title}</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[color:var(--seer-text)]">{result.summary}</h2>
        </div>
        <SafetyVerdictBadge verdict={result.verdict} riskScore={result.risk_score} />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_38%),linear-gradient(180deg,rgba(5,12,22,0.92),rgba(8,17,29,0.86))] p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Risk score</div>
            <div className="mt-2 text-5xl font-black tracking-[-0.06em] text-[color:var(--seer-text)]">{result.risk_score}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Status</div>
            <div className="mt-2 text-lg font-semibold capitalize text-[color:var(--seer-text)]">{result.verdict.replaceAll("_", " ")}</div>
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-white/10">
          <div
            className={`h-3 rounded-full ${
              result.risk_score >= 80
                ? "bg-[linear-gradient(90deg,#f97316,#ef4444)]"
                : result.risk_score >= 50
                  ? "bg-[linear-gradient(90deg,#f59e0b,#f97316)]"
                  : "bg-[linear-gradient(90deg,#10b981,#38bdf8)]"
            }`}
            style={{ width: `${result.risk_score}%` }}
          />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--seer-text-muted)]">Risk band</div>
            <div className="mt-2 text-sm font-semibold text-[color:var(--seer-text)]">
              {result.risk_score >= 80 ? "Immediate caution" : result.risk_score >= 50 ? "Review carefully" : "Low visible risk"}
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--seer-text-muted)]">Primary signal</div>
            <div className="mt-2 text-sm font-semibold text-[color:var(--seer-text)]">{result.findings?.[0]?.label || "Behavioral analysis"}</div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--seer-text-muted)]">Evidence count</div>
            <div className="mt-2 text-sm font-semibold text-[color:var(--seer-text)]">
              {(result.findings?.length || 0) + (result.citations?.length || 0) + (result.tactics?.length || 0)}
            </div>
          </div>
        </div>
      </div>

      {(typeof result.confidence === "number" || result.degraded_mode) ? (
        <div className="grid gap-4 md:grid-cols-2">
          {typeof result.confidence === "number" ? (
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Confidence</div>
              <div className="mt-2 text-2xl font-black text-[color:var(--seer-text)]">{Math.round(result.confidence * 100)}%</div>
              <div className="mt-3 h-2 rounded-full bg-white/8">
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,#2dd4bf,#38bdf8)]" style={{ width: `${Math.round(result.confidence * 100)}%` }} />
              </div>
            </div>
          ) : null}
          {result.degraded_mode ? (
            <div className="rounded-[24px] border border-amber-400/20 bg-amber-300/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Fallback mode</div>
              <div className="mt-2 text-sm leading-6 text-amber-50/90">Part of this result used a fallback path because a deeper model or provider was unavailable.</div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">What we noticed</div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[color:var(--seer-text-soft)]">{result.explanation}</p>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">What you should do</div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[color:var(--seer-text-soft)]">{result.advice}</p>
        </div>
      </div>

      {result.transcript ? (
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Transcript</div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[color:var(--seer-text-soft)]">{result.transcript}</p>
        </div>
      ) : null}

      {result.parsed_email ? (
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Email details</div>
          <div className="mt-3 grid gap-3 text-sm text-[color:var(--seer-text-soft)] sm:grid-cols-2">
            <div><span className="font-semibold">From:</span> {result.parsed_email.sender || "Unknown"}</div>
            <div><span className="font-semibold">Reply-to:</span> {result.parsed_email.reply_to || "Not provided"}</div>
            <div className="sm:col-span-2"><span className="font-semibold">Subject:</span> {result.parsed_email.subject || "No subject"}</div>
            <div className="sm:col-span-2"><span className="font-semibold">Body:</span> {result.parsed_email.body || "No text extracted"}</div>
          </div>
        </div>
      ) : null}

      {result.tactics?.length ? (
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Detected tactics</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.tactics.map((tactic) => (
              <div key={tactic.label} className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100 shadow-[0_12px_28px_rgba(21,177,255,0.1)]">
                {tactic.label} ({Math.round(tactic.confidence * 100)}%)
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result.findings?.length ? (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Key signs</div>
          {result.findings.map((finding, index) => (
            <div key={`${finding.label}-${index}`} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="text-sm font-semibold text-[color:var(--seer-text)]">{finding.label}</div>
              <div className="mt-1 text-sm text-[color:var(--seer-text-muted)]">{finding.value}</div>
              <div className="mt-2 text-sm leading-6 text-[color:var(--seer-text-soft)]">{finding.note}</div>
            </div>
          ))}
        </div>
      ) : null}

      {result.extracted_urls?.length ? (
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Links found</div>
          <div className="mt-3 space-y-2 text-sm text-[color:var(--seer-text-soft)]">
            {result.extracted_urls.map((url) => (
              <div key={url} className="break-all rounded-xl border border-white/8 bg-white/5 px-3 py-2">{url}</div>
            ))}
          </div>
        </div>
      ) : null}

      {result.citations?.length ? (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Helpful references</div>
          {result.citations.map((citation, index) => (
            <div key={`${citation.source}-${index}`} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="text-sm font-semibold text-[color:var(--seer-text)]">{citation.source}</div>
              <div className="mt-2 text-sm leading-6 text-[color:var(--seer-text-soft)]">{citation.snippet}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Relevance {Math.round(citation.score * 100)}%</div>
            </div>
          ))}
        </div>
      ) : null}

      {result.limitations?.length ? (
        <div className="rounded-[24px] border border-amber-400/20 bg-amber-300/10 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Limits of this check</div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50/90">
            {result.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
