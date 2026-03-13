import RiskBadge from "./RiskBadge";

export default function AnalysisCard({ analysis, onOpen }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{analysis.attack_prediction}</h3>
          <p className="text-sm text-slate-500">{analysis.tactic_prediction}</p>
        </div>
        <RiskBadge riskScore={analysis.risk_score} />
      </div>
      <p className="mt-4 line-clamp-3 text-sm text-slate-600">{analysis.input_text}</p>
      <button onClick={() => onOpen(analysis.id)} className="mt-4 rounded-xl bg-cyber-700 px-4 py-2 text-sm text-white">
        View Details
      </button>
    </div>
  );
}
