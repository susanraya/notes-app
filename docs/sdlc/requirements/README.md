# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-TECHSTACK · approved · source: requirements:technology-stack

Product owner approved a fixed technology stack: FastAPI 0.115 backend, AWS cloud, PostgreSQL 16 database, React 19 frontend.

Decision: design and build against exactly this stack, no substitutions. Rationale given: FastAPI is lean and validates requests for the small single-user login/CRUD/search backend; AWS covers browser-reachable hosting plus managed, backed-up Postgres (RDS) at low cost for a free single-user app; PostgreSQL 16 stores structured note records (title, body, last-updated timestamp) with built-in full-text search covering the title+body search requirement; React 19 supports the responsive, interactive rich-text editor (via libraries like TipTap/Slate) and instant search UI across desktop and mobile.

- ⚠ No architecture-phase input exists yet to confirm this stack was actually applied in a design.

### REQ-SCOPE-EXCLUSIONS · draft · source: requirements:scope

Explicit out-of-scope items for this delivery: file/image attachments and any organizing structures (tags, labels, folders, notebooks).

Requirements state these must not be designed or built in this scope: (1) File and image attachments on notes, (2) Tags, labels, folders and notebooks for organising notes. Confirmed again in AC-009 (no attachment option in editor) and AC-019 (no tags/labels/folders/notebooks in notes list).

### REQ-US-001 · draft · source: requirements:US-001

Critical story: the sole owner logs in with email and password to reach their private notes.

Acceptance: (AC-001) correct email+password on the login page authenticates the user and routes them to the notes list. (AC-002) incorrect credentials keep the user on the login page with an error message. (AC-003) no self-service sign-up or account-creation option is offered anywhere on the login page, consistent with the epic assumption that the single account's credentials are provisioned outside any self-service flow.

**Related:** EPIC-001, AC-001, AC-002, AC-003, NFR-002

### REQ-US-002 · draft · source: requirements:US-002

Critical story: all notes screens require a valid login, and logging out ends the session.

Acceptance: (AC-004) an unauthenticated visitor attempting to open the notes list, view, or editor directly is redirected to the login page, never seeing note content. (AC-005) logging out ends the session and returns the user to the login page; reaching notes screens again requires logging back in.

**Related:** EPIC-001, AC-004, AC-005, NFR-001, NFR-002

### REQ-US-003 · draft · source: requirements:US-003

Critical story: logged-in user creates a new note with a title and rich-text body.

Acceptance: (AC-006) creating a new note opens an empty editor with a title field and a rich-text body field. (AC-007) once saved, the note is stored and appears in the notes list.

**Related:** EPIC-002, AC-006, AC-007

### REQ-US-004 · draft · source: requirements:US-004

High-priority story: note body supports bold, lists, headings and links; no attachments.

Acceptance: (AC-008) applying bold, list, heading, or link formatting to selected text shows the formatting in the editor and it persists through save and reopen. (AC-009) the editor offers no option to add file or image attachments, consistent with the out-of-scope exclusion.

**Related:** EPIC-002, AC-008, AC-009

### REQ-US-005 · draft · source: requirements:US-005

High-priority story: user opens a saved note to read its full title and formatted body.

Acceptance: (AC-010) selecting a saved note from the list displays its title and rich-text body with formatting preserved.

**Related:** EPIC-003, AC-010

### REQ-US-006 · draft · source: requirements:US-006

High-priority story: user edits the title/body of an existing note.

Acceptance: (AC-011) changing and saving a note's title or body stores the update and shows it on reopen. (AC-012) saving an edit sets the note's last-updated timestamp to the time of that change.

**Related:** EPIC-003, AC-011, AC-012

### REQ-US-007 · draft · source: requirements:US-007

High-priority story: changes are auto-saved (or explicitly saved) so work is never lost, with timestamp updates.

Acceptance: (AC-013) saving changes, automatically or via explicit action, persists content and updates the last-updated timestamp. (AC-014) after reloading the app and reopening a note, the most recently saved changes are present. No version history is kept per the epic assumption.

**Related:** EPIC-003, AC-013, AC-014, NFR-003

### REQ-US-008 · draft · source: requirements:US-008

Medium-priority story: user deletes a note they no longer need; deletion is permanent.

Acceptance: (AC-015) confirming deletion removes the note from the notes list and from search results. (AC-016) a deleted note cannot be recovered from within the app -- this is an accepted risk per NFR-007 since no version history is kept.

**Related:** EPIC-003, AC-015, AC-016, NFR-007

### REQ-US-009 · draft · source: requirements:US-009

High-priority story: notes list shows all notes newest-first by last-updated timestamp.

Acceptance: (AC-017) the notes list shows all notes ordered by last-updated timestamp, most recent first. (AC-018) editing a note moves it to the top of the list as its timestamp changes. (AC-019) no tags, labels, folders or notebooks are presented, consistent with the out-of-scope exclusion.

**Related:** EPIC-004, AC-017, AC-018, AC-019

### REQ-US-010 · draft · source: requirements:US-010

High-priority story: search box filters notes by matching text in title and body.

Acceptance: (AC-020) typing a term filters the list to notes whose title or body text matches it. (AC-021) when no notes match, an empty-result indication is shown and the term can be cleared to return to the full list. Per NFR-004, filtering happens as the user types.

**Related:** EPIC-004, AC-020, AC-021, NFR-004

### REQ-US-011 · draft · source: requirements:US-011

High-priority story: app adapts to desktop and mobile browser screen sizes.

Acceptance: (AC-022) login, notes list, and editor are usable and readable at desktop widths. (AC-023) the same screens adapt to mobile screen sizes with all core actions usable, without any native app.

**Related:** EPIC-005, AC-022, AC-023, NFR-005

### REQ-US-012 · draft · source: requirements:US-012

Medium-priority story: notes are stored in the app's own database, with no external sync/export.

Acceptance: (AC-024) logging out and back in later retrieves notes from the app's own database, shown as before. (AC-025) no option to sync with or export to external services (e.g. Evernote, Google Keep) is offered in this version.

**Related:** EPIC-005, AC-024, AC-025, NFR-001, NFR-006

### REQ-US-013 · draft · source: requirements:US-013

Low-priority story: the app is free, with no payment, billing or subscription ever presented.

Acceptance: (AC-026) no payment, billing, subscription, or paywall screen is presented at any point while using any feature of the app.

**Related:** EPIC-005, AC-026

### REQ-NFR-001 · draft · source: requirements:NFR-001

Privacy NFR: notes are visible only to the single signed-in owner; no sharing, collaboration or multi-user access.

The app serves exactly one person keeping private notes. Applies to US-002 (auth-gated notes screens) and US-012 (app's own private data store).

**Related:** US-002, US-012

### REQ-NFR-002 · draft · source: requirements:NFR-002

Security NFR: valid login required for all note access; logout ends the session.

Every notes screen requires valid authentication; unauthenticated attempts redirect to login; logging out ends the session so notes require a fresh login to reach again. Applies to US-001 and US-002.

**Related:** US-001, US-002

### REQ-NFR-003 · draft · source: requirements:NFR-003

Usability NFR: no work lost -- auto-save or explicit save must persist the latest content.

Edits must be saved automatically or via an explicit save so typed work is never lost; the most recently saved content must be present after reloading the app. Applies to US-007.

**Related:** US-007

### REQ-NFR-004 · draft · source: requirements:NFR-004

Usability NFR: search filters the list live as the user types, matching title and body.

The notes list updates to match the search term as it is typed, filtering on both title and body text. Applies to US-010.

**Related:** US-010

### REQ-NFR-005 · draft · source: requirements:NFR-005

Compatibility NFR: responsive web app usable and readable on both desktop and mobile browsers.

All core actions must be available without a native app, on both desktop and mobile browser widths. Applies to US-011.

**Related:** US-011

### REQ-NFR-006 · draft · source: requirements:NFR-006

Availability NFR: notes persist reliably across sessions via the app's own database.

Notes are kept in the app's own database and retrieved reliably across sessions, so saved notes reappear after logging out and back in later. Applies to US-012.

**Related:** US-012

### REQ-NFR-007 · draft · source: requirements:NFR-007

Availability NFR (accepted risk): no version history or note recovery after deletion.

The app keeps no version history; once deleted, a note cannot be recovered from within the app. This loss of recoverability is an explicitly accepted risk. Applies to US-008.

**Related:** US-008

### REQ-NFR-008 · draft · source: requirements:NFR-008

Scalability NFR (accepted risk): built for exactly one user, not multi-tenant.

The app is deliberately single-user scale only; supporting multiple concurrent users, teams, or roles is not provided. Applies to the whole system.
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v1  
**Delivery scope:** lightweight  
**Approved:** 2026-10-26

**Capabilities in scope:** Single-user login to protect access, Create a note with a title and rich-text body, Rich-text formatting (bold, lists, headings, links), View a note, Edit a note, Delete a note, Auto-save with a last-updated timestamp, Notes list ordered newest-first, Search notes by title and body text, Responsive layout for desktop and mobile browsers, Email-and-password login for the single user, no public sign-up, Free app with no payments, billing or subscriptions, Notes kept in the app's own store, no sync to external services

**Approved technology stack:**

| Layer | Choice | Rationale |
|---|---|---|
| backend | FastAPI | The backend here is small and well-defined: log one person in, and create/read/update/delete/search their notes. FastAPI is a lean Python framework that does this with very little code, and its automatic request validation keeps the note-saving and login endpoints safe without extra libraries. Its light footprint suits an app that only ever serves one user. |
| cloud | AWS | You need the app reachable from any desktop or mobile browser, with the notes database and backups running somewhere dependable. AWS covers all of that and scales down to a very small, low-cost setup that fits a free, single-user app. Managed Postgres (RDS) means your notes are backed up automatically rather than by hand. |
| database | PostgreSQL | Notes are structured records (title, body, last-updated timestamp) that must be stored reliably and ordered newest-first, and your search has to match both title and body text. PostgreSQL stores all of this in one place and has built-in full-text search, so the search box you described works without adding a separate search product. It handles a single user's notes effortlessly and will never be the thing that limits this app. |
| frontend | React | Your product is a responsive web app with a rich-text editor (bold, lists, headings, links) and instant search that updates as the user types. React handles exactly this kind of interactive, in-browser editing and gives you a single codebase that adapts to both desktop and mobile browsers, which is what you asked for. Mature rich-text editors (TipTap, Slate) plug straight into React, so the formatting features don't have to be built from scratch. |
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start epics -->
## EPIC-001: Single-User Access & Authentication

Access to the application is protected by a single-user login using email and password. There is no public sign-up, no multiple accounts, no roles and no team/workspace concept — the app serves exactly one person keeping private notes.

Assumption: Access is protected by a single-user login (email + password); no public sign-up or roles. The single account's credentials are provisioned outside of any self-service sign-up flow.

### US-001: Log in with email and password

**Priority:** critical

> As a sole owner of the notes app, I want to log in with my email and password, so that only I can reach my private notes.

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | I am an unauthenticated visitor on the login page | I enter the correct email and password and submit | I am authenticated and taken to my notes list |
| AC-002 | I am on the login page | I enter an incorrect email or password and submit | I remain on the login page and see an error message indicating the credentials were not accepted |
| AC-003 | the understanding states there is no public sign-up or roles | I look at the login page | no self-service sign-up or account-creation option is offered |

### US-002: Protect notes behind authentication

**Priority:** critical

> As a sole owner of the notes app, I want all notes screens to require a valid login, so that my notes stay private when I am not signed in.

| ID | Given | When | Then |
|---|---|---|---|
| AC-004 | I am not logged in | I attempt to open any notes screen directly (list, view or editor) | I am redirected to the login page instead of seeing any note content |
| AC-005 | I am logged in | I choose to log out | my session ends and I am returned to the login page, and reaching notes screens again requires logging in |

## EPIC-002: Note Creation & Rich-Text Editing

The user can create a note with a title and a rich-text body. The body supports formatting including bold, lists, headings and links. File and image attachments are explicitly out of scope.

### US-003: Create a new note

**Priority:** critical

> As a logged-in user, I want to create a new note with a title and a body, so that I can capture something I want to keep.

| ID | Given | When | Then |
|---|---|---|---|
| AC-006 | I am logged in and viewing my notes | I choose to create a new note | an empty note editor opens with fields for a title and a rich-text body |
| AC-007 | I have opened a new note and entered a title and/or body | the note is saved | it is stored in the app and appears in my notes list |

### US-004: Format note body with rich text

**Priority:** high

> As a logged-in user, I want to apply bold, lists, headings and links in the note body, so that I can structure and emphasise my notes.

| ID | Given | When | Then |
|---|---|---|---|
| AC-008 | I am editing a note body | I apply bold, a list, a heading or a link to selected text | the formatting is shown in the editor and retained when the note is saved and reopened |
| AC-009 | the understanding excludes attachments | I am editing a note | the editor offers no option to add file or image attachments |

## EPIC-003: View, Edit & Delete Notes

Core actions on an existing note: view it, edit its title and body, and delete it. Notes save automatically or on an explicit save action and keep a last-updated timestamp used for ordering.

Assumption: Core actions are create, view, edit and delete a note; notes save automatically or on an explicit save and keep a last-updated timestamp used for ordering. No version history is kept.

### US-005: View a note

**Priority:** high

> As a logged-in user, I want to open a note and read its full title and formatted body, so that I can review what I previously saved.

| ID | Given | When | Then |
|---|---|---|---|
| AC-010 | I have at least one saved note | I select it from the notes list | its title and rich-text body are displayed with the formatting preserved |

### US-006: Edit a note

**Priority:** high

> As a logged-in user, I want to change the title and body of an existing note, so that I can keep my notes up to date.

| ID | Given | When | Then |
|---|---|---|---|
| AC-011 | I am viewing an existing note | I change its title or body and the change is saved | the updated content is stored and shown when I reopen the note |
| AC-012 | I edit a note | the change is saved | the note's last-updated timestamp is set to the time of that change |

### US-007: Auto-save with last-updated timestamp

**Priority:** high

> As a logged-in user, I want my note changes to be saved without losing work, so that I do not have to worry about losing what I typed.

| ID | Given | When | Then |
|---|---|---|---|
| AC-013 | I am editing a note | my changes are saved (automatically or via an explicit save action) | the note's content is persisted and its last-updated timestamp is updated to reflect the save |
| AC-014 | a note has been saved | I reload the app and reopen that note | my most recently saved changes are present |

### US-008: Delete a note

**Priority:** medium

> As a logged-in user, I want to delete a note I no longer need, so that my notes list stays relevant.

| ID | Given | When | Then |
|---|---|---|---|
| AC-015 | I am viewing or selecting an existing note | I confirm deletion of that note | the note is removed and no longer appears in my notes list or search results |
| AC-016 | the understanding states there is no version history | a note has been deleted | it cannot be recovered from within the app |

## EPIC-004: Notes List & Search

All notes appear in a single list ordered newest-first by last-updated timestamp. A search box finds notes by matching text in both the title and the body. There are no tags, labels, folders or notebooks.

Assumption: Search matches against both note title and body text. Organising features (tags, labels, folders, notebooks) are out of scope.

### US-009: See all notes newest-first

**Priority:** high

> As a logged-in user, I want to see all my notes in a single list ordered newest-first, so that my most recently updated notes are easiest to find.

| ID | Given | When | Then |
|---|---|---|---|
| AC-017 | I have multiple saved notes | I open the notes list | all my notes are shown in one list ordered by last-updated timestamp with the most recently updated first |
| AC-018 | I edit a note so its last-updated timestamp changes | I return to the notes list | that note moves to the top of the list |
| AC-019 | the understanding excludes organising features | I view the notes list | no tags, labels, folders or notebooks are presented |

### US-010: Search notes by title and body

**Priority:** high

> As a logged-in user, I want to search my notes by typing text, so that I can quickly find a specific note.

| ID | Given | When | Then |
|---|---|---|---|
| AC-020 | I have notes whose title or body contains a given term | I type that term into the search box | the list is filtered to notes whose title or body text matches the term |
| AC-021 | no notes match the search term | the search returns no results | an empty-result indication is shown and the search box lets me clear the term to return to the full list |

## EPIC-005: Responsive Web Platform & Data Storage

The application is delivered as a responsive web app usable in desktop and mobile browsers; there is no native mobile or desktop app. Notes are stored in the app's own database with no sync or export to external services. The app is free with no payments, billing or subscriptions.

Assumptions: Delivered as a responsive web application for desktop and mobile browsers only; notes are kept in the app's own store with no external sync or export; the app is free with no payments, billing or subscriptions.

### US-011: Use the app on desktop and mobile browsers

**Priority:** high

> As a logged-in user, I want the app to adapt to desktop and mobile browser screen sizes, so that I can read and manage notes on whatever device I am using.

| ID | Given | When | Then |
|---|---|---|---|
| AC-022 | I open the app in a desktop browser | the notes list, editor and login are displayed | the layout is usable and readable at desktop widths |
| AC-023 | I open the app in a mobile browser | the notes list, editor and login are displayed | the layout adapts to the smaller screen and all core actions remain usable without a native app |

### US-012: Store notes in the app's own database

**Priority:** medium

> As a logged-in user, I want my notes kept in the app's own store, so that my notes persist reliably between sessions and remain private to this app.

| ID | Given | When | Then |
|---|---|---|---|
| AC-024 | I have saved notes | I log out and log back in later | my notes are retrieved from the app's own database and shown as before |
| AC-025 | the understanding excludes external sync and export | I use the app | no option to sync with or export to external services (e.g. Evernote, Google Keep) is offered in this version |

### US-013: Use the app free of charge

**Priority:** low

> As a logged-in user, I want to use the app without any payment, so that I am never asked to pay or subscribe to keep my notes.

| ID | Given | When | Then |
|---|---|---|---|
| AC-026 | the understanding states the app is free | I use any feature of the app | no payment, billing, subscription or paywall screen is presented at any point |
<!-- sdlc:auto:end epics -->
