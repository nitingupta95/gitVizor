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
    return <div>Loading...</div>;
  }

  if (!meeting) {
    return <div>Meeting not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{meeting.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <video
            className="w-full rounded-lg"
            src={meeting.cloudinaryUrl}
            controls
          />
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Issues</h2>
            {meeting.issues.length === 0 ? (
              <p className="text-muted-foreground">
                No issues found for this meeting.
              </p>
            ) : (
              <ul className="space-y-4">
                {meeting.issues.map((issue) => (
                  <li key={issue.id} className="p-4 rounded-lg border">
                    <h3 className="font-semibold">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {issue.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Ask a Question</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What is this meeting about?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={askQuestion.isPending}>
                {askQuestion.isPending ? "Submitting..." : "Ask Question"}
              </Button>
            </form>
          </Form>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">
              Questions & Answers
            </h2>
            {questions?.filter((q) => q.meetingId === meetingId).length === 0 ? (
              <p className="text-muted-foreground">
                No questions asked yet for this meeting.
              </p>
            ) : (
              <ul className="space-y-4">
                {questions
                  ?.filter((q) => q.meetingId === meetingId)
                  .map((q) => (
                    <li key={q.id} className="p-4 rounded-lg border">
                      <p className="font-semibold">{q.question}</p>
                      <p className="text-sm text-muted-foreground">
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
