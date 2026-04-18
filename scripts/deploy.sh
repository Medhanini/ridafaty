#!/usr/bin/env bash
# =============================================================================
# Deploy Script – runs on the VPS (called by GitHub Actions via SSH)
#
# DATABASE SAFETY RULES (never break these):
#   ✗  Never run: docker compose down -v
#   ✗  Never run: docker compose down  (tears down mysql briefly)
#   ✓  Only recreate app containers (backend, frontend)
#   ✓  MySQL stays running across every deploy
#   ✓  A backup is taken before any container change
#
# Manual usage:
#   bash /opt/ridafaty/scripts/deploy.sh
# =============================================================================
set -euo pipefail

APP_DIR="/opt/ridafaty"
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"
ENV_FILE="$APP_DIR/.env.prod"
BACKUP_DIR="$APP_DIR/backups"
BACKUP_KEEP=14   # number of most-recent backups to keep

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
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull backend frontend
ok "Images pulled"

# ── 3. Ensure MySQL is running (start once, never recreate) ───────────────────
log "Ensuring MySQL is running..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d mysql

# Wait for MySQL to be healthy before touching anything else
log "Waiting for MySQL to be healthy..."
DB_TIMEOUT=120
DB_ELAPSED=0
until docker inspect --format='{{.State.Health.Status}}' ridafaty_mysql 2>/dev/null | grep -q "healthy"; do
    if [[ "$DB_ELAPSED" -ge "$DB_TIMEOUT" ]]; then
        err "MySQL did not become healthy after ${DB_TIMEOUT}s"
    fi
    sleep 3
    DB_ELAPSED=$((DB_ELAPSED + 3))
done
ok "MySQL is healthy"

# ── 4. Backup database before deploying ──────────────────────────────────────
log "Backing up database..."
mkdir -p "$BACKUP_DIR"

DB_USER=$(grep '^MYSQL_USER='     "$ENV_FILE" | cut -d= -f2-)
DB_PASS=$(grep '^MYSQL_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)
DB_NAME=$(grep '^MYSQL_DATABASE=' "$ENV_FILE" | cut -d= -f2-)
DB_NAME="${DB_NAME:-ridafaty}"

BACKUP_FILE="$BACKUP_DIR/$(date +%Y%m%d_%H%M%S).sql.gz"
docker exec ridafaty_mysql \
    mysqldump -u"$DB_USER" -p"$DB_PASS" \
    --single-transaction --routines --triggers "$DB_NAME" \
    | gzip > "$BACKUP_FILE"

# Rotate: keep only the most recent $BACKUP_KEEP backups
find "$BACKUP_DIR" -name '*.sql.gz' -maxdepth 1 \
    | sort -r | tail -n +$((BACKUP_KEEP + 1)) | xargs rm -f 2>/dev/null || true

ok "Backup saved: $BACKUP_FILE"

# ── 5. Recreate app containers only (MySQL is untouched) ─────────────────────
log "Restarting app containers (backend + frontend)..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" \
    up -d --force-recreate --no-deps backend frontend
ok "App containers restarted"

# ── 6. Wait for health checks ─────────────────────────────────────────────────
log "Waiting for services to be healthy..."
TIMEOUT=180
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

# ── 7. Clean up old images ────────────────────────────────────────────────────
log "Pruning unused Docker images..."
docker image prune -f
ok "Pruned"

# ── 8. Show running services ─────────────────────────────────────────────────
docker compose -f "$COMPOSE_FILE" ps

echo ""
ok "Deployment complete at $(date) — commit $(git rev-parse --short HEAD)"
