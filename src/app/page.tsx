import Link from "next/link";
import {
  Bot,
  GitBranch,
  Mic,
  Users,
  CreditCard,
  Zap,
  ArrowRight,
  Github,
  ChevronDown,
  Code2,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  Star,
  Sparkles,
  Shield,
  Globe,
} from "lucide-react";

/* ——————————————————————————————————————————————
   GitVizor Landing Page
   Fully server-rendered, zero client JS needed.
   —————————————————————————————————————————————— */

// ── Feature data ────────────────────────────────
const FEATURES = [
  {
    icon: Bot,
    title: "AI Codebase Q&A",
    description:
      "Ask natural-language questions about your repository and get precise, context-aware answers powered by RAG architecture with real code references.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: GitBranch,
    title: "GitHub Sync & Commits",
    description:
      "Connect any GitHub repository, automatically track commits in real-time, and browse an interactive log linking back to GitHub.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Mic,
    title: "Meeting Transcription",
    description:
      "Upload developer meeting recordings and let AI extract summaries, action items, and issues automatically via AssemblyAI.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite teammates to projects, share AI-generated insights, and keep everyone aligned with shared Q&A history.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: CreditCard,
    title: "Credit-Based Billing",
    description:
      "Pay only for what you use. Purchase credits via Stripe to index repositories — no monthly subscriptions required.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Streaming AI Responses",
    description:
      "Answers stream into your screen in real-time via the Vercel AI SDK, so you never stare at a loading spinner.",
    gradient: "from-violet-500 to-fuchsia-500",
  },
] as const;

// ── How it works steps ──────────────────────────
const STEPS = [
  {
    step: "01",
    title: "Connect Repository",
    description:
      "Paste your GitHub URL, provide a token, and GitVizor indexes every file using vector embeddings.",
    icon: Code2,
  },
  {
    step: "02",
    title: "Ask Questions",
    description:
      "Type any question about your codebase. The AI retrieves relevant source files and generates a detailed answer.",
    icon: MessageSquare,
  },
  {
    step: "03",
    title: "Get Actionable Insights",
    description:
      "Review AI-generated answers with exact file references, share with your team, and save for future reference.",
    icon: Lightbulb,
  },
] as const;

// ── FAQ data ────────────────────────────────────
const FAQS = [
  {
    question: "What kind of repositories can I connect?",
    answer:
      "Any public or private GitHub repository. For private repos, you'll need to provide a personal access token with repo scope.",
  },
  {
    question: "How does the credit system work?",
    answer:
      "Each credit lets you index one file. A repository with 200 files costs 200 credits. New accounts start with 150 free credits, and you can purchase more anytime via Stripe.",
  },
  {
    question: "Which AI models power GitVizor?",
    answer:
      "GitVizor uses both OpenAI and Google Gemini with automatic fallback. If one provider is unavailable, we seamlessly route to the other for zero downtime.",
  },
  {
    question: "Is my code stored or shared?",
    answer:
      "Code embeddings are stored securely in our PostgreSQL database for retrieval purposes. Your raw source code is never shared with third parties beyond the AI inference call.",
  },
  {
    question: "Can I upload meeting recordings?",
    answer:
      "Yes! Upload audio files (.mp3, .wav, etc.) and GitVizor will transcribe, summarize, and extract action items and issues automatically.",
  },
] as const;

// ── Tech logos (just names, rendered as styled text) ──
const TECH_NAMES = [
  "Next.js 15",
  "React 19",
  "TypeScript",
  "PostgreSQL",
  "Prisma",
  "tRPC",
  "Tailwind CSS",
  "Stripe",
];

// ═══════════════════════════════════════════════════
//   COMPONENT
// ═══════════════════════════════════════════════════

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[128px] animate-pulse-glow" />
        <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[128px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[128px]" />
      </div>

      {/* ── Grid overlay ── */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-40" aria-hidden />

      {/* =========================================
          NAVIGATION
         ========================================= */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-110">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">GitVizor</span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-zinc-400 transition-colors hover:text-white">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-zinc-400 transition-colors hover:text-white">
              FAQ
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-zinc-300 transition-colors hover:text-white sm:inline-block"
              id="nav-sign-in"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110"
              id="nav-get-started"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================
          HERO SECTION
         ========================================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 text-center md:pt-32 lg:pt-40">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Repository Intelligence
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Your Codebase,{" "}
          <span className="animate-gradient-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Decoded by AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:text-xl">
          Connect your GitHub repositories, ask natural-language questions, track
          commits in real‑time, and transcribe developer meetings — all powered
          by cutting-edge AI.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:brightness-110"
            id="hero-cta-primary"
          >
            Start for Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-zinc-300 backdrop-blur transition-all hover:border-white/20 hover:bg-white/10"
            id="hero-cta-secondary"
          >
            See How It Works
            <ChevronDown className="h-5 w-5" />
          </a>
        </div>

        {/* Hero visual — Abstract code mockup */}
        <div className="relative mx-auto mt-16 max-w-4xl animate-fade-in-up">
          <div className="glow-border rounded-2xl">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-1 shadow-2xl shadow-indigo-500/10 backdrop-blur">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 rounded-t-xl border-b border-white/5 bg-zinc-800/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <div className="ml-4 flex-1 rounded-md bg-zinc-700/50 px-3 py-1 text-xs text-zinc-500">
                  gitvizor.app/dashboard
                </div>
              </div>
              {/* Simulated dashboard content */}
              <div className="grid grid-cols-3 gap-3 p-6">
                {/* Sidebar mock */}
                <div className="col-span-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
                    <div className="h-3 w-20 rounded bg-zinc-700" />
                  </div>
                  <div className="space-y-2 pt-2">
                    {["Dashboard", "Q&A", "Meetings", "Billing"].map((item) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                          item === "Dashboard"
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "text-zinc-500"
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-sm ${
                            item === "Dashboard" ? "bg-indigo-400" : "bg-zinc-600"
                          }`}
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                    <div className="text-[10px] text-zinc-600">Projects</div>
                    {["my-saas-app", "api-server"].map((p) => (
                      <div key={p} className="flex items-center gap-2 text-xs text-zinc-500">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] text-zinc-400">
                          {p[0]?.toUpperCase()}
                        </div>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main area */}
                <div className="col-span-2 space-y-3">
                  {/* Ask Question card mock */}
                  <div className="rounded-xl border border-white/5 bg-zinc-800/40 p-4">
                    <div className="mb-2 text-xs font-medium text-zinc-300">Ask a question</div>
                    <div className="rounded-lg border border-white/5 bg-zinc-800/60 px-3 py-2 text-xs text-zinc-500">
                      Which file handles user authentication?
                    </div>
                    <div className="mt-3 flex">
                      <div className="rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-xs font-medium text-white">
                        Ask GitVizor!
                      </div>
                    </div>
                  </div>
                  {/* Commit log mock */}
                  <div className="rounded-xl border border-white/5 bg-zinc-800/40 p-4">
                    <div className="mb-3 text-xs font-medium text-zinc-300">Recent Commits</div>
                    <div className="space-y-2">
                      {[
                        { msg: "feat: add user auth flow", time: "2 hours ago" },
                        { msg: "fix: resolve API timeout", time: "5 hours ago" },
                        { msg: "refactor: clean up utils", time: "1 day ago" },
                      ].map((c) => (
                        <div
                          key={c.msg}
                          className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-zinc-700" />
                            <span className="text-xs text-zinc-400">{c.msg}</span>
                          </div>
                          <span className="text-[10px] text-zinc-600">{c.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          TECH STRIP
         ========================================= */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-zinc-500">
            Built with industry-leading technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {TECH_NAMES.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURES
         ========================================= */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Star className="h-3.5 w-3.5" />
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to{" "}
            <span className="animate-gradient-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              understand your code
            </span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            From AI-powered code analysis to meeting transcription, GitVizor gives your
            team superpowers.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="group relative rounded-2xl border border-white/5 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-white/10 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              {/* Icon */}
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feat.gradient} shadow-lg transition-transform group-hover:scale-110`}
              >
                <feat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feat.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS
         ========================================= */}
      <section id="how-it-works" className="relative z-10 border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <Lightbulb className="h-3.5 w-3.5" />
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Three steps to{" "}
              <span className="animate-gradient-text bg-gradient-to-r from-emerald-400 to-teal-400">
                code clarity
              </span>
            </h2>
            <p className="mt-4 text-base text-zinc-400 sm:text-lg">
              Get started in minutes. No complex setup required.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, idx) => (
              <div key={s.step} className="relative text-center">
                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute left-1/2 top-10 hidden h-0.5 w-full bg-gradient-to-r from-emerald-500/20 to-transparent md:block" />
                )}
                {/* Step circle */}
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 shadow-xl shadow-emerald-500/5">
                  <s.icon className="h-8 w-8 text-emerald-400" />
                  <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-lg">
                    {s.step}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-zinc-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          PRICING
         ========================================= */}
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            <CreditCard className="h-3.5 w-3.5" />
            Pricing
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple,{" "}
            <span className="animate-gradient-text bg-gradient-to-r from-amber-400 to-orange-400">
              credit-based
            </span>{" "}
            pricing
          </h2>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            No monthly subscriptions. Buy credits when you need them, pay per file indexed.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-lg">
          <div className="glow-border rounded-2xl">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur">
              {/* Free tier */}
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">150</span>
                <span className="text-lg text-zinc-400">free credits</span>
              </div>
              <p className="mb-6 text-sm text-zinc-400">
                Every new account starts with 150 free credits. Each credit indexes one file
                in your repository.
              </p>
              <div className="mb-8 space-y-3">
                {[
                  "AI-powered codebase Q&A",
                  "Real-time commit tracking",
                  "Meeting transcription & analysis",
                  "Team collaboration & invites",
                  "Saved Q&A History",
                  "Multi-model AI fallback",
                ].map((perk) => (
                  <div key={perk} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    {perk}
                  </div>
                ))}
              </div>
              <div className="mb-4 rounded-xl border border-white/5 bg-zinc-800/50 p-4 text-center">
                <p className="text-xs text-zinc-500">Need more?</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  $2<span className="text-base font-normal text-zinc-400"> / 100 credits</span>
                </p>
              </div>
              <Link
                href="/sign-up"
                className="block w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110"
                id="pricing-cta"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          TRUST SIGNALS
         ========================================= */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            {[
              { icon: Shield, label: "Secure by Design", desc: "Clerk auth + Stripe payments" },
              { icon: Globe, label: "Open Standards", desc: "Built on Next.js, Prisma, tRPC" },
              { icon: Zap, label: "Lightning Fast", desc: "Turbo dev server + edge-ready" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900">
                  <item.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">{item.label}</h4>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          FAQ
         ========================================= */}
      <section id="faq" className="relative z-10 mx-auto max-w-3xl px-6 py-24 md:py-32">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <MessageSquare className="h-3.5 w-3.5" />
            FAQ
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-white/5 bg-zinc-900/50 transition-all hover:border-white/10 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-white">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-zinc-400">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* =========================================
          CTA BANNER
         ========================================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-8 py-16 text-center backdrop-blur md:px-16">
          {/* Decorative blobs inside */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-purple-500/20 blur-[80px]" />

          <h2 className="relative mx-auto max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to decode your codebase?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-base text-zinc-400">
            Join developers who use GitVizor to understand, document, and collaborate
            on their code faster than ever.
          </p>
          <div className="relative mt-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-zinc-900 shadow-xl transition-all hover:bg-zinc-100"
              id="cta-final"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          FOOTER
         ========================================= */}
      <footer className="relative z-10 border-t border-white/5 bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <GitBranch className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">GitVizor</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a href="#features" className="transition-colors hover:text-white">Features</a>
              <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
              <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
              <a
                href="https://github.com/nitingupta95/githVizor"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} GitVizor. Made by Nitin Gupta.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
