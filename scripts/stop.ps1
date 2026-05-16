# JOBFLOW - Shutdown: Stop ALL Services (Windows + WSL)
# Project: JOBFLOW (Dashboard Job Tracker)
# Usage:   .\scripts\stop.ps1

$PROJECT_TAG = "JOBFLOW"
$PROJECT_DIR = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  $PROJECT_TAG - Stopping All Services" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: Stop Vite (Windows) ---
Write-Host "[JOBFLOW] Stopping Vite dev server..." -ForegroundColor Yellow

$pidFile = "$PROJECT_DIR\.jobflow-vite-pid"
if (Test-Path $pidFile) {
    $vitePid = Get-Content $pidFile
    $proc = Get-Process -Id $vitePid -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $vitePid -Force -ErrorAction SilentlyContinue
        Write-Host "  Vite stopped (PID: $vitePid)" -ForegroundColor Green
    }
    else {
        Write-Host "  Vite was not running" -ForegroundColor Gray
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}
else {
    $viteConn = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($viteConn) {
        Stop-Process -Id $viteConn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  Vite stopped (PID: $($viteConn.OwningProcess))" -ForegroundColor Green
    }
    else {
        Write-Host "  Vite was not running" -ForegroundColor Gray
    }
}
Write-Host ""

# --- Step 2: Stop Docker (WSL) ---
Write-Host "[JOBFLOW] Stopping Docker services..." -ForegroundColor Yellow

wsl bash -c 'cd /mnt/c/VMs/Projetos/VMs/Dashboard_Job_Tracker; docker compose down --remove-orphans 2>&1'

$jobflowContainers = wsl bash -c "docker ps -q --filter 'label=project=JOBFLOW' 2>/dev/null"
if ([string]::IsNullOrWhiteSpace($jobflowContainers)) {
    Write-Host "  All JOBFLOW Docker containers stopped" -ForegroundColor Green
}
else {
    Write-Host "  Force stopping remaining containers..." -ForegroundColor DarkYellow
    wsl bash -c "docker stop $jobflowContainers 2>/dev/null"
}
Write-Host ""

# --- Step 3: Verify ---
Write-Host "[JOBFLOW] Verification:" -ForegroundColor Yellow

@(5173, 8001) | ForEach-Object {
    $port = $_
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $proc = Get-Process -Id $conn[0].OwningProcess -ErrorAction SilentlyContinue
        Write-Host "  Port $port still in use by: $($proc.ProcessName)" -ForegroundColor DarkYellow
    }
    else {
        Write-Host "  Port $port - Free" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  $PROJECT_TAG - All Services Stopped" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
