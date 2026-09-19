# GitVizor - Architecture and Systems Documentation

## 1. Project Overview
GitVizor is a SaaS application designed to enhance the software development lifecycle by integrating GitHub repository intelligence with meeting transcription and analysis. The system allows users to link raw codebases, query their repositories using an AI assistant (RAG), and upload developer meeting recordings to automatically extract context, issues, and action items.

---

## 2. Core Functionalities

### 🧩 Repository Synchronization & Analysis
- **GitHub Integration**: Connects to the GitHub REST API to fetch commits, file trees, and source code for linked repositories.
- **Credit-Based Parsing**: Analyzes the size and file count of a repository and algorithmically charges the user internal 'credits' to ingest the data.
- **Commit Tracking**: Maintains an interactive, real-time log of commits, linking directly back to the GitHub web interface for easy tracking.

### 🤖 AI Codebase Querying (RAG Architecture)
- **Codebase Q&A**: Users can ask contextual questions regarding their specific project.
- **Context Retrieval**: The system fetches relevant code references (`sourceCode`) from the repository using vector search (`pgvector`) and passes the context to language models (OpenAI/Gemini).
- **Streaming Responses**: Leveraging the Vercel AI SDK, AI responses stream into the UI in real-time, accompanied by the specific file references used to generate the answer.

### 🎙️ Audio Meeting Processing
- **File Uploads**: Drag-and-drop component to upload audio recordings (`.mp3`, `.wav`, etc.).
- **Cloud Storage**: Securely uploads raw audio binaries directly to Cloudinary/Firebase.
- **AI Transcription & Extraction**: Processes the meeting audio URL via AssemblyAI to extract actionable intelligence, discussions, and developer action-items.

### 💳 Authentication & Billing Pipeline
- **Clerk Authentication**: Next.js middleware safely gates premium components, handling secure sign-ins, sign-ups, and user state mappings.
- **Stripe Webhooks**: Uses a credit-based billing model. Stripe securely processes payments, and a verified webhook (`/api/webhook/stripe`) securely increments the user's database credit balance.

---

## 3. Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Radix UI.
- **Backend Architecture**: Serverless Next.js API Routes, heavily coupled with **tRPC** for strictly-typed client-to-server data fetching.
- **Database**: **PostgreSQL** hosted on Neon.tech, using the **Prisma ORM**. Employs `pgvector` for embedding storage and similarity search.
- **External APIs**: OpenAI, Google Gemini, AssemblyAI, GitHub API, Stripe API, Clerk API, Cloudinary.

---

## 4. Known Limitations and Roadmap

The following areas have been identified as architectural bottlenecks and are slated for improvement:

### A. Move from Personal GitHub Tokens to a Native "GitHub App"
Currently, the platform relies on a manual `GITHUB_TOKEN`. This leads to `Request quota exhausted` errors from the GitHub API due to rigid hourly limits on personal tokens. Moving to an official GitHub App installation will provide significantly larger, dedicated server-to-server API rate limits.

### B. Implement Background Jobs for Audio Processing
When a user uploads a meeting, `processMeeting` currently fires off a standard HTTP API request. Serverless platforms have strict timeouts (e.g., 15-60 seconds on Vercel). Large audio files take minutes to transcribe, which can cause a `504 Gateway Timeout` error. This processing should be handed off to a background job queuing service (e.g., Inngest, Upstash QStash, or Trigger.dev).

### C. Serverless Database Connection Pooling
The application directly uses Prisma to connect to a Neon.tech Postgres DB. Under high concurrency in a serverless environment, this can exhaust the database max connection limit, resulting in `P1001` timeout errors. Wrapping the `DATABASE_URL` in Prisma Accelerate or using Neon's native PgBouncer connection pooling will resolve this.

### D. Multi-Provider AI Fallback (High Availability)
The application currently relies heavily on OpenAI. Wrapping the LLM invocations with a fallback mechanism to route prompts to Google Gemini in the event of a `429 Quota Exceeded` or `5xx` error from OpenAI will ensure higher availability and zero downtime for end users.
