# ADR-005: Authority and approval model

## Status
PROPOSED

## Context

The first slice must not execute external actions without explicit authority. The repository also needs a clear distinction between preview and commit, draft and publication, and branch and production.

## Decision

Authority is explicit, typed, and action-scoped. High-risk actions require approval before commit; low-risk read-only actions do not.

## Decision details

Proposed authority matrix:

| Action class | Example | Default | Requires approval |
| --- | --- | --- | --- |
| Read | inspect project state | allowed | no |
| Preview | render draft analysis | allowed | no |
| Local write | edit docs in workspace | limited | sometimes |
| Branch commit | commit contract docs | limited | yes for governed areas |
| Publication | ship or publish | restricted | yes |
| Submission | send external entry | restricted | yes |
| Spending | pay or buy | restricted | yes |
| Deletion | remove evidence or state | restricted | yes |
| Production change | deploy or mutate live systems | restricted | yes |
| Merge or canon change | promote source of truth | restricted | yes |

Rules:
- reversible actions may be previewed before commit;
- irreversible actions require explicit authority;
- production is stricter than branch;
- draft state cannot impersonate publication;
- failed authority checks must fail safe and not partially execute.

## Alternatives considered

- Single global permission flag: rejected because it is too coarse.
- Implicit approval through workflow state: rejected because it hides responsibility.

## Consequences

### Positive

- Clear safety boundary.
- Easier auditing.
- Better user trust.

### Negative

- More confirmation steps.
- More decision surface to document.

### Risks

- Overly broad approvals may still be dangerous.
- Too many micro-approvals may block useful work.

## Compatibility and migration

Existing branch workflows remain compatible. The first slice adds no production-facing execution path.

## Validation criteria

- Restricted actions cannot run without approval.
- Preview and commit are separated.
- Audit history records authority decisions.

## Open questions

- Whether branch commits for documentation-only changes can be auto-authorized.
- How granular authority should be for future mode-specific publishing.

## Source evidence

- Repository audit and handoff requirements.
- Existing evidence and workflow contracts.
