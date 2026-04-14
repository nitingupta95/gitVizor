import { z } from "zod";
import { createTRPCRouter, protectedprocedure } from "../trpc";
import { db } from "~/server/db";
import cloudinary from "@/lib/cloudinary";

export const meetingRouter = createTRPCRouter({
  createMeeting: protectedprocedure
    .input(
      z.object({
        name: z.string(),
        cloudinaryUrl: z.string(),
        cloudinaryPublicId: z.string(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.userId) {
        throw new Error("User not found");
      }
      const meeting = await db.meeting.create({
        data: {
          name: input.name,
          cloudinaryUrl: input.cloudinaryUrl,
          cloudinaryPublicId: input.cloudinaryPublicId,
          projectId: input.projectId,
          userId: ctx.user.userId,
        },
      });
      return meeting;
    }),

  getMeetings: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.userId) {
        throw new Error("User not found");
      }
      const meetings = await db.meeting.findMany({
        where: {
          projectId: input.projectId,
          userId: ctx.user.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return meetings;
    }),

  getMeeting: protectedprocedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.userId) {
        throw new Error("User not found");
      }
      const meeting = await db.meeting.findFirst({
        where: {
          id: input.meetingId,
          userId: ctx.user.userId,
        },
        include: {
          issues: true,
        },
      });
      return meeting;
    }),

  askQuestion: protectedprocedure
    .input(
      z.object({
        meetingId: z.string(),
        question: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await db.meeting.findUnique({
        where: { id: input.meetingId },
        select: { projectId: true },
      });

      if (!meeting) {
        throw new Error("Meeting not found");
      }
      if (!ctx.user.userId) {
        throw new Error("User not found");
      }

      const question = await db.question.create({
        data: {
          question: input.question,
          meetingId: input.meetingId,
          projectId: meeting.projectId,
          userId: ctx.user.userId,
          answer: "Processing...", // Placeholder answer
        },
      });
      return question;
    }),

  deleteMeeting: protectedprocedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First, delete related issues
      await db.issue.deleteMany({
        where: {
          meetingId: input.meetingId,
        },
      });
      
      const meeting = await db.meeting.findUnique({
        where: { id: input.meetingId },
        select: { cloudinaryPublicId: true },
      });

      if (meeting?.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(meeting.cloudinaryPublicId, {
          resource_type: "video",
        });
      }

      await db.meeting.delete({
        where: {
          id: input.meetingId,
        },
      });

      return { success: true };
    }),

  createCloudinarySignature: protectedprocedure.mutation(async () => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
      },
      process.env.CLOUDINARY_API_SECRET!
    );
    return { timestamp, signature };
  }),
});
