// src/components/ui/Field.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  name,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-[12px] font-medium text-text-secondary"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-[var(--radius-md)] border bg-surface-sunken px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-secondary/70 transition-colors focus:bg-surface focus:border-accent-600 focus:outline-none ${
            error ? "border-danger" : "border-border-soft"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  );
}
