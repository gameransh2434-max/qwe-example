# QWE Community — Project Structure

## Overview

pnpm monorepo with a React+Vite frontend, Express 5 API server, and shared TypeScript libraries.

```
qwe-community/
├── artifacts/
│   ├── api-server/          ← Express 5 API + WebSocket server (Node.js)
│   └── qwe-community/       ← React + Vite frontend
├── lib/
│   ├── db/                  ← Drizzle ORM schema + PostgreSQL client
│   ├── api-spec/            ← OpenAPI 3.1 contract (source of truth)
│   ├── api-client-react/    ← Auto-generated React Query hooks (from OpenAPI)
│   └── api-zod/             ← Auto-generated Zod validation schemas (from OpenAPI)
├── scripts/
│   ├── src/seed-admin.ts    ← Creates/promotes admin account
│   └── src/seed-rewards.ts  ← Seeds 86 reward entries + categories
├── package.json             ← Root workspace orchestration
├── pnpm-workspace.yaml      ← Workspace + catalog dependency pins
├── tsconfig.json            ← Root TypeScript solution file (libs only)
├── tsconfig.base.json       ← Shared strict TypeScript defaults
├── .env.example             ← Environment variable template
├── DEPLOYMENT.md            ← Deployment guide
└── PROJECT_STRUCTURE.md     ← This file
```

---

## Important Files

### Backend (artifacts/api-server/)
| File | Purpose |
|---|---|
| `src/index.ts` | Entry point — creates HTTP + WebSocket server |
| `src/app.ts` | Express app, middleware (CORS, JSON, pino logging) |
| `src/routes/auth.ts` | Register, login, OTP verification, forgot password |
| `src/routes/rewards.ts` | Browse rewards, featured, by category |
| `src/routes/claims.ts` | Submit claims, upload proof, admin approve/reject |
| `src/routes/tickets.ts` | Support tickets + messages |
| `src/routes/stats.ts` | Homepage stats, leaderboard, search, user dashboard |
| `src/routes/admin.ts` | Admin-only: manage users, rewards, categories |
| `src/routes/notifications.ts` | User notifications |
| `src/routes/announcements.ts` | Community announcements |
| `src/middlewares/auth.ts` | JWT authentication middleware |
| `src/lib/logger.ts` | Pino structured logger |
| `build.mjs` | esbuild bundler script |

### Frontend (artifacts/qwe-community/)
| File | Purpose |
|---|---|
| `src/main.tsx` | React app entry point |
| `src/App.tsx` | Root component with providers |
| `src/AppRoutes.tsx` | Wouter client-side routing |
| `src/contexts/AuthContext.tsx` | JWT auth state, login/logout |
| `src/pages/Home.tsx` | Homepage — stats, featured rewards, world chat |
| `src/pages/RewardsList.tsx` | Browse all rewards with filters |
| `src/pages/RewardDetail.tsx` | Reward detail + claim submission form |
| `src/pages/ClaimsList.tsx` | User's claim history |
| `src/pages/ClaimDetail.tsx` | Claim detail + message thread |
| `src/pages/Dashboard.tsx` | User dashboard with stats |
| `src/pages/admin/` | Admin panel (claims, rewards, tickets, users) |
| `src/pages/Login.tsx` | Login page |
| `src/pages/Register.tsx` | Register + OTP verification flow |
| `src/components/WorldChat.tsx` | Live WebSocket world chat component |
| `vite.config.ts` | Vite config with OG URL injection |
| `index.html` | HTML entry with SEO/OG meta tags |

### Shared Libraries
| Package | Purpose |
|---|---|
| `lib/db/src/schema/index.ts` | All Drizzle table definitions |
| `lib/db/drizzle.config.ts` | Drizzle Kit migration config |
| `lib/api-spec/openapi.yaml` | OpenAPI contract |
| `lib/api-client-react/src/generated/` | Generated React Query hooks |
| `lib/api-zod/src/generated/` | Generated Zod schemas |

---

## Database Tables

| Table | Description |
|---|---|
| `users` | Members and admins with JWT auth |
| `categories` | Reward categories (Discord, TikTok, Instagram, etc.) |
| `rewards` | Reward definitions with requirements and values |
| `claims` | Member reward claims with proof and status |
| `claim_messages` | Message thread on each claim |
| `tickets` | Support tickets |
| `messages` | Support ticket messages |
| `notifications` | User notifications |
| `announcements` | Community announcements |
| `world_chat` | Live world chat messages |

---

## Entry Points

- **API Server:** `artifacts/api-server/src/index.ts`
- **Frontend:** `artifacts/qwe-community/src/main.tsx`
- **DB Schema:** `lib/db/src/schema/index.ts`
- **OpenAPI Spec:** `lib/api-spec/openapi.yaml`

---

## Commands

```bash
# Install dependencies
pnpm install

# Push DB schema (creates/updates tables)
pnpm --filter @workspace/db run push

# Seed admin account
pnpm --filter @workspace/scripts run seed-admin

# Seed rewards (86 entries)
pnpm --filter @workspace/scripts run seed-rewards

# Build API server
pnpm --filter @workspace/api-server run build

# Start API server (production)
pnpm --filter @workspace/api-server run start

# Run frontend dev server
pnpm --filter @workspace/qwe-community run dev

# Build frontend (static files → artifacts/qwe-community/dist/public/)
pnpm --filter @workspace/qwe-community run build

# Full typecheck
pnpm run typecheck

# Regenerate API hooks/schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

---

## Build Output

- **API Server:** `artifacts/api-server/dist/index.mjs` (esbuild CJS bundle ~2MB)
- **Frontend:** `artifacts/qwe-community/dist/public/` (static HTML/JS/CSS)

The API server must serve static frontend files in production (or use a reverse proxy like nginx/Caddy).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24, TypeScript 5.9 |
| Package manager | pnpm 10 (workspaces) |
| Frontend | React 19, Vite 7, Tailwind CSS 4, shadcn/ui, Wouter |
| API | Express 5 |
| Real-time | WebSocket (`ws` library) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (jsonwebtoken) + OTP email |
| Email | Nodemailer + Gmail SMTP |
| Validation | Zod v4, drizzle-zod |
| Build | esbuild (API), Vite (frontend) |
