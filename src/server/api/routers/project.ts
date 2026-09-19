import z from "zod";
import { createTRPCRouter, protectedprocedure } from "../trpc";
import { pollCommits } from "@/lib/github/commits";
import { checkCredits, indexGithubRepo } from "@/lib/github/loader";
import { db } from "@/server/db";
import { createProjectRateLimit } from "@/lib/ratelimit";

async function verifyProjectAccess(ctx: any, projectId: string) {
  if (!ctx.user?.userId) throw new Error("Authentication failed: User ID is missing.");
  const hasAccess = await ctx.db.userToProject.findUnique({
    where: {
      userId_projectId: {
        userId: ctx.user.userId,
        projectId,
      },
    },
  });
  if (!hasAccess) {
    throw new Error("Unauthorized: You do not have access to this project.");
  }
}

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
      const userId = ctx.user?.userId!;
      if (createProjectRateLimit) {
        const { success } = await createProjectRateLimit.limit(userId);
        if (!success) {
          throw new Error("Rate limit exceeded: You can only create 5 projects per day.");
        }
      }

      const user= await db.user.findUnique({
        where: {id: userId},
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
          status: "PROCESSING",
          UserToProject: {
            create: {
              userId: ctx.user?.userId || "",
            },
          },
        },
      });

      // Don't await this, let it run in the background
      indexGithubRepo(project.id, input.githubUrl, input.githubToken)
        .then(() => pollCommits(project.id))
        .then(() => {
          return ctx.db.project.update({
            where: { id: project.id },
            data: { status: "COMPLETED" },
          });
        })
        .catch((error) => {
          console.error("Error indexing project:", error);
          return ctx.db.project.update({
            where: { id: project.id },
            data: { status: "FAILED" },
          });
        });

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

  getProjectStatus: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyProjectAccess(ctx, input.projectId);
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { status: true },
      });
      return project?.status;
    }),

  getCommits: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyProjectAccess(ctx, input.projectId);

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
      await verifyProjectAccess(ctx, input.projectId);

      return await ctx.db.question.create({
        data: {
          projectId: input.projectId,
          question: input.question,
          fileReferences: input.fileReferences,
          userId: ctx.user.userId!,
          answer: input.answer,
        },
      });
    }),
  getQuestions: protectedprocedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
    await verifyProjectAccess(ctx, input.projectId);
    return await ctx.db.question.findMany({
      where: { projectId: input.projectId },
      orderBy: { createdAt: 'desc' },
      include: { User: true },
    });

  }),

    archiveProject: protectedprocedure.input(z.object({projectId: z.string()})).mutation(async({ctx, input})=>{
      await verifyProjectAccess(ctx, input.projectId);
      return await ctx.db.project.update({
        where: {id: input.projectId},
        data: {deletedAt: new Date()}
      })
    }),

    getTeamMembers: protectedprocedure.input(z.object({projectId: z.string()})).query(async({ctx, input})=>{
      await verifyProjectAccess(ctx, input.projectId);
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
    }),

  // ── Public sharing ────────────────────────────────────────────────────────

  getPublicShare: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyProjectAccess(ctx, input.projectId);
      return await ctx.db.publicShare.findUnique({
        where: { projectId: input.projectId },
        select: {
          id: true,
          token: true,
          enabled: true,
          qaCreditsUsed: true,
          qaCreditsCap: true,
          qaCapPeriodStart: true,
        },
      });
    }),

  upsertPublicShare: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyProjectAccess(ctx, input.projectId);
      return await ctx.db.publicShare.upsert({
        where: { projectId: input.projectId },
        create: { projectId: input.projectId, enabled: true },
        update: { enabled: true },
        select: { token: true, enabled: true, qaCreditsUsed: true, qaCreditsCap: true },
      });
    }),

  disablePublicShare: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyProjectAccess(ctx, input.projectId);
      return await ctx.db.publicShare.update({
        where: { projectId: input.projectId },
        data: { enabled: false },
        select: { token: true, enabled: true },
      });
    }),

  regenerateShareToken: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyProjectAccess(ctx, input.projectId);
      // Delete the old record so the old token hard-404s immediately
      await ctx.db.publicShare.deleteMany({ where: { projectId: input.projectId } });
      // Create a fresh record — Prisma @default(cuid()) generates a new token
      return await ctx.db.publicShare.create({
        data: { projectId: input.projectId, enabled: true },
        select: { token: true, enabled: true, qaCreditsUsed: true, qaCreditsCap: true },
      });
    }),

  });