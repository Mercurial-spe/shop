#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="${APP_NAME:-mercurial-shop}"
APP_DIR="${APP_DIR:-/opt/${APP_NAME}}"
WEB_ROOT="${WEB_ROOT:-/var/www/${APP_NAME}}"
SERVICE_USER="${SERVICE_USER:-www-data}"
DB_NAME="${DB_NAME:-shop_db}"
DB_USER="${DB_USER:-shop_user}"
DB_PASSWORD="${DB_PASSWORD:-shop_pass}"
DB_PORT="${DB_PORT:-3306}"
DB_HOST="${DB_HOST:-127.0.0.1}"
SMTP_HOST="${SMTP_HOST:-smtp.qq.com}"
SMTP_PORT="${SMTP_PORT:-465}"
SMTP_USER="${SMTP_USER:-}"
SMTP_PASS="${SMTP_PASS:-}"

echo "[1/7] Building backend jar..."
(
  cd "${ROOT_DIR}/shop-backend"
  ./mvnw -DskipTests package
)

echo "[2/7] Building frontend assets..."
(
  cd "${ROOT_DIR}/shop-frontend"
  npm ci
  npm run build
)

echo "[3/7] Installing application files..."
sudo install -d -m 0755 "${APP_DIR}/backend" "${WEB_ROOT}"
sudo install -m 0644 "${ROOT_DIR}/shop-backend/target/shop-backend-0.0.1-SNAPSHOT.jar" "${APP_DIR}/backend/app.jar"
sudo rsync -a --delete "${ROOT_DIR}/shop-frontend/dist/" "${WEB_ROOT}/"

echo "[4/7] Writing backend environment..."
sudo install -d -m 0750 /etc/mercurial-shop
sudo tee /etc/mercurial-shop/backend.env >/dev/null <<EOF
DB_URL=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EOF
sudo chmod 0640 /etc/mercurial-shop/backend.env

echo "[5/7] Installing systemd service..."
sudo tee /etc/systemd/system/${APP_NAME}.service >/dev/null <<EOF
[Unit]
Description=Mercurial Shop Spring Boot backend
After=network.target mysql.service
Wants=mysql.service

[Service]
User=${SERVICE_USER}
WorkingDirectory=${APP_DIR}/backend
EnvironmentFile=/etc/mercurial-shop/backend.env
ExecStart=/usr/bin/java -jar ${APP_DIR}/backend/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo "[6/7] Installing Nginx site..."
sudo install -m 0644 "${ROOT_DIR}/deploy/nginx/mercurial-shop.conf" /etc/nginx/sites-available/${APP_NAME}.conf
sudo ln -sfn /etc/nginx/sites-available/${APP_NAME}.conf /etc/nginx/sites-enabled/${APP_NAME}.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

echo "[7/7] Restarting services..."
sudo systemctl daemon-reload
sudo systemctl enable --now ${APP_NAME}
sudo systemctl restart ${APP_NAME}
sudo systemctl reload nginx

echo
echo "Deployment finished."
echo "Backend status:"
sudo systemctl --no-pager --lines=20 status ${APP_NAME} || true
echo
echo "Health check:"
curl -fsS http://127.0.0.1:8080/actuator/health || true
