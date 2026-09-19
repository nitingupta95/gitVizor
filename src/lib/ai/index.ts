import OpenAI from "openai";
import { type Document } from "@langchain/core/documents";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // set in .env
});

/**
 * Summarize a Git diff using GPT-4o-mini (cheap & fast).
 */
export const aiSummariseCommit = async (diff: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert programmer, and you are trying to summarize a git diff.`,
      },
      {
        role: "user",
        content: `Remind yourself of the git diff format:
- A line starting with '+' means it was added.
- A line starting with '-' means it was deleted.
- Context lines start with neither.

EXAMPLE SUMMARY COMMENTS:
* Raised the amount of returned recordings from 10 to 100 [packages/server/recordings_api.ts], [packages/server/constants.ts]
* Fixed a typo in the GitHub action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the octokit initialization to a separate file [src/octokit.ts], [src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]

Do not copy the examples. Summarize this diff instead:

${diff}`,
      },
    ],
  });

  return response.choices[0].message.content?.trim() || "";
};

/**
 * Summarize a source code file for onboarding junior engineers.
 */
export async function summariseCode(doc: Document) {
  console.log("getting summary for", doc.metadata.source);
  try {
    const code = doc.pageContent.slice(0, 10000); // Limit to 10k chars
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a senior software engineer onboarding a junior engineer onto a project.",
        },
        {
          role: "user",
          content: `Explain the purpose of the following file (${doc.metadata.source}) in no more than 100 words:\n\n${code}`,
        },
      ],
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (err) {
    console.error("Error summarising code:", err);
    return "";
  }
}

/**
 * Generate embeddings for text using OpenAI's embedding model.
 */
export async function generateEmbedding(summary: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: summary,
  });

  return response.data[0].embedding;
}

export async function generateDocSection(groupName: string, files: { fileName: string, summary: string }[]) {
  const prompt = `You are a senior engineer writing a "Living Codebase Guide" for a module in a software project.
The module is located in the directory: ${groupName}

Explain what this module does, its key files, and how it connects to the rest of the app.
Cite ACTUAL file paths from the provided context in your explanation using markdown inline code or links.
Do not invent file paths.
  
Files in this module:
${files.map(f => `File: ${f.fileName}\nSummary: ${f.summary}`).join('\n\n')}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for cost effectiveness during massive generation
      messages: [
        { role: "system", content: "You are an expert software architect." },
        { role: "user", content: prompt }
      ]
    });
    return response.choices[0].message.content?.trim() || "";
  } catch (err) {
    console.error("Error generating doc section:", err);
    return "";
  }
}
