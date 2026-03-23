export default function ResultTabs({ value, onChange }) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "details", label: "Technical details" },
    { id: "raw", label: "Raw data" },
  ];

  return (
    <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/8 bg-black/20 p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            value === tab.id
              ? "bg-[linear-gradient(135deg,rgba(36,190,255,0.25),rgba(103,80,255,0.22))] text-white shadow-[0_12px_30px_rgba(18,29,67,0.32)]"
              : "border border-white/8 bg-white/5 text-[color:var(--seer-text-muted)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
