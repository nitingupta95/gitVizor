"use client";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { Textarea } from "@/components/ui/textarea";
import { Video, MessageSquare, AlertCircle, Bot } from "lucide-react";

const formSchema = z.object({
  question: z.string().min(1, "Question is required"),
});

const MeetingPage = () => {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const { data: meeting, isLoading } = api.meeting.getMeeting.useQuery({
    meetingId,
  });
  const askQuestion = api.meeting.askQuestion.useMutation();
  const { data: questions } = api.project.getQuestions.useQuery({
    projectId: meeting?.projectId ?? "",
  });
  const refetch = useRefetch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    askQuestion.mutate(
      { meetingId, question: values.question },
      {
        onSuccess: () => {
          toast.success("Your question has been submitted!");
          form.reset();
          refetch();
        },
        onError: (error) => {
          toast.error("Error submitting question: " + error.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          Meeting not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 tracking-tight">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Video className="h-5 w-5 text-primary" />
        </div>
        {meeting.name}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <video
            className="w-full rounded-xl border border-border/40 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
            src={meeting.cloudinaryUrl}
            controls
          />
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              </div>
              Issues
            </h2>
            {meeting.issues.length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 text-sm text-muted-foreground backdrop-blur-sm">
                No issues found for this meeting.
              </div>
            ) : (
              <ul className="space-y-3">
                {meeting.issues.map((issue) => (
                  <li key={issue.id} className="p-4 rounded-xl border border-border/40 bg-card/60 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-sm hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] transition-shadow duration-300">
                    <h3 className="font-semibold text-foreground">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {issue.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            Ask a Question
          </h2>
          <div className="rounded-xl border border-border/40 bg-card/60 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What is this meeting about?"
                          {...field}
                          className="border-border/40 bg-background/50 focus:border-primary/30 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={askQuestion.isPending} className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all">
                  {askQuestion.isPending ? "Submitting..." : "Ask Question"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
              </div>
              Questions & Answers
            </h2>
            {questions?.filter((q) => q.meetingId === meetingId).length === 0 ? (
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 text-sm text-muted-foreground backdrop-blur-sm">
                No questions asked yet for this meeting.
              </div>
            ) : (
              <ul className="space-y-3">
                {questions
                  ?.filter((q) => q.meetingId === meetingId)
                  .map((q) => (
                    <li key={q.id} className="p-4 rounded-xl border border-border/40 bg-card/60 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-sm hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] transition-shadow duration-300">
                      <p className="font-semibold text-foreground">{q.question}</p>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {q.answer}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;
