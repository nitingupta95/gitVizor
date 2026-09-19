"use client";

import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ChevronRight,
  FileCode2,
  SendHorizontal,
  Loader2,
  AlertTriangle,
  Clock,
  Github,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type Section = {
  id: string;
  title: string;
  slug: string;
  content: string;
  sourceFileRefs: string[];
  order: number;
  status: string;
};

type QAState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "streaming"; answer: string; refs: { fileName: string }[] }
  | { kind: "done"; answer: string; refs: { fileName: string }[] }
  | { kind: "rate_limited" }
  | { kind: "cap_reached" }
  | { kind: "error"; message: string };

interface Props {
  token: string;
  projectName: string;
  githubUrl: string;
  sections: Section[];
  capUsed: number;
  capTotal: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildGithubLink(githubUrl: string, filePath: string): string {
  const base = githubUrl.replace(/\.git$/, "");
  return `${base}/blob/main/${filePath}`;
}

// ── Main Client Component ──────────────────────────────────────────────────

export default function PublicGuideClient({
  token,
  projectName,
  githubUrl,
  sections,
  capUsed,
  capTotal,
}: Props) {
  const [selectedSection, setSelectedSection] = useState<Section | null>(
    sections[0] ?? null
  );
  const [question, setQuestion] = useState("");
  const [qaState, setQaState] = useState<QAState>({ kind: "idle" });

  const handleAsk = useCallback(async () => {
    if (!question.trim() || qaState.kind === "loading" || qaState.kind === "streaming") return;

    setQaState({ kind: "loading" });

    try {
      const res = await fetch("/api/public/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, question: question.trim() }),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "public_cap_reached") {
          setQaState({ kind: "cap_reached" });
        } else {
          setQaState({ kind: "rate_limited" });
        }
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setQaState({ kind: "error", message: body.error ?? "Something went wrong" });
        return;
      }

      if (!res.body) {
        setQaState({ kind: "error", message: "No response body received" });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let refs: { fileName: string }[] = [];
      let firstChunk = true;

      setQaState({ kind: "streaming", answer: "", refs: [] });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // First chunk contains file refs metadata
        if (firstChunk && chunk.startsWith("__REFS__")) {
          const newlineIdx = chunk.indexOf("\n");
          const refsJson = chunk.slice("__REFS__".length, newlineIdx);
          refs = JSON.parse(refsJson);
          fullText += chunk.slice(newlineIdx + 1);
          firstChunk = false;
        } else {
          fullText += chunk;
          firstChunk = false;
        }

        setQaState({ kind: "streaming", answer: fullText, refs });
      }

      setQaState({ kind: "done", answer: fullText, refs });
    } catch (err: any) {
      setQaState({ kind: "error", message: err.message ?? "Network error" });
    }
  }, [question, qaState.kind, token]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br bg-blue-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-white/90">{projectName}</span>
            <span className="hidden sm:inline-block text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              Public Guide
            </span>
          </div>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View on GitHub</span>
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        {sections.length > 0 && (
          <aside className="hidden lg:flex flex-col gap-1 w-56 flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-2 mb-2">
              Contents
            </p>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSection(s)}
                className={cn(
                  "group flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-all duration-150",
                  selectedSection?.id === s.id
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
                )}
              >
                <ChevronRight
                  className={cn(
                    "w-3 h-3 flex-shrink-0 transition-transform",
                    selectedSection?.id === s.id ? "rotate-90 text-blue-400" : "opacity-0 group-hover:opacity-60"
                  )}
                />
                <span className="truncate font-medium">{s.title}</span>
              </button>
            ))}
          </aside>
        )}

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-8">
          {sections.length === 0 ? (
            <EmptyGuide />
          ) : (
            <>
              {/* Section viewer */}
              {selectedSection && (
                <article className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/8 bg-white/[0.02]">
                    <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                    </div>
                    <h1 className="text-base font-semibold text-white/90">{selectedSection.title}</h1>
                    {selectedSection.status === "STALE" && (
                      <span className="ml-auto text-[10px] text-amber-400/70 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                        Updating…
                      </span>
                    )}
                  </div>

                  <div className="px-6 py-5">
                    <ReactMarkdown
                      components={{
                      p: ({ children }) => <p className="text-white/70 leading-relaxed text-sm">{children}</p>,
                      code: ({ children }) => <code className="bg-white/8 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                      a: ({ href, children }) => <a href={href} className="text-blue-400 hover:underline">{children}</a>,
                    }}
                    >
                      {selectedSection.content}
                    </ReactMarkdown>

                    {selectedSection.sourceFileRefs.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-white/8">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">
                          Source Files
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSection.sourceFileRefs.map((f) => (
                            <a
                              key={f}
                              href={buildGithubLink(githubUrl, f)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[11px] font-mono text-blue-300/70 bg-blue-500/8 border border-blue-500/15 px-2.5 py-1 rounded-lg hover:border-blue-500/30 hover:text-blue-300 transition-all"
                            >
                              <FileCode2 className="w-3 h-3" />
                              {f}
                              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )}

              {/* Mobile section nav */}
              {sections.length > 1 && (
                <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSection(s)}
                      className={cn(
                        "flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all",
                        selectedSection?.id === s.id
                          ? "bg-blue-500/15 text-blue-300 border-blue-500/20"
                          : "text-white/40 border-white/10 hover:text-white/70"
                      )}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Q&A Widget ─────────────────────────────────────────────── */}
          <PublicQAWidget
            question={question}
            onQuestionChange={setQuestion}
            onAsk={handleAsk}
            qaState={qaState}
            githubUrl={githubUrl}
            capUsed={capUsed}
            capTotal={capTotal}
          />

          {/* Soft CTA — below widget, never blocking */}
          <div className="text-center py-4">
            <Link
              href="/"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Powered by GitVizor · Build your own →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Q&A Widget ─────────────────────────────────────────────────────────────

function PublicQAWidget({
  question,
  onQuestionChange,
  onAsk,
  qaState,
  githubUrl,
  capUsed,
  capTotal,
}: {
  question: string;
  onQuestionChange: (v: string) => void;
  onAsk: () => void;
  qaState: QAState;
  githubUrl: string;
  capUsed: number;
  capTotal: number;
}) {
  const isActive = qaState.kind === "loading" || qaState.kind === "streaming";

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br bg-blue-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-white/90">Ask about this codebase</span>
        </div>
        <span className="text-[10px] text-white/25 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
          {capUsed}/{capTotal} used this month
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Input */}
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (question.trim()) onAsk();
              }
            }}
            disabled={isActive}
            rows={3}
            placeholder="How does authentication work in this project?"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-white/25">
            Press <kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to ask
          </p>
          <button
            onClick={onAsk}
            disabled={isActive || !question.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isActive ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking…
              </>
            ) : (
              <>
                <SendHorizontal className="w-4 h-4" />
                Ask
              </>
            )}
          </button>
        </div>

        {/* Response area */}
        {qaState.kind !== "idle" && (
          <div className="mt-2 rounded-xl border border-white/10 bg-[#0d0d18] overflow-hidden">
            {qaState.kind === "rate_limited" && (
              <StatusMessage
                icon={<Clock className="w-4 h-4 text-amber-400" />}
                title="Too many questions"
                desc="You've sent too many questions. Try again in an hour."
                color="amber"
              />
            )}

            {qaState.kind === "cap_reached" && (
              <StatusMessage
                icon={<AlertTriangle className="w-4 h-4 text-orange-400" />}
                title="Monthly limit reached"
                desc={`This project's public Q&A has reached its limit (${capUsed}/${capTotal} questions used). The owner will need to wait until next month or increase the cap.`}
                color="orange"
              />
            )}

            {qaState.kind === "error" && (
              <StatusMessage
                icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
                title="Something went wrong"
                desc={qaState.message}
                color="red"
              />
            )}

            {(qaState.kind === "streaming" || qaState.kind === "done") && (
              <div className="p-4 space-y-4">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-white/75 leading-relaxed text-sm">{children}</p>,
                    code: ({ children }) => <code className="bg-white/10 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                    pre: ({ children }) => <pre className="bg-[#13131f] border border-white/10 rounded-lg p-3 overflow-x-auto">{children}</pre>,
                    a: ({ href, children }) => <a href={href} className="text-blue-400 hover:underline">{children}</a>,
                  }}
                >
                  {qaState.answer}
                </ReactMarkdown>

                {qaState.kind === "streaming" && (
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Generating…
                  </div>
                )}

                {qaState.refs.length > 0 && (
                  <div className="pt-3 border-t border-white/8 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">
                      Source references
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {qaState.refs.map((r) => (
                        <a
                          key={r.fileName}
                          href={buildGithubLink(githubUrl, r.fileName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] font-mono text-blue-300/70 bg-blue-500/8 border border-blue-500/15 px-2.5 py-1 rounded-lg hover:border-blue-500/30 hover:text-blue-300 transition-all"
                        >
                          <FileCode2 className="w-3 h-3" />
                          {r.fileName}
                          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusMessage({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: "amber" | "orange" | "red";
}) {
  const colors = {
    amber: "text-amber-400/80 bg-amber-500/8 border-amber-500/15",
    orange: "text-orange-400/80 bg-orange-500/8 border-orange-500/15",
    red: "text-red-400/80 bg-red-500/8 border-red-500/15",
  };
  return (
    <div className={cn("flex gap-3 p-4 rounded-xl border", colors[color])}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold mb-0.5">{title}</p>
        <p className="text-xs opacity-70 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function EmptyGuide() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-white/20" />
      </div>
      <div>
        <p className="text-sm font-medium text-white/50 mb-1">No guide sections yet</p>
        <p className="text-xs text-white/25">The project owner hasn&apos;t generated a guide yet.</p>
      </div>
    </div>
  );
}

