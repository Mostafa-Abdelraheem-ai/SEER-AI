import { useTranslation } from "react-i18next";

import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const monitoringCards = t("profilePage.monitoringCards", { returnObjects: true });
  const modelCards = t("profilePage.modelCards", { returnObjects: true });
  const integrations = t("profilePage.integrations", { returnObjects: true });

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">{t("profilePage.eyebrow")}</p>
        <h1 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--seer-text)] sm:text-4xl">{t("profilePage.title")}</h1>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--seer-text-soft)]">{t("profilePage.subtitle")}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <div className="panel-surface rounded-[32px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">{t("profilePage.workspaceOwner")}</div>
                <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[color:var(--seer-text)]">{user?.full_name}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--seer-text-soft)]">
                {user?.role}
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("profilePage.email")}</div>
                <div className="mt-2 text-sm font-semibold text-[color:var(--seer-text)]">{user?.email}</div>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--seer-text-muted)]">{t("profilePage.workspaceId")}</div>
                <div className="mt-2 break-all text-sm font-semibold text-[color:var(--seer-text)]">{user?.id}</div>
              </div>
            </div>
          </div>
          <div className="panel-surface rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">{t("profilePage.aiModelPosture")}</div>
              <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">{t("profilePage.live")}</div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {modelCards.map(([label, value]) => (
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
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">{t("profilePage.monitoringTitle")}</div>
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
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">{t("profilePage.integrationsTitle")}</div>
            <div className="mt-4 space-y-3">
              {integrations.map(([label, value]) => (
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
