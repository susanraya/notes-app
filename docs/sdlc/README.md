# notes app — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
a simple notes app

**Documentation version:** v2
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v1 approved |
| [Architecture](architecture/README.md) | 11 entries |
| [Development](development/README.md) | 1 entry |
| [Testing](testing/README.md) | 1 entry |
| [Deployment](deployment/README.md) | 1 entry |
| [Maintenance](maintenance/README.md) | 1 entry |
| [Data model](architecture/data-model.md) | generated |
| [API (OpenAPI)](architecture/api/openapi.yaml) | generated |
| [Decisions (ADRs)](architecture/adr/README.md) | 4 decisions |
| [Sprint plan](development/sprint-plan.md) | not generated yet |
| [Developer guide](development/developer-guide.md) | generated |
| [API reference](development/api-reference.md) | 1 route |
| [Test report](testing/test-report.md) | not run yet |
| [Tests](testing/test-cases.md) | 0 tests |
| [Deployment guide](deployment/deployment-guide.md) | not deployed yet |
| [Runbook](deployment/runbook.md) | not deployed yet |
| [Release notes](deployment/release-notes.md) | 0 releases |
| [Traceability matrix](traceability-matrix.md) | 13 requirements |
| [Changelog](CHANGELOG.md) | 2 versions |
<!-- sdlc:auto:end contents -->

## Open gaps

<!-- sdlc:auto:start open-gaps -->
### Requirements

- No architecture-phase input exists yet to confirm this stack was actually applied in a design.

### Architecture

- Requirement keys US-001 through US-013 were provided without descriptions, so this architecture cannot be traced to specific requirements -- traceability matrix cannot be completed until requirement content is supplied.
- No detail provided on session/token expiry, refresh, or logout invalidation beyond client-side token discard.
- Auto-save trigger conditions (e.g. debounce interval, save-on-blur) are not specified in the architecture input.
- No explicit constraints (e.g. uniqueness on email, foreign key cascade behavior on user_id) are stated.
- No explicit error-handling spec (e.g. responses for not-found, validation failures) beyond the 401 on login.
- No networking/security details (VPC, security groups, TLS termination) provided.

### Development

- Development phase has not started -- no tickets, code, or build artifacts exist to document.

### Testing

- Testing phase has not started -- no test coverage of the 13 user stories or their acceptance criteria exists yet.

### Deployment

- No deployment recorded yet -- the approved AWS target environment has not been provisioned or documented as deployed to.

### Maintenance

- No maintenance activity recorded yet -- there is nothing to maintain until deployment occurs.
<!-- sdlc:auto:end open-gaps -->
