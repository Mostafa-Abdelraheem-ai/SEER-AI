import RiskBadge from "./RiskBadge";
import { truncate } from "../utils/formatters";

export default function AnalysisCard({ analysis, onOpen }) {
  return (
    <div className="glass-panel rounded-[28px] p-5 transition hover:translate-y-[-2px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">{analysis.channel}</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{analysis.attack_prediction}</h3>
          <p className="text-sm text-slate-500">{analysis.tactic_prediction}</p>
        </div>
        <RiskBadge riskScore={analysis.risk_score} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{truncate(analysis.input_text, 170)}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
          {analysis.retrieved_chunks?.length || 0} knowledge hits
        </span>
        <button onClick={() => onOpen(analysis.id)} className="rounded-2xl bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-4 py-2 text-sm font-medium text-white">
        View Details
        </button>
      </div>
    </div>
  );
}
