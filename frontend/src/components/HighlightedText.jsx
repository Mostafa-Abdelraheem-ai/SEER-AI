function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightedText({ text, highlights = [] }) {
  if (!text) {
    return <p className="text-sm leading-6 text-slate-500">No source text available for highlighting.</p>;
  }

  const phrases = highlights
    .map((item) => item.value)
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  if (!phrases.length) {
    return <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{text}</p>;
  }

  const matcher = new RegExp(`(${phrases.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(matcher);

  return (
    <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
      {parts.map((part, index) => {
        const match = phrases.find((phrase) => phrase.toLowerCase() === part.toLowerCase());
        if (match) {
          return (
            <mark key={`${part}-${index}`} className="rounded-lg bg-amber-200 px-1.5 py-0.5 text-slate-950">
              {part}
            </mark>
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </p>
  );
}
