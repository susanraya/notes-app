<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-10-26

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Vue
- Svelte

## Decision Outcome

Chosen option: React 19, because Delivers the responsive SPA with a rich-text editor and type-ahead search from a single codebase that adapts to desktop and mobile browsers; mature React rich-text editors (TipTap) plug in directly.

## Consequences

Client-side rendering needs a route guard that redirects unauthenticated users to login; acceptable for a single-user app.
<!-- sdlc:auto:end adr -->