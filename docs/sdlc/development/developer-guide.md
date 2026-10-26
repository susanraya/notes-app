# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `188231b` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
This is a Quorq AI SDLC generated 'notes app' repository containing two independent applications. The frontend is a Vite + React 19 single-page app whose screens were generated from an approved design and currently render seeded sample data rather than live API calls. The backend is a FastAPI 0.115 service for which no architecture had been approved at generation time, so it currently exposes only a health-check endpoint and stub infrastructure (SQLAlchemy models, Pydantic schemas, a router package) ready for real endpoints to be added. The backend defaults to a local SQLite database but can be pointed at PostgreSQL (the approved database, runnable locally via the provided docker-compose service) through an environment variable.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for npm/Vite, frontend/package.json uses Vite 6 and React 19)
- npm
- Python 3.12 (matches backend/Dockerfile base image)
- pip
- Docker and Docker Compose (optional, for running the PostgreSQL service in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository
2. cd backend && pip install -r requirements.txt
3. (optional) docker compose up -d   # starts PostgreSQL 16 on localhost:5432 as defined in docker-compose.yml
4. (optional) set DATABASE_URL to point the backend at Postgres instead of the default SQLite file; otherwise no setup is needed and app.db (SQLite) is created automatically
5. cd frontend && npm install
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend dev | `uvicorn app.main:app --reload` | Runs the FastAPI backend locally with auto-reload (from backend/, after pip install) |
| frontend dev | `npm run dev` | Starts the Vite dev server for the React SPA (from frontend/) |
| frontend build | `npm run build` | Bundles the frontend app with Vite; does not typecheck |
| frontend preview | `npm run preview` | Serves the production build locally |
| db | `docker compose up -d` | Starts the PostgreSQL 16 database container defined in docker-compose.yml |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend/app` | FastAPI application code: entrypoint (main.py), DB engine/session (database.py), SQLAlchemy models (models.py), Pydantic schemas (schemas.py), and routers/ for per-component endpoint routers |
| `backend/tests` | Pytest test suite (currently covers the health endpoint) |
| `backend/Dockerfile` | Container image definition for the FastAPI service, runs as non-root user, exposes port 8000 with a health check |
| `frontend/src` | React SPA source: main.tsx entrypoint, lib/ (api client, icons, ui components, navigation), index.css |
| `frontend/e2e` | Playwright end-to-end acceptance tests |
| `.quorq` | Quorq platform metadata (handoff.json) |
| `docker-compose.yml` | Defines the local PostgreSQL 16 service used by the backend |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend organizes endpoints into one router per approved architecture component under backend/app/routers
- Unimplemented backend routes return a typed StubResponse (schemas.py) rather than failing, keeping the OpenAPI spec complete
- SQLAlchemy models live in models.py and share a single Base from database.py; schemas.py holds Pydantic request/response models
- Backend DB connection is driven by the DATABASE_URL env var, defaulting to local SQLite for zero-setup runs
- CORS allowed origins are driven by the ALLOWED_ORIGINS env var, falling back to the Vite dev server origins
- Frontend uses the '@/' path alias mapped to src/ (see tsconfig.json and vite.config.ts)
- Frontend API calls go through src/lib/api.ts, using VITE_API_BASE_URL and VITE_API_SECRET_KEY (bearer auth) env vars; screens currently use seeded sample data instead
- Frontend component tests live beside the components they test and are matched under src/**/*.{test,spec}.{ts,tsx}; Playwright specs live separately in e2e/
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend test | `pytest` | Runs backend tests (from backend/; pytest.ini sets pythonpath so 'import app' works) |
| backend lint | `ruff check .` | Lints the backend Python code |
| backend format | `ruff format .` | Formats backend Python code with ruff |
| frontend unit test | `npm run test` | Runs Vitest component tests |
| frontend typecheck | `npm run typecheck` | Runs tsc --noEmit to typecheck the frontend |
| frontend lint | `npm run lint` | Runs ESLint over the frontend app |
| frontend e2e install | `npm run test:e2e:install` | Installs the Chromium browser needed for Playwright |
| frontend e2e | `npm run test:e2e` | Runs Playwright acceptance tests; builds backend+frontend and serves them locally unless E2E_BASE_URL is set |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Frontend calls to the backend are blocked by CORS | Set the ALLOWED_ORIGINS env var on the backend to include the frontend's origin (comma-separated); defaults only allow localhost:5173/127.0.0.1:5173 |
| `pytest` fails with an import error for `app` | Run pytest from the backend/ directory so pytest.ini's pythonpath=. setting applies |
| Playwright e2e tests fail because the browser isn't installed | Run `npm run test:e2e:install` once before `npm run test:e2e` |
| Backend fails to connect when pointed at Postgres | Ensure docker compose up -d has started the db service and DATABASE_URL is set to a valid postgres connection string (psycopg driver is included in requirements.txt) |
| `npm run build` succeeds but the app has type errors | Run `npm run typecheck` (tsc --noEmit) separately, since build does not typecheck |
<!-- sdlc:auto:end troubleshooting -->
