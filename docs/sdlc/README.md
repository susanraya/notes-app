# notes app — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
a simple notes app

**Documentation version:** v10
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v2 approved |
| [Architecture](architecture/README.md) | 11 entries |
| [Development](development/README.md) | 10 entries |
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
| [Tests](testing/test-cases.md) | 201 tests |
| [Deployment guide](deployment/deployment-guide.md) | not deployed yet |
| [Runbook](deployment/runbook.md) | not deployed yet |
| [Release notes](deployment/release-notes.md) | 0 releases |
| [Traceability matrix](traceability-matrix.md) | 20 requirements |
| [Changelog](CHANGELOG.md) | 10 versions |
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

- Plan input lists sprints and backlog items separately but does not explicitly map which items belong to which sprint; sprint-to-item assignment above is based only on each sprint's stated goal text, not an explicit mapping field.
- No commit hash/reference recorded for this tested ticket.
- Development run status says 'completed' but 12 stories and 4 sub-tasks from the approved plan have no corresponding ticket data -- unclear whether they were built and simply not reported, skipped, or still pending.
- All 8 reported tickets show commit=(none), so there is no code-level evidence (commit/PR reference) backing any of the 'tested' statuses in this input.

### Testing

- Testing phase has not started -- no test coverage of the 13 user stories or their acceptance criteria exists yet.

### Deployment

- No deployment recorded yet -- the approved AWS target environment has not been provisioned or documented as deployed to.

### Maintenance

- No maintenance activity recorded yet -- there is nothing to maintain until deployment occurs.
<!-- sdlc:auto:end open-gaps -->
