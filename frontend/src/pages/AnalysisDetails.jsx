import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/client";
import RiskBadge from "../components/RiskBadge";

export default function AnalysisDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    api.get(`/api/analysis/${id}`).then((response) => setAnalysis(response.data));
  }, [id]);

  if (!analysis) {
    return <div className="glass-panel rounded-[28px] px-6 py-8 text-slate-500">Loading analysis...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Investigation dossier</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Analysis Details</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">Detailed detection evidence, investigation context, and report actions for this message.</p>
        </div>
        <RiskBadge riskScore={analysis.risk_score} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-[30px] p-6">
          <h2 className="text-lg font-semibold text-slate-950">Prediction Summary</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div>Attack: <span className="font-semibold text-slate-900">{analysis.attack_prediction}</span></div>
            <div>Tactic: <span className="font-semibold text-slate-900">{analysis.tactic_prediction}</span></div>
            <div>Confidence: <span className="font-semibold text-slate-900">{analysis.confidence}</span></div>
            <div>Recommendation: <span className="font-semibold text-slate-900">{analysis.recommended_action}</span></div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">
            {analysis.explanation}
          </div>
          <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4 text-sm leading-6 text-slate-700">
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-700">Original message</div>
            <p className="mt-2 whitespace-pre-line">{analysis.input_text}</p>
          </div>
        </div>
        <div className="glass-panel rounded-[30px] p-6">
          <h2 className="text-lg font-semibold text-slate-950">Evidence Trail</h2>
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Triggered rules</div>
            <div className="mt-3 space-y-3">
              {analysis.triggered_rules.length ? analysis.triggered_rules.map((rule) => (
                <div key={rule.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="font-semibold text-slate-950">{rule.rule_name}</div>
                  <div className="mt-1 leading-6">{rule.matched_text}</div>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No triggered rules captured.</div>}
            </div>
          </div>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Retrieved knowledge</div>
            <div className="mt-3 space-y-3">
              {analysis.retrieved_chunks.length ? analysis.retrieved_chunks.map((chunk) => (
                <div key={chunk.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-950">{chunk.source_document}</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-cyan-700">score {chunk.relevance_score}</div>
                  </div>
                  <div className="mt-2 leading-6">{chunk.chunk_text}</div>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No retrieved chunks available.</div>}
            </div>
          </div>
          <button
            onClick={async () => {
              const response = await api.post(`/api/reports/${analysis.id}`);
              navigate(`/reports?highlight=${response.data.id}`);
            }}
            className="mt-6 rounded-2xl bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-4 py-2 text-sm font-medium text-white"
          >
            Generate / Open Report
          </button>
        </div>
      </div>
      <div className="glass-panel rounded-[30px] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-950">Incident Report</h2>
          {analysis.incident_report ? (
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600"
              onClick={async () => {
                await navigator.clipboard.writeText(analysis.incident_report);
                setCopied("Report copied");
                setTimeout(() => setCopied(""), 1800);
              }}
            >
              {copied || "Copy report"}
            </button>
          ) : null}
        </div>
        <p className="mt-4 whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {analysis.incident_report || "Not generated."}
        </p>
      </div>
    </div>
  );
}
