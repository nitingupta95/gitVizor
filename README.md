# GitVizor

[![CI](https://github.com/nitingupta95/gitvizor/actions/workflows/ci.yml/badge.svg)](https://github.com/nitingupta95/gitvizor/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> An AI-powered SaaS application that bridges the gap between raw GitHub repository data and developer meetings via RAG codebase Q&A and audio transcription analysis.

## 🧩 Project Overview
GitVizor is a full-stack, production-ready SaaS designed to handle user authentication, credit-based subscription management, and repository intelligence.
It allows users to ingest GitHub repositories to ask contextual questions about their codebase and upload developer meetings to automatically extract action items and summaries.

## 🚀 Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend Architecture**: Next.js Serverless API Routes + tRPC
- **Database**: PostgreSQL (Neon.tech) with Prisma ORM & `pgvector`
- **Auth & Security**: Clerk
- **AI Integration**: OpenAI, Google Gemini, AssemblyAI, Vercel AI SDK
- **Billing**: Stripe API & Webhooks
- **Storage**: Cloudinary / Firebase

## 📦 Features
- ✅ Multi‑tenant architecture with Clerk Auth
- ✅ Credit-based billing and Stripe subscription management
- ✅ GitHub Repository Ingestion & real-time commit tracking
- ✅ RAG-powered Codebase Q&A (Ask GitVizor)
- ✅ Developer meeting audio upload and AI extraction
- ✅ Streaming AI responses with exact source-code file references

## 🛠️ Architecture

```mermaid
graph TD
    Client[Client Browser] -->|Uploads Meeting Audio| Storage[Cloudinary / Firebase]
    Client -->|Links GitHub Repo| API[Next.js API Routes / tRPC]
    
    API -->|Fetches Repo Tree| GitHub[GitHub API]
    GitHub --> API
    
    API -->|Generates Embeddings| OpenAI[OpenAI / Gemini Embeddings]
    OpenAI --> DB[(PostgreSQL / pgvector)]
    
    Storage -->|Transcribes Audio| AssemblyAI[AssemblyAI]
    AssemblyAI --> DB
    
    Client -->|Ask Code Question| API
    API -->|Vector Search Context| DB
    DB --> API
    API -->|Streams RAG Response| AI[Vercel AI SDK / LLMs]
    AI -.->|Response Stream| Client
```

## 🚀 Getting Started

### Prerequisites
- Node.js (>=18)
- pnpm (recommended for this workspace)
- PostgreSQL database (e.g., Neon.tech) with `pgvector` extension
- API Keys for Clerk, Stripe, GitHub, OpenAI, Gemini, AssemblyAI, and Cloudinary

### Installation
```bash
git clone https://github.com/nitingupta95/gitvizor.git
cd gitvizor
pnpm install
```

### Configuration
Copy the following into your `.env` file and update with your respective keys:

```env
# Database (PostgreSQL with pgvector)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL='/sync-user'

# AI & APIs
GITHUB_TOKEN=your-github-personal-access-token
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ASSEMBLYAI_API_KEY=your-assemblyai-key

# Stripe Billing
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_API_VERSION=2024-06-20

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup
Run migrations and generate the Prisma client:
```bash
pnpm db:generate
pnpm db:push
```

### Run Locally
```bash
pnpm dev
```  
App will be available at `http://localhost:3000`.

### Build for Production
```bash
pnpm build
pnpm start
```

## 🗺️ Known Limitations / Roadmap
As the platform scales to more users, the following structural improvements are prioritized:
- **GitHub Apps Integration**: Migrating from manual Personal Access Tokens (PATs) to a dedicated GitHub App to avoid hourly API rate limit exhaustion.
- **Background Job Queue**: Offloading audio transcription and heavy repo-parsing tasks to a background job queue (e.g. Inngest / Trigger.dev) to prevent serverless `504 Gateway Timeouts`.
- **Database Connection Pooling**: Implementing native PgBouncer or Prisma Accelerate to handle serverless database connection spikes effectively.
- **Multi-Provider AI Fallback**: Wrapping LLM invocations with graceful degradation, automatically falling back from OpenAI to Google Gemini if rate limits (`429`) are hit.

## 🧑‍💻 Contributing
Contributions are always welcome!
1. Fork the repository
2. Create a branch (`git checkout -b feature/YourFeature`)
3. Commit your changes
4. Push to your fork
5. Open a Pull Request

## 📄 License
Licensed under the [MIT License](LICENSE).

---
Made with ❤️ by [Nitin Gupta](https://github.com/nitingupta95)
