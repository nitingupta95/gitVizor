'use server'

import { streamText } from 'ai'
import { createStreamableValue } from '@ai-sdk/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { generateEmbedding } from '@/lib/ai'
import { db } from '@/server/db'
import { askQuestionRateLimit } from '@/lib/ratelimit'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logger'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue()

  const { userId } = await auth();
  if (userId && askQuestionRateLimit) {
    const { success } = await askQuestionRateLimit.limit(userId);
    if (!success) {
      stream.update("\n\n*Error: Rate limit exceeded. You can only ask 10 questions per minute. Please try again later.*")
      stream.done()
      return { output: stream.value }
    }
  }

  const queryVector = await generateEmbedding(question)
  const vectorQuery = `[${queryVector.join(',')}]`

  const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .3
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  ` as {fileName:string; sourceCode:string;summary:string}[]
  logger.info({ count: result.length, projectId }, 'DEBUG - Vector query result count');


  let context = ''
  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
  }

    const hasContext = result.length > 0;
    const promptText = `
You are an AI assistant for GitVizor, a code intelligence platform. You help developers understand their codebase.
You ONLY answer questions based on the provided codebase context below.
If the context is empty or doesn't contain enough information to answer, say: "I couldn't find relevant code for that in this project's indexed files. Try re-indexing the repository or asking about a specific file or feature."
Do NOT invent answers, do NOT discuss things outside the provided code context.
Answer in markdown with code snippets where helpful. Be precise and concise.

START CONTEXT BLOCK
${hasContext ? context : "(No relevant source files found for this query.)"}  
END OF CONTEXT BLOCK

QUESTION: ${question}
`;

  ;(async () => {
    try {
      const { textStream } = await streamText({
        model: google('gemini-3.6-flash') as any,
        prompt: promptText,
      })

      logger.info("[AI] Served by Gemini (gemini-3.5-flash)");
      for await (const delta of textStream) {
        stream.update(delta)
      }
    } catch (error: any) {
      const status = error?.statusCode || error?.status || 500;
      if (status === 429 || status >= 500) {
        logger.warn({ status, err: error }, `[AI Fallback] Gemini failed. Retrying with OpenAI...`);
        
        try {
          const { textStream } = await streamText({
            model: openai('gpt-4o-mini') as any,
            prompt: promptText,
          })

          logger.info("[AI] Served by OpenAI (gpt-4o-mini)");
          for await (const delta of textStream) {
            stream.update(delta)
          }
        } catch (fallbackError) {
          logger.error({ err: fallbackError }, "[AI Fallback] OpenAI also failed");
          stream.update("\n\n*Error: Both AI providers failed to respond. Please try again later.*")
        }
      } else {
        logger.error({ err: error }, "[AI Error] Gemini failed with non-retriable error");
        stream.update("\n\n*Error: Failed to process your request.*")
      }
    } finally {
      stream.done()
    }
  })()

  return {
    output: stream.value, // This is a Proxy-like server object
    filesReferences: result,
  }
}



