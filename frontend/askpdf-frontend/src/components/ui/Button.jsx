// src/components/ui/Button.jsx
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-accent-600 text-white hover:bg-accent-700 disabled:bg-accent-500/60",
  secondary:
    "bg-surface text-text-primary border border-border-soft hover:bg-surface-sunken",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-sunken",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const sizes = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-[15px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  icon: Icon,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
