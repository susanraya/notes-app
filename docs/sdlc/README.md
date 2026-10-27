# notes app — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
a simple notes app

**Documentation version:** v9
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v2 approved |
| [Architecture](architecture/README.md) | 11 entries |
| [Development](development/README.md) | 2 entries |
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
| [Changelog](CHANGELOG.md) | 9 versions |
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

- Input explicitly ties the monochrome restyle to US-015, US-016, US-017, US-018 only; requirement keys US-001-US-014, US-019, US-020 are not mapped to any specific architecture element in this input -- confirm whether they apply to this phase or were covered elsewhere.
- No delete confirmation screen details given beyond 'restyled to monochrome' -- no critical path or endpoint narrative describes its UX flow.
- No requirement key is explicitly linked to this component in the input.
- No requirement keys explicitly linked to the data model in the input.

### Development

- Plan input does not explicitly state which backlog items are assigned to which sprint; approximate groupings can be inferred from story-point totals matching each sprint's capacity of 20, but this mapping is not confirmed by the input and should not be treated as authoritative.
- Development run status is reported as 'completed', yet ticket-level delivery data (status, commit) is recorded for only 1 of the 20 stories (US-014) and none of the 4 tasks under US-001 -- this is a discrepancy between the reported run status and the evidence available.
- No ticket-level development data (status/commit) was provided for the 19 other planned stories (US-001-US-013, US-015-US-020) or the 4 tasks under US-001, so their implementation status cannot be documented here.

### Testing

- Testing phase has not started -- no test coverage of the 13 user stories or their acceptance criteria exists yet.

### Deployment

- No deployment recorded yet -- the approved AWS target environment has not been provisioned or documented as deployed to.

### Maintenance

- No maintenance activity recorded yet -- there is nothing to maintain until deployment occurs.
<!-- sdlc:auto:end open-gaps -->
