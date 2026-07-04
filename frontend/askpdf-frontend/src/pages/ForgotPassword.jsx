// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Logo from "../components/ui/Logo";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 landing-bg">
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] border border-border-soft bg-surface p-16 shadow-sm">
        <div className="mb-8">
          <Logo dark={false} />
        </div>

        {!sent ? (
          <>
            <h1 className="font-display text-[20px] font-medium text-text-primary">
              Reset your password
            </h1>
            <p className="mt-1 text-[13px] leading-[1.6] text-text-secondary">
              Enter the email on your account and we'll send a link to reset
              your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <Field
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Send reset link
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-100">
              <Mail className="h-5 w-5 text-accent-600" aria-hidden="true" />
            </div>
            <h2 className="font-display text-[18px] font-medium text-text-primary">
              Check your email
            </h2>
            <p className="mt-1 text-[13px] leading-[1.6] text-text-secondary">
              We sent a reset link to <strong>{email}</strong>. It expires in
              15 minutes.
            </p>
          </div>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to log in
        </Link>
      </div>
    </div>
  );
}
