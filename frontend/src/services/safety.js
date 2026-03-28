import api from "../api/client";

export const INPUT_TYPES = [
  { id: "message", labelKey: "common.messageCheck", acceptsFile: false, accept: "" },
  { id: "email", labelKey: "scanTypes.email", acceptsFile: true, accept: ".eml,message/rfc822" },
  { id: "link", labelKey: "common.linkCheck", acceptsFile: false, accept: "" },
  { id: "image", labelKey: "common.imagePrivacy", acceptsFile: true, accept: "image/*" },
  { id: "voice", labelKey: "common.voiceCheck", acceptsFile: true, accept: "audio/*,.wav" },
  { id: "attachment", labelKey: "scanTypes.attachment", acceptsFile: true, accept: "*" },
  { id: "hash", labelKey: "scanTypes.hash", acceptsFile: false, accept: "" },
];

export function detectInputType({ text, file }) {
  if (file) {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "voice";
    if (file.name.toLowerCase().endsWith(".eml")) return "email";
    return "attachment";
  }

  const normalized = text.trim();
  if (!normalized) return "message";
  if (/^https?:\/\//i.test(normalized) || /^www\./i.test(normalized)) return "link";
  if (/^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i.test(normalized)) return "hash";
  if (/^from:\s|^subject:\s|reply-to:/im.test(normalized)) return "email";
  return "message";
}

export function createPreview(file) {
  if (!file) return null;
  return {
    name: file.name,
    size: file.size,
    type: file.type || "Unknown",
    objectUrl: file.type.startsWith("image/") || file.type.startsWith("audio/") ? URL.createObjectURL(file) : null,
  };
}

export async function runSafetyAnalysis({ mode, text, file, transcriptHint, channel = "message" }) {
  if (mode === "message") {
    const response = await api.post("/api/safety/message", { message: text, channel });
    return response.data;
  }

  if (mode === "email") {
    if (file) {
      const formData = new FormData();
      formData.append("email_file", file);
      const response = await api.post("/api/safety/email-upload", formData);
      return response.data;
    }
    const response = await api.post("/api/safety/email", { raw_email_text: text });
    return response.data;
  }

  if (mode === "link") {
    const response = await api.post("/api/safety/link", { url: text });
    return response.data;
  }

  if (mode === "image") {
    const formData = new FormData();
    formData.append("image_file", file);
    const response = await api.post("/api/safety/image-privacy", formData);
    return response.data;
  }

  if (mode === "voice") {
    const formData = new FormData();
    formData.append("audio_file", file);
    if (transcriptHint?.trim()) {
      formData.append("transcript_hint", transcriptHint.trim());
    }
    const response = await api.post("/api/safety/voice", formData);
    return response.data;
  }

  if (mode === "attachment") {
    const formData = new FormData();
    formData.append("attachment", file);
    const response = await api.post("/api/safety/attachment", formData);
    return response.data;
  }

  if (mode === "hash") {
    const response = await api.post("/api/safety/hash", { hash_value: text });
    return response.data;
  }

  throw new Error(`Unsupported mode: ${mode}`);
}

export async function fetchSafetyHistory(limit) {
  const response = await api.get(limit ? `/api/safety/history?limit=${limit}` : "/api/safety/history");
  return response.data.items;
}

export async function fetchSafetyScan(id) {
  const response = await api.get(`/api/safety/${id}`);
  return response.data;
}
