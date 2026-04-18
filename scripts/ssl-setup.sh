#!/usr/bin/env bash
# =============================================================================
# SSL Setup – idafaty.com
#
# Run ONCE on the VPS after vps-setup.sh and after DNS is pointing to this IP.
# Prerequisites: Nginx installed, port 80 open, DNS A record set.
#
# Usage (as root or with sudo):
#   bash /opt/ridafaty/scripts/ssl-setup.sh
# =============================================================================
set -euo pipefail

DOMAIN="idafaty.com"
WWW_DOMAIN="www.idafaty.com"
EMAIL="admin@idafaty.com"          # ← change to real email for cert expiry alerts
APP_DIR="/opt/ridafaty"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
WEBROOT="/var/www/certbot"

GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
log() { echo -e "${BLUE}▶  $1${NC}"; }
ok()  { echo -e "${GREEN}✓  $1${NC}"; }

[[ $EUID -ne 0 ]] && { echo "Run as root or with sudo"; exit 1; }

# ── 1. Create webroot for ACME challenge ─────────────────────────────────────
log "Creating webroot for ACME challenge..."
mkdir -p "$WEBROOT"
ok "Webroot: $WEBROOT"

# ── 2. Deploy temporary HTTP-only Nginx config ───────────────────────────────
log "Deploying temporary HTTP config..."
cat > "$NGINX_AVAILABLE/$DOMAIN" <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name idafaty.com www.idafaty.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 "OK – SSL setup in progress";
        add_header Content-Type text/plain;
    }
}
NGINX

ln -sf "$NGINX_AVAILABLE/$DOMAIN" "$NGINX_ENABLED/$DOMAIN"
rm -f "$NGINX_ENABLED/default"
nginx -t && systemctl reload nginx
ok "Temporary HTTP config deployed"

# ── 3. Obtain Let's Encrypt certificate ──────────────────────────────────────
log "Obtaining SSL certificate for $DOMAIN and $WWW_DOMAIN..."
certbot certonly \
    --webroot \
    --webroot-path "$WEBROOT" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "$WWW_DOMAIN"
ok "Certificate obtained: /etc/letsencrypt/live/$DOMAIN/"

# ── 4. Deploy production Nginx config (HTTPS) ────────────────────────────────
log "Deploying production HTTPS Nginx config..."
cp "$APP_DIR/nginx/idafaty.com.conf" "$NGINX_AVAILABLE/$DOMAIN"
nginx -t && systemctl reload nginx
ok "HTTPS Nginx config deployed"

# ── 5. Test HTTPS ─────────────────────────────────────────────────────────────
log "Testing HTTPS..."
sleep 2
if curl -fsSL "https://$DOMAIN" -o /dev/null -w "%{http_code}" | grep -q "^[23]"; then
    ok "HTTPS is working at https://$DOMAIN"
else
    echo "⚠  Could not verify HTTPS — check Nginx logs: journalctl -u nginx"
fi

# ── 6. Set up auto-renewal ────────────────────────────────────────────────────
log "Configuring auto-renewal..."
# certbot installs a systemd timer automatically; verify it's active:
systemctl is-active certbot.timer &>/dev/null && ok "certbot.timer is active" || {
    # Fallback: cron job
    CRON="0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'"
    (crontab -l 2>/dev/null | grep -v certbot; echo "$CRON") | crontab -
    ok "Cron renewal job added (daily at 03:00)"
}

echo ""
echo -e "${GREEN}======================================"
echo "  SSL setup complete!"
echo -e "======================================${NC}"
echo ""
echo "  https://$DOMAIN  ✓"
echo "  https://$WWW_DOMAIN  → redirects to $DOMAIN  ✓"
echo ""
echo "Next: start the application:"
echo "  cd $APP_DIR"
echo "  docker compose -f docker-compose.prod.yml --env-file .env.prod up -d"
echo ""
