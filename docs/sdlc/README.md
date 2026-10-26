# notes app — SDLC Documentation

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start overview -->
a simple notes app

**Documentation version:** v3
<!-- sdlc:auto:end overview -->

## Contents

<!-- sdlc:auto:start contents -->
| Document | State |
|---|---|
| [Requirements](requirements/README.md) | v1 approved |
| [Architecture](architecture/README.md) | 11 entries |
| [Development](development/README.md) | 10 entries |
| [Testing](testing/README.md) | 1 entry |
| [Deployment](deployment/README.md) | 1 entry |
| [Maintenance](maintenance/README.md) | 1 entry |
| [Data model](architecture/data-model.md) | generated |
| [API (OpenAPI)](architecture/api/openapi.yaml) | generated |
| [Decisions (ADRs)](architecture/adr/README.md) | 4 decisions |
| [Sprint plan](development/sprint-plan.md) | 3 sprints |
| [Developer guide](development/developer-guide.md) | generated |
| [API reference](development/api-reference.md) | 1 route |
| [Test report](testing/test-report.md) | not run yet |
| [Tests](testing/test-cases.md) | 0 tests |
| [Deployment guide](deployment/deployment-guide.md) | not deployed yet |
| [Runbook](deployment/runbook.md) | not deployed yet |
| [Release notes](deployment/release-notes.md) | 0 releases |
| [Traceability matrix](traceability-matrix.md) | 13 requirements |
| [Changelog](CHANGELOG.md) | 3 versions |
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

- No explicit mapping is given in the input tying individual stories/tasks to a specific sprint number -- sprint-to-item assignment below is inferred from sprint goal wording, not stated directly.
- No execution status (in-progress/done), code artifacts, or test results were provided for any sprint.
- Input does not explicitly list which backlog items belong to Sprint 1; association above is inferred from the goal description only.
- No completion or demo status recorded for Sprint 1.
- Input does not explicitly list which backlog items belong to Sprint 2; association above is inferred from the goal description only.
- No completion or demo status recorded for Sprint 2.
- Input does not explicitly list which backlog items belong to Sprint 3; association above is inferred from the goal description only.
- US-012 (data storage) could plausibly belong to an earlier sprint since persistence is needed for Sprint 1's 'create and persist a note end-to-end' goal -- the plan does not clarify this, flagging a possible discrepancy.
- No completion or demo status recorded for Sprint 3.
- No status (not started/in progress/done) given for any task or story under this epic.
- No code, PR, or test evidence provided to confirm these were actually implemented.
- No status or implementation evidence given for US-003 or US-004.
- No breakdown tasks were provided for this epic's stories, unlike EPIC-001.
- No status or implementation evidence given for any story in this epic.
- No breakdown tasks were provided for this epic's stories.
- No status or implementation evidence given for US-009 or US-010.
- No status or implementation evidence given for US-011, US-012, or US-013.
- US-013's role assignment to qa-agent (rather than a product/billing role) suggests this item may be a verification check (confirming no paid surfaces exist) rather than a build task -- plan does not clarify this distinction.
- Application build has not been confirmed complete; there is nothing yet to document for end-user usage instructions.

### Testing

- Testing phase has not started -- no test coverage of the 13 user stories or their acceptance criteria exists yet.

### Deployment

- No deployment recorded yet -- the approved AWS target environment has not been provisioned or documented as deployed to.

### Maintenance

- No maintenance activity recorded yet -- there is nothing to maintain until deployment occurs.
<!-- sdlc:auto:end open-gaps -->
