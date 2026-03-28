import { createContext, useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, RTL_LANGUAGES } from "../i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const language = i18n.language || DEFAULT_LANGUAGE;
    const dir = RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.documentElement.classList.toggle("lang-ar", language === "ar");
    document.documentElement.classList.toggle("lang-en", language !== "ar");
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [i18n.language]);

  const value = useMemo(
    () => ({
      language: i18n.language || DEFAULT_LANGUAGE,
      isRTL: RTL_LANGUAGES.includes(i18n.language || DEFAULT_LANGUAGE),
      changeLanguage: (language) => i18n.changeLanguage(language),
    }),
    [i18n]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider");
  }
  return context;
}
