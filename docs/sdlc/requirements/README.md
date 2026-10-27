# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-SCOPE · draft · source: requirements:scope

Defines the overall delivery scope and boundaries for the notes app: a lightweight, single-user, free, web-only notes application with no attachments or organisational features.

Delivery scope: lightweight. Requirements version: 2. In-scope capabilities: single-user login, create/view/edit/delete notes with rich-text body, rich-text formatting (bold/lists/headings/links), auto-save with last-updated timestamp, notes list ordered newest-first, search by title and body, responsive desktop/mobile layout, email-and-password login with no public sign-up, free app with no payments, notes stored only in the app's own store with no external sync. Out of scope: file/image attachments on notes; tags, labels, folders and notebooks for organising notes.

**Related:** US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013

- ⚠ No prior (v1) requirements content was provided, so it is unclear what changed between v1 and v2 of the requirements.

### REQ-TECHSTACK · approved · source: requirements:techstack

Technology stack approved by the product owner: FastAPI backend, AWS cloud, PostgreSQL 16 database, React 19 frontend. Stack choices are explicitly tied to the app's single-user, rich-text, searchable, responsive requirements.

Backend: FastAPI 0.115 - chosen for a small, well-defined API (single login, CRUD + search on notes) with built-in request validation; supports US-001/US-002 login and note CRUD stories. Cloud: AWS - chosen for browser reachability from desktop/mobile and managed Postgres (RDS) backups at low cost for a single-user free app; supports US-011, US-012, US-013. Database: PostgreSQL 16 - chosen for reliable structured storage of title/body/last-updated fields, newest-first ordering, and built-in full-text search covering both title and body; supports US-009, US-010, US-012. Frontend: React 19 - chosen for responsive, interactive rich-text editing with instant search-as-you-type, using mature editor libraries (TipTap, Slate) for formatting; supports US-004, US-010, US-011. The product owner approved designing/building against exactly this stack, no substitutions.

**Related:** US-001, US-004, US-010, US-011, US-012

### US-001 · draft · source: requirements:US-001

Single owner logs in with email and password to reach their private notes; no public sign-up or roles exist.

AC-001: correct email/password submission authenticates the user and routes to the notes list. AC-002: incorrect credentials keep the user on the login page with an error message. AC-003: no self-service sign-up or account-creation option is offered on the login page. Assumption: the single account's credentials are provisioned outside any self-service flow.

**Related:** US-002, US-015

- ⚠ How the single account's credentials are initially provisioned (who sets the email/password, and how) is not specified.
- ⚠ No password-reset/recovery flow is described.

### US-002 · draft · source: requirements:US-002

All notes screens (list, view, editor) require a valid login session; logging out ends the session and returns to login.

AC-004: unauthenticated attempts to open any notes screen redirect to the login page, with no note content shown. AC-005: logging out ends the session, returns to the login page, and subsequent access again requires login.

**Related:** US-001

- ⚠ Session duration/expiry behavior is not specified.

### US-015 · draft · source: requirements:US-015

Login screen is restyled with the new black-and-white theme, replacing the prior indigo/purple palette.

AC-028: login page background, text and input styling use the black-and-white palette instead of indigo/purple. AC-029: the credentials-error message is styled with the new monochrome palette and remains clearly legible.

**Related:** US-001, US-014

### US-003 · draft · source: requirements:US-003

Logged-in user creates a new note with a title and rich-text body, which is saved and appears in the notes list.

AC-006: choosing to create a new note opens an empty editor with title and rich-text body fields. AC-007: after entering title and/or body and saving, the note is stored and appears in the notes list.

**Related:** US-004, US-007

### US-004 · draft · source: requirements:US-004

Note body supports bold, lists, headings and links; no file or image attachment options are offered, per scope exclusion.

AC-008: applying bold, a list, a heading or a link to selected text shows the formatting in the editor and retains it when the note is saved and reopened. AC-009: the editor offers no option to add file or image attachments (explicitly out of scope).

**Related:** US-003, US-017

### US-017 · draft · source: requirements:US-017

Note creation editor and its formatting toolbar (bold/list/heading/link) are restyled with the black-and-white theme.

AC-032: title field, body field and toolbar render using the black-and-white palette instead of indigo/purple. AC-033: active/selected toolbar states (bold, list, heading, link) are rendered in the new monochrome palette.

**Related:** US-004, US-014

### US-005 · draft · source: requirements:US-005

User opens a saved note from the list and reads its full title and formatted body.

AC-010: selecting a saved note from the notes list displays its title and rich-text body with formatting preserved.

**Related:** US-009, US-018

### US-006 · draft · source: requirements:US-006

User edits the title and/or body of an existing note; the change is stored and the note's last-updated timestamp is set to the change time.

AC-011: changing title or body and saving stores the updated content, shown on reopening the note. AC-012: saving an edit sets the note's last-updated timestamp to the time of that change.

**Related:** US-005, US-007, US-018

### US-007 · draft · source: requirements:US-007

Changes to a note are saved (automatically or via explicit save) without losing work, and persist across app reloads.

AC-013: saving (automatic or explicit) persists note content and updates the last-updated timestamp. AC-014: reloading the app and reopening a note shows the most recently saved changes. Assumption: no version history is kept.

**Related:** US-003, US-006

- ⚠ Whether saving is purely automatic (e.g. on a timer/blur) or requires an explicit save action -- or both -- is not specified; AC-013 allows for either.

### US-008 · draft · source: requirements:US-008

User deletes a note they no longer need; it is permanently removed from the list and search with no recovery option.

AC-015: confirming deletion removes the note so it no longer appears in the notes list or search results. AC-016: deleted notes cannot be recovered from within the app (no version history, per assumption).

**Related:** US-009, US-010, US-019

### US-018 · draft · source: requirements:US-018

Note view and edit screens are restyled with the black-and-white theme, replacing indigo/purple.

AC-034: viewing a saved note renders title, body and formatting using the black-and-white palette. AC-035: the edit screen uses the same black-and-white palette as the view screen.

**Related:** US-005, US-006, US-014

### US-019 · draft · source: requirements:US-019

Delete confirmation dialog is restyled with the black-and-white theme.

AC-036: the delete confirmation shown when deleting an existing note is styled using the black-and-white palette instead of indigo/purple.

**Related:** US-008, US-014

### US-009 · draft · source: requirements:US-009

All notes appear in a single list ordered newest-first by last-updated timestamp; no tags, labels, folders or notebooks are presented.

AC-017: notes list shows all notes ordered by last-updated timestamp, most recent first. AC-018: editing a note so its timestamp changes moves it to the top of the list. AC-019: no tags, labels, folders or notebooks are presented (organising features out of scope).

**Related:** US-005, US-006, US-010, US-016

### US-010 · draft · source: requirements:US-010

A search box filters the notes list by matching typed text against both title and body; no-match state is shown with a way to clear the search.

AC-020: typing a term filters the list to notes whose title or body text matches. AC-021: when no notes match, an empty-result indication is shown and the search box allows clearing the term to return to the full list.

**Related:** US-009, US-016

### US-016 · draft · source: requirements:US-016

Notes list and search box are restyled with the black-and-white theme.

AC-030: list rows, highlights and the search box use the black-and-white palette instead of indigo/purple. AC-031: the empty-result indication is styled using the new monochrome palette.

**Related:** US-009, US-010, US-014

### US-011 · draft · source: requirements:US-011

The app adapts to desktop and mobile browser screen sizes; there is no native mobile or desktop app, only a responsive web app.

AC-022: desktop browser view renders the notes list, editor and login usably and readably at desktop widths. AC-023: mobile browser view adapts layout to smaller screens, and all core actions remain usable without a native app.

**Related:** US-020

### US-012 · draft · source: requirements:US-012

Notes are stored in the app's own database with no sync or export to external services such as Evernote or Google Keep.

AC-024: logging out and back in later retrieves notes from the app's own database, shown as before. AC-025: no option to sync with or export to external services is offered in this version.

**Related:** US-011

### US-013 · draft · source: requirements:US-013

The app is free to use, with no payment, billing, subscription or paywall ever presented.

AC-026: no payment, billing, subscription or paywall screen is presented at any point while using any feature of the app.

### US-014 · draft · source: requirements:US-014

Global design tokens (colors, backgrounds, borders) are switched from the old indigo/purple scheme to a black-and-white monochrome palette across the app.

AC-027: shared style/theme definitions are updated so all shared color variables resolve to black, white and greyscale values, with no indigo/purple values remaining in the shared theme.

**Related:** US-015, US-016, US-017, US-018, US-019, US-020

### US-020 · draft · source: requirements:US-020

The restyled black-and-white theme is checked for contrast and visual consistency on both desktop and mobile browser widths across all screens.

AC-037: after login, notes list, editor, view and delete confirmation are restyled, each is checked at desktop and mobile widths to confirm no indigo/purple colors remain and text/background contrast is clearly readable on every screen.

**Related:** US-011, US-014, US-015, US-016, US-017, US-018, US-019

- ⚠ This is a verification/QA activity described at requirements time; no actual verification results exist yet since testing has not started.
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v2  
**Delivery scope:** lightweight  
**Approved:** 2026-10-27

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

### US-015: Apply black-and-white theme to the login screen

**Priority:** low

> As a sole owner of the notes app, I want the login page styled with the new black-and-white theme, so that the first screen I see matches the new look.

| ID | Given | When | Then |
|---|---|---|---|
| AC-028 | I am on the login page | the page renders | its background, text and input styling use the black-and-white palette instead of indigo/purple |
| AC-029 | I submit incorrect credentials on the login page | the error message is shown | the error message is styled using the new monochrome palette and remains clearly legible |

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

### US-017: Apply black-and-white theme to the note creation editor and formatting toolbar

**Priority:** low

> As a logged-in user, I want the note editor and its bold/list/heading/link toolbar styled with the new black-and-white theme, so that creating and formatting notes matches the new look.

| ID | Given | When | Then |
|---|---|---|---|
| AC-032 | I open a new note editor | the editor renders | the title field, body field and toolbar use the black-and-white palette instead of indigo/purple |
| AC-033 | I apply bold, a list, a heading or a link in the editor | the formatting is shown | active/selected toolbar states are rendered using the new monochrome palette |

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

### US-018: Apply black-and-white theme to viewing and editing an existing note

**Priority:** low

> As a logged-in user, I want the note view and edit screens styled with the new black-and-white theme, so that reading and updating a saved note matches the new look.

| ID | Given | When | Then |
|---|---|---|---|
| AC-034 | I open a saved note to view it | the note content renders | the title, body and formatting are displayed using the black-and-white palette instead of indigo/purple |
| AC-035 | I am editing an existing note | the edit screen renders | it uses the same black-and-white palette as the view screen |

### US-019: Apply black-and-white theme to the delete confirmation

**Priority:** low

> As a logged-in user, I want the delete confirmation styled with the new black-and-white theme, so that deleting a note matches the new look.

| ID | Given | When | Then |
|---|---|---|---|
| AC-036 | I choose to delete an existing note | the delete confirmation is shown | it is styled using the black-and-white palette instead of indigo/purple |

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

### US-016: Apply black-and-white theme to the notes list and search box

**Priority:** low

> As a logged-in user, I want the notes list and search box styled with the new black-and-white theme, so that browsing and searching my notes matches the new look.

| ID | Given | When | Then |
|---|---|---|---|
| AC-030 | I have multiple saved notes | the notes list renders | list rows, highlights and the search box use the black-and-white palette instead of indigo/purple |
| AC-031 | no notes match my search term | the empty-result indication is shown | it is styled using the new monochrome palette |

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

### US-014: Define global black-and-white theme tokens

**Priority:** low

> As a sole owner of the notes app, I want the app's visual design tokens (colors, backgrounds, borders) switched to a black-and-white monochrome palette, so that the whole app has a consistent, high-contrast look instead of the old indigo/purple scheme.

| ID | Given | When | Then |
|---|---|---|---|
| AC-027 | the app's shared style/theme definitions currently use dark indigo/purple colors | the theme tokens are updated | all shared color variables resolve to black, white and greyscale values and no indigo/purple values remain in the shared theme |

### US-020: Verify black-and-white theme consistency across desktop and mobile browsers

**Priority:** low

> As a sole owner of the notes app, I want the new black-and-white theme checked for contrast and consistency on desktop and mobile browser widths, so that all screens remain readable and consistently styled after the restyle.

| ID | Given | When | Then |
|---|---|---|---|
| AC-037 | the login, notes list, editor, view and delete confirmation have been restyled | each is checked at desktop and mobile browser widths | no indigo/purple colors remain and text/background contrast is clearly readable on every screen |
<!-- sdlc:auto:end epics -->
