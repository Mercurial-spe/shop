#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

check_cmd() {
  local name="$1"
  local cmd="$2"

  echo
  echo "==> ${name}"
  if bash -lc "${cmd}"; then
    echo "OK: ${name}"
  else
    echo "FAIL: ${name}"
    FAIL=1
  fi
}

check_cmd "Java 21" 'java -version 2>&1 | head -n 1 | grep -E "version \"21\\.|openjdk 21\\."'
check_cmd "Maven" 'mvn -v | head -n 1'
check_cmd "Maven Wrapper" "cd '${ROOT_DIR}/shop-backend' && ./mvnw -v | head -n 2"
check_cmd "MySQL client" 'mysql --version'
check_cmd "Node in fish/nvm" 'fish -lc "if not type -q nvm; and test -f ~/.config/fish/functions/nvm.fish; source ~/.config/fish/functions/nvm.fish; end; type -q nvm && if not nvm use 20 --silent; nvm install 20; end; nvm use 20 >/dev/null && node -v && npm -v"'
check_cmd "Git" 'git --version'

if [[ "${1:-}" == "--build" ]]; then
  check_cmd "Frontend build" "cd '${ROOT_DIR}/shop-frontend' && fish -lc 'if not type -q nvm; and test -f ~/.config/fish/functions/nvm.fish; source ~/.config/fish/functions/nvm.fish; end; if not nvm use 20 --silent; nvm install 20; end; nvm use 20 >/dev/null; npm install; npm run build'"
  check_cmd "Backend compile" "cd '${ROOT_DIR}/shop-backend' && ./mvnw -DskipTests compile"
else
  echo
  echo "Build checks skipped. Run this for full verification:"
  echo "  scripts/check-dev-env.sh --build"
fi

echo
if [[ "${FAIL}" -eq 0 ]]; then
  echo "All checks passed."
else
  echo "Some checks failed."
fi

exit "${FAIL}"
