import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/client";
import SafetyResultPanel from "../components/SafetyResultPanel";

export default function SafetyScanDetails() {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/api/safety/${id}`).then((response) => setResult(response.data));
  }, [id]);

  if (!result) {
    return <div className="glass-panel rounded-[30px] px-6 py-8 text-slate-500">Loading check details...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Check details</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">{result.title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">A full breakdown of what we checked, what we found, and what to do next.</p>
      </div>
      <SafetyResultPanel result={result} />
    </div>
  );
}
