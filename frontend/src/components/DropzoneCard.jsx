import { useRef, useState } from "react";

export default function DropzoneCard({ accept, label, hint, onFileSelect }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = (files) => {
    const file = files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      className={`rounded-[28px] border-2 border-dashed p-5 transition duration-200 ${
        isDragging
          ? "border-cyan-300 bg-cyan-300/10 shadow-[0_20px_60px_rgba(41,191,255,0.14)]"
          : "border-white/10 bg-black/20"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        pickFile(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => pickFile(event.target.files)}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-[color:var(--seer-text)]">{label}</div>
          <div className="mt-2 text-sm leading-6 text-[color:var(--seer-text-soft)]">{hint}</div>
        </div>
        <button
          type="button"
          className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-[color:var(--seer-text)] transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </button>
      </div>
    </div>
  );
}
