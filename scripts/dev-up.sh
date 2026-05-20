#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3307}"
DB_USER="${DB_USER:-shop_user}"
DB_PASSWORD="${DB_PASSWORD:-shop_pass}"

echo "[1/3] Checking local MySQL..."
if ! mysqladmin ping -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" --silent >/dev/null 2>&1; then
  echo "Local MySQL is not reachable at ${DB_HOST}:${DB_PORT}."
  echo "Run this first:"
  echo "  ${ROOT_DIR}/scripts/setup-local-mysql.sh"
  exit 1
fi

echo "[2/3] Starting backend on http://localhost:8080 ..."
(
  cd "${ROOT_DIR}/shop-backend"
  ./mvnw spring-boot:run
) &
BACKEND_PID=$!

echo "[3/3] Starting frontend on http://localhost:5173 ..."
(
  cd "${ROOT_DIR}/shop-frontend"
  if command -v fish >/dev/null 2>&1; then
    fish -lc "if not type -q nvm; and test -f ~/.config/fish/functions/nvm.fish; source ~/.config/fish/functions/nvm.fish; end; if not nvm use 20 --silent; nvm install 20; end; nvm use 20 >/dev/null; npm run dev -- --host 0.0.0.0"
  else
    npm run dev -- --host 0.0.0.0
  fi
) &
FRONTEND_PID=$!

cleanup() {
  echo
  echo "Stopping dev servers..."
  kill "${BACKEND_PID}" "${FRONTEND_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

echo
echo "Development servers are starting:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080"
echo
echo "Press Ctrl+C to stop both."

wait
