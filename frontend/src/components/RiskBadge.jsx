export default function RiskBadge({ riskScore }) {
  const tone =
    riskScore >= 70
      ? "border-red-200 bg-red-50 text-red-700"
      : riskScore >= 40
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tone}`}>Risk {riskScore}</span>;
}
