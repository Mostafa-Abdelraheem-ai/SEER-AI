const toneClasses = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  caution: "border-amber-200 bg-amber-50 text-amber-700",
  risky: "border-orange-200 bg-orange-50 text-orange-700",
  likely_scam: "border-red-200 bg-red-50 text-red-700",
  private_info_detected: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  unknown: "border-slate-200 bg-slate-50 text-slate-700",
};

const labels = {
  safe: "Safe",
  caution: "Caution",
  risky: "Risky",
  likely_scam: "Likely scam",
  private_info_detected: "Private info detected",
  unknown: "Needs review",
};

export default function SafetyVerdictBadge({ verdict, riskScore }) {
  const tone = toneClasses[verdict] || toneClasses.unknown;
  const label = labels[verdict] || labels.unknown;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tone}`}>
      <span>{label}</span>
      {typeof riskScore === "number" ? <span className="opacity-75">Score {riskScore}</span> : null}
    </span>
  );
}
