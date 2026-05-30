#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Bootstrap Java Mastery on a fresh Ubuntu/Debian VPS
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/.../deploy.sh | bash
#   OR:
#   chmod +x deploy.sh && sudo ./deploy.sh
#
# The script:
#   1. Installs Docker + Docker Compose
#   2. Opens firewall ports 80 + 443
#   3. Creates a .env file with your domain
#   4. Pulls + builds and starts all services
# =============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-java-aws.fillthesyntax.in}"
ACME_EMAIL="${ACME_EMAIL:-}"
APP_DIR="${APP_DIR:-/opt/java-mastery}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── 0. Must be root ──────────────────────────────────────────────────────────
[[ $EUID -eq 0 ]] || error "Run as root: sudo $0"

# ── 1. Install Docker ────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  info "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
  info "Docker installed: $(docker --version)"
else
  info "Docker already installed: $(docker --version)"
fi

# ── 2. Install Docker Compose plugin ────────────────────────────────────────
if ! docker compose version &>/dev/null; then
  info "Installing Docker Compose plugin..."
  apt-get install -y docker-compose-plugin
fi

# ── 3. Firewall ──────────────────────────────────────────────────────────────
if command -v ufw &>/dev/null; then
  info "Configuring UFW firewall..."
  ufw allow 22/tcp   comment "SSH"
  ufw allow 80/tcp   comment "HTTP"
  ufw allow 443/tcp  comment "HTTPS"
  ufw allow 443/udp  comment "HTTP3"
  ufw --force enable
  ufw status
fi

# ── 4. Clone / pull repo ─────────────────────────────────────────────────────
if [[ -d "$APP_DIR/.git" ]]; then
  info "Pulling latest changes in $APP_DIR..."
  git -C "$APP_DIR" pull --ff-only
else
  info "Cloning repository to $APP_DIR..."
  git clone "${REPO_URL:?Set REPO_URL env var}" "$APP_DIR"
fi

cd "$APP_DIR"

# ── 5. Write .env ────────────────────────────────────────────────────────────
[[ -z "$ACME_EMAIL" ]] && read -rp "Enter email for Let's Encrypt notifications: " ACME_EMAIL

cat > .env <<EOF
DOMAIN=$DOMAIN
ACME_EMAIL=$ACME_EMAIL
ALLOWED_ORIGIN=https://$DOMAIN
EOF
info ".env written"

# ── 6. Start production stack ────────────────────────────────────────────────
info "Building and starting containers (this takes ~3 minutes first time)..."
docker compose -f docker-compose.prod.yml pull caddy || true
docker compose -f docker-compose.prod.yml up -d --build

info "Waiting for backend health check..."
for i in $(seq 1 20); do
  if docker inspect --format='{{.State.Health.Status}}' java-mastery-backend 2>/dev/null | grep -q "healthy"; then
    break
  fi
  sleep 5
done

docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✔  Deployment complete!${NC}"
echo -e "   Open https://${DOMAIN} in your browser."
echo -e "   Caddy will obtain a free Let's Encrypt certificate automatically."
echo ""
echo "   Useful commands:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo "   docker compose -f docker-compose.prod.yml restart"
echo "   docker compose -f docker-compose.prod.yml down"
