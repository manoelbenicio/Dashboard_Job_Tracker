#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# JOBFLOW — Bootstrap: Start All Services
# Project: JOBFLOW (Dashboard Job Tracker)
# Usage:   bash scripts/start.sh
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_TAG="JOBFLOW"
DOCLING_PORT=8001

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║        $PROJECT_TAG — Starting All Services       ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── Step 1: Port Safety Check ──────────────────────────────
echo "🔍 [$PROJECT_TAG] Checking port availability..."

check_port() {
  local port=$1
  local service=$2
  local pid=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    local proc=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
    if docker ps --filter "label=project=JOBFLOW" --format '{{.Ports}}' 2>/dev/null | grep -q ":${port}->"; then
      echo "  ✅ Port $port — Already used by $PROJECT_TAG ($service). Will restart."
      return 0
    else
      echo "  ⚠️  Port $port — In use by '$proc' (PID: $pid). NOT a $PROJECT_TAG service."
      echo "     Skipping — will NOT kill third-party process."
      echo "     Please free port $port manually or change the port in docker-compose.yml"
      return 1
    fi
  else
    echo "  ✅ Port $port — Available"
    return 0
  fi
}

PORT_OK=true
check_port $DOCLING_PORT "Docling API" || PORT_OK=false

if [ "$PORT_OK" = false ]; then
  echo ""
  echo "❌ [$PROJECT_TAG] Port conflict detected. Fix conflicts above and retry."
  exit 1
fi

echo ""

# ─── Step 2: Start Docker Services ─────────────────────────
echo "🐳 [$PROJECT_TAG] Starting Docker services..."
cd "$(dirname "$0")/.."

docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

echo "  ✅ Docling API running on http://localhost:$DOCLING_PORT"
echo ""

# ─── Step 3: Health Check ───────────────────────────────────
echo "🏥 [$PROJECT_TAG] Waiting for Docling API health check..."
for i in {1..15}; do
  if curl -s "http://localhost:$DOCLING_PORT/api/health" > /dev/null 2>&1; then
    echo "  ✅ Docling API is healthy!"
    break
  fi
  if [ $i -eq 15 ]; then
    echo "  ⚠️  Docling API not responding yet (may need more time on first build)"
  fi
  sleep 2
done
echo ""

# ─── Done ───────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════╗"
echo "║        $PROJECT_TAG — Backend Services Running    ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Docling API: http://localhost:$DOCLING_PORT             ║"
echo "║  Health:      http://localhost:$DOCLING_PORT/api/health  ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Now run Vite from Windows terminal:            ║"
echo "║    npm run dev                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
