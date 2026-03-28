import { useTranslation } from "react-i18next";

import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle({ className = "", compact = false }) {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
    >
      <span className="theme-toggle__thumb">{isDark ? "◐" : "◑"}</span>
      {!compact ? <span className="theme-toggle__label">{isDark ? t("theme.lightUi") : t("theme.darkUi")}</span> : null}
    </button>
  );
}
