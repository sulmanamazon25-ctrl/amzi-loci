# Amzi Loci - deploy to Coolify on Server A (46.62.226.89)
#
#   cd "E:\amzi loci"
#   .\scripts\deploy-coolify.ps1
#
# Requires COOLIFY_TOKEN in E:\Coolify-Projects\scripts\reallead-coolify-secrets.local
# or set $env:COOLIFY_TOKEN

param(
  [string]$CoolifyToken = $env:COOLIFY_TOKEN,
  [string]$CoolifyBase = "http://46.62.226.89:8000",
  [string]$GitHubUser = "sulmanamazon25-ctrl",
  [string]$RepoName = "amzi-loci",
  [string]$Domain = "https://amzi-loci.46-62-226-89.sslip.io",
  [string]$ServerUuid = "dg0st3di04w1ptwib9bwelk3",
  [string]$DestinationUuid = "sv4aopkvaj1vgbq2hallzujj",
  [string]$FallbackKeyUuid = "v13zd1kk6t47et8pxt0igqjn",
  [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$secretsFile = "E:\Coolify-Projects\scripts\reallead-coolify-secrets.local"
$idFile = Join-Path $PSScriptRoot "amzi-loci-coolify-id.local"

if (Test-Path $secretsFile) {
  Get-Content $secretsFile | ForEach-Object {
    if ($_ -match '^COOLIFY_TOKEN=(.+)$' -and -not $CoolifyToken) {
      $CoolifyToken = $matches[1].Trim()
    }
  }
}
if (-not $CoolifyToken) { throw "Set COOLIFY_TOKEN" }

$headers = @{
  Authorization  = "Bearer $CoolifyToken"
  Accept         = "application/json"
  "Content-Type" = "application/json"
}

function Invoke-Coolify {
  param([string]$Method, [string]$Path, [object]$Body = $null)
  $uri = "$CoolifyBase/api/v1$Path"
  if ($null -ne $Body) {
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body ($Body | ConvertTo-Json -Depth 12 -Compress) -TimeoutSec 300
  }
  return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -TimeoutSec 300
}

function Set-AppEnv {
  param([string]$AppUuid, [string]$Key, [string]$Value, [bool]$Buildtime = $false)
  $existing = @(Invoke-Coolify GET "/applications/$AppUuid/envs")
  $body = @{
    key          = $Key
    value        = [string]$Value
    is_literal   = $true
    is_preview   = $false
    is_buildtime = $Buildtime
    is_runtime   = $true
  }
  $ex = $existing | Where-Object { $_.key -eq $Key } | Select-Object -First 1
  if ($ex) { Invoke-Coolify PATCH "/applications/$AppUuid/envs" $body | Out-Null }
  else { Invoke-Coolify POST "/applications/$AppUuid/envs" $body | Out-Null }
  Write-Host "  OK $Key" -ForegroundColor Green
}

Write-Host "=== Amzi Loci - Coolify deploy ===" -ForegroundColor Cyan

# Project
$projects = Invoke-Coolify GET "/projects"
$project = $projects | Where-Object { $_.name -eq "amzi-loci" } | Select-Object -First 1
if (-not $project) {
  Write-Host "Creating project amzi-loci..." -ForegroundColor Yellow
  $project = Invoke-Coolify POST "/projects" @{
    name        = "amzi-loci"
    description = "BYOK Amazon listing asset generator - Phase 0"
  }
}
$projectUuid = $project.uuid
Write-Host "Project: $projectUuid"

$envs = Invoke-Coolify GET "/projects/$projectUuid/environments"
$environmentUuid = ($envs | Select-Object -First 1).uuid
if (-not $environmentUuid) { throw "No environment found" }
Write-Host "Environment: $environmentUuid"

# PostgreSQL
$dbPass = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
$databases = Invoke-Coolify GET "/databases?project_uuid=$projectUuid"
$db = $databases | Where-Object { $_.name -eq "amzi-loci-db" } | Select-Object -First 1
if (-not $db) {
  Write-Host "Creating PostgreSQL database..." -ForegroundColor Yellow
  $db = Invoke-Coolify POST "/databases/postgresql" @{
    server_uuid       = $ServerUuid
    project_uuid      = $projectUuid
    environment_uuid  = $environmentUuid
    environment_name  = "production"
    destination_uuid  = $DestinationUuid
    name              = "amzi-loci-db"
    postgres_user     = "amzi_loci"
    postgres_password = $dbPass
    postgres_db       = "amzi_loci"
    instant_deploy    = $true
    limits_memory     = "512M"
  }
  Start-Sleep -Seconds 15
} else {
  $dbPass = $null
}
$dbUuid = $db.uuid
$dbDetail = Invoke-Coolify GET "/databases/$dbUuid"
$databaseUrl = $dbDetail.internal_db_url
if (-not $databaseUrl -and $dbPass) {
  $encPass = [uri]::EscapeDataString($dbPass)
  $databaseUrl = "postgresql://amzi_loci:${encPass}@${dbUuid}:5432/amzi_loci"
}
if (-not $databaseUrl) { throw "Could not resolve DATABASE_URL" }
Write-Host "Database: $dbUuid"

# Deploy key
$keyName = "amzi-loci-deploy"
$keys = Invoke-Coolify GET "/security/keys"
$key = $keys | Where-Object { $_.name -eq $keyName } | Select-Object -First 1
if (-not $key) {
  try {
    $key = Invoke-Coolify POST "/security/keys" @{
      name        = $keyName
      description = "GitHub deploy key for amzi-loci"
    }
  } catch {
    Write-Host "Using fallback deploy key" -ForegroundColor DarkYellow
    $key = $keys | Where-Object { $_.uuid -eq $FallbackKeyUuid } | Select-Object -First 1
  }
}
$keyUuid = $key.uuid
Write-Host "Deploy key: $keyUuid"

# Application
$gitRepo = "git@github.com:${GitHubUser}/${RepoName}.git"
$apps = Invoke-Coolify GET "/applications?project_uuid=$projectUuid"
$app = $apps | Where-Object { $_.name -eq "amzi-loci-api" } | Select-Object -First 1
if (-not $app) {
  Write-Host "Creating application amzi-loci-api..." -ForegroundColor Yellow
  $app = Invoke-Coolify POST "/applications/private-deploy-key" @{
    project_uuid         = $projectUuid
    server_uuid          = $ServerUuid
    environment_name     = "production"
    environment_uuid     = $environmentUuid
    destination_uuid     = $DestinationUuid
    private_key_uuid     = $keyUuid
    git_repository       = $gitRepo
    git_branch           = "main"
    build_pack           = "dockerfile"
    dockerfile_location  = "/apps/server-a/Dockerfile"
    base_directory       = "/"
    ports_exposes        = "3000"
    name                 = "amzi-loci-api"
    health_check_enabled = $true
    health_check_path    = "/health"
    health_check_port    = "3000"
    limits_memory        = "512M"
    limits_cpus          = "1"
  }
}
$appUuid = $app.uuid
Write-Host "Application: $appUuid"

Set-AppEnv $appUuid "DATABASE_URL" $databaseUrl
Set-AppEnv $appUuid "NODE_ENV" "production"
Set-AppEnv $appUuid "PORT" "3000"
Set-AppEnv $appUuid "REDIS_URL" "redis://localhost:6379"

try {
  Invoke-Coolify PATCH "/applications/$appUuid" @{ domains = $Domain } | Out-Null
  Write-Host "Domain: $Domain" -ForegroundColor Green
} catch {
  Write-Host "Domain patch: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

@(
  "PROJECT_UUID=$projectUuid"
  "ENVIRONMENT_UUID=$environmentUuid"
  "APP_UUID=$appUuid"
  "DB_UUID=$dbUuid"
  "DOMAIN=$Domain"
) | Set-Content $idFile -Encoding utf8

if (-not $SkipDeploy) {
  Write-Host "Starting deploy (may take 5-10 min)..." -ForegroundColor Cyan
  Invoke-RestMethod -Method GET -Uri "$CoolifyBase/api/v1/deploy?uuid=$appUuid&force=true" -Headers $headers -TimeoutSec 120 | Out-Null
  Write-Host "Deploy queued." -ForegroundColor Green
}

Write-Host ""
Write-Host "========== Amzi Loci deployed ==========" -ForegroundColor Green
Write-Host "Coolify UI: $CoolifyBase/project/$projectUuid"
Write-Host "Health:     $Domain/health"
Write-Host "API root:   $Domain/"
Write-Host ""
Write-Host "GitHub deploy key (add to repo if not already):" -ForegroundColor Yellow
Write-Host $key.public_key
Write-Host ""
Write-Host "Desktop .env:" -ForegroundColor Cyan
Write-Host "VITE_SERVER_A_URL=$Domain"
