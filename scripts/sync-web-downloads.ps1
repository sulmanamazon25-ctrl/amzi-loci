# Copy Windows installers from repo dist/ into apps/web/public/downloads/
#
#   cd "E:\amzi loci"
#   .\scripts\sync-web-downloads.ps1
#
# Source: dist/Amzi-Loci-<version>-*  (Tauri build output copied here)
# Target: apps/web/public/downloads/  (bundled into nginx on deploy)

param(
  [string]$Version = "0.11.0",
  [string]$SourceDir = "",
  [string]$TargetDir = ""
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
if (-not $SourceDir) { $SourceDir = Join-Path $RepoRoot "dist" }
if (-not $TargetDir) { $TargetDir = Join-Path $RepoRoot "apps\web\public\downloads" }

if (-not (Test-Path $SourceDir)) {
  throw "Source folder not found: $SourceDir. Run Tauri build and copy installers to dist/ first."
}

New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

$patterns = @(
  "Amzi-Loci-$Version-setup.exe",
  "Amzi-Loci-$Version.msi",
  "Amzi-Loci-$Version-portable.exe"
)

$copied = 0
foreach ($name in $patterns) {
  $src = Join-Path $SourceDir $name
  if (-not (Test-Path $src)) {
    Write-Host "  skip (missing) $name" -ForegroundColor DarkYellow
    continue
  }
  Copy-Item $src (Join-Path $TargetDir $name) -Force
  $sizeMb = [math]::Round((Get-Item $src).Length / 1MB, 1)
  Write-Host "  OK $name ($sizeMb MB)" -ForegroundColor Green
  $copied++
}

if ($copied -eq 0) {
  throw "No installers found in $SourceDir for v$Version"
}

Write-Host "Synced $copied installer(s) to $TargetDir" -ForegroundColor Cyan
