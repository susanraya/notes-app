<!-- sdlc:auto:start adr -->
# ADR-0002: Use FastAPI 0.115 for Backend

Status: Accepted  
Date: 2026-10-27

## Context and Problem Statement

Which Backend technology does the project use? Decided in architecture v1.

## Considered Options

- FastAPI 0.115
- Flask
- Django

## Decision Outcome

Chosen option: FastAPI 0.115, because A lean Python framework whose automatic request validation keeps the login and note-saving endpoints safe with little code, matching the small, well-defined surface of this app.

## Consequences

Auth (password hashing and tokens) is assembled from small libraries rather than a batteries-included framework, which keeps the footprint light here.
<!-- sdlc:auto:end adr -->