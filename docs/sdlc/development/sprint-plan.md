# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Stand up login/session protection and the ability to create and persist a note end-to-end

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Log in with email and password | 8 | backend-agent | — |
| ↳ US-001-T1 | Task | Implement POST /auth/login with credential validation | — | backend-agent | — |
| ↳ US-001-T2 | Task | Build login page UI | — | frontend-agent | — |
| ↳ US-001-T3 | Task | Wire session storage and authenticated redirect | — | frontend-agent | — |
| US-002 | Story | Protect notes behind authentication | 5 | backend-agent | US-001 |
| US-003 | Story | Create a new note | 5 | backend-agent | US-002 |
| US-012 | Story | Store notes in the app's own database | 2 | devops-agent | US-003 |

## Sprint 2: Sprint 2

Complete core note management: formatting, view, edit with auto-save, delete, and the newest-first list

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-004 | Story | Format note body with rich text | 5 | frontend-agent | US-003 |
| US-005 | Story | View a note | 2 | frontend-agent | US-003 |
| US-006 | Story | Edit a note | 3 | backend-agent | US-003 |
| US-007 | Story | Auto-save with last-updated timestamp | 3 | frontend-agent | US-006 |
| US-008 | Story | Delete a note | 2 | backend-agent | US-003 |
| US-009 | Story | See all notes newest-first | 3 | backend-agent | US-003 |

## Sprint 3: Sprint 3

Add search, responsive layout across all screens, and confirm the app has no payment surfaces

Capacity: 20 points · Committed: 11

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-010 | Story | Search notes by title and body | 5 | backend-agent | US-009 |
| US-011 | Story | Use the app on desktop and mobile browsers | 5 | frontend-agent | US-003, US-005, US-009 |
| US-013 | Story | Use the app free of charge | 1 | qa-agent | — |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
