// src/pages/ChangePassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Lock, ShieldCheck } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

function validatePassword(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = validatePassword(password);
  const passed = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"][passed];
  const strengthColor = ["", "text-danger", "text-coral", "text-coral", "text-teal", "text-teal"][passed];
  const barColor = ["", "bg-danger", "bg-coral", "bg-coral", "bg-teal", "bg-teal"][passed];

  const items = [
    { key: "length", label: "At least 8 characters" },
    { key: "uppercase", label: "One uppercase letter" },
    { key: "lowercase", label: "One lowercase letter" },
    { key: "number", label: "One number" },
    { key: "symbol", label: "One special character (!@#$...)" },
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1,2,3,4,5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= passed ? barColor : "bg-border-soft"}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium mb-2 ${strengthColor}`}>{strengthLabel}</p>
      <ul className="flex flex-col gap-1">
        {items.map(({ key, label }) => (
          <li key={key} className="flex items-center gap-2 text-[12px]">
            <span className={checks[key] ? "text-teal" : "text-danger"}>
              {checks[key] ? "✓" : "✗"}
            </span>
            <span className={checks[key] ? "text-teal" : "text-text-secondary"}>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChangePassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const checks = validatePassword(form.next);
    if (!Object.values(checks).every(Boolean)) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (form.next !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await updatePassword(form.current, form.next);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const confirmMismatch = form.confirm.length > 0 && form.next !== form.confirm;
  const confirmMatch = form.confirm.length >= 8 && form.next === form.confirm;

  return (
    <AppShell>
      <div className="min-h-screen bg-surface-sunken px-7 py-8">
        <div className="mx-auto max-w-2xl">

          <button
            onClick={() => navigate("/profile")}
            className="mb-6 flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to profile
          </button>

          <div className="mb-8">
            <h1 className="font-display text-[24px] font-medium text-text-primary">
              Change password
            </h1>
            <p className="mt-1 text-[13px] text-text-secondary">
              Choose a strong password to keep your account secure.
            </p>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-border-soft bg-surface p-6">

            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-accent-100">
                <Lock className="h-3.5 w-3.5 text-accent-600" />
              </div>
              <h2 className="text-[14px] font-semibold text-text-primary">Update your password</h2>
            </div>

            {done ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-bg">
                  <ShieldCheck className="h-8 w-8 text-teal" />
                </div>
                <p className="text-[16px] font-semibold text-text-primary">Password updated!</p>
                <p className="mt-2 text-[13px] text-text-secondary max-w-xs">
                  Your password has been changed successfully. Use it next time you log in.
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="mt-6 rounded-[var(--radius-md)] bg-accent-600 px-6 py-2.5 text-[13px] font-medium text-white hover:bg-accent-700 transition-colors"
                >
                  Back to profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
                    Current password
                  </label>
                  <Field
                    type="password"
                    name="current"
                    value={form.current}
                    onChange={update("current")}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
                    New password
                  </label>
                  <Field
                    type="password"
                    name="next"
                    value={form.next}
                    onChange={update("next")}
                    placeholder="Create a strong password"
                    required
                  />
                  <PasswordStrength password={form.next} />
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
                    Confirm new password
                  </label>
                  <Field
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={update("confirm")}
                    placeholder="Re-enter new password"
                    required
                  />
                  {confirmMismatch && (
                    <p className="mt-1.5 text-[12px] text-danger flex items-center gap-1">
                      ✗ Passwords don't match
                    </p>
                  )}
                  {confirmMatch && (
                    <p className="mt-1.5 text-[12px] text-teal flex items-center gap-1">
                      <Check className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-[var(--radius-md)] bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger">
                    {error}
                  </div>
                )}

                <Button type="submit" loading={saving} className="mt-1 w-full">
                  Update password
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}