import { useTranslation } from "react-i18next";

export default function AssistantLoadingCard({ message }) {
  const { t } = useTranslation();

  return (
    <div className="panel-surface interactive-surface rounded-[30px] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-red-500/10 shadow-[0_12px_36px_rgba(239,68,68,0.14)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{t("common.working")}</div>
          <div className="mt-1 text-base font-semibold text-[color:var(--seer-text)] sm:text-lg">{message}</div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-4 animate-pulse rounded-full bg-white/8" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/8" />
        <div className="h-4 w-3/5 animate-pulse rounded-full bg-white/8" />
      </div>
    </div>
  );
}
