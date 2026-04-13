#!/usr/bin/env bash
# Start FastAPI (port 8000) and Vite (5173). Ctrl+C stops both.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT" || exit 1

BACK_PID=""
FRONT_PID=""

cleanup() {
  if [[ -n "${BACK_PID}" ]]; then
    kill "${BACK_PID}" 2>/dev/null || true
    wait "${BACK_PID}" 2>/dev/null || true
  fi
  if [[ -n "${FRONT_PID}" ]]; then
    kill "${FRONT_PID}" 2>/dev/null || true
    wait "${FRONT_PID}" 2>/dev/null || true
  fi
}

trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM
trap cleanup EXIT

if [[ ! -x backend/.venv/bin/uvicorn ]]; then
  echo "Backend venv not ready. Run once:"
  echo "  cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  echo "  cp .env.example .env   # optional"
  exit 1
fi

if [[ ! -f backend/.env ]]; then
  echo "Note: backend/.env missing — copy backend/.env.example if you need env vars."
fi

if [[ ! -d frontend/node_modules ]]; then
  echo "Installing frontend dependencies…"
  (cd frontend && npm install) || exit 1
fi

echo ""
echo "  API → http://127.0.0.1:8000  (OpenAPI /docs)"
echo "  UI  → http://localhost:5173  (/api proxied to the API)"
echo ""

(cd backend && exec .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) &
BACK_PID=$!

(cd frontend && exec npm run dev) &
FRONT_PID=$!

wait "${BACK_PID}" "${FRONT_PID}"
