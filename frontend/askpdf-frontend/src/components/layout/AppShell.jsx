// src/components/layout/AppShell.jsx
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  MessageCircle,
  Sparkles,
  ShieldOff,
  LogOut,
} from "lucide-react";
import Logo from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "All documents", icon: LayoutGrid },
  { to: "/chat", label: "Q&A", icon: MessageCircle },
  { to: "/summarize", label: "Summarize", icon: Sparkles },
  { to: "/redact", label: "Redact", icon: ShieldOff },
];

export default function AppShell({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  async function handleSignOut() {
    setShowSignOutConfirm(false);
    await signOut();
    navigate("/");
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex h-screen overflow-hidden bg-surface-sunken">
      {/* Sidebar */}
      <aside className="flex w-[210px] flex-shrink-0 flex-col overflow-y-auto bg-ink-900 px-4 py-5">
        <div className="mb-6 px-1">
          <Logo size={22} />
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-white/10 font-medium text-white"
                    : "text-text-on-dark-muted hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {isDashboard && (
          <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-white/10 font-medium text-white"
                    : "text-text-on-dark-muted hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-100 text-[10px] font-medium text-accent-700">
                {initials}
              </div>
              Profile
            </NavLink>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[13px] text-text-on-dark-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Sign-out confirmation */}
      {showSignOutConfirm && (
        <div
          onClick={() => setShowSignOutConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-[var(--radius-lg)] border border-border-soft bg-surface p-5 shadow-md"
          >
            <h2 className="font-display text-[16px] font-medium text-text-primary">
              Sign out?
            </h2>
            <p className="mt-1.5 text-[13px] text-text-secondary">
              You'll need to sign in again to access your documents.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="rounded-[var(--radius-md)] border border-border-soft px-3.5 py-2 text-[13px] font-medium text-text-primary transition-colors hover:bg-surface-sunken"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="rounded-[var(--radius-md)] bg-danger px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#a52f22]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}