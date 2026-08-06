# ADR-004: Learning and rule governance

## Status
PROPOSED

## Context

The audit identified the need for governed learning so observations can become candidate lessons, then tested rules, without silent self-modification.

## Decision

Learning follows the lifecycle `OBSERVATION -> CANDIDATE -> TESTING -> EARNED -> SUPERSEDED / REJECTED`. No rule becomes canonical without human approval.

## Decision details

- Observation is a recorded fact with evidence and provenance.
- Candidate is a proposed lesson or rule.
- Testing records a bounded evaluation window.
- Earned means the rule passed evidence-backed review and received approval.
- Superseded replaces an older earned rule with a newer approved one.
- Rejected means the candidate cannot promote.

Governance rules:
- contradictions must be recorded, not hidden;
- confidence must be explicit and bounded;
- rollback must preserve history;
- silent self-modification is prohibited;
- promotion always requires human approval;
- versioning must keep prior rule lineage readable.

## Alternatives considered

- Auto-promote high-confidence rules: rejected because it violates human approval and creates hidden drift.
- Store only final rules: rejected because it destroys auditability.

## Consequences

### Positive

- Strong audit trail.
- Safer adaptation.
- Clear rollback path.

### Negative

- More process overhead.
- More metadata to maintain.

### Risks

- Overly strict approval may slow useful learning.
- Poor evidence quality may stall promotion.

## Compatibility and migration

Existing evidence vocabularies should be adapted into this lifecycle without deleting their source semantics. Legacy notes can map to observations or candidates through adapters.

## Validation criteria

- Every promoted rule has a human approval record.
- Prior versions remain discoverable.
- Contradictions can be surfaced and reviewed.

## Open questions

- Whether confidence should be a scalar or a bounded enum.
- Whether testing duration is mode-specific.

## Source evidence

- Repository audit on learning governance gaps.
- Attached Hackathon and UI/UX materials with overlapping rule vocabularies.
