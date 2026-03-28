import { useTranslation } from "react-i18next";

import { useLanguage } from "../hooks/useLanguage";

export default function LanguageSwitcher({ compact = false, className = "" }) {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <label className={`language-switcher ${className}`}>
      {!compact ? <span className="language-switcher__label">{t("common.language")}</span> : null}
      <select
        aria-label={t("common.language")}
        className="language-switcher__select"
        value={language}
        onChange={(event) => changeLanguage(event.target.value)}
      >
        <option value="en">{t("common.english")}</option>
        <option value="ar">{t("common.arabic")}</option>
      </select>
    </label>
  );
}
