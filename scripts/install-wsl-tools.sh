#!/usr/bin/env bash
set -euo pipefail

echo "[1/3] Installing WSL system tools..."
sudo apt-get update
sudo apt-get install -y \
  openjdk-21-jdk \
  maven \
  default-mysql-client \
  curl \
  ca-certificates \
  unzip \
  git

echo "[2/3] Installing Node.js 20 through fish/fisher nvm..."
if command -v fish >/dev/null 2>&1; then
  fish -lc '
    if not type -q nvm; and test -f ~/.config/fish/functions/nvm.fish
      source ~/.config/fish/functions/nvm.fish
    end

    if not type -q nvm
      echo "nvm.fish is not available in fish. Install it first with:"
      echo "  fisher install jorgebucaran/nvm.fish"
      exit 2
    end

    nvm install 20
    nvm use 20
    set -Ux nvm_default_version 20

    echo "fish node:" (node -v)
    echo "fish npm:" (npm -v)
  '
else
  echo "fish is not installed. Install it first if you want to use fisher nvm:"
  echo "  sudo apt-get install -y fish"
  exit 2
fi

echo "[3/3] Installed tool versions..."
java -version
mvn -v
mysql --version
git --version

echo "Done. Open a new fish shell, then run: scripts/check-dev-env.sh --build"
