import type { NextRequest } from "next/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from "@/server/db";
import { generateEmbedding } from "@/lib/ai";
import { logger } from "@/lib/logger";
import { publicQaIpRateLimit, publicQaTokenRateLimit } from "@/lib/ratelimit";

// ── Types ──────────────────────────────────────────────────────────────────

type SourceRow = { fileName: string; sourceCode: string; summary: string };

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_QUESTION_LENGTH = 2000;
const MIN_QUESTION_LENGTH = 2;

/**
 * Lightweight injection detection patterns.
 * Rejections are logged server-side but return a generic 400.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions/i,
  /you\s+are\s+now\s+a/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /disregard\s+(your|all|previous)/i,
  /forget\s+(everything|all|your)\s+(above|previous)/i,
  /act\s+as\s+(if\s+you\s+are|a\s+different)/i,
  /new\s+instructions?\s*:/i,
  /system\s+prompt/i,
];

const SYSTEM_PROMPT = `You are a read-only code assistant for a public GitVizor project page.
You ONLY have access to source code files shown in the context block below.
You have NO access to meeting recordings, team discussions, internal decisions, hiring conversations, or private project notes.
If asked about meetings, team decisions, internal discussions, or anything not in the source code, politely decline and explain that you can only answer questions about the source code.
Do NOT invent or hallucinate information. If the context does not contain enough to answer, say so clearly.
Answer in markdown with code snippets where helpful. Be precise and concise.`;

// ── Google AI client ───────────────────────────────────────────────────────

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse body ─────────────────────────────────────────────────────
    let body: { token?: string; question?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { token, question } = body;

    if (!token || typeof token !== "string") {
      return Response.json({ error: "token is required" }, { status: 400 });
    }

    // ── 2. Input validation ───────────────────────────────────────────────
    if (!question || typeof question !== "string") {
      return Response.json({ error: "question is required" }, { status: 400 });
    }
    const trimmed = question.trim();
    if (trimmed.length < MIN_QUESTION_LENGTH) {
      return Response.json({ error: "Question is too short" }, { status: 400 });
    }
    if (trimmed.length > MAX_QUESTION_LENGTH) {
      return Response.json({ error: "Question is too long (max 2000 chars)" }, { status: 400 });
    }

    // ── 3. Injection detection ────────────────────────────────────────────
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        logger.warn({ token, pattern: pattern.toString() }, "[PublicQA] Injection attempt blocked");
        return Response.json({ error: "Invalid question content" }, { status: 400 });
      }
    }

    // ── 4. Resolve token to share + project ──────────────────────────────
    const share = await db.publicShare.findUnique({
      where: { token },
      select: {
        id: true,
        enabled: true,
        qaCreditsUsed: true,
        qaCreditsCap: true,
        qaCapPeriodStart: true,
        project: { select: { id: true } },
      },
    });

    if (!share?.enabled) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    const projectId = share.project.id;

    // ── 5. Rate limiting ──────────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (publicQaIpRateLimit) {
      const { success } = await publicQaIpRateLimit.limit(`ip:${ip}`);
      if (!success) {
        return Response.json({ error: "rate_limited" }, { status: 429 });
      }
    }

    if (publicQaTokenRateLimit) {
      const { success } = await publicQaTokenRateLimit.limit(`token:${token}`);
      if (!success) {
        return Response.json({ error: "rate_limited" }, { status: 429 });
      }
    }

    // ── 6. Monthly reset (lazy check) + cap enforcement ───────────────────
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    if (share.qaCapPeriodStart < monthAgo) {
      await db.publicShare.update({
        where: { id: share.id },
        data: { qaCreditsUsed: 0, qaCapPeriodStart: new Date() },
      });
      share.qaCreditsUsed = 0;
    }

    if (share.qaCreditsUsed >= share.qaCreditsCap) {
      return Response.json({ error: "public_cap_reached" }, { status: 429 });
    }

    // ── 7. Retrieve from SourceCodeEmbedding ONLY ─────────────────────────
    // This query NEVER touches Meeting, Issue, User, or any other table.
    // Import chain for this file: db, generateEmbedding, streamText, google — nothing meeting-related.
    const queryVector = await generateEmbedding(trimmed);
    const vectorQuery = `[${queryVector.join(",")}]`;

    const sourceRows = await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
      FROM "SourceCodeEmbedding"
      WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.3
        AND "projectId" = ${projectId}
      ORDER BY similarity DESC
      LIMIT 10
    ` as SourceRow[];

    logger.info({ count: sourceRows.length, projectId }, "[PublicQA] Vector query results");

    const context = sourceRows
      .map((r) => `source: ${r.fileName}\ncode content: ${r.sourceCode}\nsummary: ${r.summary}`)
      .join("\n\n");

    const prompt = `${SYSTEM_PROMPT}

START CONTEXT BLOCK
${sourceRows.length > 0 ? context : "(No relevant source files found for this query.)"}
END OF CONTEXT BLOCK

QUESTION: ${trimmed}`;

    // ── 8. Stream response ────────────────────────────────────────────────
    const { textStream } = await streamText({
      model: google("gemini-2.5-flash") as any,
      prompt,
    });

    // ── 9. Increment public credit counter AFTER starting stream ──────────
    // User.credits is never touched here.
    await db.publicShare.update({
      where: { id: share.id },
      data: { qaCreditsUsed: { increment: 1 } },
    });

    // Return file references alongside the stream as a header (JSON-encoded)
    const fileRefs = sourceRows.map((r) => ({ fileName: r.fileName }));
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // First chunk: file references as a special metadata line
        controller.enqueue(
          encoder.encode(`__REFS__${JSON.stringify(fileRefs)}\n`)
        );
        for await (const chunk of textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-File-Refs": JSON.stringify(fileRefs),
        "Cache-Control": "no-cache, no-store",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    logger.error({ err: error }, "[PublicQA] Unhandled error");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
