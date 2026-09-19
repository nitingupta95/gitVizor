import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { inngest } from "@/inngest/client";
import crypto from "crypto";

// Github sends the repository URL, which we use to identify the Project.
// Payload has `commits` array with `added`, `removed`, `modified` arrays of file paths.

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  // If you configure a secret in GitHub and add GITHUB_WEBHOOK_SECRET to .env
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (secret && signature) {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(payload).digest("hex");
    if (signature !== digest) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const data = JSON.parse(payload);
  
  // Only process push events
  if (!data.commits) {
    return NextResponse.json({ message: "Not a push event, ignored" });
  }

  const githubUrl = data.repository?.html_url;
  if (!githubUrl) {
    return NextResponse.json({ message: "Missing repository URL" });
  }

  // Find the project
  const project = await db.project.findFirst({
    where: { githubUrl }
  });

  if (!project) {
    return NextResponse.json({ message: "Project not found" });
  }

  // Extract changed files
  const changedFiles = new Set<string>();
  for (const commit of data.commits) {
    commit.added?.forEach((f: string) => changedFiles.add(f));
    commit.removed?.forEach((f: string) => changedFiles.add(f));
    commit.modified?.forEach((f: string) => changedFiles.add(f));
  }

  if (changedFiles.size === 0) {
    return NextResponse.json({ message: "No files changed" });
  }

  // Find intersecting DocSections
  const staleSections = await db.docSection.findMany({
    where: {
      projectId: project.id,
      sourceFileRefs: {
        hasSome: Array.from(changedFiles)
      }
    },
    select: { id: true }
  });

  if (staleSections.length > 0) {
    const staleIds = staleSections.map(s => s.id);
    
    // Mark them STALE
    await db.docSection.updateMany({
      where: { id: { in: staleIds } },
      data: { status: "STALE" }
    });

    // Enqueue regeneration task
    await inngest.send({
      name: "guide/regenerate-stale",
      data: {
        projectId: project.id,
      }
    });
    
    console.log(`Marked ${staleIds.length} sections STALE for project ${project.id}`);
  }

  return NextResponse.json({ success: true, staleCount: staleSections.length });
}
