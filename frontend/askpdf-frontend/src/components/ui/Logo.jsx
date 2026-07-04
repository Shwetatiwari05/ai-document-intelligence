// src/components/ui/Logo.jsx
// AskPDF logo — a speech bubble with a small document inside it,
// communicating "ask your document a question"

export default function Logo({ size = 28, withWordmark = true, dark = true }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
        {/* rounded square background */}
        <rect x="0" y="0" width="28" height="28" rx="8" fill="var(--color-accent-600)" />
        {/* Speech bubble body */}
        <path
          d="M5 7 Q5 4 8 4 H20 Q23 4 23 7 V15 Q23 18 20 18 H15 L11 23 L11 18 H8 Q5 18 5 15 Z"
          fill="white"
          opacity="0.95"
        />
        {/* Document lines inside bubble */}
        <rect x="9" y="8" width="10" height="2" rx="1" fill="var(--color-accent-500)" />
        <rect x="9" y="12" width="7" height="2" rx="1" fill="var(--color-accent-300)" />
      </svg>
      {withWordmark && (
        <span
          className={`font-display text-[18px] font-medium tracking-tight ${
            dark ? "text-white" : "text-text-primary"
          }`}
        >
          AskPDF
        </span>
      )}
    </div>
  );
}
