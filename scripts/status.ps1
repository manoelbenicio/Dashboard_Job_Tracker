# JOBFLOW - Status: Check ALL Services (Windows + WSL)
# Project: JOBFLOW (Dashboard Job Tracker)
# Usage:   .\scripts\status.ps1

$PROJECT_TAG = "JOBFLOW"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  $PROJECT_TAG - Service Status Report" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# --- Docker Containers ---
Write-Host "[JOBFLOW] Docker Containers:" -ForegroundColor Yellow
$containers = wsl bash -c "docker ps -a --filter 'label=project=JOBFLOW' --format '  {{.Names}}  {{.Status}}  {{.Ports}}' 2>/dev/null"
if ($containers) {
    Write-Host $containers
}
else {
    Write-Host "  No JOBFLOW containers found" -ForegroundColor Red
}
Write-Host ""

# --- Port Usage ---
Write-Host "[JOBFLOW] Port Usage:" -ForegroundColor Yellow

@(@{Port=5173; Service="Vite"}, @{Port=8001; Service="Docling API"}) | ForEach-Object {
    $port = $_.Port
    $svc = $_.Service
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "  Port $port ($svc) - Active ($($proc.ProcessName), PID: $($proc.Id))" -ForegroundColor Green
    }
    else {
        Write-Host "  Port $port ($svc) - Free" -ForegroundColor Gray
    }
}
Write-Host ""

# --- Health Checks ---
Write-Host "[JOBFLOW] Health Checks:" -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "http://localhost:8001/api/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  Docling API: Healthy (engine: $($health.engine))" -ForegroundColor Green
}
catch {
    Write-Host "  Docling API: Not responding" -ForegroundColor Red
}

try {
    $null = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  Vite Server: Running" -ForegroundColor Green
}
catch {
    Write-Host "  Vite Server: Not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
