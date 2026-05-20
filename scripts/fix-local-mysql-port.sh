#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "fix-local-mysql-port.sh is kept for compatibility."
echo "Delegating to setup-local-mysql.sh..."
exec "${SCRIPT_DIR}/setup-local-mysql.sh"
