import { useTranslation } from "react-i18next";

export default function RiskBadge({ riskScore }) {
  const { t } = useTranslation();
  const tone =
    riskScore >= 70
      ? "border-red-200 bg-red-50 text-red-700 shadow-[0_0_24px_rgba(239,68,68,0.1)]"
      : riskScore >= 40
        ? "border-amber-200 bg-amber-50 text-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.08)]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone}`}>{t("result.riskScore")} {riskScore}</span>;
}
