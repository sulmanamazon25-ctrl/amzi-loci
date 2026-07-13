# Amzi Loci — Phase 0 Deployment Guide

Deploy in this order: **Server B → migrations → Server A → desktop config**.

## 1. Server B — Postgres + Redis (194.9.62.143)

1. Push this repo to GitHub
2. Open Coolify on EURONODE: `http://194.9.62.143:8000`
3. **+ New Resource** → **Docker Compose**
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

## 3. Server A — Fastify API (46.62.226.89)

1. Open Coolify: `http://46.62.226.89:8000`
2. **+ New Resource** → **Application** → Dockerfile
3. Connect same GitHub repo
4. Settings:
   - **Base Directory**: `/` (repo root — Dockerfile needs monorepo context)
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

## 4. Desktop — point at deployed API

Create `apps/desktop/.env`:
```
VITE_SERVER_A_URL=https://your-api-domain
```

Build:
```powershell
pnpm --filter @amzi-loci/desktop tauri build
```

## Phase 0 checklist

- [ ] `pnpm install` succeeds
- [ ] `pnpm db:migrate:deploy` against Server B
- [ ] `GET /health` returns 200 with `db: "connected"`
- [ ] Desktop shows Connected when Server A is up
- [ ] Desktop shows Disconnected when Server A is stopped
- [ ] No secrets in git
