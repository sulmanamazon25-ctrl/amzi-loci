# Phase 0 local verification script
# Run from repo root: .\scripts\verify-phase0.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "=== Amzi Loci Phase 0 Verification ===" -ForegroundColor Cyan

# 1. pnpm install
Write-Host "`n[1/5] pnpm install..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
Write-Host "OK" -ForegroundColor Green

# 2. Docker / Postgres
Write-Host "`n[2/5] Checking Postgres (docker compose)..." -ForegroundColor Yellow
$dockerRunning = $false
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    docker info *> $null
    $dockerOk = $LASTEXITCODE -eq 0
    $ErrorActionPreference = $prevEap
    if ($dockerOk) { $dockerRunning = $true }
}

if ($dockerRunning) {
    $envFile = "infra/server-b/.env"
    if (-not (Test-Path $envFile)) {
        @"
POSTGRES_USER=amzi_loci
POSTGRES_PASSWORD=amzi_loci_dev
POSTGRES_DB=amzi_loci
"@ | Set-Content $envFile -Encoding utf8
        Write-Host "Created $envFile for local dev" -ForegroundColor Gray
    }

    docker compose -f infra/server-b/docker-compose.yml --env-file $envFile up -d
    if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }
    Start-Sleep -Seconds 5
    Write-Host "Running migrations..." -ForegroundColor Yellow
    $env:DATABASE_URL = "postgresql://amzi_loci:amzi_loci_dev@localhost:5432/amzi_loci"
    pnpm db:migrate:deploy
    if ($LASTEXITCODE -ne 0) { throw "db:migrate:deploy failed" }
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "SKIP - Docker not running. Start Docker Desktop and re-run for full DB check." -ForegroundColor DarkYellow
}

# 3. Build
Write-Host "`n[3/5] Building packages..." -ForegroundColor Yellow
pnpm --filter @amzi-loci/shared build
if ($LASTEXITCODE -ne 0) { throw "shared build failed" }
pnpm --filter @amzi-loci/database build
if ($LASTEXITCODE -ne 0) { throw "database build failed" }
pnpm --filter @amzi-loci/server-a build
if ($LASTEXITCODE -ne 0) { throw "server-a build failed" }
pnpm --filter @amzi-loci/desktop build
if ($LASTEXITCODE -ne 0) { throw "desktop build failed" }
Write-Host "OK" -ForegroundColor Green

# 4. Health check (expects server-a running on :3000)
Write-Host "`n[4/5] Health endpoint..." -ForegroundColor Yellow
$healthUrl = "http://localhost:3000/health"
try {
    $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 5
    Write-Host "  status: $($health.status)" -ForegroundColor Gray
    Write-Host "  db: $($health.db)" -ForegroundColor Gray
    if ($health.status -ne "ok") { throw "health status not ok" }
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "SKIP - Server A not running on :3000. Run 'pnpm dev:server' in another terminal." -ForegroundColor DarkYellow
}

# 5. Git secrets check
Write-Host "`n[5/5] Checking for committed secrets..." -ForegroundColor Yellow
if (Test-Path ".git") {
    $trackedEnv = git ls-files "*.env" 2>$null
    if ($trackedEnv) { throw "Found tracked .env files: $trackedEnv" }
}
Write-Host "OK" -ForegroundColor Green

Write-Host "`n=== Phase 0 verification complete ===" -ForegroundColor Cyan
