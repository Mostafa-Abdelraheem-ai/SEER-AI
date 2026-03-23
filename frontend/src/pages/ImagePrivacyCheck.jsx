import { useState } from "react";

import api from "../api/client";
import SafetyResultPanel from "../components/SafetyResultPanel";

export default function ImagePrivacyCheck() {
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Image privacy check</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Could this image expose private information?</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Upload an image before you share it. We’ll extract visible text and warn you if it may contain phone numbers, email addresses, card-like numbers, or similar private details.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <form
          className="glass-panel rounded-[30px] p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!imageFile) {
              setError("Please choose an image first.");
              return;
            }
            try {
              setLoading(true);
              setError("");
              const formData = new FormData();
              formData.append("image_file", imageFile);
              const response = await api.post("/api/safety/image-privacy", formData);
              setResult(response.data);
            } catch (err) {
              setError(err.response?.data?.detail || "Image privacy check failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              />
            </div>
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <button className="rounded-2xl bg-[linear-gradient(135deg,#08152a,#0d4f82)] px-5 py-3 font-semibold text-white" disabled={loading}>
              {loading ? "Checking image..." : "Check image"}
            </button>
          </div>
        </form>
        <SafetyResultPanel result={result} />
      </div>
    </div>
  );
}
