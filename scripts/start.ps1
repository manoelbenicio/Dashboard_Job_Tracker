# JOBFLOW - Bootstrap: Start ALL Services (Windows + WSL)
# Project: JOBFLOW (Dashboard Job Tracker)
# Usage:   .\scripts\start.ps1

$PROJECT_TAG = "JOBFLOW"
$VITE_PORT = 5173
$DOCLING_PORT = 8001
$MAX_RETRIES = 3
$PROJECT_DIR = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Set-Location $PROJECT_DIR

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  $PROJECT_TAG - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# --- Helper: Check if port is in use ---
function Test-PortInUse($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($null -ne $conn) { return $true }
    return $false
}

function Get-PortProcess($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        return $proc.ProcessName
    }
    return $null
}

# --- Step 1: Port Safety Check ---
Write-Host "[JOBFLOW] Checking port availability..." -ForegroundColor Yellow

$portConflict = $false

if (Test-PortInUse $DOCLING_PORT) {
    $proc = Get-PortProcess $DOCLING_PORT
    if ($proc -eq "com.docker.backend" -or $proc -eq "wslhost" -or $proc -eq "wslrelay") {
        Write-Host "  Port $DOCLING_PORT - JOBFLOW Docker (will restart)" -ForegroundColor Gray
    }
    else {
        Write-Host "  Port $DOCLING_PORT - In use by $proc (NOT JOBFLOW)" -ForegroundColor Red
        $portConflict = $true
    }
}
else {
    Write-Host "  Port $DOCLING_PORT - Available" -ForegroundColor Green
}

if (Test-PortInUse $VITE_PORT) {
    $proc = Get-PortProcess $VITE_PORT
    Write-Host "  Port $VITE_PORT - In use by $proc (will restart)" -ForegroundColor Gray
}
else {
    Write-Host "  Port $VITE_PORT - Available" -ForegroundColor Green
}

if ($portConflict) {
    Write-Host ""
    Write-Host "[JOBFLOW] Port conflict with third-party service. Aborting." -ForegroundColor Red
    exit 1
}
Write-Host ""

# --- Step 2: Start Docker Backend (via WSL) ---
Write-Host "[JOBFLOW] Starting Docker backend via WSL..." -ForegroundColor Yellow

$dockerSuccess = $false
for ($attempt = 1; $attempt -le $MAX_RETRIES; $attempt++) {
    Write-Host "  Attempt $attempt of $MAX_RETRIES..." -ForegroundColor Gray

    wsl bash -c 'cd /mnt/c/VMs/Projetos/VMs/Dashboard_Job_Tracker; docker compose down --remove-orphans 2>/dev/null; docker compose up -d --build 2>&1'

    $healthy = $false
    for ($i = 1; $i -le 20; $i++) {
        Start-Sleep -Seconds 2
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:$DOCLING_PORT/api/health" -TimeoutSec 3 -ErrorAction Stop
            if ($response.status -eq "ok") {
                $healthy = $true
                break
            }
        }
        catch { }
        Write-Host "  Waiting for Docling API... ($i/20)" -ForegroundColor Gray
    }

    if ($healthy) {
        $dockerSuccess = $true
        Write-Host "  Docling API is healthy on port $DOCLING_PORT!" -ForegroundColor Green
        break
    }
    else {
        Write-Host "  Docling API failed. Retrying..." -ForegroundColor Red
        wsl bash -c 'cd /mnt/c/VMs/Projetos/VMs/Dashboard_Job_Tracker; docker compose down 2>/dev/null'
    }
}

if (-not $dockerSuccess) {
    Write-Host "  Docling API failed after $MAX_RETRIES attempts." -ForegroundColor Red
    exit 1
}
Write-Host ""

# --- Step 3: Start Vite Dev Server (Windows) ---
Write-Host "[JOBFLOW] Starting Vite dev server..." -ForegroundColor Yellow

# Kill existing processes on the port
if (Test-PortInUse $VITE_PORT) {
    $conns = Get-NetTCPConnection -LocalPort $VITE_PORT -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        try {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        } catch {}
    }
    Write-Host "  Cleared port $VITE_PORT" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

$viteSuccess = $false
for ($attempt = 1; $attempt -le $MAX_RETRIES; $attempt++) {
    Write-Host "  Attempt $attempt of $MAX_RETRIES..." -ForegroundColor Gray

    # Start Vite using cmd.exe for reliable background execution
    $viteProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d $PROJECT_DIR && npx vite --host" -PassThru -WindowStyle Hidden
    $viteProc.Id | Out-File "$PROJECT_DIR\.jobflow-vite-pid" -Force

    # Check if port becomes active (TCP check, not HTTP)
    for ($i = 1; $i -le 20; $i++) {
        Start-Sleep -Seconds 2
        if (Test-PortInUse $VITE_PORT) {
            $viteSuccess = $true
            break
        }
        Write-Host "  Waiting for Vite... ($i/20)" -ForegroundColor Gray
    }

    if ($viteSuccess) {
        Write-Host "  Vite running on port $VITE_PORT (PID: $($viteProc.Id))!" -ForegroundColor Green
        break
    }
    else {
        Write-Host "  Vite failed. Retrying..." -ForegroundColor Red
        Stop-Process -Id $viteProc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

if (-not $viteSuccess) {
    Write-Host "  Vite failed after $MAX_RETRIES attempts." -ForegroundColor Red
    exit 1
}
Write-Host ""

# --- Final Report ---
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  $PROJECT_TAG - All Services Running" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Frontend:    http://localhost:$VITE_PORT" -ForegroundColor Green
Write-Host "  Docling API: http://localhost:$DOCLING_PORT" -ForegroundColor Green
Write-Host "  Health:      http://localhost:$DOCLING_PORT/api/health" -ForegroundColor Green
Write-Host "  Stop all:    .\scripts\stop.ps1" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
