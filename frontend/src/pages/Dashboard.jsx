import { useEffect, useState } from "react";

import api from "../api/client";
import StatsCard from "../components/StatsCard";

export default function Dashboard() {
  const [overview, setOverview] = useState({ total_analyses: 0, total_reports: 0, high_risk_count: 0 });
  const [distribution, setDistribution] = useState([]);
  const [attacks, setAttacks] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/api/dashboard/overview"),
      api.get("/api/dashboard/risk-distribution"),
      api.get("/api/dashboard/attack-types"),
    ]).then(([overviewRes, distRes, attackRes]) => {
      setOverview(overviewRes.data);
      setDistribution(distRes.data);
      setAttacks(attackRes.data);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">Overview of detections, reports, and risk patterns.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Analyses" value={overview.total_analyses} subtitle="Stored message investigations" />
        <StatsCard title="Reports" value={overview.total_reports} subtitle="Generated incident reports" />
        <StatsCard title="High Risk" value={overview.high_risk_count} subtitle="Risk score >= 70" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Risk Distribution</h2>
          <pre className="mt-4 text-sm text-slate-600">{JSON.stringify(distribution, null, 2)}</pre>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Attack Types</h2>
          <pre className="mt-4 text-sm text-slate-600">{JSON.stringify(attacks, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
