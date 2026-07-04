// src/components/layout/AuthIllustration.jsx
import { Check } from "lucide-react";

export default function AuthIllustration({ variant = "signup" }) {
  return (
    <div className="flex h-full items-center justify-center bg-surface-sunken p-10">
      <svg width="160" height="190" viewBox="0 0 160 190" aria-hidden="true">
        <rect
          x="20"
          y="10"
          width="120"
          height="160"
          rx="10"
          fill="var(--color-surface)"
          stroke="var(--color-border-soft)"
        />
        <rect x="36" y="30" width="80" height="6" rx="3" fill="var(--color-accent-100)" />
        <rect x="36" y="44" width="60" height="6" rx="3" fill="var(--color-accent-100)" />

        {variant === "signup" ? (
          <>
            <rect x="36" y="68" width="88" height="5" rx="2.5" fill="var(--color-border-soft)" />
            <rect x="36" y="80" width="70" height="5" rx="2.5" fill="var(--color-border-soft)" />
            <rect x="36" y="92" width="88" height="5" rx="2.5" fill="var(--color-border-soft)" />
          </>
        ) : (
          <rect
            x="34"
            y="64"
            width="92"
            height="18"
            rx="4"
            fill="var(--color-accent-500)"
            opacity="0.18"
          />
        )}
      </svg>
      <div className="absolute" style={{ transform: "translate(48px, 90px)" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-600">
          {variant === "signup" ? (
            <span className="text-xl font-medium text-white">+</span>
          ) : (
            <Check className="h-5 w-5 text-white" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
