// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, MessageCircle, FileSearch, Zap, Star } from "lucide-react";
// Star still used in DocBuddy sparkle
import Logo from "../components/ui/Logo";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden landing-bg">

      {/* Purple gradient blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-8">

        {/* Nav */}
        <nav className="flex items-center justify-between py-7">
          <Logo dark={false} />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-[var(--radius-md)] px-4 py-2 text-[13px] text-text-secondary transition-colors hover:bg-accent-100 hover:text-accent-700"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-[var(--radius-md)] bg-accent-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-700 shadow-sm"
            >
              Create account
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center gap-12 py-16 md:flex-row">
          <div className="max-w-lg flex-1 text-center md:text-left">

            <h1
              className="font-display text-[48px] font-medium leading-[1.12] tracking-tight text-text-primary md:text-[64px]"
              style={{ fontVariationSettings: "'opsz' 28, 'wght' 480" }}
              >
              Beyond PDFs.
              <br />
              <span className="gradient-text">Beyond search.</span>
              </h1>
            <p className="mx-auto mt-7 max-w-md text-[18px] leading-[1.75] text-text-secondary md:mx-0">
              Ask anything about your documents. Get instant answers, smart summaries,
              and protect your sensitive data — all in one place.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                to="/signup"
                className="rounded-[var(--radius-md)] bg-accent-600 px-8 py-3.5 text-[14px] font-medium text-white shadow-md transition-all hover:bg-accent-700 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Create your account
              </Link>
              <Link
                to="/login"
                className="rounded-[var(--radius-md)] bg-white/80 backdrop-blur px-8 py-3.5 text-[14px] font-medium text-text-primary border border-border-soft transition-all hover:bg-white hover:-translate-y-0.5 hover:shadow-sm"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Doc buddy */}
          <div className="flex-shrink-0">
            <DocBuddy />
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <div className="text-center mb-12">
            <p className="text-[12px] font-medium uppercase tracking-widest text-accent-500 mb-3">How it works</p>
            <h2 className="font-display text-[34px] font-medium text-text-primary leading-snug">
              Three steps to document magic
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              number="01"
              icon={FileSearch}
              title="Upload your PDF"
              body="Drag and drop any document — contracts, reports, research papers, invoices."
              color="accent"
            />
            <StepCard
              number="02"
              icon={MessageCircle}
              title="Ask your questions"
              body="Type naturally. AskPDF reads the whole doc and gives you precise, cited answers."
              color="coral"
            />
            <StepCard
              number="03"
              icon={ShieldCheck}
              title="Share it safely"
              body="Redact sensitive info with one click before exporting or sharing with anyone."
              color="teal"
            />
          </div>
        </section>

        {/* Feature strip */}
        <section className="grid grid-cols-1 gap-4 border-t border-border-soft py-10 sm:grid-cols-3 mb-6">
          <FeatureItem
            icon={MessageCircle}
            color="accent"
            title="Ask anything"
            body="Type or speak your question — get answers pulled from the page."
          />
          <FeatureItem
            icon={Sparkles}
            color="coral"
            title="Summarize instantly"
            body="Long report? Get the short version in seconds."
          />
          <FeatureItem
            icon={ShieldCheck}
            color="teal"
            title="Redact safely"
            body="Black out emails, names, or anything sensitive before sharing."
          />
        </section>

      </div>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, body, color }) {
  const colorMap = {
    accent: { bg: "var(--color-accent-100)", text: "var(--color-accent-600)", border: "var(--color-accent-200)" },
    coral: { bg: "var(--color-coral-bg)", text: "var(--color-coral)", border: "#f4c8bb" },
    teal: { bg: "var(--color-teal-bg)", text: "var(--color-teal)", border: "#b5e5d5" },
  };
  const c = colorMap[color];
  return (
    <div
      className="step-card rounded-[var(--radius-xl)] bg-white/70 backdrop-blur p-8 border border-border-soft transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="font-display text-[36px] font-medium opacity-15 text-text-primary">{number}</span>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <Icon className="h-5 w-5" style={{ color: c.text }} />
        </div>
      </div>
      <p className="text-[15px] font-medium text-text-primary mb-2">{title}</p>
      <p className="text-[13.5px] leading-[1.6] text-text-secondary">{body}</p>
    </div>
  );
}

function FeatureItem({ icon: Icon, color, title, body }) {
  const colorClasses = {
    accent: "bg-accent-100 text-accent-600",
    coral: "bg-coral-bg text-coral",
    teal: "bg-teal-bg text-teal",
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] ${colorClasses[color]}`}>
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-text-primary">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-[1.5] text-text-secondary">{body}</p>
      </div>
    </div>
  );
}

function DocBuddy() {
  return (
    <div
      className="relative h-[380px] w-[320px]"
      role="img"
      aria-label="Friendly document character"
    >
      {/* floating docs */}
      <div className="animate-float-slow absolute left-0 top-4">
        <MiniDoc rotate={-8} tint="var(--color-coral-bg)" line="var(--color-coral)" />
      </div>
      <div className="animate-float-slow-delayed absolute bottom-2 right-0">
        <MiniDoc rotate={10} tint="var(--color-teal-bg)" line="var(--color-teal)" />
      </div>
      {/* third floating doc - new */}
      <div className="animate-float-medium absolute top-1/2 right-4">
        <MiniDoc rotate={-5} tint="var(--color-accent-100)" line="var(--color-accent-500)" />
      </div>

      {/* main character */}
      <div className="animate-bob absolute left-1/2 top-10 -translate-x-1/2">
        <svg width="200" height="250" viewBox="0 0 200 250">
          {/* glow behind */}
          <ellipse cx="100" cy="160" rx="75" ry="75" fill="var(--color-accent-100)" opacity="0.5" />

          {/* shadow */}
          <ellipse cx="100" cy="230" rx="55" ry="7" fill="var(--color-accent-200)" opacity="0.6" />

          {/* arms */}
          <path d="M40 125 Q16 115 20 93" stroke="var(--color-accent-500)" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M160 125 Q184 115 180 93" stroke="var(--color-accent-500)" strokeWidth="10" strokeLinecap="round" fill="none" />

          {/* tiny hands */}
          <circle cx="18" cy="90" r="6" fill="var(--color-accent-400)" />
          <circle cx="182" cy="90" r="6" fill="var(--color-accent-400)" />

          {/* body: page with folded corner */}
          <path
            d="M32 18 H138 L168 48 V200 Q168 212 156 212 H44 Q32 212 32 200 Z"
            fill="white"
            stroke="var(--color-accent-500)"
            strokeWidth="3"
          />
          <path
            d="M138 18 V48 H168 Z"
            fill="var(--color-accent-100)"
            stroke="var(--color-accent-500)"
            strokeWidth="3"
          />

          {/* face */}
          <circle cx="78" cy="104" r="7.5" fill="var(--color-ink-900)" />
          <circle cx="122" cy="104" r="7.5" fill="var(--color-ink-900)" />
          {/* eye shine */}
          <circle cx="81" cy="101" r="2.5" fill="white" />
          <circle cx="125" cy="101" r="2.5" fill="white" />
          {/* smile */}
          <path
            d="M78 130 Q100 148 122 130"
            stroke="var(--color-ink-900)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* blush */}
          <ellipse cx="60" cy="120" rx="9" ry="6" fill="var(--color-coral-bg)" opacity="0.9" />
          <ellipse cx="140" cy="120" rx="9" ry="6" fill="var(--color-coral-bg)" opacity="0.9" />

          {/* text lines */}
          <rect x="52" y="162" width="96" height="6" rx="3" fill="var(--color-accent-100)" />
          <rect x="52" y="176" width="68" height="6" rx="3" fill="var(--color-accent-100)" />

          {/* legs */}
          <rect x="68" y="210" width="12" height="24" rx="6" fill="var(--color-accent-600)" />
          <rect x="120" y="210" width="12" height="24" rx="6" fill="var(--color-accent-600)" />
          {/* feet */}
          <ellipse cx="74" cy="234" rx="10" ry="6" fill="var(--color-accent-700)" />
          <ellipse cx="126" cy="234" rx="10" ry="6" fill="var(--color-accent-700)" />
        </svg>
      </div>

      {/* sparkles */}
      <Sparkles className="absolute right-6 top-0 h-6 w-6 text-accent-500 animate-pulse-soft" aria-hidden="true" />
      <Zap className="absolute left-2 top-24 h-4 w-4 text-coral animate-pulse-soft" style={{ animationDelay: "0.8s" }} aria-hidden="true" />
      <Star className="absolute left-2 bottom-16 h-4 w-4 text-teal animate-pulse-soft fill-teal" style={{ animationDelay: "1.4s" }} aria-hidden="true" />
    </div>
  );
}

function MiniDoc({ rotate, tint, line }) {
  return (
    <svg
      width="58"
      height="70"
      viewBox="0 0 58 70"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <rect x="4" y="4" width="50" height="62" rx="9" fill="white" stroke={line} strokeWidth="2.5" />
      <rect x="13" y="18" width="32" height="5" rx="2.5" fill={tint} />
      <rect x="13" y="30" width="23" height="5" rx="2.5" fill={tint} />
      <rect x="13" y="42" width="28" height="5" rx="2.5" fill={tint} />
    </svg>
  );
}
