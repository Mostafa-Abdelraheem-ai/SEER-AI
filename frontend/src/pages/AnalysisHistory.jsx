import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SafetyHistoryCard from "../components/SafetyHistoryCard";
import SegmentedControl from "../components/SegmentedControl";
import { fetchSafetyHistory } from "../services/safety";

export default function AnalysisHistory() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSafetyHistory().then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = filter === "all" ? true : item.scan_type === filter || item.verdict === filter;
      const haystack = `${item.title} ${item.summary} ${item.scan_type} ${item.verdict}`.toLowerCase();
      const matchesQuery = query.trim() ? haystack.includes(query.trim().toLowerCase()) : true;
      return matchesType && matchesQuery;
    });
  }, [filter, items, query]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Archive</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">History</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Browse previous checks, reopen the full explanation, and filter by type or risk level.</p>
      </div>
      <div className="glass-panel rounded-[30px] p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr,auto] lg:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, result, or check type"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          />
          <SegmentedControl
            items={[
              { id: "all", label: "All" },
              { id: "message", label: "Messages" },
              { id: "voice", label: "Voice" },
              { id: "link", label: "Links" },
              { id: "image_privacy", label: "Images" },
              { id: "likely_scam", label: "High risk" },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </div>
      </div>
      {filteredItems.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <SafetyHistoryCard key={item.id} item={item} onOpen={(id) => navigate(`/history/${id}`)} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[30px] px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-slate-950">No matching results yet</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Try a different filter or run a new check to populate the archive.</p>
        </div>
      )}
    </div>
  );
}
