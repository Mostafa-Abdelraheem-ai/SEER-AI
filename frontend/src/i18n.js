import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar";
import en from "./locales/en";

export const LANGUAGE_STORAGE_KEY = "seer_language";
export const DEFAULT_LANGUAGE = "en";
export const RTL_LANGUAGES = ["ar"];

const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE
    : DEFAULT_LANGUAGE;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
