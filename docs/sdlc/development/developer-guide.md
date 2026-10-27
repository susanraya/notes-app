# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `614cf9d` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
This is a generated two-app notes project: a Vite + React 19 single-page frontend containing the approved, reviewed UI screens (currently running on seeded sample data, not yet wired to the API), and a FastAPI 0.115 backend that implements the approved Notes API (single-owner JWT login plus note CRUD) backed by SQLAlchemy models and Alembic migrations. The backend defaults to a local SQLite file so it runs with no external database, while docker-compose provides a Postgres 16 container matching the approved architecture.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for Vite 6 / React 19 frontend tooling)
- Python 3.12
- pip
- Docker (optional, for the Postgres 16 service in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. git clone the repository and cd into it
2. cd backend && pip install -r requirements.txt
3. (optional) docker-compose up -d to start the Postgres 16 db service; otherwise the app defaults to a local SQLite file (app.db)
4. (optional) set DATABASE_URL to point at Postgres instead of the SQLite default
5. cd backend && alembic upgrade head  # creates the users/notes tables (the app no longer creates them on startup)
6. cd backend && uvicorn app.main:app --reload
7. In a separate terminal: cd frontend && npm install
8. cd frontend && npm run dev
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend dev | `uvicorn app.main:app --reload` | Run the FastAPI backend locally with autoreload (from backend/) |
| frontend dev | `npm run dev` | Start the Vite dev server for the React SPA (from frontend/) |
| frontend build | `npm run build` | Bundle the frontend for deployment (does not typecheck) |
| frontend preview | `npm run preview` | Serve the production build locally |
| db up | `docker-compose up -d` | Start the Postgres 16 database container defined in docker-compose.yml |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend` | FastAPI service: app code, Alembic migrations, tests, Dockerfile |
| `backend/app` | Application package: main entrypoint, config, database, models, schemas, routers, services, security |
| `backend/migrations` | Alembic migration scripts for the users and notes tables |
| `backend/tests` | Pytest unit and integration tests for auth, notes, security and health |
| `frontend` | Vite + React SPA: approved screens, API client, and tests |
| `frontend/src` | App source: screens, lib (api client, auth, ui/icons/brand), App.tsx shell |
| `frontend/e2e` | Playwright end-to-end specs for auth and notes flows |
| `.quorq` | Platform metadata (handoff/prepared state) used by the Quorq SDLC platform |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend: one router per architecture component (auth.py, notes.py) registered in routers/__init__.py
- Backend: thin route handlers delegate persistence/ownership logic to app/services/*.py
- Backend: one SQLAlchemy model and matching Pydantic schema pair per entity (User/Note)
- Backend: all /notes routes require a valid JWT via the get_current_owner dependency
- Backend: DATABASE_URL env var selects the database; SQLite is the zero-setup default
- Frontend: one module per approved screen under src/screens/
- Frontend: shared component/icon vocabulary in src/lib/ui.tsx and src/lib/icons.tsx; brand tokens in src/lib/brand.ts and index.css
- Frontend: API calls go through the single apiFetch wrapper in src/lib/api.ts, which attaches the bearer token and redirects to /login on 401
- Frontend: routes are guarded by a RequireAuth wrapper in App.tsx checking isAuthenticated()
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend tests | `pytest` | Run backend unit and integration tests (from backend/) |
| backend lint | `ruff check .` | Lint the backend code |
| backend format | `ruff format .` | Format the backend code |
| frontend tests | `npm test` | Run Vitest component tests (from frontend/) |
| frontend lint | `npm run lint` | Run ESLint over the frontend app |
| frontend typecheck | `npm run typecheck` | Run tsc --noEmit (not run by build) |
| frontend e2e | `npm run test:e2e` | Run Playwright acceptance tests; builds/boots backend and frontend locally unless E2E_BASE_URL is set |
| e2e browser install | `npm run test:e2e:install` | Install the Chromium browser Playwright needs |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Backend returns 404/errors for notes because tables don't exist | Run `alembic upgrade head` from backend/ — the app no longer creates tables on startup, it relies on migrations |
| Frontend requests are blocked by CORS | Set the ALLOWED_ORIGINS env var (comma-separated) on the backend to include the frontend's origin; it defaults to the Vite dev server origins (localhost:5173) |
| Password hashing raises an error from passlib/bcrypt | Ensure bcrypt stays pinned to 4.0.1 as in requirements.txt — passlib's bcrypt backend breaks on bcrypt 4.1+ |
| Frontend screens don't reflect real backend data | The approved frontend screens currently run on seeded sample data; wiring each screen to the backend API in src/lib/api.ts is still pending work |
| `npm run build` succeeds but deployment fails on type errors | Run `npm run typecheck` (tsc --noEmit) before shipping, since build does not typecheck |
<!-- sdlc:auto:end troubleshooting -->
