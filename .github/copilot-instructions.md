# Project Guidelines

## Source Of Truth
- Prefer current implementation files over stale prose docs.
- Use `package.json` scripts as the canonical command list.
- Use `PROJECT_DOCS.md` for architecture context and scaling risks.
- Treat `README.md` as onboarding-only: parts of its stack description are outdated (for example MongoDB/Express/Vite references do not match the current Next.js + tRPC + Prisma codebase).

## Build And Test
- Install: `pnpm install`
- Run dev server: `pnpm dev`
- Run lint + typecheck before finishing non-trivial changes: `pnpm check`
- Individual checks: `pnpm lint`, `pnpm typecheck`, `pnpm format:check`
- Prisma workflows: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push`, `pnpm db:studio`
- Local Postgres helper: `./start-database.sh` (reads `DATABASE_URL` from `.env`)
- There is no configured test script in `package.json`; do not assume `pnpm test` exists.

## Architecture
- App framework: Next.js App Router under `src/app` with protected routes in `src/app/(protected)`.
- API boundary: tRPC routers under `src/server/api`, exposed via `src/app/api/trpc/[trpc]`.
- Auth: Clerk middleware in `src/middleware.ts` and auth checks in tRPC middleware (`protectedprocedure`).
- Data layer: Prisma client singleton in `src/server/db.ts`, schema in `prisma/schema.prisma`.
- AI and ingestion integrations live in `src/lib` (GitHub ingestion, embeddings, Gemini/OpenAI helpers, Stripe/Firebase integrations).

## Conventions
- Use TypeScript path aliases already configured in `tsconfig.json`: `@/*` and `~/*`.
- Keep auth-gated logic in protected tRPC procedures; avoid duplicating auth checks in UI components when server checks already enforce access.
- For new public endpoints, update Clerk public route matching in `src/middleware.ts` when needed.
- Reuse existing UI primitives from `src/components/ui` and existing hooks under `src/hooks` before creating parallel abstractions.
- Preserve current naming and exports unless doing an intentional refactor (for example `protectedprocedure` is currently the shared protected tRPC primitive).

## Known Pitfalls
- `next.config.mjs` currently ignores ESLint and TypeScript build errors during build; run `pnpm check` explicitly when validating changes.
- Long-running meeting/audio processing can exceed serverless time limits; avoid adding more synchronous heavy work to request handlers.
- GitHub API and AI provider quotas can fail at runtime; keep fallbacks and error handling in mind when changing ingestion or generation flows.

## Docs To Link Instead Of Duplicating
- `README.md`: setup and onboarding basics.
- `PROJECT_DOCS.md`: product capabilities, architecture notes, and scaling recommendations.
