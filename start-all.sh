#!/usr/bin/env sh
# Start the EduNova API and web client with one command (npm concurrently).
# Usage: ./start-all.sh
cd "$(dirname "$0")" || exit 1
if [ ! -d node_modules ]; then
  echo "Installing workspace dependencies..."
  npm install --no-audit --no-fund
fi
exec npm run dev
