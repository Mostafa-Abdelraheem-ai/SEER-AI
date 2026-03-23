export default function SegmentedControl({ items, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-[24px] border border-white/8 bg-black/20 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-[18px] px-4 py-2.5 text-sm font-semibold transition duration-200 ${
            value === item.id
              ? "bg-[linear-gradient(135deg,rgba(36,190,255,0.26),rgba(103,80,255,0.22))] text-white shadow-[0_14px_34px_rgba(18,29,67,0.35)]"
              : "text-[color:var(--seer-text-muted)] hover:bg-white/6 hover:text-[color:var(--seer-text)]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
