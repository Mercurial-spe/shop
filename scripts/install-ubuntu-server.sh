#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${DB_NAME:-shop_db}"
DB_USER="${DB_USER:-shop_user}"
DB_PASSWORD="${DB_PASSWORD:-shop_pass}"
INSTALL_CERTBOT="${INSTALL_CERTBOT:-1}"

echo "[1/6] Installing base packages..."
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ca-certificates \
  curl \
  git \
  gnupg \
  nginx \
  mysql-server \
  openjdk-21-jdk \
  rsync \
  unzip

echo "[2/6] Installing Node.js 20 if needed..."
NODE_MAJOR="$(node -v 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/' || true)"
if [[ "${NODE_MAJOR:-0}" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi

echo "[3/6] Installing optional HTTPS tooling..."
if [[ "${INSTALL_CERTBOT}" == "1" ]]; then
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx
fi

echo "[4/6] Starting MySQL and Nginx..."
sudo systemctl enable --now mysql
sudo systemctl enable --now nginx

echo "[5/6] Creating application database and user..."
sudo mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'
  IDENTIFIED BY '${DB_PASSWORD}';

CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1'
  IDENTIFIED BY '${DB_PASSWORD}';

ALTER USER '${DB_USER}'@'localhost'
  IDENTIFIED BY '${DB_PASSWORD}';

ALTER USER '${DB_USER}'@'127.0.0.1'
  IDENTIFIED BY '${DB_PASSWORD}';

GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

echo "[6/6] Installed versions..."
java -version
node -v
npm -v
mysql --version
nginx -v

echo
echo "Server prerequisites are ready."
echo "Next: clone or pull the repository, then run:"
echo "  ./scripts/deploy-ubuntu-server.sh"
