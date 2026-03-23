export function truncate(text, max = 180) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

export function scanTypeLabel(scanType) {
  const labels = {
    message: "Message check",
    voice: "Voice check",
    email: "Email check",
    attachment: "Attachment check",
    link: "Link check",
    hash: "Hash check",
    image_privacy: "Image privacy check",
  };
  return labels[scanType] || "Safety check";
}
