"use client";

import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { useState } from "react";
import { toast } from "sonner";
import {
  Globe,
  Copy,
  Check,
  RefreshCcw,
  Loader2,
  Lock,
  Unlock,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function SharingSettings() {
  const { projectId } = useProject();
  const [copied, setCopied] = useState(false);

  const { data: share, refetch, isLoading } = api.project.getPublicShare.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const upsert = api.project.upsertPublicShare.useMutation({
    onSuccess: () => { toast.success("Public sharing enabled"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const disable = api.project.disablePublicShare.useMutation({
    onSuccess: () => { toast.success("Public sharing disabled"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const regenerate = api.project.regenerateShareToken.useMutation({
    onSuccess: () => { toast.success("New link generated — old link is now invalid"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const isBusy = upsert.isPending || disable.isPending || regenerate.isPending;

  const shareUrl = share?.token
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/share/${share.token}`
    : null;

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const capPct = share ? Math.round((share.qaCreditsUsed / share.qaCreditsCap) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-muted/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/20">
          <Globe className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Public Sharing</h2>
          <p className="text-xs text-muted-foreground/60">
            Share a read-only guide with visitors — no account required
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <>
            {/* Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  {share?.enabled ? "Sharing is enabled" : "Sharing is disabled"}
                </p>
                <p className="text-xs text-muted-foreground/50 mt-0.5">
                  {share?.enabled
                    ? "Anyone with the link can read the guide and ask Q&A questions."
                    : "No one can access the public guide. Old links show a 'not available' page immediately."}
                </p>
              </div>
              <Button
                variant={share?.enabled ? "outline" : "default"}
                size="sm"
                disabled={isBusy}
                onClick={() =>
                  share?.enabled
                    ? disable.mutate({ projectId: projectId! })
                    : upsert.mutate({ projectId: projectId! })
                }
                className={cn(
                  "flex-shrink-0 gap-2",
                  share?.enabled
                    ? "border-border/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    : "bg-gradient-to-r bg-blue-600 text-white border-0 shadow-md shadow-blue-600/20"
                )}
              >
                {isBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : share?.enabled ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
                {share?.enabled ? "Disable" : "Enable sharing"}
              </Button>
            </div>

            {/* Shareable URL — only when enabled */}
            {share?.enabled && shareUrl && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                  Shareable Link
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center min-w-0 rounded-xl border border-border/40 bg-background/50 px-3 py-2">
                    <span className="text-xs font-mono text-muted-foreground/60 truncate">
                      {shareUrl}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex-shrink-0 border-border/40 gap-1.5"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                {/* Regenerate */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground/50 hover:text-muted-foreground gap-1.5"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      Regenerate link
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-border/40 bg-background/95 backdrop-blur-xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Regenerate share link?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground/70 leading-relaxed">
                        This will <strong className="text-foreground">immediately invalidate the current link</strong>. Anyone who has bookmarked or shared the old link will see a &ldquo;not available&rdquo; page &mdash; they won&apos;t be redirected to the new one.
                        <br /><br />
                        The new link will be available instantly.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border/40">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => regenerate.mutate({ projectId: projectId! })}
                        className="bg-gradient-to-r bg-blue-600 text-white border-0"
                      >
                        Yes, regenerate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Usage meter */}
            {share && (
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Public Q&A usage this month</span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">
                    {share.qaCreditsUsed} / {share.qaCreditsCap}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      capPct >= 90
                        ? "bg-red-500"
                        : capPct >= 70
                        ? "bg-amber-500"
                        : "bg-gradient-to-r bg-blue-600"
                    )}
                    style={{ width: `${Math.min(capPct, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/40">
                  Resets monthly. Public questions never affect your paid credits.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
