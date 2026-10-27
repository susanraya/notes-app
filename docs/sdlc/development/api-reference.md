# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| POST | /auth/login | login | `backend/app/routers/auth.py:26` | — |
| POST | /auth/logout | logout | `backend/app/routers/auth.py:39` | — |
| GET | /health | health | `backend/app/main.py:44` | Liveness probe, and the only route here that is not a stub. |
| GET | /notes | list_notes | `backend/app/routers/notes.py:31` | — |
| POST | /notes | create_note | `backend/app/routers/notes.py:40` | — |
| DELETE | /notes/{note_id} | delete_note | `backend/app/routers/notes.py:75` | — |
| GET | /notes/{note_id} | get_note | `backend/app/routers/notes.py:50` | — |
| PUT | /notes/{note_id} | update_note | `backend/app/routers/notes.py:62` | — |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- DELETE /notes/{id}
- GET /notes/{id}
- PUT /notes/{id}

**Code only:**

- DELETE /notes/{note_id}
- GET /notes/{note_id}
- PUT /notes/{note_id}
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `614cf9d`
<!-- sdlc:auto:end source -->
