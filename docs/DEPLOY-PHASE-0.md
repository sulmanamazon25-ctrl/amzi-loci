# Amzi Loci â€” Phase 0 Deployment Guide

Deploy in this order: **Server B â†’ migrations â†’ Server A â†’ desktop config**.

## 1. Server B â€” Postgres + Redis (194.9.62.143)

1. Push this repo to GitHub
2. Open Coolify on EURONODE: `http://194.9.62.143:8000`
3. **+ New Resource** â†’ **Docker Compose**
4. Connect GitHub repo, set **Base Directory** to `infra/server-b`
5. Set environment variables in Coolify UI:
   - `POSTGRES_USER=amzi_loci`
   - `POSTGRES_PASSWORD=<strong-password>`
   - `POSTGRES_DB=amzi_loci`
6. Deploy and verify both services are healthy
7. **Firewall**: allow TCP 5432 from Server A IP (`46.62.226.89`) only

## 2. Run migrations

From your local machine (with network access to Server B):

```powershell
cd "E:\amzi loci"
$env:DATABASE_URL="postgresql://amzi_loci:<password>@194.9.62.143:5432/amzi_loci"
pnpm db:migrate:deploy
```

## 3. Server A â€” Fastify API (46.62.226.89)

1. Open Coolify: `http://46.62.226.89:8000`
2. **+ New Resource** â†’ **Application** â†’ Dockerfile
3. Connect same GitHub repo
4. Settings:
   - **Base Directory**: `/` (repo root â€” Dockerfile needs monorepo context)
   - **Dockerfile**: `apps/server-a/Dockerfile`
   - **Port**: 3000
   - **Health Check**: `/health`
5. Environment variables:
   - `DATABASE_URL=postgresql://amzi_loci:<password>@194.9.62.143:5432/amzi_loci`
   - `REDIS_URL=redis://194.9.62.143:6379` (or internal hostname)
   - `NODE_ENV=production`
6. Add domain or use assigned port
7. Deploy

Verify:
```powershell
curl https://your-api-domain/health
# Expect: { "status": "ok", "db": "connected", ... }
```

## 4. Desktop â€” point at deployed API

Create `apps/desktop/.env`:
```
VITE_SERVER_A_URL=https://your-api-domain
```

Build:
```powershell
pnpm --filter @amzi-loci/desktop tauri build
```

## Local pre-deploy check

```powershell
.\scripts\verify-phase0.ps1
```

## Phase 0 checklist

- [x] `pnpm install` succeeds
- [ ] `pnpm db:migrate:deploy` against Server B
- [x] `GET /health` returns 200 with `db: "connected"` (verified 2026-07-13: production sslip.io)
- [ ] Desktop shows Connected when Server A is up
- [ ] Desktop shows Disconnected when Server A is stopped
- [x] No secrets in git

## Phase 0 verification log

- **2026-07-13**: pnpm install, db:generate, server-a/desktop builds OK; production /health 200 db: connected; GET / 200 (API v0.8.0). Local Docker Postgres unavailable (engine error); local db:migrate:deploy not run.
