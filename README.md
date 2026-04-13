# Multi Agent Debater

Several **debater** roles argue in one thread; a **judge** picks a winner. **FastAPI** backend, **React + TypeScript + Vite + Tailwind** UI.

## What’s included

- **Debate + judge** via `POST /api/debate` (LLM when configured, otherwise **demo** turns and a simple heuristic judge).
- **Optional accounts**: register / login (JWT), SQLite user store and **activity log** when signed in.
- **Browser LLM overrides**: Settings page stores API key / base URL / models in `localStorage`; the UI sends them as headers so each browser can point at its own provider without changing server env.
- **Health check** `GET /health` and **OpenAPI** at `/docs` on the API.

## Requirements

- **Python 3.10+** (backend)
- **Node.js 18+** (frontend)
- **Bash** (for `start.sh`; on Windows use **WSL** or Git Bash, or run the backend and frontend in two terminals as below)

## Quick start — one command (development)

**First time only:** create the backend virtualenv (the script installs frontend `node_modules` automatically if missing):

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env   # optional
cd ..
```

From the **repository root**:

```bash
chmod +x start.sh   # only if your checkout didn’t keep the executable bit
./start.sh
```

This starts:

- **FastAPI** at **http://127.0.0.1:8000** (`--reload`, OpenAPI at `/docs`)
- **Vite** at **http://localhost:5173** (proxies `/api` and `/health` to port 8000)

**Ctrl+C** stops both. The script checks for `backend/.venv` and runs `npm install` in `frontend/` if `node_modules` is missing.

---

## Quick start — manual (two terminals)

### 1. API

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env   # edit: at least JWT_SECRET for anything beyond local play
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On first run the app creates the SQLite file (default `./data/app.db` under `backend/`). That directory should be writable; it is **not** committed to git.

### 2. UI (development)

The Vite dev server **proxies** `/api` and `/health` to `http://127.0.0.1:8000`, so you normally **do not** set `VITE_API_BASE_URL` for local work.

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Start the API on port **8000** first if you use sign-in, activity, or real LLM calls.

### 3. Without `OPENAI_API_KEY`

The API still runs: debaters use **stub** content and the judge uses a **non-LLM** verdict so you can click through the flow offline.

---

## Backend environment (`backend/.env`)

Copy from `backend/.env.example`. Important variables:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | If set, enables OpenAI-compatible **chat** for debaters and JSON judge. |
| `OPENAI_BASE_URL` | API base (default `https://api.openai.com/v1`). |
| `DEBATE_MODEL` / `JUDGE_MODEL` | Model names (defaults `gpt-4o-mini`). |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API (include your dev UI and production UI URLs). |
| `DATABASE_PATH` | SQLite path (default `./data/app.db`). |
| `JWT_SECRET` | **Required for real use** — long random string; tokens are invalid if this changes. |
| `JWT_EXPIRE_MINUTES` | Access token lifetime (default `10080` ≈ 7 days). |

---

## API overview

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/health` | Liveness. |
| `POST` | `/api/debate` | Body: `topic`, optional `debaters`. Optional `Authorization: Bearer <jwt>`. Optional LLM override headers (below). |
| `POST` | `/api/auth/register` | Email, password, optional display name → JWT. |
| `POST` | `/api/auth/login` | Email + password → JWT. |
| `GET` | `/api/auth/me` | Current user (requires JWT). |
| `GET` | `/api/activity` | Signed-in user’s activity log (`?limit=` optional). |

### LLM overrides (per request)

If the UI sends these headers, they override server defaults for that debate only:

- `X-LLM-Api-Key`
- `X-LLM-Base-Url`
- `X-LLM-Debate-Model`
- `X-LLM-Judge-Model`

---

## Frontend

### Production / custom API URL

If the built UI is served from a different origin than the API, set the API root **before** `npm run build`:

```bash
export VITE_API_BASE_URL=https://your-api.example.com
npm run build
```

Omit trailing slash. With no variable, requests use **relative** `/api` (same origin as the static site).

### Settings → LLM

Values are kept in the browser (`localStorage`, keys prefixed `multi_agent_debater_llm_*`). They are sent only to **your** backend as the headers above; they are not stored server-side by this app.

### Main routes

`/`, `/login`, `/signup`, `/settings`, `/logs`, `/help`, `/offline` (and layout-wrapped variants as implemented in the router).

---

## Production checklist

1. Set a strong **`JWT_SECRET`** and keep it stable across deploys.
2. Set **`CORS_ORIGINS`** to your real UI origin(s).
3. Set **`OPENAI_API_KEY`** (or rely on per-user keys from Settings + headers).
4. Build the UI with **`VITE_API_BASE_URL`** if API and static hosting differ.
5. Run the API behind HTTPS in production; protect `DATABASE_PATH` (permissions, backups).

---

## Project layout

```
start.sh     Dev helper: API + Vite together (see above)
backend/     FastAPI app, SQLite, auth & activity
frontend/    Vite + React app
```

OpenAPI docs: **http://localhost:8000/docs** when the API is running.
