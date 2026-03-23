import SafetyVerdictBadge from "./SafetyVerdictBadge";
import { formatDateTime, scanTypeLabel, truncate } from "../utils/formatters";

export default function SafetyHistoryCard({ item, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="glass-panel w-full rounded-[28px] p-5 text-left transition hover:translate-y-[-2px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">{scanTypeLabel(item.scan_type)}</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{formatDateTime(item.created_at)}</p>
        </div>
        <SafetyVerdictBadge verdict={item.verdict} riskScore={item.risk_score} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{truncate(item.summary, 140)}</p>
    </button>
  );
}
