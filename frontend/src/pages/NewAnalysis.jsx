import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import RiskBadge from "../components/RiskBadge";

export default function NewAnalysis() {
  const [form, setForm] = useState({ input_text: "", channel: "email" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">New Analysis</h1>
        <p className="mt-2 text-slate-500">Submit message content for social-engineering analysis.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const response = await api.post("/api/analysis", form);
              setResult(response.data);
              setError("");
            } catch (err) {
              setError(err.response?.data?.detail || "Analysis failed");
            }
          }}
        >
          <div className="space-y-4">
            <select className="w-full rounded-xl border p-3" onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="chat">Chat</option>
            </select>
            <textarea
              className="min-h-64 w-full rounded-xl border p-4"
              placeholder="Paste suspicious email, SMS, or chat message"
              onChange={(e) => setForm({ ...form, input_text: e.target.value })}
            />
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <button className="rounded-xl bg-cyber-700 px-5 py-3 font-medium text-white">Run Analysis</button>
          </div>
        </form>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Result</h2>
          {result ? (
            <div className="mt-4 space-y-4">
              <RiskBadge riskScore={result.risk_score} />
              <div className="text-sm text-slate-600">Attack: {result.attack_prediction}</div>
              <div className="text-sm text-slate-600">Tactic: {result.tactic_prediction}</div>
              <div className="text-sm text-slate-600">{result.explanation}</div>
              <button onClick={() => navigate(`/analysis/${result.id}`)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">
                Open Details
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No analysis yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
