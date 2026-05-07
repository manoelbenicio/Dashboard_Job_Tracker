# ╔══════════════════════════════════════════════════════════════╗
# ║  JobFlow — Shutdown Script                                  ║
# ║  Gracefully stops all services started by start.ps1         ║
# ║                                                             ║
# ║  Usage:  .\stop.ps1              → Stop all services        ║
# ║          .\stop.ps1 -Force       → Force kill all           ║
# ╚══════════════════════════════════════════════════════════════╝

param(
    [switch]$Force,
    [switch]$Silent
)

$ErrorActionPreference = "SilentlyContinue"
$ProjectRoot = $PSScriptRoot
$PidFile = Join-Path $ProjectRoot ".jobflow-pids"

if (-Not $Silent) {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor DarkRed
    Write-Host "  ║  🛑 JobFlow — Shutting Down                  ║" -ForegroundColor DarkRed
    Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor DarkRed
    Write-Host ""
}

$stopped = 0

# ─── Kill by PID file (from start.ps1) ───
if (Test-Path $PidFile) {
    $pids = Get-Content $PidFile
    foreach ($pid in $pids) {
        $pid = $pid.Trim()
        if ($pid -and $pid -match '^\d+$') {
            $proc = Get-Process -Id ([int]$pid) -ErrorAction SilentlyContinue
            if ($proc) {
                if (-Not $Silent) { Write-Host "  ⏹  Stopping PID $pid ($($proc.ProcessName))..." -ForegroundColor Yellow }
                
                if ($Force) {
                    Stop-Process -Id ([int]$pid) -Force -ErrorAction SilentlyContinue
                } else {
                    # Graceful: stop the process tree
                    $proc | Stop-Process -Force -ErrorAction SilentlyContinue
                }

                # Also stop child processes (node spawned by npm)
                Get-Process | Where-Object { $_.Parent.Id -eq [int]$pid } | ForEach-Object {
                    if (-Not $Silent) { Write-Host "  ⏹  Stopping child PID $($_.Id) ($($_.ProcessName))..." -ForegroundColor DarkYellow }
                    $_ | Stop-Process -Force -ErrorAction SilentlyContinue
                }
                $stopped++
            }
        }
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

# ─── Fallback: Kill any node processes on JobFlow ports ───
# Port 5173 (Vite dev) and 4173 (Vite preview)
foreach ($port in @(5173, 4173)) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($proc -and $proc.ProcessName -eq "node") {
            if (-Not $Silent) { Write-Host "  ⏹  Killing node on port $port (PID: $($proc.Id))..." -ForegroundColor Yellow }
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            $stopped++
        }
    }
}

# ─── Summary ───
if (-Not $Silent) {
    Write-Host ""
    if ($stopped -gt 0) {
        Write-Host "  ✅ $stopped service(s) stopped successfully." -ForegroundColor Green
    } else {
        Write-Host "  ℹ  No running JobFlow services found." -ForegroundColor DarkGray
    }
    Write-Host ""
    Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor DarkGray
    Write-Host "  │  ▶  Restart:  .\start.ps1                │" -ForegroundColor DarkGray
    Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor DarkGray
    Write-Host ""
}
