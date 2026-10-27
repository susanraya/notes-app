# notes app — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
a simple notes app

**Documentation version:** v7
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v2 approved |
| [Architecture](architecture/README.md) | 11 entries |
| [Development](development/README.md) | 12 entries |
| [Testing](testing/README.md) | 1 entry |
| [Deployment](deployment/README.md) | 1 entry |
| [Maintenance](maintenance/README.md) | 1 entry |
| [Data model](architecture/data-model.md) | generated |
| [API (OpenAPI)](architecture/api/openapi.yaml) | generated |
| [Decisions (ADRs)](architecture/adr/README.md) | 4 decisions |
| [Sprint plan](development/sprint-plan.md) | 4 sprints |
| [Developer guide](development/developer-guide.md) | generated |
| [API reference](development/api-reference.md) | 8 routes |
| [Test report](testing/test-report.md) | no_tests |
| [Tests](testing/test-cases.md) | 133 tests |
| [Deployment guide](deployment/deployment-guide.md) | not deployed yet |
| [Runbook](deployment/runbook.md) | not deployed yet |
| [Release notes](deployment/release-notes.md) | 0 releases |
| [Traceability matrix](traceability-matrix.md) | 20 requirements |
| [Changelog](CHANGELOG.md) | 7 versions |
<!-- sdlc:auto:end contents -->

## Open gaps

<!-- sdlc:auto:start open-gaps -->
### Requirements

- No prior (v1) requirements content was provided, so it is unclear what changed between v1 and v2 of the requirements.
- How the single account's credentials are initially provisioned (who sets the email/password, and how) is not specified.
- No password-reset/recovery flow is described.
- Session duration/expiry behavior is not specified.
- Whether saving is purely automatic (e.g. on a timer/blur) or requires an explicit save action -- or both -- is not specified; AC-013 allows for either.
- This is a verification/QA activity described at requirements time; no actual verification results exist yet since testing has not started.

### Architecture

- Requirement keys US-001 through US-013 were provided without descriptions, so this architecture cannot be traced to specific requirements -- traceability matrix cannot be completed until requirement content is supplied.
- No detail provided on session/token expiry, refresh, or logout invalidation beyond client-side token discard.
- Auto-save trigger conditions (e.g. debounce interval, save-on-blur) are not specified in the architecture input.
- No explicit constraints (e.g. uniqueness on email, foreign key cascade behavior on user_id) are stated.
- No explicit error-handling spec (e.g. responses for not-found, validation failures) beyond the 401 on login.
- No networking/security details (VPC, security groups, TLS termination) provided.

### Development

- The input does not explicitly assign each backlog item to a sprint -- item-to-sprint mapping in this documentation was inferred from sprint goal wording and should be confirmed.
- No explicit per-item sprint assignment was given; mapping to US-001/US-002/US-003 is inferred from the sprint goal description, not stated directly.
- No explicit per-item sprint assignment was given; mapping is inferred from the sprint goal description, not stated directly.
- No explicit per-item sprint assignment was given; mapping is inferred from the sprint goal description.
- US-012 (store notes in the app's own database) and the black-and-white theme stories (US-014 through US-020) are not clearly placed in any sprint goal text -- their sprint assignment is unknown.
- No detail was provided on what CHG-001 actually changes, which requirements it affects, or its backlog items -- cannot be traced to any US-xxx requirement.
- No delivery/completion status given for US-001, US-002, or their sub-tasks beyond the overall 'development run completed' status.
- No delivery/completion status given for US-003 or US-004 beyond the overall run status.
- No delivery/completion status given for US-005 through US-008 beyond the overall run status.
- No delivery/completion status given for US-009 or US-010 beyond the overall run status.
- Only US-014 has a recorded delivery status (delivered) in the input; US-011, US-012, US-013, US-015 through US-020 have no stated delivery status, commit, or completion evidence despite the overall run being marked 'completed'.
- Overall run is marked 'completed' but per-ticket delivery evidence is missing for US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013, US-015, US-016, US-017, US-018, US-019, US-020, and all US-001 sub-tasks -- cannot confirm what was actually built and merged versus merely planned.

### Testing

- Testing phase has not started -- no test coverage of the 13 user stories or their acceptance criteria exists yet.

### Deployment

- No deployment recorded yet -- the approved AWS target environment has not been provisioned or documented as deployed to.

### Maintenance

- No maintenance activity recorded yet -- there is nothing to maintain until deployment occurs.
<!-- sdlc:auto:end open-gaps -->
