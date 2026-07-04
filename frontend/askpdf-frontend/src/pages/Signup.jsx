// src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo";
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
  const items = [
    { key: "length", label: "At least 8 characters" },
    { key: "uppercase", label: "One uppercase letter" },
    { key: "lowercase", label: "One lowercase letter" },
    { key: "number", label: "One number" },
    { key: "symbol", label: "One special character (!@#$...)" },
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

function AnimatedDoc() {
  return (
    <div className="relative flex flex-col items-center justify-center h-full gap-18 p-18">
      <Link
        to="/"
        className="absolute top-4 left-0.5 flex items-center gap-1.5 text-[14px] font-semibold text-accent-600 hover:text-accent-700 z-20"
        >
        ← Back
      </Link>

      <div className="animate-float-slow absolute top-16 left-6 opacity-60">
        <svg width="48" height="58" viewBox="0 0 48 58">
          <rect x="2" y="2" width="44" height="54" rx="7" fill="white" stroke="#a78bfa" strokeWidth="2"/>
          <rect x="10" y="14" width="28" height="4" rx="2" fill="#eeedfe"/>
          <rect x="10" y="24" width="20" height="4" rx="2" fill="#eeedfe"/>
          <rect x="10" y="34" width="24" height="4" rx="2" fill="#eeedfe"/>
        </svg>
      </div>
      <div className="animate-float-slow-delayed absolute bottom-12 right-8 opacity-60">
        <svg width="40" height="50" viewBox="0 0 40 50">
          <rect x="2" y="2" width="36" height="46" rx="7" fill="white" stroke="#c4b5fd" strokeWidth="2"/>
          <rect x="8" y="12" width="24" height="4" rx="2" fill="#f0eeff"/>
          <rect x="8" y="22" width="16" height="4" rx="2" fill="#f0eeff"/>
        </svg>
      </div>

      <div className="animate-bob relative">
        <div className="relative w-[160px] h-[200px]">
          <svg width="160" height="200" viewBox="0 0 160 200" className="absolute inset-0">
            <rect x="10" y="4" width="140" height="192" rx="12" fill="white" stroke="#c4b5fd" strokeWidth="2"/>
            <path d="M120 4 L150 34 L120 34 Z" fill="#eeedfe" stroke="#c4b5fd" strokeWidth="1.5"/>
            <rect x="24" y="50" width="100" height="6" rx="3" fill="#eeedfe"/>
            <rect x="24" y="66" width="80" height="6" rx="3" fill="#eeedfe"/>
            <rect x="24" y="82" width="90" height="6" rx="3" fill="#eeedfe"/>
            <rect x="24" y="98" width="70" height="6" rx="3" fill="#eeedfe"/>
            <rect x="24" y="114" width="95" height="6" rx="3" fill="#eeedfe"/>
            <rect x="24" y="130" width="75" height="6" rx="3" fill="#eeedfe"/>
            <rect x="24" y="146" width="85" height="6" rx="3" fill="#eeedfe"/>
            <rect x="24" y="162" width="60" height="6" rx="3" fill="#eeedfe"/>
          </svg>
          <div
            className="absolute left-[10px] w-[140px] h-[3px] rounded-full z-10"
            style={{
              background: "linear-gradient(90deg, transparent, #7f77dd, #a78bfa, #7f77dd, transparent)",
              boxShadow: "0 0 10px 3px #a78bfa66",
              animation: "scan-sweep 2.4s ease-in-out infinite",
              top: "4px",
            }}
          />
          <div
            className="absolute left-[10px] w-[140px] rounded-xl z-[5] pointer-events-none"
            style={{
              background: "linear-gradient(180deg, #7f77dd11 0%, transparent 100%)",
              height: "40px",
              animation: "scan-sweep 2.4s ease-in-out infinite",
              top: "4px",
            }}
          />
        </div>
      </div>

      <p className="text-center text-[13px] text-text-secondary leading-relaxed max-w-[160px]">
        Upload any PDF and start getting answers instantly 
      </p>
    </div>
  );
}

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setFieldErrors((fe) => ({ ...fe, [field]: "" }));
    };
  }

  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Full name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    const pwChecks = validatePassword(form.password);
    if (!form.password) {
      errors.password = "Password is required";
    } else if (!Object.values(pwChecks).every(Boolean)) {
      errors.password = "Password does not meet all requirements";
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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
    const res = await signUp({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (res.emailConfirmationRequired) {
      alert(
        "Account created successfully!\n\nPlease verify your email before signing in."
      );

      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="flex min-h-screen items-center justify-center px-4 landing-bg">
      <div className="w-full max-w-3xl overflow-hidden rounded-[var(--radius-lg)] border border-border-soft bg-surface shadow-sm md:flex">
        <div className="hidden flex-1 md:flex items-center justify-center relative overflow-hidden">
          <AnimatedDoc />
        </div>

        <div className="flex-1 p-6 sm:p-8">
          <div className="mb-6">
            <Logo dark={false} />
          </div>

          <h1 className="font-display text-[22px] font-medium text-text-primary">
            Create your account
          </h1>
          <p className="mt-1 text-[13px] text-text-secondary">
            Upload a PDF and start asking it questions in minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <Field label="Full name" name="name" value={form.name} onChange={update("name")} placeholder="Your full name" required />
              {fieldErrors.name && <p className="mt-1 text-[12px] text-danger">{fieldErrors.name}</p>}
            </div>
            <div>
              <Field label="Email" type="email" name="email" value={form.email} onChange={update("email")} placeholder="you@email.com" required />
              {fieldErrors.email && <p className="mt-1 text-[12px] text-danger">{fieldErrors.email}</p>}
            </div>
            <div>
              <Field label="Password" type="password" name="password" value={form.password} onChange={update("password")} placeholder="Create a strong password" required />
              <PasswordStrength password={form.password} />
              {fieldErrors.password && <p className="mt-1 text-[12px] text-danger">{fieldErrors.password}</p>}
            </div>
            <div>
              <Field label="Confirm password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Re-enter your password" required />
              {fieldErrors.confirmPassword && <p className="mt-1 text-[12px] text-danger">{fieldErrors.confirmPassword}</p>}
            </div>
            {error && <p className="text-[13px] text-danger">{error}</p>}
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-[13px] text-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent-600">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}