import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { generateDocSection, generateEmbedding } from "@/lib/ai";
import { DOC_SECTION_CREDIT_COST } from "@/lib/constants";

export const maxDuration = 300; // 5 minutes for pro plans; adjust as needed

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Verify project access
    const project = await db.project.findFirst({
      where: { id: projectId, UserToProject: { some: { userId } } },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Fetch source code embeddings
    const embeddings = await db.sourceCodeEmbedding.findMany({
      where: { projectId },
      select: { id: true, fileName: true, summary: true, sourceCode: true },
    });

    if (embeddings.length === 0) {
      return NextResponse.json({ error: "No source code found for this project. Please index the repository first." }, { status: 400 });
    }

    // Group files by top-level directory
    const grouped: Record<string, typeof embeddings> = {};
    for (const emb of embeddings) {
      const parts = emb.fileName.split("/");
      let topLevel = parts.length > 1 ? parts[0]! : "/";
      // Refine grouping for src/ files to avoid one giant section
      if (emb.fileName.startsWith("src/") && parts.length > 2) {
        topLevel = parts.slice(0, 2).join("/");
      }
      if (!grouped[topLevel]) grouped[topLevel] = [];
      grouped[topLevel]!.push(emb);
    }

    const groups = Object.entries(grouped);
    const totalCost = groups.length * DOC_SECTION_CREDIT_COST;

    // Check credits
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < totalCost) {
      return NextResponse.json(
        { error: `Insufficient credits. Need ${totalCost}, have ${user?.credits ?? 0}.` },
        { status: 402 }
      );
    }

    // Mark all existing sections for this project as GENERATING (progress indicator)
    // and generate each section sequentially
    let order = 0;
    const generatedIds: string[] = [];

    for (const [groupName, files] of groups) {
      // Per-section credit check (safety guard)
      const freshUser = await db.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });
      if (!freshUser || freshUser.credits < DOC_SECTION_CREDIT_COST) {
        // ran out of credits mid-way; stop gracefully
        break;
      }

      // Build section embedding for meeting matching
      let sectionEmbedding: number[] | undefined;
      try {
        const embText = `Module: ${groupName}\nFiles: ${files.map((f) => f.fileName).join(", ")}`;
        sectionEmbedding = await generateEmbedding(embText);
      } catch {
        // non-fatal; skip meeting context
      }

      // Find relevant meetings via vector similarity
      let relevantMeetings: Array<{ id: string; name: string; summary: string; similarity: number }> = [];
      if (sectionEmbedding) {
        try {
          const matches = await db.$queryRaw<Array<{ id: string; name: string; summary: string; similarity: number }>>`
            SELECT id, summary, name,
              1 - ("summaryEmbedding" <=> ${sectionEmbedding}::vector) as similarity
            FROM "Meeting"
            WHERE "projectId" = ${projectId} AND "summaryEmbedding" IS NOT NULL
            ORDER BY "summaryEmbedding" <=> ${sectionEmbedding}::vector
            LIMIT 3
          `;
          relevantMeetings = matches.filter((m) => m.similarity > 0.7);
        } catch {
          // non-fatal; skip meeting context
        }
      }

      // Generate the section content via LLM
      let content = await generateDocSection(
        groupName,
        files.map((f) => ({ fileName: f.fileName, summary: f.summary }))
      );

      if (!content) {
        order++;
        continue; // skip if LLM fails for this section
      }

      // Append meeting context if available
      if (relevantMeetings.length > 0) {
        content += `\n\n### Team Context\n`;
        content += `Based on relevant meetings, this module relates to the following discussions:\n\n`;
        relevantMeetings.forEach((m) => {
          content += `- **${m.name}**: ${m.summary}\n`;
        });
      }

      // Deduct credits
      await db.user.update({
        where: { id: userId },
        data: { credits: { decrement: DOC_SECTION_CREDIT_COST } },
      });

      // Upsert the DocSection
      const slug =
        groupName === "/" ? "root" : groupName.replace(/\W+/g, "-").toLowerCase();

      const docSection = await db.docSection.upsert({
        where: { projectId_slug: { projectId, slug } },
        update: {
          content,
          title: groupName,
          status: "FRESH",
          lastGeneratedAt: new Date(),
          sourceFileRefs: files.map((f) => f.fileName),
          relatedMeetingIds: relevantMeetings.map((m) => m.id),
          order,
        },
        create: {
          projectId,
          slug,
          title: groupName,
          content,
          status: "FRESH",
          lastGeneratedAt: new Date(),
          sourceFileRefs: files.map((f) => f.fileName),
          relatedMeetingIds: relevantMeetings.map((m) => m.id),
          order,
        },
      });

      generatedIds.push(docSection.id);
      order++;
    }

    return NextResponse.json({
      success: true,
      sectionsGenerated: generatedIds.length,
      total: groups.length,
    });
  } catch (error) {
    console.error("[guide/generate] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
