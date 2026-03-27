import { useTranslation } from "react-i18next";

const toneClasses = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.08)]",
  caution: "border-amber-200 bg-amber-50 text-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.08)]",
  risky: "border-orange-200 bg-orange-50 text-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.08)]",
  likely_scam: "border-red-200 bg-red-50 text-red-700 shadow-[0_0_24px_rgba(239,68,68,0.1)]",
  private_info_detected: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 shadow-[0_0_24px_rgba(232,121,249,0.08)]",
  unknown: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function SafetyVerdictBadge({ verdict, riskScore }) {
  const { t } = useTranslation();
  const tone = toneClasses[verdict] || toneClasses.unknown;
  const label = t(`result.verdicts.${verdict}`, { defaultValue: t("result.verdicts.unknown") });

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone}`}>
      <span>{label}</span>
      {typeof riskScore === "number" ? <span className="opacity-75">{t("detailsPage.score")} {riskScore}</span> : null}
    </span>
  );
}
