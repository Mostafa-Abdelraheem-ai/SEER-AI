import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const monitoringCards = [
    ["API health", "Healthy", "Core FastAPI routes, metrics, and readiness endpoints are active."],
    ["Model runtime", "Hybrid", "OpenAI-backed and local inference paths can both be used depending on configuration."],
    ["Webhook intake", "Ready", "Authenticated ingestion is available for external systems and automation."],
    ["Monitoring", "Online", "Prometheus and Grafana can be used to inspect latency, errors, and AI pipeline behavior."],
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">System controls</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[color:var(--seer-text)]">Settings, integrations, and monitoring</h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--seer-text-soft)]">Configure how SEER-AI behaves, how it connects to other systems, and how healthy the platform looks at a glance.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <div className="panel-surface rounded-[32px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Workspace owner</div>
                <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[color:var(--seer-text)]">{user?.full_name}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--seer-text-soft)]">
                {user?.role}
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Email</div>
                <div className="mt-2 text-sm font-semibold text-[color:var(--seer-text)]">{user?.email}</div>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">Workspace ID</div>
                <div className="mt-2 break-all text-sm font-semibold text-[color:var(--seer-text)]">{user?.id}</div>
              </div>
            </div>
          </div>
          <div className="panel-surface rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">AI model posture</div>
              <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Live</div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                ["Text reasoning", "Hybrid runtime with grounded retrieval"],
                ["Voice processing", "Transcript + acoustic pressure analysis"],
                ["Image privacy", "OCR plus sensitive entity detection"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-[color:var(--seer-text)]">{label}</div>
                  <div className="mt-1 text-sm text-[color:var(--seer-text-soft)]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="panel-surface rounded-[32px] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Platform monitoring</div>
            <div className="mt-4 space-y-3">
              {monitoringCards.map(([label, status, value]) => (
                <div key={label} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[color:var(--seer-text)]">{label}</div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                      {status}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-[color:var(--seer-text-soft)]">{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-surface rounded-[32px] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Integrations</div>
            <div className="mt-4 space-y-3">
              {[
                ["OpenAI path", "Enable `OPENAI_API_KEY` to unlock stronger grounded explanations and transcript generation."],
                ["Webhook secret", "Configure `WEBHOOK_SECRET` to accept trusted inbound reports from external systems."],
                ["Grafana / Prometheus", "Use the monitoring stack to inspect latency, AI fallbacks, and health over time."],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-[color:var(--seer-text)]">{label}</div>
                  <div className="mt-1 text-sm text-[color:var(--seer-text-soft)]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
