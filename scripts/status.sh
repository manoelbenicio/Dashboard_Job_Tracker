#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# JOBFLOW — Status: Check All Services
# Project: JOBFLOW (Dashboard Job Tracker)
# Usage:   bash scripts/status.sh
# ═══════════════════════════════════════════════════════════════

PROJECT_TAG="JOBFLOW"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       $PROJECT_TAG — Service Status Report        ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── Docker Containers ──────────────────────────────────────
echo "🐳 Docker Containers (JOBFLOW only):"
CONTAINERS=$(docker ps -a --filter "label=project=JOBFLOW" --format "  {{.Names}}  {{.Status}}  {{.Ports}}" 2>/dev/null || true)
if [ -n "$CONTAINERS" ]; then
  echo "$CONTAINERS"
else
  echo "  ❌ No JOBFLOW containers found"
fi
echo ""

# ─── Port Usage ─────────────────────────────────────────────
echo "🔌 Port Usage:"
for port in 5173 8001; do
  PID=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$PID" ]; then
    PROC=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
    echo "  Port $port — ✅ Active ($PROC, PID: $PID)"
  else
    echo "  Port $port — ⭕ Free"
  fi
done
echo ""

# ─── Health Checks ──────────────────────────────────────────
echo "🏥 Health Checks:"
HEALTH=$(curl -s "http://localhost:8001/api/health" 2>/dev/null || echo "UNREACHABLE")
if echo "$HEALTH" | grep -q '"ok"'; then
  echo "  Docling API: ✅ Healthy"
else
  echo "  Docling API: ❌ $HEALTH"
fi

VITE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173" 2>/dev/null || echo "000")
if [ "$VITE" = "200" ] || [ "$VITE" = "304" ]; then
  echo "  Vite Server: ✅ Running"
else
  echo "  Vite Server: ❌ Not responding (HTTP $VITE)"
fi
echo ""

echo "╚══════════════════════════════════════════════════╝"
