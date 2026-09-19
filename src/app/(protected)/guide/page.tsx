"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import {
  Loader2,
  RefreshCcw,
  BookOpen,
  AlertCircle,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Clock,
  FileText,
  Coins,
  X,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type GenerateState = "idle" | "generating" | "done" | "error";
const isGenerating = (s: string): boolean => s === "generating";
const isError = (s: string): boolean => s === "error";

const PROGRESS_STEPS = [
  "Fetching source code embeddings...",
  "Grouping files by module...",
  "Matching relevant meeting context...",
  "Generating documentation sections...",
  "Saving guide to database...",
];

export default function GuidePage() {
  const { projectId } = useProject();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState("");
  const [generateState, setGenerateState] = useState<GenerateState>("idle");
  const [progressStep, setProgressStep] = useState(0);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Cycle through fake progress steps while generating for better UX
  useEffect(() => {
    if (!isGenerating(generateState)) {
      setProgressStep(0);
      return;
    }
    const interval = setInterval(() => {
      setProgressStep((prev) => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, [generateState]);

  const { data: sections, isLoading, refetch } = api.guide.getSections.useQuery(
    { projectId: projectId! },
    {
      enabled: !!projectId,
      refetchInterval: isGenerating(generateState) ? 3000 : false,
    }
  );

  const { data: creditsData, refetch: refetchCredits } = api.guide.checkCredits.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const regenerateSection = api.guide.regenerateSection.useMutation({
    onSuccess: () => {
      toast.success("Section queued for regeneration.");
      setShowRegenerateConfirm(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start regeneration");
    },
  });

  const handleGenerateGuide = useCallback(async () => {
    if (!projectId) return;
    setGenerateState("generating");
    setProgressStep(0);

    try {
      const res = await fetch("/api/guide/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);

      setGenerateState("done");
      toast.success(`✨ Guide ready! Generated ${data.sectionsGenerated} sections.`);
      await refetch();
      await refetchCredits();
    } catch (err) {
      setGenerateState("error");
      const message = err instanceof Error ? err.message : "Failed to generate guide";
      toast.error(message);
    }
  }, [projectId, refetch, refetchCredits]);

  const filteredSections = useMemo(() => {
    if (!sections) return [];
    if (!filterTopic) return sections;
    return [...sections].sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(filterTopic.toLowerCase()) ? -1 : 1;
      const bMatch = b.title.toLowerCase().includes(filterTopic.toLowerCase()) ? -1 : 1;
      return aMatch - bMatch;
    });
  }, [sections, filterTopic]);

  const selectedSection =
    sections?.find((s) => s.id === selectedSectionId) || filteredSections?.[0];

  // ── No project selected ──────────────────────────────────────────────────
  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/20">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <p className="text-muted-foreground">Select a project from the sidebar to view its guide.</p>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="animate-spin w-7 h-7 text-indigo-400" />
        <p className="text-sm text-muted-foreground">Loading guide...</p>
      </div>
    );
  }

  // ── Generating ────────────────────────────────────────────────────────────
  if (isGenerating(generateState)) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center gap-8 px-4">
        {/* Animated orb */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight">Generating Your Guide</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Our AI is reading your source code, matching meeting context, and writing a comprehensive documentation guide.
          </p>
        </div>

        {/* Progress steps */}
        <div className="w-full space-y-2">
          {PROGRESS_STEPS.map((step, i) => (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-500",
                i < progressStep
                  ? "text-muted-foreground/50"
                  : i === progressStep
                  ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                  : "text-muted-foreground/30"
              )}
            >
              {i < progressStep ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : i === progressStep ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-current flex-shrink-0 opacity-40" />
              )}
              {step}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/50">
          Keep this tab open · This takes 1–3 minutes
        </p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center gap-6 px-4">
        {/* Hero icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-indigo-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Living Codebase Guide</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Generate a comprehensive, auto-updating guide for your codebase. Powered by your source code and enriched with meeting context.
          </p>
        </div>

        {/* Credit cost card */}
        {creditsData && (
          <div className="w-full rounded-xl border border-border/40 bg-muted/30 divide-y divide-border/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-3.5 h-3.5" />
                Estimated cost
              </span>
              <span className="font-semibold">{creditsData.estimatedCost} credits</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Coins className="w-3.5 h-3.5" />
                Your balance
              </span>
              <span
                className={cn(
                  "font-semibold",
                  creditsData.hasEnough ? "text-green-400" : "text-destructive"
                )}
              >
                {creditsData.userCredits} credits
              </span>
            </div>
          </div>
        )}

        {/* Error banner */}
        {isError(generateState) && (
          <div className="w-full flex items-start gap-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Generation failed. Please check your API keys and try again.</span>
          </div>
        )}

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0 font-semibold"
          onClick={handleGenerateGuide}
          disabled={isGenerating(generateState) || (creditsData != null && !creditsData.hasEnough)}
        >
          {isGenerating(generateState) ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {creditsData && !creditsData.hasEnough ? "Insufficient Credits" : "Generate Guide"}
        </Button>
      </div>
    );
  }

  // ── Main guide view ───────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-64 border-r border-border/40 flex flex-col bg-muted/10 flex-shrink-0">
        {/* Sidebar header */}
        <div className="p-3 border-b border-border/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">Living Guide</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleGenerateGuide}
              disabled={isGenerating(generateState)}
              title="Regenerate entire guide"
            >
              <RefreshCcw
                className={cn("w-3.5 h-3.5", isGenerating(generateState) && "animate-spin")}
              />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sections..."
              className="pl-8 h-8 text-xs bg-background/50"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
            />
            {filterTopic && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setFilterTopic("")}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Section count */}
          <p className="text-[10px] text-muted-foreground/60 px-0.5">
            {filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""}
            {filterTopic ? ` matching "${filterTopic}"` : ""}
          </p>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredSections.map((section) => {
            const isSelected = selectedSection?.id === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 group",
                  isSelected
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText
                    className={cn(
                      "w-3 h-3 flex-shrink-0",
                      isSelected ? "text-indigo-400" : "text-muted-foreground/50"
                    )}
                  />
                  <span className="truncate font-medium">{section.title}</span>
                  <div className="ml-auto flex-shrink-0">
                    {section.status === "GENERATING" && (
                      <RefreshCcw className="w-2.5 h-2.5 animate-spin text-blue-400" />
                    )}
                    {section.status === "STALE" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    )}
                    {section.status === "FRESH" && isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Credits footer */}
        {creditsData && (
          <div className="border-t border-border/40 p-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Credits
              </span>
              <span className={cn("font-semibold", creditsData.hasEnough ? "text-green-400" : "text-destructive")}>
                {creditsData.userCredits}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {selectedSection ? (
          <>
            {/* Content header */}
            <div className="border-b border-border/40 px-6 py-4 flex items-start justify-between gap-4 bg-background/30 backdrop-blur-sm flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold tracking-tight truncate">{selectedSection.title}</h2>
                  <StatusBadge status={selectedSection.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedSection.lastGeneratedAt
                      ? `Updated ${formatRelative(selectedSection.lastGeneratedAt)}`
                      : "Never generated"}
                  </span>
                  {selectedSection.sourceFileRefs?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {selectedSection.sourceFileRefs.length} file{selectedSection.sourceFileRefs.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Regenerate button */}
              <div className="relative flex-shrink-0">
                {showRegenerateConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Cost 1 credit?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs px-2.5"
                      disabled={regenerateSection.isPending}
                      onClick={() =>
                        regenerateSection.mutate({
                          projectId: projectId!,
                          sectionId: selectedSection.id,
                        })
                      }
                    >
                      {regenerateSection.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setShowRegenerateConfirm(false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-border/40 hover:border-indigo-500/40 hover:text-indigo-300"
                    disabled={selectedSection.status === "GENERATING" || regenerateSection.isPending}
                    onClick={() => setShowRegenerateConfirm(true)}
                  >
                    <RefreshCcw
                      className={cn(
                        "w-3.5 h-3.5 mr-1.5",
                        (selectedSection.status === "GENERATING" || regenerateSection.isPending) &&
                          "animate-spin"
                      )}
                    />
                    Regenerate
                  </Button>
                )}
              </div>
            </div>

            {/* Source file refs strip */}
            {selectedSection.sourceFileRefs?.length > 0 && (
              <div className="px-6 py-2 border-b border-border/30 bg-muted/10 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
                <span className="text-[10px] text-muted-foreground/60 mr-1 flex-shrink-0">Sources:</span>
                {selectedSection.sourceFileRefs.slice(0, 8).map((ref) => (
                  <Badge
                    key={ref}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-5 font-mono flex-shrink-0 bg-muted/50"
                  >
                    {ref.split("/").slice(-1)[0]}
                  </Badge>
                ))}
                {selectedSection.sourceFileRefs.length > 8 && (
                  <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">
                    +{selectedSection.sourceFileRefs.length - 8} more
                  </span>
                )}
              </div>
            )}

            {/* Content body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
              {selectedSection.status === "GENERATING" ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <p className="text-sm">Generating documentation for this section...</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2
                  prose-h3:text-base prose-h3:text-indigo-300
                  prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-muted/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/40 prose-pre:rounded-xl
                  prose-blockquote:border-indigo-500/40 prose-blockquote:text-muted-foreground
                  prose-strong:text-foreground prose-li:text-muted-foreground">
                  <ReactMarkdown
                    components={{
                      a: ({ ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                      h2: ({ ...props }) => (
                        <h2 {...props} />
                      ),
                      code: ({ children, className, ...props }) => {
                        const isBlock = className?.includes("language-");
                        if (isBlock) return <code className={className} {...props}>{children}</code>;
                        return <code {...props}>{children}</code>;
                      },
                    }}
                  >
                    {selectedSection.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <ChevronRight className="w-8 h-8 opacity-20" />
            <p className="text-sm">Select a section from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "FRESH") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Up to date
      </span>
    );
  }
  if (status === "STALE") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
        <AlertCircle className="w-2.5 h-2.5" />
        Stale
      </span>
    );
  }
  if (status === "GENERATING") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
        Generating
      </span>
    );
  }
  return null;
}

function formatRelative(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString();
}
