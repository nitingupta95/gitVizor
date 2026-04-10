import z from "zod";
import { createTRPCRouter, protectedprocedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";
import { db } from "@/server/db";

export const projectRouter = createTRPCRouter({
  createProject: protectedprocedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user= await db.user.findUnique({
        where: {id: ctx.user?.userId!},
        select:{credits: true}
      })
      if(!user) throw new Error("User not found");
      const currentCredits= user.credits;
      const fileCount= await checkCredits(input.githubUrl, input.githubToken);
      if(currentCredits < fileCount){
        throw new Error("Not enough credits to create this project. Please upgrade your plan.");
      }


     

      // ✅ Create project linked to user
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.name,
          githubToken: input.githubToken,
          UserToProject: {
            create: {
              userId: ctx.user?.userId || "",
            },
          },
        },
      });

      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollCommits(project.id);
      await db.user.update({
        where: {id: ctx.user?.userId!},
        data: {credits: currentCredits - fileCount}
      })

      return project;
    }),

  getProjects: protectedprocedure.query(async ({ ctx }) => {
    const userId = ctx.user?.userId;
    if (!userId) {
      throw new Error("Authentication failed: User ID is missing.");
    }

    return await ctx.db.project.findMany({
      where: {
        UserToProject: {
          some: { userId },
        },
        deletedAt: null,
      },
    });
  }),

  getCommits: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user?.userId;
      if (!userId) {
        throw new Error("Authentication failed: User ID is missing.");
      }

      pollCommits(input.projectId).catch(console.error);

      return await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
      });
    }),

  saveAnswer: protectedprocedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.userId;
      if (!userId) {
        throw new Error("Authentication failed: User ID is missing.");
      }

      return await ctx.db.question.create({
        data: {
          projectId: input.projectId,
          question: input.question,
          fileReferences: input.fileReferences,
          userId: userId,
          answer: input.answer,
        },
      });
    }),
  getQuestions: protectedprocedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.db.question.findMany({
      where: { projectId: input.projectId },
      orderBy: { createdAt: 'desc' },
      include: { User: true },
    });

  }),
  uploadMeeting: protectedprocedure.input(z.object({
    projectId: z.string(), meetingUrl: z.string(), name: z.string()
  })).mutation(async({ctx, input})=>{
    const meeting = await ctx.db.meeting.create({
      data:{
        projectId: input.projectId,
        meetingUrl: input.meetingUrl,
        name: input.name,
        status: "PROCESSING"
      }})
    return meeting;
    }),

    getMeetings: protectedprocedure.input(z.object({projectId: z.string()})).query(async({ctx, input})=>{
      return await ctx.db.meeting.findMany({
        where: {projectId: input.projectId},
        orderBy: {createdAt: "desc"},
        include:{issues:true}
      })
    }),

    deleteMeeting: protectedprocedure.input(z.object({meetingId: z.string()})).mutation(async({ctx, input})=>{
      await ctx.db.meeting.delete({
        where: {id: input.meetingId}, 
      }); 
    }),

    getMeetingById: protectedprocedure.input(z.object({meetingId: z.string()})).query(async({ctx, input})=>{
      return await ctx.db.meeting.findUnique({
        where: {id: input.meetingId},
        include: {issues: {orderBy: {start: "asc"}}}
      })
    }),

    archiveProject: protectedprocedure.input(z.object({projectId: z.string()})).mutation(async({ctx, input})=>{
      return await ctx.db.project.update({
        where: {id: input.projectId},
        data: {deletedAt: new Date()}
      })
    }),

    getTeamMembers: protectedprocedure.input(z.object({projectId: z.string()})).query(async({ctx, input})=>{
      return await ctx.db.userToProject.findMany({
        where: {projectId: input.projectId},
        include: {User: true}
      })
    }),
    getMyCredits: protectedprocedure.query(async({ctx})=>{
      return await ctx.db.user.findUnique({
        where: {id: ctx.user?.userId ?? undefined},
        select: {credits: true}
      })
    }),

    checkCredits:protectedprocedure.input(z.object({githubUrl:z.string(),githubToken:z.string(),})).mutation(async({ctx, input})=>{
      const fileCount= await checkCredits(input.githubUrl, input.githubToken);
      const userCredits= await ctx.db.user.findUnique({
        where: {id: ctx.user?.userId ?? undefined},
        select: {credits: true}
      });
      return {fileCount, userCredits: userCredits?.credits ?? 0};
    })



  });