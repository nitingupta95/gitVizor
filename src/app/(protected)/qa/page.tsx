/* eslint-disable @next/next/no-img-element */
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import { CodeReferences } from "../dashboard/code-refrences";
import { MessageSquare, Bot, Clock, FileText, ChevronRight, Sparkles } from "lucide-react";

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId: projectId! });
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const question = questions?.[questionIndex];

  return (
    <Sheet>
      {/* ── Ask question card ─────────────────────────────────────── */}
      <AskQuestionCard />

      <div className="h-8" />

      {/* ── Saved questions section ───────────────────────────────── */}
      {questions && questions.length > 0 && (
        <>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
              <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <h2 className="text-base font-semibold tracking-tight">Saved Questions</h2>
            <span className="ml-1 text-xs text-muted-foreground/50 tabular-nums bg-muted/40 rounded-full px-2 py-0.5">
              {questions.length}
            </span>
          </div>

          <div className="grid gap-2.5">
            {questions.map((q, index) => (
              <SheetTrigger key={q.id} asChild onClick={() => setQuestionIndex(index)}>
                <button className="group w-full text-left flex items-start gap-3.5 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/5">
                  {/* Avatar */}
                  {q.User?.imageUrl ? (
                    <img
                      src={q.User.imageUrl}
                      alt="User"
                      className="flex-shrink-0 w-8 h-8 rounded-full ring-2 ring-border/30 ring-offset-1 ring-offset-background mt-0.5"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center mt-0.5">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1 leading-snug">
                      {q.question}
                    </p>
                    <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-1 leading-relaxed">
                      {q.answer}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(q.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {(q.fileReferences as any[])?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                          <FileText className="w-2.5 h-2.5" />
                          {(q.fileReferences as any[]).length} source{(q.fileReferences as any[]).length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="flex-shrink-0 w-4 h-4 text-muted-foreground/30 group-hover:text-blue-400 mt-1 transition-colors" />
                </button>
              </SheetTrigger>
            ))}
          </div>
        </>
      )}

      {/* ── Empty saved state ─────────────────────────────────────── */}
      {questions && questions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center border border-border/30">
            <Sparkles className="w-5 h-5 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground/50">
            No saved questions yet — ask something above!
          </p>
        </div>
      )}

      {/* ── Answer sheet ──────────────────────────────────────────── */}
      {question && (
        <SheetContent className="w-full sm:max-w-3xl border-border/40 bg-background/95 backdrop-blur-xl overflow-y-auto flex flex-col gap-0 p-0">
          {/* Sheet header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/10 flex-shrink-0">
            <SheetTitle className="flex items-start gap-3 text-left">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mt-0.5">
                <Bot className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-base font-semibold leading-snug">{question.question}</span>
            </SheetTitle>
          </SheetHeader>

          {/* Answer content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div data-color-mode="dark" className="rounded-xl border border-border/40 overflow-hidden bg-muted/20">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">AI Answer</span>
              </div>
              <div className="p-4 max-h-[50vh] overflow-y-auto">
                <MDEditor.Markdown
                  source={question.answer ?? "No answer yet"}
                  className="!bg-transparent !text-foreground prose prose-sm prose-invert !max-w-none w-full
                    prose-p:w-full prose-headings:w-full
                    prose-headings:text-foreground prose-headings:font-semibold
                    prose-code:bg-muted/60 prose-code:text-blue-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                    prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/40 prose-pre:rounded-lg prose-pre:w-full
                    prose-a:text-blue-400"
                />
              </div>
            </div>

            {/* Source references */}
            {(question.fileReferences as any[])?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                    Source References
                  </span>
                </div>
                <CodeReferences filesReferences={question.fileReferences as any} />
              </div>
            )}
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;