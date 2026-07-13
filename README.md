# Amzi Loci

BYOK, local-first desktop app for turning Amazon reviews into listing assets (images, A+ content, ad creatives).

## Architecture

| Layer | Tech | Location |
|-------|------|----------|
| Desktop | Tauri 2 + React + TypeScript | Local machine |
| Server A | Fastify + TypeScript | `46.62.226.89` (Coolify) |
| Server B | Postgres 16 + Redis 7 | `194.9.62.143` (EURONODE Coolify) |

## Prerequisites

- Node.js 20+
- pnpm 9+
- Rust toolchain (`rustup`) + MSVC Build Tools (Windows)
- Docker (for local Postgres/Redis or Server B deployment)

## Quick start (local)

```powershell
cd "E:\amzi loci"

# Copy env and edit DATABASE_URL if needed
copy .env.example .env

# Start local Postgres + Redis (optional — or use Server B)
docker compose -f infra/server-b/docker-compose.yml up -d

# Install dependencies
pnpm install

# Run migrations
pnpm db:migrate

# Terminal 1 — API server
pnpm dev:server

# Terminal 2 — Desktop app
pnpm dev:desktop
```

Desktop shows **Connected** when Server A `/health` returns 200.

## Monorepo layout

```
apps/desktop/       Tauri + React wizard UI
apps/server-a/      Fastify API (proprietary prompts, AI proxy)
packages/database/  Prisma schema + migrations
packages/shared/    Shared TypeScript types
infra/server-b/     Postgres + Redis docker-compose
```

## Deployment

### Server B (194.9.62.143)

1. Coolify → New Resource → Docker Compose
2. Point at `infra/server-b/docker-compose.yml` in this repo
3. Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` in Coolify UI
4. Firewall: allow port 5432 from Server A IP (`46.62.226.89`) only

### Migrations

```powershell
# Against production Server B
$env:DATABASE_URL="postgresql://USER:PASS@194.9.62.143:5432/amzi_loci"
pnpm db:migrate:deploy
```

### Server A (46.62.226.89)

1. Coolify → New Application → Dockerfile
2. Base Directory: `/` (repo root)
3. Dockerfile: `apps/server-a/Dockerfile`
4. Port 3000, health check `/health`
4. Env vars: `DATABASE_URL`, `REDIS_URL`, `NODE_ENV=production`

### Desktop

Set `VITE_SERVER_A_URL` to your deployed Server A URL before building:

```powershell
pnpm --filter @amzi-loci/desktop build
pnpm --filter @amzi-loci/desktop tauri build
```

## Phase 0 verification

- [ ] `pnpm install` succeeds
- [ ] `pnpm db:migrate` runs clean
- [ ] `GET /health` returns 200 with `db: "connected"`
- [ ] Desktop shows Connected when Server A is up
- [ ] Desktop shows Disconnected when Server A is down
- [ ] No secrets committed to git

## License

Private — all rights reserved.
