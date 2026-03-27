import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/client";
import RiskBadge from "../components/RiskBadge";

export default function AnalysisDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    api.get(`/api/analysis/${id}`).then((response) => setAnalysis(response.data));
  }, [id]);

  if (!analysis) {
    return <div className="glass-panel interactive-surface rounded-[28px] px-6 py-8 text-sm text-slate-500">{t("detailsPage.loadingAnalysis")}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">{t("detailsPage.investigationDossier")}</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{t("detailsPage.analysisDetails")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{t("detailsPage.analysisSubtitle")}</p>
        </div>
        <RiskBadge riskScore={analysis.risk_score} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel interactive-surface rounded-[30px] p-6">
          <h2 className="text-lg font-semibold text-slate-950">{t("detailsPage.predictionSummary")}</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div>{t("detailsPage.attack")}: <span className="font-semibold text-slate-900">{analysis.attack_prediction}</span></div>
            <div>{t("detailsPage.tactic")}: <span className="font-semibold text-slate-900">{analysis.tactic_prediction}</span></div>
            <div>{t("result.confidence")}: <span className="font-semibold text-slate-900">{analysis.confidence}</span></div>
            <div>{t("detailsPage.recommendation")}: <span className="font-semibold text-slate-900">{analysis.recommended_action}</span></div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">
            {analysis.explanation}
          </div>
          <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4 text-sm leading-6 text-slate-700">
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-700">{t("detailsPage.originalMessage")}</div>
            <p className="mt-2 whitespace-pre-line">{analysis.input_text}</p>
          </div>
        </div>
        <div className="glass-panel interactive-surface rounded-[30px] p-6">
          <h2 className="text-lg font-semibold text-slate-950">{t("detailsPage.evidenceTrail")}</h2>
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("detailsPage.triggeredRules")}</div>
            <div className="mt-3 space-y-3">
              {analysis.triggered_rules.length ? analysis.triggered_rules.map((rule) => (
                <div key={rule.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="font-semibold text-slate-950">{rule.rule_name}</div>
                  <div className="mt-1 leading-6">{rule.matched_text}</div>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{t("detailsPage.noTriggeredRules")}</div>}
            </div>
          </div>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("detailsPage.retrievedKnowledge")}</div>
            <div className="mt-3 space-y-3">
              {analysis.retrieved_chunks.length ? analysis.retrieved_chunks.map((chunk) => (
                <div key={chunk.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-950">{chunk.source_document}</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-cyan-700">{t("detailsPage.score")} {chunk.relevance_score}</div>
                  </div>
                  <div className="mt-2 leading-6">{chunk.chunk_text}</div>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{t("detailsPage.noRetrievedChunks")}</div>}
            </div>
          </div>
          <button
            onClick={async () => {
              const response = await api.post(`/api/reports/${analysis.id}`);
              navigate(`/reports?highlight=${response.data.id}`);
            }}
            className="app-primary-button mt-6 py-2.5 text-sm"
          >
            {t("detailsPage.generateReport")}
          </button>
        </div>
      </div>
      <div className="glass-panel interactive-surface rounded-[30px] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-950">{t("detailsPage.incidentReport")}</h2>
          {analysis.incident_report ? (
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600"
              onClick={async () => {
                await navigator.clipboard.writeText(analysis.incident_report);
                setCopied(t("detailsPage.copied"));
                setTimeout(() => setCopied(""), 1800);
              }}
            >
              {copied || t("detailsPage.copyReport")}
            </button>
          ) : null}
        </div>
        <p className="mt-4 whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {analysis.incident_report || t("detailsPage.notGenerated")}
        </p>
      </div>
    </div>
  );
}
