# QWE Community

A community reward platform where members complete tasks (Discord boosts, TikTok views, Instagram growth) and submit proof to earn digital gift card rewards.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/qwe-community run dev` — run the frontend (port 24783)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed-admin` — create/promote admin account
- `pnpm --filter @workspace/scripts run seed-rewards` — seed reward categories and entries
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (SESSION_SECRET env var) + OTP email verification
- Email: Nodemailer via Gmail SMTP
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/index.ts` — DB schema (users, categories, rewards, claims, claimMessages, tickets, messages, notifications, announcements)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for API)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/qwe-community/src/pages/` — React page components
- `artifacts/qwe-community/src/contexts/AuthContext.tsx` — auth state
- `scripts/src/seed-admin.ts` — admin seed script
- `deployment.env.template` — SMTP credentials template for GitHub/VPS deployments

## Architecture decisions

- SMTP credentials stored in `deployment.env.template` (not Replit secrets) so they survive git pushes to GitHub/VPS
- OTP verification uses InputOTP component (not letter-spaced Input) to fix mobile keyboard freeze bug
- JWT secret comes from `SESSION_SECRET` Replit env secret
- If SMTP env vars are missing, the server logs OTP to console (dev fallback) instead of emailing
- API server serves all routes under `/api` prefix; frontend at `/`

## Product

- Public: Browse rewards by category, view leaderboard, search
- Auth flow: Register → OTP email verification → Login
- Members: Submit claims with proof URL, track claim status, raise support tickets, view notifications
- Admin panel: Manage rewards/categories, review & approve/reject claims, manage tickets
- Stats dashboard on homepage shows live operative/reward/claim counts

## User preferences

- SMTP credentials go in `deployment.env.template` file, NOT Replit secrets (for GitHub/VPS portability)
- Admin account: gameransh2434@gmail.com / gameransh2434@gmail.com (role=admin, isVerified=true)

## Gotchas

- Run `pnpm install` after changing any `package.json` before running seed scripts
- `drizzle-orm` must be listed in `scripts/package.json` dependencies (not just devDependencies) for tsx to resolve it
- The `vite.config.ts` requires `PORT` env var; `BASE_PATH` defaults to `/` if not set
- API server must be restarted after route changes (it builds with esbuild on startup)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
