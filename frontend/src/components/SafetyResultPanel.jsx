import { useTranslation } from "react-i18next";

import SafetyVerdictBadge from "./SafetyVerdictBadge";

export default function SafetyResultPanel({ result }) {
  const { t } = useTranslation();

  if (!result) {
    return (
      <div className="panel-surface rounded-[30px] px-6 py-8 text-sm leading-6 text-[color:var(--seer-text-soft)]">
        {t("result.runCheckPlaceholder")}
      </div>
    );
  }

  return (
    <div className="panel-surface interactive-surface space-y-6 rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">{result.title}</div>
          <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[color:var(--seer-text)] sm:text-2xl">{result.summary}</h2>
        </div>
        <SafetyVerdictBadge verdict={result.verdict} riskScore={result.risk_score} />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_38%),linear-gradient(180deg,rgba(5,12,22,0.92),rgba(8,17,29,0.86))] p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.riskScore")}</div>
            <div className="mt-2 text-4xl font-black tracking-[-0.06em] text-[color:var(--seer-text)] sm:text-5xl">{result.risk_score}</div>
          </div>
          <div className="text-right rtl:text-left">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.status")}</div>
            <div className="mt-2 text-base font-semibold capitalize text-[color:var(--seer-text)] sm:text-lg">{t(`result.verdicts.${result.verdict}`, { defaultValue: t("result.verdicts.unknown") })}</div>
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
            <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--seer-text-muted)]">{t("result.riskBand")}</div>
            <div className="mt-2 text-sm font-semibold text-[color:var(--seer-text)]">
              {result.risk_score >= 80 ? t("result.immediateCaution") : result.risk_score >= 50 ? t("result.reviewCarefully") : t("result.lowVisibleRisk")}
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--seer-text-muted)]">{t("result.primarySignal")}</div>
            <div className="mt-2 text-sm font-semibold text-[color:var(--seer-text)]">{result.findings?.[0]?.label || t("result.behavioralAnalysis")}</div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--seer-text-muted)]">{t("result.evidenceCount")}</div>
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
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.confidence")}</div>
              <div className="mt-2 text-xl font-black text-[color:var(--seer-text)] sm:text-2xl">{Math.round(result.confidence * 100)}%</div>
              <div className="mt-3 h-2 rounded-full bg-white/8">
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,#2dd4bf,#38bdf8)]" style={{ width: `${Math.round(result.confidence * 100)}%` }} />
              </div>
            </div>
          ) : null}
          {result.degraded_mode ? (
            <div className="rounded-[24px] border border-amber-400/20 bg-amber-300/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-200">{t("result.fallbackMode")}</div>
              <div className="mt-2 text-sm leading-6 text-amber-50/90">{t("result.fallbackHelp")}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.whatWeNoticed")}</div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[color:var(--seer-text-soft)]">{result.explanation}</p>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.whatYouShouldDo")}</div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[color:var(--seer-text-soft)]">{result.advice}</p>
        </div>
      </div>

      {result.transcript ? (
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.transcript")}</div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[color:var(--seer-text-soft)]">{result.transcript}</p>
        </div>
      ) : null}

      {result.parsed_email ? (
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.emailDetails")}</div>
          <div className="mt-3 grid gap-3 text-sm text-[color:var(--seer-text-soft)] sm:grid-cols-2">
            <div><span className="font-semibold">{t("result.from")}:</span> {result.parsed_email.sender || t("common.unknown")}</div>
            <div><span className="font-semibold">{t("result.replyTo")}:</span> {result.parsed_email.reply_to || t("common.notProvided")}</div>
            <div className="sm:col-span-2"><span className="font-semibold">{t("result.subject")}:</span> {result.parsed_email.subject || t("common.noSubject")}</div>
            <div className="sm:col-span-2"><span className="font-semibold">{t("result.body")}:</span> {result.parsed_email.body || t("common.noTextExtracted")}</div>
          </div>
        </div>
      ) : null}

      {result.tactics?.length ? (
        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.detectedTactics")}</div>
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
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.keySigns")}</div>
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
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.linksFound")}</div>
          <div className="mt-3 space-y-2 text-sm text-[color:var(--seer-text-soft)]">
            {result.extracted_urls.map((url) => (
              <div key={url} className="break-all rounded-xl border border-white/8 bg-white/5 px-3 py-2">{url}</div>
            ))}
          </div>
        </div>
      ) : null}

      {result.citations?.length ? (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("result.helpfulReferences")}</div>
          {result.citations.map((citation, index) => (
            <div key={`${citation.source}-${index}`} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="text-sm font-semibold text-[color:var(--seer-text)]">{citation.source}</div>
              <div className="mt-2 text-sm leading-6 text-[color:var(--seer-text-soft)]">{citation.snippet}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("detailsPage.score")} {Math.round(citation.score * 100)}%</div>
            </div>
          ))}
        </div>
      ) : null}

      {result.limitations?.length ? (
        <div className="rounded-[24px] border border-amber-400/20 bg-amber-300/10 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-200">{t("result.limitations")}</div>
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
