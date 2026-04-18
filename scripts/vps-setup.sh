#!/usr/bin/env bash
# =============================================================================
# VPS Initial Setup – idafaty.com
#
# Run ONCE as root on a fresh Ubuntu 22.04 LTS VPS:
#   curl -o vps-setup.sh https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/scripts/vps-setup.sh
#   bash vps-setup.sh
#
# After this script:
#   1. Add your SSH public key to /home/deploy/.ssh/authorized_keys
#   2. Clone the repo to /opt/ridafaty
#   3. Copy .env.prod.example → /opt/ridafaty/.env.prod and fill it in
#   4. Run scripts/ssl-setup.sh
# =============================================================================
set -euo pipefail

DEPLOY_USER="deploy"
APP_DIR="/opt/ridafaty"
GITHUB_REPO="https://github.com/YOUR_USERNAME/YOUR_REPO.git"  # ← change this

# ── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${BLUE}▶  $1${NC}"; }
ok()   { echo -e "${GREEN}✓  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠  $1${NC}"; }

[[ $EUID -ne 0 ]] && { echo "Run as root"; exit 1; }

# ── 1. Update system ─────────────────────────────────────────────────────────
log "Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw fail2ban htop unzip
ok "System updated"

# ── 2. Install Docker ─────────────────────────────────────────────────────────
log "Installing Docker..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    ok "Docker installed"
else
    ok "Docker already installed"
fi

# ── 3. Install Docker Compose plugin ─────────────────────────────────────────
log "Installing Docker Compose..."
apt-get install -y docker-compose-plugin
ok "Docker Compose installed: $(docker compose version)"

# ── 4. Install Nginx ──────────────────────────────────────────────────────────
log "Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx
ok "Nginx installed"

# ── 5. Install Certbot ───────────────────────────────────────────────────────
log "Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx
ok "Certbot installed"

# ── 6. Create deploy user ────────────────────────────────────────────────────
log "Creating deploy user: $DEPLOY_USER..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
    ok "User $DEPLOY_USER created"
else
    ok "User $DEPLOY_USER already exists"
fi
usermod -aG docker "$DEPLOY_USER"
mkdir -p /home/$DEPLOY_USER/.ssh
chmod 700 /home/$DEPLOY_USER/.ssh
touch /home/$DEPLOY_USER/.ssh/authorized_keys
chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
ok "Docker group + SSH dir set up for $DEPLOY_USER"

# ── 7. Create app directory ───────────────────────────────────────────────────
log "Creating app directory: $APP_DIR..."
mkdir -p "$APP_DIR"
chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"
ok "App dir ready: $APP_DIR"

# ── 8. Configure UFW firewall ─────────────────────────────────────────────────
log "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   comment "SSH"
ufw allow 80/tcp   comment "HTTP"
ufw allow 443/tcp  comment "HTTPS"
ufw --force enable
ok "Firewall enabled (22, 80, 443)"

# ── 9. Configure fail2ban ─────────────────────────────────────────────────────
log "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
ok "fail2ban active"

# ── 10. Harden SSH ───────────────────────────────────────────────────────────
log "Hardening SSH..."
SSHD=/etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' "$SSHD"
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' "$SSHD"
sshd -t && systemctl restart sshd
ok "SSH hardened (password auth off)"

# ── 11. Clone repo ────────────────────────────────────────────────────────────
if [[ "$GITHUB_REPO" != *"YOUR_USERNAME"* ]]; then
    log "Cloning repo to $APP_DIR..."
    sudo -u $DEPLOY_USER git clone "$GITHUB_REPO" "$APP_DIR" 2>/dev/null || \
        (cd "$APP_DIR" && sudo -u $DEPLOY_USER git pull)
    ok "Repo cloned"
else
    warn "GITHUB_REPO not set — clone manually:"
    warn "  sudo -u $DEPLOY_USER git clone YOUR_REPO $APP_DIR"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}======================================"
echo "  VPS setup complete!"
echo -e "======================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Paste your CI/CD SSH public key into:"
echo "       /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "  2. Clone the repo if not already done:"
echo "       git clone YOUR_REPO $APP_DIR"
echo "  3. Fill in secrets:"
echo "       cp $APP_DIR/.env.prod.example $APP_DIR/.env.prod"
echo "       nano $APP_DIR/.env.prod"
echo "  4. Run SSL setup:"
echo "       bash $APP_DIR/scripts/ssl-setup.sh"
echo ""
