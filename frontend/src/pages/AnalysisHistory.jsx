import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import SafetyHistoryCard from "../components/SafetyHistoryCard";

export default function AnalysisHistory() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/safety/history").then((response) => setItems(response.data.items));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Archive</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">History</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">All your recent safety checks in one place, including messages, links, voice notes, attachments, and image privacy scans.</p>
      </div>
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <SafetyHistoryCard key={item.id} item={item} onOpen={(id) => navigate(`/history/${id}`)} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[30px] px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-slate-950">No investigations stored yet</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Run your first analysis to populate this archive and unlock detailed evidence review.</p>
        </div>
      )}
    </div>
  );
}
