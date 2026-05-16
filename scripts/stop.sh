#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# JOBFLOW — Shutdown: Stop All Services
# Project: JOBFLOW (Dashboard Job Tracker)
# Usage:   bash scripts/stop.sh
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_TAG="JOBFLOW"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       $PROJECT_TAG — Stopping All Services        ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── Step 1: Stop Vite Dev Server ──────────────────────────
echo "🛑 [$PROJECT_TAG] Stopping Vite dev server..."
if [ -f /tmp/jobflow-vite.pid ]; then
  VITE_PID=$(cat /tmp/jobflow-vite.pid)
  if kill -0 $VITE_PID 2>/dev/null; then
    kill $VITE_PID 2>/dev/null || true
    echo "  ✅ Vite stopped (PID: $VITE_PID)"
  else
    echo "  ℹ️  Vite was not running"
  fi
  rm -f /tmp/jobflow-vite.pid
else
  # Try to find by port
  VITE_PID=$(lsof -ti :5173 2>/dev/null || true)
  if [ -n "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null || true
    echo "  ✅ Vite stopped (PID: $VITE_PID)"
  else
    echo "  ℹ️  Vite was not running"
  fi
fi
echo ""

# ─── Step 2: Stop Docker Services ─────────────────────────
echo "🐳 [$PROJECT_TAG] Stopping Docker services..."
cd "$(dirname "$0")/.."

# Only stop containers with JOBFLOW label
JOBFLOW_CONTAINERS=$(docker ps -q --filter "label=project=JOBFLOW" 2>/dev/null || true)
if [ -n "$JOBFLOW_CONTAINERS" ]; then
  docker compose down
  echo "  ✅ All JOBFLOW Docker containers stopped"
else
  echo "  ℹ️  No JOBFLOW containers were running"
fi
echo ""

# ─── Step 3: Verify ────────────────────────────────────────
echo "📋 [$PROJECT_TAG] Service status after shutdown:"
echo ""

# Check for any remaining JOBFLOW containers
REMAINING=$(docker ps --filter "label=project=JOBFLOW" --format "  {{.Names}} ({{.Status}})" 2>/dev/null || true)
if [ -n "$REMAINING" ]; then
  echo "  ⚠️  Still running:"
  echo "$REMAINING"
else
  echo "  ✅ No JOBFLOW containers running"
fi

# Check ports
for port in 5173 8001; do
  PID=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$PID" ]; then
    PROC=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
    echo "  ⚠️  Port $port still in use by: $PROC (PID: $PID) — NOT a JOBFLOW service"
  else
    echo "  ✅ Port $port — Free"
  fi
done

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       $PROJECT_TAG — All Services Stopped         ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
