# ╔══════════════════════════════════════════════════════════════╗
# ║  JobFlow — Bootstrap Start Script                           ║
# ║  Starts all services needed for local development           ║
# ║                                                             ║
# ║  Usage:  .\start.ps1              → Start dev server        ║
# ║          .\start.ps1 -Preview     → Start preview server    ║
# ║          .\start.ps1 -Build       → Build + Deploy          ║
# ╚══════════════════════════════════════════════════════════════╝

param(
    [switch]$Preview,
    [switch]$Build
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$PidFile = Join-Path $ProjectRoot ".jobflow-pids"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor DarkCyan
Write-Host "  ║  🚀 JobFlow — Executive Career Tracker       ║" -ForegroundColor DarkCyan
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor DarkCyan
Write-Host ""

# ─── Pre-flight checks ───
Write-Host "  [1/4] Pre-flight checks..." -ForegroundColor DarkGray

if (-Not (Test-Path (Join-Path $ProjectRoot "node_modules"))) {
    Write-Host "  ⚠  node_modules not found — installing dependencies..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    npm install
    Pop-Location
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✅ Dependencies OK" -ForegroundColor Green
}

if (-Not (Test-Path (Join-Path $ProjectRoot ".env.local"))) {
    Write-Host "  ⚠  .env.local not found — Firebase credentials may be missing!" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Environment variables loaded (.env.local)" -ForegroundColor Green
}

# ─── Clean up any stale PID file ───
if (Test-Path $PidFile) {
    Write-Host "  ⚠  Stale PID file found — cleaning up previous session..." -ForegroundColor Yellow
    & (Join-Path $ProjectRoot "stop.ps1") -Silent
}

# ─── Mode: Build + Deploy ───
if ($Build) {
    Write-Host ""
    Write-Host "  [2/4] Building for production..." -ForegroundColor Cyan
    Push-Location $ProjectRoot
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Build failed! Fix errors above and retry." -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "  ✅ Production build complete (dist/)" -ForegroundColor Green

    Write-Host ""
    Write-Host "  [3/4] Deploying to Firebase Hosting..." -ForegroundColor Cyan
    npx firebase-tools deploy --only hosting
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Deployment failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "  ✅ Deployed to https://jobflow-exec-tracker.web.app" -ForegroundColor Green
    Pop-Location

    Write-Host ""
    Write-Host "  [4/4] Done!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🌐 Production URL: https://jobflow-exec-tracker.web.app" -ForegroundColor White
    Write-Host ""
    exit 0
}

# ─── Mode: Preview (production bundle locally) ───
if ($Preview) {
    Write-Host ""
    Write-Host "  [2/4] Building production bundle..." -ForegroundColor Cyan
    Push-Location $ProjectRoot
    npm run build
    Pop-Location
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✅ Build complete" -ForegroundColor Green

    Write-Host ""
    Write-Host "  [3/4] Starting preview server..." -ForegroundColor Cyan
    $previewJob = Start-Process -FilePath "npm" -ArgumentList "run preview" -WorkingDirectory $ProjectRoot -PassThru -WindowStyle Hidden
    $previewJob.Id | Out-File $PidFile -Encoding UTF8
    Write-Host "  ✅ Preview server started (PID: $($previewJob.Id))" -ForegroundColor Green

    Start-Sleep -Seconds 2
    Write-Host ""
    Write-Host "  [4/4] All services running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor DarkGray
    Write-Host "  │  🌐 Preview:  http://localhost:4173      │" -ForegroundColor White
    Write-Host "  │  🛑 Stop:     .\stop.ps1                 │" -ForegroundColor DarkGray
    Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor DarkGray
    Write-Host ""
    exit 0
}

# ─── Mode: Dev (default) ───
Write-Host ""
Write-Host "  [2/4] Starting Vite dev server..." -ForegroundColor Cyan

$devJob = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $ProjectRoot -PassThru -WindowStyle Hidden
$devJob.Id | Out-File $PidFile -Encoding UTF8
Write-Host "  ✅ Vite dev server started (PID: $($devJob.Id))" -ForegroundColor Green

# ─── Wait for server to be ready ───
Write-Host ""
Write-Host "  [3/4] Waiting for server to be ready..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
        $ready = $true
        break
    } catch {
        Write-Host "  ." -NoNewline -ForegroundColor DarkGray
    }
}
Write-Host ""

if ($ready) {
    Write-Host "  ✅ Server is ready!" -ForegroundColor Green
} else {
    Write-Host "  ⚠  Server may still be starting — check http://localhost:5173" -ForegroundColor Yellow
}

# ─── Summary ───
Write-Host ""
Write-Host "  [4/4] All services running!" -ForegroundColor Green
Write-Host ""
Write-Host "  ┌──────────────────────────────────────────────────────────┐" -ForegroundColor DarkGray
Write-Host "  │  🌐 Local:       http://localhost:5173                   │" -ForegroundColor White
Write-Host "  │  🌐 Production:  https://jobflow-exec-tracker.web.app   │" -ForegroundColor DarkGray
Write-Host "  │  🛑 Stop:        .\stop.ps1                             │" -ForegroundColor DarkGray
Write-Host "  │  📦 Build+Deploy: .\start.ps1 -Build                    │" -ForegroundColor DarkGray
Write-Host "  └──────────────────────────────────────────────────────────┘" -ForegroundColor DarkGray
Write-Host ""
