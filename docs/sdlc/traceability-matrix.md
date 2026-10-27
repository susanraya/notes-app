# Traceability Matrix

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start legend -->
Built from recorded links, not written by a model: requirement key → plan item (`source_stable_key`) → development ticket (`stable_key`) → the ticket's test steps → the last live deployment that started after the work finished. **AC tests** counts the story's acceptance criteria that have a test case, and those whose test cases all passed in the latest finished E2E run.
<!-- sdlc:auto:end legend -->

<!-- sdlc:auto:start matrix -->
| Requirement | Epic | Title | Plan items | Sprint | Design | Code | Commits | Ticket | Tests | AC tests | Deployed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | EPIC-001 | Log in with email and password | US-001, US-001-T1, US-001-T2, US-001-T3 | 1 | POST /auth/login, backend, frontend, users | backend/alembic.ini, backend/app/dependencies.py, backend/app/main.py, backend/app/routers/auth.py, backend/app/routers/notes.py +19 more | 5b21427 | delivered | not run | 3/3 tested · 1/3 passing | — |
| US-002 | EPIC-001 | Protect notes behind authentication | US-002 | 1 | POST /auth/logout, backend, frontend, users | — | 5b21427 | delivered | not run | 2/2 tested · 0/2 passing | — |
| US-003 | EPIC-002 | Create a new note | US-003 | 1 | POST /notes, backend, database, frontend, notes | backend/app/routers/notes.py, backend/app/services/__init__.py, backend/app/services/notes.py, backend/tests/integration/test_notes.py, frontend/e2e/notes.spec.ts +4 more | 6d36a16 | delivered | not run | 2/2 tested · 2/2 passing | — |
| US-004 | EPIC-002 | Format note body with rich text | US-004 | 2 | frontend, notes | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-005 | EPIC-003 | View a note | US-005 | 2 | GET /notes/{id}, frontend, notes | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
| US-006 | EPIC-003 | Edit a note | US-006 | 2 | PUT /notes/{id}, backend, frontend, notes | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-007 | EPIC-003 | Auto-save with last-updated timestamp | US-007 | 2 | PUT /notes/{id}, backend, frontend, notes | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-008 | EPIC-003 | Delete a note | US-008 | 2 | DELETE /notes/{id}, backend, frontend, notes | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-009 | EPIC-004 | See all notes newest-first | US-009 | 2 | GET /notes, backend, frontend, notes | — | — | not started | not run | 0/3 tested · 0/3 passing | — |
| US-010 | EPIC-004 | Search notes by title and body | US-010 | 3 | GET /notes, backend, frontend, notes | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-011 | EPIC-005 | Use the app on desktop and mobile browsers | US-011 | 3 | frontend | — | — | not started | not run | 0/2 tested · 0/2 passing | — |
| US-012 | EPIC-005 | Store notes in the app's own database | US-012 | 1 | backend, database, notes, users | — | 6d36a16 | delivered | not run | 2/2 tested · 1/2 passing | — |
| US-013 | EPIC-005 | Use the app free of charge | US-013 | 3 | frontend | — | — | not started | not run | 0/1 tested · 0/1 passing | — |
<!-- sdlc:auto:end matrix -->
