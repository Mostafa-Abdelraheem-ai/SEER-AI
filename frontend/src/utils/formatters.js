import i18n from "../i18n";

export function truncate(text, max = 180) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(i18n.language === "ar" ? "ar-EG" : "en-US");
}

export function scanTypeLabel(scanType) {
  return i18n.t(`scanTypes.${scanType}`, { defaultValue: i18n.t("scanTypes.default") });
}
