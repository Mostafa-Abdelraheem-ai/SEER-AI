function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function buildWaveBars(name = "") {
  return Array.from({ length: 28 }, (_, index) => {
    const seed = name.charCodeAt(index % Math.max(1, name.length)) || 42;
    return 24 + ((seed + index * 17) % 56);
  });
}

export default function FilePreviewCard({ preview, mode, onRemove }) {
  if (!preview) return null;

  return (
    <div className="panel-surface rounded-[28px] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Preview</div>
          <div className="mt-2 text-lg font-semibold text-[color:var(--seer-text)]">{preview.name}</div>
          <div className="mt-1 text-sm text-[color:var(--seer-text-muted)]">{preview.type} • {formatBytes(preview.size)}</div>
        </div>
        <button
          type="button"
          className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-[color:var(--seer-text-soft)] transition hover:bg-white/8"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>

      {mode === "image" && preview.objectUrl ? (
        <img src={preview.objectUrl} alt="Selected upload" className="max-h-72 w-full rounded-[24px] border border-white/8 object-cover" />
      ) : null}

      {mode === "voice" && preview.objectUrl ? (
        <div className="space-y-4">
          <audio controls className="w-full opacity-90">
            <source src={preview.objectUrl} />
          </audio>
          <div className="flex h-24 items-end gap-1 rounded-[24px] border border-white/8 bg-[#08111d] px-4 py-3">
            {buildWaveBars(preview.name).map((height, index) => (
              <span
                key={`${preview.name}-${index}`}
                className="wave-bar w-2 rounded-full bg-gradient-to-t from-cyan-500 to-cyan-200"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
