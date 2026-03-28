import { useTranslation } from "react-i18next";

import RiskBadge from "./RiskBadge";
import { truncate } from "../utils/formatters";

export default function AnalysisCard({ analysis, onOpen }) {
  const { t } = useTranslation();

  return (
    <div className="glass-panel interactive-surface rounded-[28px] p-5 transition hover:translate-y-[-2px]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">{analysis.channel}</div>
          <h3 className="mt-2 break-words text-base font-semibold text-slate-950 sm:text-lg">{analysis.attack_prediction}</h3>
          <p className="text-sm text-slate-500">{analysis.tactic_prediction}</p>
        </div>
        <RiskBadge riskScore={analysis.risk_score} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{truncate(analysis.input_text, 170)}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
          {analysis.retrieved_chunks?.length || 0} {t("detailsPage.knowledgeHits")}
        </span>
        <button onClick={() => onOpen(analysis.id)} className="app-primary-button py-2.5 text-sm">
          {t("tabs.details")}
        </button>
      </div>
    </div>
  );
}
