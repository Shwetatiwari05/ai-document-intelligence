// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Logo from "../components/ui/Logo";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";

function validatePassword(password) {
  return {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    symbol:    /[^A-Za-z0-9]/.test(password),
  };
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = validatePassword(password);
  const items = [
    { key: "length",    label: "At least 8 characters" },
    { key: "uppercase", label: "One uppercase letter" },
    { key: "lowercase", label: "One lowercase letter" },
    { key: "number",    label: "One number" },
    { key: "symbol",    label: "One special character (!@#$...)" },
  ];
  return (
    <ul className="mt-2 flex flex-col gap-1">
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
  );
}

export default function ResetPassword() {
  const navigate  = useNavigate();
  const [form, setForm]           = useState({ password: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error,  setError]        = useState("");
  const [loading, setLoading]     = useState(false);
  const [done,   setDone]         = useState(false);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setFieldErrors((fe) => ({ ...fe, [field]: "" }));
    };
  }

  function validate() {
    const errors = {};
    const checks = validatePassword(form.password);
    if (!form.password) {
      errors.password = "Password is required";
    } else if (!Object.values(checks).every(Boolean)) {
      errors.password = "Password does not meet all requirements";
    }
    if (!form.confirm) {
      errors.confirm = "Please confirm your password";
    } else if (form.password !== form.confirm) {
      errors.confirm = "Passwords do not match";
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({
        password: form.password,
      });
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 landing-bg">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border-soft bg-surface p-8 shadow-sm">
        <div className="mb-6">
          <Logo dark={false} />
        </div>

        {done ? (
          <div className="flex flex-col items-center py-6 text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-bg">
              <span className="text-xl text-teal">✓</span>
            </div>
            <h2 className="font-display text-[20px] font-medium text-text-primary">
              Password updated!
            </h2>
            <p className="text-[13px] text-text-secondary">
              Redirecting you to login…
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-[22px] font-medium text-text-primary">
              Set new password
            </h1>
            <p className="mt-1 text-[13px] text-text-secondary">
              Choose a strong password for your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
              <div>
                <Field
                  label="New password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Create a strong password"
                  required
                />
                <PasswordStrength password={form.password} />
                {fieldErrors.password && (
                  <p className="mt-1 text-[12px] text-danger">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <Field
                  label="Confirm new password"
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={update("confirm")}
                  placeholder="Re-enter your password"
                  required
                />
                {fieldErrors.confirm && (
                  <p className="mt-1 text-[12px] text-danger">{fieldErrors.confirm}</p>
                )}
              </div>

              {error && <p className="text-[13px] text-danger">{error}</p>}

              <Button type="submit" loading={loading} className="mt-2 w-full">
                Update password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}