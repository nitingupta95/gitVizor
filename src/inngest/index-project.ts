import { inngest } from "./client";
import { processMeeting } from "@/lib/third-party/assembly";
import { db } from "@/server/db";
import { generateEmbedding } from "@/lib/ai";

export const processAudioFile = inngest.createFunction(
  { id: "process-audio-file", triggers: [{ event: "meeting/process" }] },
  async ({ event, step }) => {
    const { meetingUrl, meetingId } = event.data as { meetingUrl: string; meetingId: string };

    // Step 1: Process Meeting via AssemblyAI
    const { summaries } = await step.run("process-assemblyai", async () => {
      return await processMeeting(meetingUrl);
    });

    // Step 2: Save Issues
    await step.run("save-issues", async () => {
      await db.issue.createMany({
        data: summaries.map((summary: any) => ({
          meetingId,
          title: summary.headline || summary.gist || "Issue",
          description: summary.summary || "",
          status: "open",
          priority: "medium",
        })),
      });
    });

    // Step 3: Update Meeting Status and Embedding
    await step.run("update-meeting-status", async () => {
      const summaryText = summaries[0]?.summary || summaries[0]?.headline || "";
      let embedding: number[] | null = null;
      if (summaryText) {
        try {
          embedding = await generateEmbedding(summaryText);
        } catch (e) {
          console.error("Failed to generate embedding for meeting", e);
        }
      }

      await db.meeting.update({
        where: { id: meetingId },
        data: {
          status: "COMPLETED",
          name: summaries[0]?.headline || "Untitled Meeting",
          summary: summaryText,
        },
      });

      if (embedding) {
        await db.$executeRaw`UPDATE "Meeting" SET "summaryEmbedding" = ${embedding}::vector WHERE id = ${meetingId}`;
      }
    });

    return { success: true, meetingId };
  }
);
