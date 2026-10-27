<!-- sdlc:auto:start adr -->
# ADR-0004: Use AWS for Cloud

Status: Accepted  
Date: 2026-10-27

## Context and Problem Statement

Which Cloud technology does the project use? Decided in architecture v1.

## Considered Options

- AWS
- Google Cloud
- Azure

## Decision Outcome

Chosen option: AWS, because Makes the app reachable from any browser, hosts the static frontend on S3/CloudFront and the backend as a container, and runs managed PostgreSQL (RDS) with automatic backups at a low-cost, scale-down footprint.

## Consequences

Managed services add minor operational config; offset by automated backups removing manual backup effort.
<!-- sdlc:auto:end adr -->