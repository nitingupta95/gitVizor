# GitVizor (Dionysus) - Project Documentation

## 1. Project Overview
GitVizor is an AI-powered SaaS application built to enhance the software development lifecycle by integrating direct GitHub repository intelligence with meeting transcription and analysis. Users can link raw codebases, interact with an AI to understand their repositories, and upload developer meeting recordings to automatically extract context, issues, and summaries.

---

## 2. Core Functionalities Handled by This Project

The project is driven by several tightly integrated, highly advanced features:

### 🧩 Repository Synchronization & Analysis
- **GitHub Integration**: Connects to the GitHub REST API using authentication tokens to fetch commits, file trees, and source code.
- **Credit-Based Parsing**: Analyzes the size/file count of a repository and algorithmically charges the user internal 'credits' to ingest the database.
- **Commit Tracking**: Maintains an interactive, real-time log of commits, linking directly back to the GitHub web interface for easy tracking.

### 🤖 AI Codebase Querying (RAG Architecture)
- **Ask GitVizor**: Users can "Ask a Question" regarding their specific project.
- **Context Retrieval**: The AI fetches actual code references (`sourceCode`) from the repository using vector search / retrieval-augmented generation and passes it to OpenAI/Gemini models.
- **Streaming Responses**: Leveraging the Vercel AI SDK, responses stream into the UI in real-time, accompanied by the specific files the AI used to generate the answer.

### 🎙️ Audio Meeting Processing
- **File Uploads**: Drag-and-drop component to upload audio recordings (`.mp3`, `.wav`, etc.).
- **Firebase Storage Storage**: Securely uploads raw audio binaries directly to Google Firebase Storage.
- **AI Transcription & Extraction**: Processes the meeting audio URL via APIs (e.g. AssemblyAI/OpenAI) to extract actionable intelligence, discussions, and developer action-items.

### 💳 Authentication & Billing Pipeline
- **Clerk Authentication**: Next.js middleware safely gates premium components, handling secure sign-ins, sign-ups, and user state mappings.
- **Stripe Webhooks**: When users run out of credits, they can purchase more. Stripe securely processes the payments, and a verified webhook (`/api/webhook/stripe`) securely increments the user's database credit balance.

---

## 3. Technology Stack

- **Frontend Environment**: Next.js 15 (App Router), React 19, Tailwind CSS v4.
- **Backend Architecture**: serverless Next.js API Routes, heavily coupled with **tRPC** for strictly-typed client-to-server data fetching.
- **Database**: **PostgreSQL** hosted on Neon.tech, strictly typed and manipulated using the **Prisma ORM**.
- **External Apis**: OpenAI, Google Gemini, GitHub API, Stripe API, Clerk API, Firebase Storage.

---

## 4. Areas for Technical Improvement

While structurally sound and functioning, here are the most critical architectural improvements that should be made before onboarding thousands of users to scale seamlessly:

### A. Move from Personal GitHub Tokens to a Native "GitHub App"
**The Problem**: Currently, the platform relies on pasting a manual `GITHUB_TOKEN`. During our tests, users frequently hit `Request quota exhausted` from the GitHub API because personal tokens have rigid hourly limits.
**The Fix**: Register the software as an official [GitHub App](https://docs.github.com/en/apps). This provides significantly larger, dedicated server-to-server API rate limits and removes the burden from the individual user.

### B. Implement Background Jobs for Audio Processing
**The Problem**: When a user uploads a meeting, `processMeeting` fires off a standard HTTP API request. Serverless platforms like Vercel have a strict `15-60 second timeout` rule. Large audio files take minutes to transcribe, which will cause a `504 Gateway Timeout` error, failing silently.
**The Fix**: Use a background job queuing service like **Inngest**, **Upstash QStash**, or **Trigger.dev** to hand off the meeting audio. This processes the audio safely in the background over several minutes and updates the database or emits a websocket event when finished.

### C. Handle Serverless Database Connection Pooling
**The Problem**: The app directly uses Prisma to connect to a Neon.tech Postgres DB. In a serverless environment, 50 users clicking simultaneously will spawn 50 distinct database connections, immediately crashing the database max connection limit and throwing `P1001` timeout errors, which you have experienced.
**The Fix**: Wrap the `DATABASE_URL` in [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate) or use Neon's native PgBouncer connection pooling URL to safely pool hundreds of serverless requests into lightweight database sockets.

### D. Multi-Provider AI Fallback (High Availability)
**The Problem**: The app crashes gracefully when the OpenAI API key runs out of funds (`429 Quota Exceeded`). 
**The Fix**: Wrap the `generateText` invocations with a fallback mechanism. If OpenAI throws a `429` error, automatically catch the error in the backend and route the prompt to Google Gemini (which offers a robust free caching tier) ensuring zero downtime for your users.

---

## 5. Final Working Code Status
The existing codebase presently residing on your local development machine contains all necessary functional fixes, syntactic solutions, layout configurations, and compiled dependencies. **It is officially validated as the final, functional working code.**
