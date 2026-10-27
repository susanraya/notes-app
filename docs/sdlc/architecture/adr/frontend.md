<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-10-27

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Vue
- Svelte

## Decision Outcome

Chosen option: React 19, because Delivers the responsive SPA with a rich-text editor and type-ahead search from a single codebase that adapts to desktop and mobile browsers; mature React rich-text editors (TipTap) plug in directly. The black-and-white restyle is expressed as shared CSS/theme tokens consumed by every screen, so switching the palette is a single-source change.

## Consequences

Client-side rendering needs a route guard that redirects unauthenticated users to login; acceptable for a single-user app. Centralising theme tokens means each screen must consume them rather than hard-coding colors, which US-014 establishes once for all screens.
<!-- sdlc:auto:end adr -->