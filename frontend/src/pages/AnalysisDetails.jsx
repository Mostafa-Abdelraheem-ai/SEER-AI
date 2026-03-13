import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/client";
import RiskBadge from "../components/RiskBadge";

export default function AnalysisDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    api.get(`/api/analysis/${id}`).then((response) => setAnalysis(response.data));
  }, [id]);

  if (!analysis) {
    return <div className="text-slate-500">Loading analysis...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Analysis Details</h1>
          <p className="mt-2 text-slate-500">Detailed detection evidence and investigation context.</p>
        </div>
        <RiskBadge riskScore={analysis.risk_score} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Prediction Summary</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div>Attack: {analysis.attack_prediction}</div>
            <div>Tactic: {analysis.tactic_prediction}</div>
            <div>Confidence: {analysis.confidence}</div>
            <div>Recommendation: {analysis.recommended_action}</div>
          </div>
          <p className="mt-4 text-sm text-slate-700 whitespace-pre-line">{analysis.explanation}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Triggered Rules</h2>
          <pre className="mt-4 text-sm text-slate-600">{JSON.stringify(analysis.triggered_rules, null, 2)}</pre>
          <h2 className="mt-6 font-semibold">Retrieved Chunks</h2>
          <pre className="mt-4 text-sm text-slate-600">{JSON.stringify(analysis.retrieved_chunks, null, 2)}</pre>
          <button
            onClick={async () => {
              const response = await api.post(`/api/reports/${analysis.id}`);
              navigate(`/reports?highlight=${response.data.id}`);
            }}
            className="mt-6 rounded-xl bg-cyber-700 px-4 py-2 text-sm text-white"
          >
            Generate / Open Report
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Incident Report</h2>
        <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{analysis.incident_report || "Not generated."}</p>
      </div>
    </div>
  );
}
