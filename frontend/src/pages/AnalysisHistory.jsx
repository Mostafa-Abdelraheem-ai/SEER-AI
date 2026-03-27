import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import SafetyHistoryCard from "../components/SafetyHistoryCard";
import SegmentedControl from "../components/SegmentedControl";
import { fetchSafetyHistory } from "../services/safety";

export default function AnalysisHistory() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">{t("historyPage.eyebrow")}</p>
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{t("historyPage.title")}</h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-500">{t("historyPage.subtitle")}</p>
      </div>
      <div className="glass-panel rounded-[30px] p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr,auto] lg:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("historyPage.searchPlaceholder")}
            className="app-input"
          />
          <SegmentedControl
            items={[
              { id: "all", label: t("common.all") },
              { id: "message", label: t("common.messages") },
              { id: "voice", label: t("common.voice") },
              { id: "link", label: t("common.links") },
              { id: "image_privacy", label: t("common.images") },
              { id: "likely_scam", label: t("common.highRisk") },
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
          <h2 className="text-xl font-semibold text-slate-950">{t("historyPage.emptyTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t("historyPage.emptySubtitle")}</p>
        </div>
      )}
    </div>
  );
}
