#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${DB_NAME:-shop_db}"
DB_USER="${DB_USER:-shop_user}"
DB_PASSWORD="${DB_PASSWORD:-shop_pass}"
DB_PORT="${DB_PORT:-3307}"
MYSQLX_PORT="${MYSQLX_PORT:-33070}"

echo "[1/5] Installing MySQL client/common packages..."
sudo apt-get update
sudo apt-get install -y mysql-common default-mysql-client

echo "[2/5] Writing WSL MySQL port override..."
sudo mkdir -p /etc/mysql/mysql.conf.d
sudo tee /etc/mysql/mysql.conf.d/z-wsl-local-port.cnf >/dev/null <<EOF
[mysqld]
port=${DB_PORT}
mysqlx-port=${MYSQLX_PORT}

[client]
port=${DB_PORT}
EOF

echo "[3/5] Installing or repairing MySQL server..."
if ! sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server; then
  echo "mysql-server install did not finish cleanly. Trying dpkg/apt repair..."
fi
sudo DEBIAN_FRONTEND=noninteractive dpkg --configure -a
sudo DEBIAN_FRONTEND=noninteractive apt-get install -f -y

echo "[4/5] Starting MySQL service..."
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl restart mysql 2>/dev/null || sudo service mysql restart || sudo service mysql start
else
  sudo service mysql restart || sudo service mysql start
fi

echo "[5/5] Creating database, application user, and verifying connection..."
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

mysql -h 127.0.0.1 -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "SHOW DATABASES LIKE '${DB_NAME}';"

echo
echo "Local MySQL is ready."
echo "Database: ${DB_NAME}"
echo "Port: ${DB_PORT}"
echo "User: ${DB_USER}"
echo "Password: ${DB_PASSWORD}"
echo
echo "Start backend with:"
echo "  cd shop-backend"
echo "  ./mvnw spring-boot:run"
