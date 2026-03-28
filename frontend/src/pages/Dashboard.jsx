import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import AnalysisWorkspace from "../components/AnalysisWorkspace";
import BarList from "../components/BarList";
import SafetyHistoryCard from "../components/SafetyHistoryCard";
import StatsCard from "../components/StatsCard";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";
import { fetchSafetyHistory } from "../services/safety";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const assistant = useSafetyAssistant("message");
  const [recentItems, setRecentItems] = useState([]);
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    fetchSafetyHistory(4).then(setRecentItems);
  }, []);

  const riskyCount = recentItems.filter((item) => ["risky", "likely_scam", "private_info_detected"].includes(item.verdict)).length;
  const averageRisk = recentItems.length ? Math.round(recentItems.reduce((sum, item) => sum + (item.risk_score || 0), 0) / recentItems.length) : 0;
  const tacticDistribution = recentItems
    .flatMap((item) => item.tactics || item.metadata?.tactics || [])
    .reduce((accumulator, tactic) => {
      const existing = accumulator.find((entry) => entry.label === tactic.label);
      if (existing) existing.count += 1;
      else accumulator.push({ label: tactic.label, count: 1 });
      return accumulator;
    }, [])
    .slice(0, 4);
  const riskMix = [
    { label: t("result.verdicts.safe"), count: recentItems.filter((item) => item.verdict === "safe").length },
    { label: t("result.verdicts.caution"), count: recentItems.filter((item) => item.verdict === "caution").length },
    { label: t("common.highRisk"), count: recentItems.filter((item) => ["risky", "likely_scam", "private_info_detected"].includes(item.verdict)).length },
  ];
  const liveStatus = averageRisk >= 75 ? "Elevated" : averageRisk >= 45 ? "Watch" : "Stable";
  const capabilityCards = t("dashboard.capabilities", { returnObjects: true });
  const toolCards = t("dashboard.toolCards", { returnObjects: true });

  return (
    <div className="space-y-8">
      <div className="panel-surface interactive-surface relative overflow-hidden rounded-[32px] px-5 py-6 md:rounded-[38px] md:px-8 md:py-8">
        <div className="absolute right-[-40px] top-[-40px] h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-[-70px] left-[15%] h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.08fr,0.92fr]">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-700">{t("dashboard.heroEyebrow")}</p>
            <h1
              className={`dashboard-hero-title mt-3 font-black text-[color:var(--seer-text)] ${
                isArabic
                  ? "max-w-[34rem] text-[2.12rem] leading-[1.01] tracking-[-0.022em] sm:text-[2.45rem] xl:text-[2.95rem]"
                  : "max-w-4xl text-3xl leading-[1.02] tracking-[-0.05em] sm:text-4xl xl:text-[3.25rem]"
              }`}
            >
              {t("dashboard.heroTitle")}
            </h1>
            <p className={`mt-4 text-sm leading-6 ${isArabic ? "max-w-[34rem] text-[color:var(--seer-text)]/72" : "max-w-2xl text-[color:var(--seer-text-soft)]"}`}>
              {t("dashboard.heroSubtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/assistant" className="app-cta rounded-[22px] px-5 py-3 text-sm font-semibold">
                {t("dashboard.openAssistant")}
              </Link>
              <Link to="/history" className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[color:var(--seer-text-soft)] transition hover:bg-white/8">
                {t("dashboard.reviewRecent")}
              </Link>
            </div>
          </div>
          <div className="grid gap-4 self-start md:grid-cols-2 lg:grid-cols-1">
            <div className="metric-tile interactive-surface rounded-[30px] px-5 py-5">
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">{t("dashboard.liveRiskPosture")}</div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="text-4xl font-black tracking-[-0.05em] text-[color:var(--seer-text)] sm:text-5xl">{averageRisk}</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--seer-text-soft)]">
                  {t("dashboard.avgRisk")}
                </div>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-white/8">
                <div className="h-2.5 rounded-full bg-[linear-gradient(90deg,#38bdf8,#8b5cf6)]" style={{ width: `${averageRisk}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--seer-text-soft)]">
                {t("dashboard.postureHelp")}
              </p>
            </div>
            <div className="panel-surface interactive-surface rounded-[30px] px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">{t("dashboard.systemPosture")}</div>
                <div className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  liveStatus === "Elevated"
                    ? "bg-red-500/15 text-red-200"
                    : liveStatus === "Watch"
                      ? "bg-amber-400/15 text-amber-200"
                      : "bg-emerald-400/15 text-emerald-200"
                }`}>
                  {t(`dashboard.${liveStatus.toLowerCase()}`)}
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  [t("dashboard.systemLabels.analyze"), t("dashboard.systemItems.analyze")],
                  [t("dashboard.systemLabels.explain"), t("dashboard.systemItems.explain")],
                  [t("dashboard.systemLabels.act"), t("dashboard.systemItems.act")],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[22px] border border-white/8 bg-black/20 p-3">
                    <div className="text-sm font-semibold capitalize text-[color:var(--seer-text)]">{label}</div>
                    <div className="mt-1 text-sm leading-6 text-[color:var(--seer-text-soft)]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatsCard title={t("dashboard.stats.recentScans")} value={recentItems.length} subtitle={t("dashboard.stats.recentScansSubtitle")} />
        <StatsCard title={t("dashboard.stats.highRisk")} value={riskyCount} subtitle={t("dashboard.stats.highRiskSubtitle")} accent="red" />
        <StatsCard title={t("dashboard.stats.protectedModes")} value="7" subtitle={t("dashboard.stats.protectedModesSubtitle")} />
        <StatsCard title={t("dashboard.stats.avgConfidence")} value={`${recentItems.length ? Math.round((recentItems.reduce((sum, item) => sum + ((item.confidence || item.metadata?.confidence || 0) * 100), 0) / recentItems.length)) : 0}%`} subtitle={t("dashboard.stats.avgConfidenceSubtitle")} accent="amber" />
      </div>
      <div className="panel-surface interactive-surface rounded-[30px] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">{t("dashboard.capabilityEyebrow")}</p>
            <h2 className="mt-2 text-xl font-black text-[color:var(--seer-text)] sm:text-2xl">{t("dashboard.capabilityTitle")}</h2>
          </div>
          <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-200">
            {t("dashboard.capabilityBadge")}
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilityCards.map(([title, text]) => (
            <div key={title} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="text-sm font-semibold text-[color:var(--seer-text)]">{title}</div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--seer-text-soft)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {[
          { to: "/assistant", content: toolCards[0] },
          { to: "/message-check", content: toolCards[1] },
          { to: "/voice-check", content: toolCards[2] },
          { to: "/link-check", content: toolCards[3] },
          { to: "/image-privacy", content: toolCards[4] },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="metric-tile interactive-surface rounded-[28px] p-5 transition hover:translate-y-[-2px]">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">{item.content[0]}</div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--seer-text-soft)]">{item.content[1]}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <BarList
          title={t("dashboard.riskMixTitle")}
          subtitle={t("dashboard.riskMixSubtitle")}
          items={riskMix}
          itemKey="label"
          valueKey="count"
          tone="amber"
        />
        <BarList
          title={t("dashboard.tacticsTitle")}
          subtitle={t("dashboard.tacticsSubtitle")}
          items={tacticDistribution.length ? tacticDistribution : [{ label: t("dashboard.noTacticData"), count: 0 }]}
          itemKey="label"
          valueKey="count"
          tone="emerald"
        />
      </div>
      <AnalysisWorkspace
        assistant={assistant}
        title={t("dashboard.workspaceTitle")}
        subtitle={t("dashboard.workspaceSubtitle")}
      />
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">{t("dashboard.recentChecksEyebrow")}</p>
            <h2 className="mt-2 text-xl font-black text-[color:var(--seer-text)] sm:text-2xl">{t("dashboard.recentChecksTitle")}</h2>
          </div>
          <Link to="/history" className="text-sm font-semibold text-cyan-300">{t("dashboard.openFullHistory")}</Link>
        </div>
        {recentItems.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentItems.map((item) => (
              <SafetyHistoryCard key={item.id} item={item} onOpen={(id) => navigate(`/history/${id}`)} />
            ))}
          </div>
        ) : (
          <div className="panel-surface rounded-[30px] px-6 py-10 text-center text-sm text-[color:var(--seer-text-soft)]">
            {t("dashboard.noChecks")}
          </div>
        )}
      </div>
      <div className="panel-surface interactive-surface relative overflow-hidden rounded-[32px] px-5 py-6 sm:px-6">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute bottom-[-30px] left-[20%] h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">{t("dashboard.nextActionEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[color:var(--seer-text)] sm:text-3xl">
              {t("dashboard.nextActionTitle")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--seer-text-soft)]">
              {t("dashboard.nextActionSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/assistant" className="app-cta rounded-[22px] px-5 py-3 text-sm font-semibold">
              {t("dashboard.startNew")}
            </Link>
            <Link to="/reports" className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[color:var(--seer-text-soft)] transition hover:bg-white/8">
              {t("dashboard.reviewReports")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
