#!/bin/zsh
set -e

cd "$(dirname "$0")"

PORT="${PORT:-3006}"
HOST="${HOST:-127.0.0.1}"
NODE_BIN="${NODE_BIN:-node}"

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "Node.js was not found. Please install Node.js or set NODE_BIN to your Node executable."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "node_modules is missing. Please install dependencies first."
  exit 1
fi

if [ ! -d ".next" ]; then
  echo ".next build output is missing. Building first..."
  NEXT_TEST_WASM=1 NEXT_TEST_WASM_DIR="$PWD/node_modules/@next/swc-wasm-nodejs" \
    "$NODE_BIN" node_modules/next/dist/bin/next build --webpack
fi

echo ""
echo "Starting COWIN MAGNET preview..."
echo "URL: http://$HOST:$PORT"
echo ""
echo "If the port is busy, run: PORT=3007 ./start-preview.sh"
echo "Press Ctrl+C to stop."
echo ""

NEXT_TEST_WASM=1 NEXT_TEST_WASM_DIR="$PWD/node_modules/@next/swc-wasm-nodejs" \
  "$NODE_BIN" node_modules/next/dist/bin/next start -H "$HOST" -p "$PORT"
