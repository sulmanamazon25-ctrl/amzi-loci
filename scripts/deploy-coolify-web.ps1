# Amzi Loci - deploy marketing web to Coolify (project cbiq740v91cgf4zce6rg88nn)
#
#   cd "E:\amzi loci"
#   .\scripts\deploy-coolify-web.ps1
#
# Requires COOLIFY_TOKEN in E:\Coolify-Projects\scripts\reallead-coolify-secrets.local
# or set $env:COOLIFY_TOKEN

param(
  [string]$CoolifyToken = $env:COOLIFY_TOKEN,
  [string]$CoolifyBase = "http://46.62.226.89:8000",
  [string]$GitHubUser = "sulmanamazon25-ctrl",
  [string]$RepoName = "amzi-loci",
  [string]$ProjectUuid = "cbiq740v91cgf4zce6rg88nn",
  [string]$EnvironmentUuid = "v7oq5j7u9opr40zm6ywz8bsa",
  [string]$ServerUuid = "dg0st3di04w1ptwib9bwelk3",
  [string]$DestinationUuid = "sv4aopkvaj1vgbq2hallzujj",
  [string]$FallbackKeyUuid = "v13zd1kk6t47et8pxt0igqjn",
  [string]$Domain = "https://amzi-loci.46-62-226-89.sslip.io",
  [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$secretsFile = "E:\Coolify-Projects\scripts\reallead-coolify-secrets.local"
$idFile = Join-Path $PSScriptRoot "amzi-loci-web-coolify-id.local"
$docsFile = Join-Path $RepoRoot "docs\DEPLOY-WEB.md"

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

Write-Host "=== Amzi Loci Web - Coolify deploy ===" -ForegroundColor Cyan
Write-Host "Project:     $ProjectUuid"
Write-Host "Environment: $EnvironmentUuid"

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
$apps = Invoke-Coolify GET "/applications?project_uuid=$ProjectUuid"
$app = $apps | Where-Object { $_.name -eq "amzi-loci-web" } | Select-Object -First 1
if (-not $app) {
  Write-Host "Creating application amzi-loci-web..." -ForegroundColor Yellow
  $app = Invoke-Coolify POST "/applications/private-deploy-key" @{
    project_uuid         = $ProjectUuid
    server_uuid          = $ServerUuid
    environment_name     = "production"
    environment_uuid     = $EnvironmentUuid
    destination_uuid     = $DestinationUuid
    private_key_uuid     = $keyUuid
    git_repository       = $gitRepo
    git_branch           = "main"
    build_pack           = "dockerfile"
    dockerfile_location  = "/apps/web/Dockerfile"
    base_directory       = "/"
    ports_exposes        = "80"
    name                 = "amzi-loci-web"
    health_check_enabled = $true
    health_check_path    = "/"
    health_check_port    = "80"
    limits_memory        = "256M"
    limits_cpus          = "0.5"
  }
} else {
  Write-Host "Updating application amzi-loci-web..." -ForegroundColor Yellow
  try {
    Invoke-Coolify PATCH "/applications/$($app.uuid)" @{
      dockerfile_location = "/apps/web/Dockerfile"
      base_directory    = "/"
      ports_exposes     = "80"
      git_branch        = "main"
    } | Out-Null
  } catch {
    Write-Host "Patch note: $($_.Exception.Message)" -ForegroundColor DarkYellow
  }
}
$appUuid = $app.uuid
Write-Host "Application: $appUuid"

try {
  Invoke-Coolify PATCH "/applications/$appUuid" @{ domains = $Domain } | Out-Null
  Write-Host "Domain: $Domain" -ForegroundColor Green
} catch {
  Write-Host "Domain patch: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# Marketing site owns amzi-loci.* — move API app to its production sslip.io hostname
$apiAppUuid = "bn24wqvv523uscic52mscga6"
$apiDomain = "https://iz1yfanbxaefgipk6e1k3o20.46-62-226-89.sslip.io"
try {
  Invoke-Coolify PATCH "/applications/$apiAppUuid" @{ domains = $apiDomain } | Out-Null
  Write-Host "API domain: $apiDomain (freed amzi-loci for web)" -ForegroundColor DarkGray
} catch {
  Write-Host "API domain patch: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

$domain = $Domain

# Fetch assigned domain (Coolify sslip.io)
$appDetail = Invoke-Coolify GET "/applications/$appUuid"
if ($appDetail.fqdn) {
  $assigned = ($appDetail.fqdn -split ',')[0].Trim()
  if ($assigned -and -not $assigned.StartsWith("http")) { $assigned = "https://$assigned" }
  Write-Host "Coolify fqdn: $assigned" -ForegroundColor DarkGray
}

@(
  "PROJECT_UUID=$ProjectUuid"
  "ENVIRONMENT_UUID=$EnvironmentUuid"
  "APP_UUID=$appUuid"
  "DOMAIN=$domain"
) | Set-Content $idFile -Encoding utf8

if (-not $SkipDeploy) {
  Write-Host "Starting deploy (may take 3-8 min)..." -ForegroundColor Cyan
  $deployUri = ('{0}/api/v1/deploy?uuid={1}&force=true' -f $CoolifyBase, $appUuid)
  Invoke-RestMethod -Method GET -Uri $deployUri -Headers $headers -TimeoutSec 120 | Out-Null
  Write-Host "Deploy queued." -ForegroundColor Green
}

# Update docs with domain if known
if ($domain -and (Test-Path $docsFile)) {
  $doc = Get-Content $docsFile -Raw
  $replacement = "**Assigned domain:** $domain"
  $doc = $doc -replace '\*\*Assigned domain:\*\*[^\r\n]*', $replacement
  Set-Content $docsFile $doc -Encoding utf8 -NoNewline
}

Write-Host ""
Write-Host "========== Amzi Loci Web deployed ==========" -ForegroundColor Green
Write-Host "Coolify UI: $CoolifyBase/project/$ProjectUuid/environment/$EnvironmentUuid"
if ($domain) {
  Write-Host "Site:       $domain/"
  Write-Host "Pricing:    $domain/pricing"
}
Write-Host "IDs saved:  $idFile"
Write-Host ""
Write-Host "Ensure apps/web is pushed to GitHub main before deploy completes." -ForegroundColor Yellow
