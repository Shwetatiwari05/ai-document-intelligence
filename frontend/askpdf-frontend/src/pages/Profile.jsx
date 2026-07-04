// src/pages/Profile.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, User, Lock } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initials = form.name
    ? form.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-surface-sunken px-7 py-8">
        <div className="mx-auto max-w-2xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-[24px] font-medium text-text-primary">
              Account settings
            </h1>
            <p className="mt-1 text-[13px] text-text-secondary">
              Manage your profile and account preferences.
            </p>
          </div>

          {/* Avatar card */}
          <div className="mb-4 rounded-[var(--radius-xl)] border border-border-soft bg-surface p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-700 text-[26px] font-semibold text-white shadow-sm">
                {initials}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-text-primary">
                  {user?.name || "Your Name"}
                </p>
                <p className="mt-0.5 text-[13px] text-text-secondary">{user?.email}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal-bg px-2.5 py-0.5 text-[11px] font-medium text-teal">
                  ✓ Active account
                </span>
              </div>
            </div>
          </div>

          {/* Profile info card */}
          <div className="mb-4 rounded-[var(--radius-xl)] border border-border-soft bg-surface p-6">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-accent-100">
                <User className="h-3.5 w-3.5 text-accent-600" />
              </div>
              <h2 className="text-[14px] font-semibold text-text-primary">Personal information</h2>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
                  Full name
                </label>
                <Field
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
                  Email address
                </label>
                <div className="rounded-[var(--radius-md)] bg-surface-sunken px-3.5 py-2.5 text-[13px] text-text-secondary">
                  {user?.email}
                </div>
                <p className="mt-1 text-[11px] text-text-secondary opacity-70">
                  Email cannot be changed.
                </p>
              </div>

              <div className="pt-1">
                <Button type="submit" loading={saving} className="w-full">
                  {saved ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" />
                      Changes saved!
                    </span>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Password card */}
          <div className="rounded-[var(--radius-xl)] border border-border-soft bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-accent-100">
                <Lock className="h-3.5 w-3.5 text-accent-600" />
              </div>
              <h2 className="text-[14px] font-semibold text-text-primary">Password</h2>
            </div>

            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-surface-sunken px-4 py-3">
              <div>
                <p className="text-[13px] font-medium text-text-primary">Change password</p>
                <p className="mt-0.5 text-[12px] text-text-secondary">
                  Update your password to keep your account secure.
                </p>
              </div>
              <Link
                to="/change-password"
                className="rounded-[var(--radius-md)] bg-accent-600 px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-accent-700"
              >
                Change
              </Link>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}