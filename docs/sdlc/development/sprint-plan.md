# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Stand up authentication and the ability to create and store notes

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Log in with email and password | 8 | backend-agent | — |
| ↳ US-001-T1 | Task | Implement POST /auth/login endpoint with credential validation | — | backend-agent | — |
| ↳ US-001-T2 | Task | Build login page UI with email and password fields | — | frontend-agent | — |
| ↳ US-001-T3 | Task | Implement session handling and redirect to notes list on success | — | backend-agent | — |
| ↳ US-001-T4 | Task | Add inline error messaging for invalid credentials | — | frontend-agent | — |
| US-002 | Story | Protect notes behind authentication | 5 | backend-agent | US-001 |
| US-003 | Story | Create a new note | 5 | backend-agent | US-002, US-012 |
| US-012 | Story | Store notes in the app's own database | 2 | devops-agent | — |

## Sprint 2: Sprint 2

Complete core note lifecycle: format, view, edit, auto-save, delete, list, and apply base theme tokens

Capacity: 20 points · Committed: 20

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-004 | Story | Format note body with rich text | 5 | frontend-agent | US-003 |
| US-005 | Story | View a note | 2 | frontend-agent | US-003 |
| US-006 | Story | Edit a note | 3 | backend-agent | US-003 |
| US-007 | Story | Auto-save with last-updated timestamp | 3 | frontend-agent | US-006 |
| US-008 | Story | Delete a note | 2 | backend-agent | US-003 |
| US-009 | Story | See all notes newest-first | 3 | backend-agent | US-003 |
| US-014 | Story | Define global black-and-white theme tokens | 2 | frontend-agent | — |

## Sprint 3: Sprint 3

Add search, responsive layout, free-app check, and restyle every screen to the black-and-white theme

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-015 | Story | Apply black-and-white theme to the login screen | 1 | frontend-agent | US-014 |
| US-017 | Story | Apply black-and-white theme to the note creation editor and formatting toolbar | 2 | frontend-agent | US-014, US-004 |
| US-018 | Story | Apply black-and-white theme to viewing and editing an existing note | 2 | frontend-agent | US-014, US-006 |
| US-019 | Story | Apply black-and-white theme to the delete confirmation | 1 | frontend-agent | US-014, US-008 |
| US-010 | Story | Search notes by title and body | 5 | backend-agent | US-009 |
| US-016 | Story | Apply black-and-white theme to the notes list and search box | 2 | frontend-agent | US-014, US-010 |
| US-011 | Story | Use the app on desktop and mobile browsers | 5 | frontend-agent | US-003 |
| US-013 | Story | Use the app free of charge | 1 | qa-agent | — |

## Sprint 4: Sprint 4

Verify theme consistency and contrast across desktop and mobile

Capacity: 20 points · Committed: 2

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-020 | Story | Verify black-and-white theme consistency across desktop and mobile browsers | 2 | qa-agent | US-015, US-016, US-017, US-018, US-019 |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
