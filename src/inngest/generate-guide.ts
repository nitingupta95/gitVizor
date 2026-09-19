import { inngest } from "./client";
import { db } from "@/server/db";
import { generateDocSection, generateEmbedding } from "@/lib/ai";
import { DOC_SECTION_CREDIT_COST } from "@/lib/constants";

export const generateGuide = inngest.createFunction(
  { id: "generate-guide", triggers: [{ event: "guide/generate" }] },
  async ({ event, step }) => {
    const { projectId, userId } = event.data as { projectId: string; userId: string };

    // Step 1: Fetch source code embeddings
    const embeddings = await step.run("fetch-embeddings", async () => {
      return await db.sourceCodeEmbedding.findMany({
        where: { projectId },
        select: { id: true, fileName: true, summary: true, sourceCode: true },
      });
    });

    if (embeddings.length === 0) {
      return { success: false, reason: "No source code found for project" };
    }

    // Step 2: Group by top level directory
    const groups = await step.run("group-files", async () => {
      const grouped: Record<string, typeof embeddings> = {};
      for (const emb of embeddings) {
        const parts = emb.fileName.split('/');
        let topLevel = parts.length > 1 ? parts[0] : '/';
        
        // Refine grouping for src/ files
        if (emb.fileName.startsWith('src/') && parts.length > 2) {
          topLevel = parts.slice(0, 2).join('/');
        }
        
        if (!grouped[topLevel]) grouped[topLevel] = [];
        grouped[topLevel].push(emb);
      }
      return grouped;
    });

    // Step 3: Generate sections and deduct credits
    const generatedSections: string[] = [];
    let order = 0;
    
    for (const [groupName, files] of Object.entries(groups)) {
      await step.run(`generate-section-${groupName.replace(/\W+/g, '-')}`, async () => {
        
        // 1. Check credits
        const user = await db.user.findUnique({ where: { id: userId }, select: { credits: true } });
        if (!user || user.credits < DOC_SECTION_CREDIT_COST) {
          throw new Error("Insufficient credits");
        }

        // Phase 3: Match against meetings
        const sectionEmbeddingText = `Module: ${groupName}\nFiles: ${files.map(f => f.fileName).join(', ')}`;
        let sectionEmbedding;
        try {
          sectionEmbedding = await generateEmbedding(sectionEmbeddingText);
        } catch (e) {
          console.error("Failed to generate embedding for section", e);
        }

        let relevantMeetings: Array<{ id: string, name: string, summary: string, similarity: number }> = [];
        if (sectionEmbedding) {
          try {
            const matches = await db.$queryRaw<Array<{ id: string, name: string, summary: string, similarity: number }>>`
              SELECT id, summary, name, 1 - ("summaryEmbedding" <=> ${sectionEmbedding}::vector) as similarity
              FROM "Meeting"
              WHERE "projectId" = ${projectId} AND "summaryEmbedding" IS NOT NULL
              ORDER BY "summaryEmbedding" <=> ${sectionEmbedding}::vector
              LIMIT 3
            `;
            relevantMeetings = matches.filter(m => m.similarity > 0.7);
          } catch (e) {
            console.error("Failed to search meetings", e);
          }
        }

        // 2. Generate content
        let content = await generateDocSection(
          groupName,
          files.map(f => ({ fileName: f.fileName, summary: f.summary }))
        );

        if (!content) return; // skip if LLM failed

        if (relevantMeetings.length > 0) {
          content += `\n\n### Team Context\n`;
          content += `Based on relevant meetings, this module relates to the following discussions:\n\n`;
          relevantMeetings.forEach(m => {
            content += `- **${m.name}**: ${m.summary}\n`;
          });
        }

        // 3. Deduct credits
        await db.user.update({
          where: { id: userId },
          data: { credits: { decrement: DOC_SECTION_CREDIT_COST } },
        });

        // 4. Save DocSection
        const slug = groupName === '/' ? 'root' : groupName.replace(/\W+/g, '-').toLowerCase();
        
        const docSection = await db.docSection.upsert({
          where: { projectId_slug: { projectId, slug } },
          update: {
            content,
            title: groupName,
            status: "FRESH",
            lastGeneratedAt: new Date(),
            sourceFileRefs: files.map(f => f.fileName),
            relatedMeetingIds: relevantMeetings.map(m => m.id),
            order
          },
          create: {
            projectId,
            slug,
            title: groupName,
            content,
            status: "FRESH",
            lastGeneratedAt: new Date(),
            sourceFileRefs: files.map(f => f.fileName),
            relatedMeetingIds: relevantMeetings.map(m => m.id),
            order
          }
        });

        generatedSections.push(docSection.id);
      });
      order++;
    }

    return { success: true, sectionsGenerated: generatedSections.length };
  }
);

export const regenerateStaleSections = inngest.createFunction(
  { id: "regenerate-stale-sections", triggers: [{ event: "guide/regenerate-stale" }] },
  async ({ event, step }) => {
    const { projectId } = event.data as { projectId: string };

    const staleSections = await step.run("fetch-stale", async () => {
      return await db.docSection.findMany({
        where: { projectId, status: "STALE" },
        take: 5
      });
    });

    if (staleSections.length === 0) return { success: true, count: 0 };

    for (const section of staleSections) {
      await step.run(`regenerate-section-${section.id}`, async () => {
        const files = await db.sourceCodeEmbedding.findMany({
          where: { projectId, fileName: { in: section.sourceFileRefs } }
        });

        const content = await generateDocSection(
          section.title,
          files.map(f => ({ fileName: f.fileName, summary: f.summary }))
        );

        if (!content) return;

        await db.docSection.update({
          where: { id: section.id },
          data: { content, status: "FRESH", lastGeneratedAt: new Date() }
        });
      });
    }

    const moreStale = await step.run("check-remaining", async () => {
      return await db.docSection.count({ where: { projectId, status: "STALE" } });
    });

    if (moreStale > 0) {
      await step.sendEvent("trigger-next-batch", {
        name: "guide/regenerate-stale",
        data: { projectId }
      });
    }

    return { success: true, count: staleSections.length };
  }
);
