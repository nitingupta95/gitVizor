import { z } from "zod";
import { createTRPCRouter, protectedprocedure, publicProcedure } from "@/server/api/trpc";
import { inngest } from "@/inngest/client";
import { DOC_SECTION_CREDIT_COST } from "@/lib/constants";

export const guideRouter = createTRPCRouter({
  generateGuide: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Basic validation to check project access
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, UserToProject: { some: { userId: ctx.user.userId! } } },
      });
      if (!project) throw new Error("Project not found or access denied");

      // We'll queue the background generation via Inngest
      await inngest.send({
        name: "guide/generate",
        data: {
          projectId: input.projectId,
          userId: ctx.user.userId!,
        },
      });

      return { success: true };
    }),

  checkCredits: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId! },
        select: { credits: true },
      });

      // estimate cost by grouping source code embeddings
      const embeddings = await ctx.db.sourceCodeEmbedding.findMany({
        where: { projectId: input.projectId },
        select: { fileName: true }
      });
      
      const groups = new Set<string>();
      for (const emb of embeddings) {
        const parts = emb.fileName.split('/');
        let topLevel = parts.length > 1 ? parts[0] : '/';
        if (emb.fileName.startsWith('src/') && parts.length > 2) {
          topLevel = parts.slice(0, 2).join('/');
        }
        groups.add(topLevel);
      }

      const cost = groups.size * DOC_SECTION_CREDIT_COST;
      const userCredits = user?.credits ?? 0;

      return {
        estimatedCost: cost,
        userCredits,
        hasEnough: userCredits >= cost
      };
    }),

  
  regenerateSection: protectedprocedure
    .input(z.object({ sectionId: z.string(), projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! }, select: { credits: true } });
      if (!user || user.credits < DOC_SECTION_CREDIT_COST) {
        throw new Error("Insufficient credits");
      }

      const section = await ctx.db.docSection.findUnique({ where: { id: input.sectionId } });
      if (!section) throw new Error("Section not found");
      
      // Deduct credit
      await ctx.db.user.update({
        where: { id: ctx.user.userId! },
        data: { credits: { decrement: DOC_SECTION_CREDIT_COST } },
      });

      // Enqueue regeneration task for this specific section
      await inngest.send({
        name: "guide/regenerate-stale",
        data: {
          projectId: input.projectId,
        }
      });
      
      await ctx.db.docSection.update({
        where: { id: input.sectionId },
        data: { status: "STALE" }
      });
      
      return { success: true };
    }),

  getSections: protectedprocedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.docSection.findMany({
        where: { projectId: input.projectId },
        orderBy: { order: 'asc' },
      });
    }),

  // Public procedure — resolves token to project, returns only safe fields
  // NO meeting IDs, NO billing data, NO project internals exposed
  getPublicSections: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const share = await ctx.db.publicShare.findUnique({
        where: { token: input.token },
        select: {
          enabled: true,
          project: {
            select: {
              githubUrl: true,
              name: true,
              DocSection: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  content: true,
                  sourceFileRefs: true,
                  order: true,
                  status: true,
                  // NOT: relatedMeetingIds, projectId, or any user/billing data
                },
              },
            },
          },
        },
      });

      if (!share?.enabled) return null;
      return {
        projectName: share.project.name,
        githubUrl: share.project.githubUrl,
        sections: share.project.DocSection,
      };
    }),
});
