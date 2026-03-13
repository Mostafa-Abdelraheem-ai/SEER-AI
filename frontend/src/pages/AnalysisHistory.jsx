import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import AnalysisCard from "../components/AnalysisCard";

export default function AnalysisHistory() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/analysis/history").then((response) => setItems(response.data.items));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Analysis History</h1>
        <p className="mt-2 text-slate-500">Persisted investigations and their outputs.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((analysis) => (
          <AnalysisCard key={analysis.id} analysis={analysis} onOpen={(id) => navigate(`/analysis/${id}`)} />
        ))}
      </div>
    </div>
  );
}
