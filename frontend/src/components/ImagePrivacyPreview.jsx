export default function ImagePrivacyPreview({ previewUrl, boxes = [] }) {
  if (!previewUrl) return null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#08111d]">
      <img src={previewUrl} alt="Privacy scan upload" className="max-h-[28rem] w-full object-contain" />
      {boxes.map((box, index) => (
        <div
          key={`${box.left}-${box.top}-${index}`}
          className="pointer-events-none absolute border-2 border-red-400/90 bg-red-400/10 shadow-[0_0_0_1px_rgba(248,113,113,0.2),0_0_24px_rgba(248,113,113,0.14)]"
          style={{
            left: `${box.left}px`,
            top: `${box.top}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
          }}
        />
      ))}
    </div>
  );
}
