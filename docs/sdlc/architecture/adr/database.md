<!-- sdlc:auto:start adr -->
# ADR-0003: Use PostgreSQL 16 for Database

Status: Accepted  
Date: 2026-10-26

## Context and Problem Statement

Which Database technology does the project use? Decided in architecture v1.

## Considered Options

- PostgreSQL 16
- SQLite
- MySQL

## Decision Outcome

Chosen option: PostgreSQL 16, because Stores structured notes reliably, orders them newest-first by timestamp, and provides built-in full-text search over title and body so no separate search product is needed.

## Consequences

Full-text search uses tsvector with a GIN index; fine for one user's notes and never the limiting factor here.
<!-- sdlc:auto:end adr -->