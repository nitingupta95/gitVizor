"use client";

import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import { askQuestion } from "./action";
import { readStreamableValue } from "@ai-sdk/rsc";
import { CodeReferences } from "./code-refrences";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { Sparkles, Loader2, Bot, FileText, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileReferences, setFileReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");

  const saveAnswer = api.project.saveAnswer.useMutation();
  const refetch = useRefetch();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id || !question.trim()) return;

    setAnswer("");
    setFileReferences([]);
    setLoading(true);
    
    try {
      const { output, filesReferences } = await askQuestion(question, project.id);
      setOpen(true);
      setFileReferences(filesReferences || []);

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((ans) => ans + delta);
        }
      }
    } catch (error: any) {
      toast.error("Failed to ask question", {
        description: error.message || "The AI service may be down or over quota.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto border border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl p-0 flex flex-col gap-0 rounded-2xl">
          {/* Header */}
          <DialogHeader className="px-6 py-5 border-b border-border/40 bg-muted/10 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                <Bot className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="font-semibold">{question}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div data-color-mode="dark" className="rounded-xl border border-border/40 overflow-hidden bg-muted/20">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-300">AI Answer</span>
              </div>
              <div className="p-4">
                <MDEditor.Markdown
                  source={answer || "Generating answer..."}
                  className={cn(
                    "!bg-transparent !text-foreground prose prose-sm prose-invert !max-w-none w-full",
                    "prose-p:w-full prose-headings:w-full",
                    "prose-headings:text-foreground prose-headings:font-semibold",
                    "prose-code:bg-muted/60 prose-code:text-indigo-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs",
                    "prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/40 prose-pre:rounded-lg prose-pre:w-full",
                    "prose-a:text-indigo-400",
                    !answer && "animate-pulse opacity-50"
                  )}
                />
              </div>
            </div>

            {fileReferences && fileReferences.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                    Source References
                  </span>
                </div>
                <CodeReferences filesReferences={fileReferences} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/40 bg-muted/10 flex justify-end gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border/40 hover:bg-muted/50"
            >
              Close
            </Button>
            <Button
              disabled={saveAnswer.isPending || !answer}
              onClick={() => {
                saveAnswer.mutate(
                  { projectId: project!.id, question, answer, fileReferences },
                  {
                    onSuccess: () => {
                      toast.success("Answer saved to Q&A history");
                      refetch();
                    },
                    onError: () => toast.error("Error saving answer"),
                  }
                );
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/25 border-0 font-medium"
            >
              {saveAnswer.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Save Answer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3 border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-indigo-500/30 group overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Ask GitVizor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none border-border/40 bg-background/50 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 transition-colors text-sm placeholder:text-muted-foreground/40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (question.trim()) {
                    const form = e.currentTarget.form;
                    if (form) form.requestSubmit();
                  }
                }
              }}
            />
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-muted-foreground/40">
                Press <kbd className="font-mono bg-muted/50 px-1 py-0.5 rounded">Enter</kbd> to ask
              </p>
              <Button
                type="submit"
                disabled={loading || !question.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/25 border-0 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="w-4 h-4 mr-2" />
                    Ask Question
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;