# Amzi Loci - Marketing Website (Coolify)

Deploy the static marketing site (`apps/web`) to Coolify on Server A as a separate application from the API.

## Coolify project

| Setting | Value |
|---------|-------|
| UI | `http://46.62.226.89:8000/project/cbiq740v91cgf4zce6rg88nn/environment/v7oq5j7u9opr40zm6ywz8bsa` |
| Project UUID | `cbiq740v91cgf4zce6rg88nn` |
| Environment UUID | `v7oq5j7u9opr40zm6ywz8bsa` |
| App name | `amzi-loci-web` |
| Dockerfile | `/apps/web/Dockerfile` |
| Port | `80` |
| Health check | `GET /` -> 200 |

Production API (unchanged): `https://iz1yfanbxaefgipk6e1k3o20.46-62-226-89.sslip.io`

## Custom domain (Hostinger)

Point **amziloci.com** at Coolify on Server A (`46.62.226.89`).

### Hostinger DNS records

In Hostinger: **Domains → amziloci.com → DNS / DNS Zone**.

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| **A** | `@` | `46.62.226.89` | 3600 (or default) |
| **A** | `www` | `46.62.226.89` | 3600 |

Remove any conflicting Hostinger parking page or default `A`/`CNAME` records first.

DNS can take 5–60 minutes to propagate. Coolify issues Let's Encrypt HTTPS once DNS resolves.

### Coolify

After DNS is set, register the domain on the app:

```powershell
cd "E:\amzi loci"
.\scripts\deploy-coolify-web.ps1 -SkipDeploy
```

Default domains: `https://amziloci.com`, `https://www.amziloci.com`

Fallback (still works): `https://amzi-loci.46-62-226-89.sslip.io`

## Public URL

**Primary:** `https://amziloci.com`

**Assigned domain (Coolify):** `https://amziloci.com`, `https://www.amziloci.com`

## Prerequisites

1. Push `apps/web` and root monorepo changes to GitHub (`main` branch).
2. `COOLIFY_TOKEN` in `E:\Coolify-Projects\scripts\reallead-coolify-secrets.local` or `$env:COOLIFY_TOKEN`.
3. Optional: copy Windows installers into `apps/web/public/downloads/` before deploy:
   - `Amzi-Loci-0.11.0-setup.exe`
   - `Amzi-Loci-0.11.0.msi`
   - `Amzi-Loci-0.11.0-portable.exe`

## Deploy

```powershell
cd "E:\amzi loci"
.\scripts\deploy-coolify-web.ps1
```

Skip the build queue (configure only):

```powershell
.\scripts\deploy-coolify-web.ps1 -SkipDeploy
```

## Local build

```powershell
pnpm install
pnpm build:web
pnpm dev:web   # http://localhost:5174
```

## Verification checklist

- [ ] `pnpm --filter @amzi-loci/web build` passes
- [ ] All routes render locally: `/`, `/features`, `/pricing`, `/download`, `/for-agencies`, `/faq`, `/about`, `/contact`, `/privacy`, `/terms`, `/changelog`
- [ ] Pricing matches `LICENSE_PLANS` in `packages/shared/src/license.ts`
- [ ] Download page shows v0.11.0 + Windows requirements
- [ ] Coolify deploy succeeds on project `cbiq740v91cgf4zce6rg88nn`
- [ ] Public URL loads Home, Features, Pricing, Privacy, Terms
- [ ] Footer API status link returns OK: `https://iz1yfanbxaefgipk6e1k3o20.46-62-226-89.sslip.io/health`

## Environment variables (optional)

Set in Coolify if you host installers elsewhere:

| Key | Purpose |
|-----|---------|
| `VITE_DOWNLOAD_BASE_URL` | Base URL for download links (build-time) |

Default: relative `/downloads/` paths in the built SPA.

## Architecture

```
Visitor â†’ amzi-loci-web (nginx static SPA)
Desktop app â†’ amzi-loci-api (existing production API)
Marketing CTAs â†’ /download (installers)
```
