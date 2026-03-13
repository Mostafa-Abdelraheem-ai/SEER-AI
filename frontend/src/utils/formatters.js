export function truncate(text, max = 180) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
