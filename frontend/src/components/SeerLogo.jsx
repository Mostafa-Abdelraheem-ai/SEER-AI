export default function SeerLogo({ className = "", compact = false, showWordmark = true }) {
  return (
    <div className={`flex items-center ${compact ? "gap-3" : "gap-4"} ${className}`}>
      <div className={`relative ${compact ? "h-11 w-11" : "h-16 w-16"} shrink-0`}>
        <svg viewBox="0 0 120 132" className="h-full w-full drop-shadow-[0_10px_30px_rgba(21,143,200,0.35)]" aria-hidden="true">
          <defs>
            <linearGradient id="seer-shield" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#08152a" />
              <stop offset="100%" stopColor="#0d2741" />
            </linearGradient>
            <linearGradient id="seer-eye" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#22b5f6" />
              <stop offset="100%" stopColor="#67d3ff" />
            </linearGradient>
          </defs>
          <path
            d="M60 4 109 21v41c0 29-17 51-49 66C28 113 11 91 11 62V21L60 4Z"
            fill="url(#seer-shield)"
            stroke="#0f4064"
            strokeWidth="5"
          />
          <path
            d="M60 16 98 29v33c0 23-13 41-38 54C35 103 22 85 22 62V29l38-13Z"
            fill="none"
            stroke="#36bff4"
            strokeWidth="4"
            opacity="0.9"
          />
          <path d="M35 66c8-11 16-16 25-16s17 5 25 16c-8 10-16 15-25 15s-17-5-25-15Z" fill="url(#seer-eye)" />
          <circle cx="60" cy="66" r="10.5" fill="#08152a" />
          <path d="M73 52 90 37" stroke="#4ecaff" strokeWidth="4" strokeLinecap="round" />
          <path d="M51 82 39 96" stroke="#4ecaff" strokeWidth="4" strokeLinecap="round" />
          <path d="M70 79 70 96" stroke="#4ecaff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="93" cy="34" r="5" fill="#08152a" stroke="#4ecaff" strokeWidth="4" />
          <circle cx="35" cy="100" r="5" fill="#08152a" stroke="#4ecaff" strokeWidth="4" />
          <circle cx="70" cy="101" r="5" fill="#08152a" stroke="#4ecaff" strokeWidth="4" />
        </svg>
      </div>
      {showWordmark ? (
        <div>
          <div className={`${compact ? "text-lg" : "text-2xl"} font-black uppercase tracking-[0.28em] text-slate-50`}>
            Seer-AI
          </div>
          {!compact ? <div className="text-xs uppercase tracking-[0.34em] text-cyan-200/80">Cyber defense cockpit</div> : null}
        </div>
      ) : null}
    </div>
  );
}
