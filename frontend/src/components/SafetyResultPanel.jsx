import SafetyVerdictBadge from "./SafetyVerdictBadge";

export default function SafetyResultPanel({ result }) {
  if (!result) {
    return (
      <div className="glass-panel rounded-[30px] px-6 py-8 text-sm leading-6 text-slate-500">
        Run a check and the result will appear here with a plain-language summary and next steps.
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-6 rounded-[30px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">{result.title}</div>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{result.summary}</h2>
        </div>
        <SafetyVerdictBadge verdict={result.verdict} riskScore={result.risk_score} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">What we noticed</div>
          <p className="mt-3 text-sm leading-6 text-slate-700 whitespace-pre-line">{result.explanation}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">What you should do</div>
          <p className="mt-3 text-sm leading-6 text-slate-700 whitespace-pre-line">{result.advice}</p>
        </div>
      </div>

      {result.transcript ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Transcript</div>
          <p className="mt-3 text-sm leading-6 text-slate-700 whitespace-pre-line">{result.transcript}</p>
        </div>
      ) : null}

      {result.parsed_email ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Email details</div>
          <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div><span className="font-semibold">From:</span> {result.parsed_email.sender || "Unknown"}</div>
            <div><span className="font-semibold">Reply-to:</span> {result.parsed_email.reply_to || "Not provided"}</div>
            <div className="sm:col-span-2"><span className="font-semibold">Subject:</span> {result.parsed_email.subject || "No subject"}</div>
            <div className="sm:col-span-2"><span className="font-semibold">Body:</span> {result.parsed_email.body || "No text extracted"}</div>
          </div>
        </div>
      ) : null}

      {result.findings?.length ? (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Key signs</div>
          {result.findings.map((finding, index) => (
            <div key={`${finding.label}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">{finding.label}</div>
              <div className="mt-1 text-sm text-slate-600">{finding.value}</div>
              <div className="mt-2 text-sm leading-6 text-slate-700">{finding.note}</div>
            </div>
          ))}
        </div>
      ) : null}

      {result.extracted_urls?.length ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Links found</div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {result.extracted_urls.map((url) => (
              <div key={url} className="break-all rounded-xl bg-white px-3 py-2">{url}</div>
            ))}
          </div>
        </div>
      ) : null}

      {result.limitations?.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-700">Limits of this check</div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
            {result.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
