#!/usr/bin/env bash
# =============================================================================
# Deploy Script – runs on the VPS (called by GitHub Actions via SSH)
#
# Also safe to run manually:
#   bash /opt/ridafaty/scripts/deploy.sh
# =============================================================================
set -euo pipefail

APP_DIR="/opt/ridafaty"
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"
ENV_FILE="$APP_DIR/.env.prod"
REGISTRY="ghcr.io"

GREEN='\033[0;32m'; BLUE='\033[0;34m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${BLUE}[$(date '+%H:%M:%S')] ▶  $1${NC}"; }
ok()   { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✓  $1${NC}"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] ✗  $1${NC}"; exit 1; }

log "Starting deployment at $(date)"

# ── Sanity checks ─────────────────────────────────────────────────────────────
[[ -f "$COMPOSE_FILE" ]] || err "Missing $COMPOSE_FILE"
[[ -f "$ENV_FILE"     ]] || err "Missing $ENV_FILE — copy from .env.prod.example"

cd "$APP_DIR"

# ── 1. Pull latest code ───────────────────────────────────────────────────────
log "Pulling latest code from master..."
git fetch origin master
git reset --hard origin/master
ok "Code up to date ($(git rev-parse --short HEAD))"

# ── 2. Pull latest Docker images ─────────────────────────────────────────────
log "Pulling latest Docker images..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
ok "Images pulled"

# ── 3. Restart services ───────────────────────────────────────────────────────
log "Restarting services..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans
ok "Services restarted"

# ── 4. Wait for health checks ─────────────────────────────────────────────────
log "Waiting for services to be healthy..."
TIMEOUT=120
ELAPSED=0
while true; do
    UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null \
        | grep -c '"Health":"unhealthy"' || true)
    STARTING=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null \
        | grep -c '"Health":"starting"' || true)

    if [[ "$STARTING" -eq 0 && "$UNHEALTHY" -eq 0 ]]; then
        ok "All services healthy"
        break
    fi

    if [[ "$ELAPSED" -ge "$TIMEOUT" ]]; then
        docker compose -f "$COMPOSE_FILE" ps
        err "Health check timeout after ${TIMEOUT}s"
    fi

    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

# ── 5. Clean up old images ────────────────────────────────────────────────────
log "Pruning unused Docker images..."
docker image prune -f
ok "Pruned"

# ── 6. Show running services ─────────────────────────────────────────────────
docker compose -f "$COMPOSE_FILE" ps

echo ""
ok "Deployment complete at $(date) — commit $(git rev-parse --short HEAD)"
