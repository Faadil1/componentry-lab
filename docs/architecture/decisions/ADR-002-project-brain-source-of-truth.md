# ADR-002: Project Brain source of truth

## Status
PROPOSED

## Context

The repository already has a Project Brain domain with types, schema, validation, presets, and serialization. The Creative Director must extend that contract instead of creating a parallel project store.

## Decision

`CreativeProject` composes the existing Project Brain contract. Project Brain stays canonical for project state, while Director-specific views and adapters layer on top.

## Decision details

- `CreativeProject` extends existing project fields rather than replacing them.
- Schema versioning is explicit and adapter-driven.
- Compatibility with current presets is mandatory.
- Compatibility with Film Kit consumers is mandatory.
- A migration adapter can project older or alternate source records into the canonical shape.
- A second authoritative project database is prohibited.

Canonical ownership:
- Project Brain owns current project status, phase, evidence, blockers, decisions, and next-action source data.
- Director Core reads from Project Brain and never becomes a competing owner.

Failure behavior:
- Unknown versions resolve through an adapter or fail closed.
- Ambiguous ownership blocks promotion instead of guessing.

## Alternatives considered

- Replace Project Brain with a new Director store: rejected because it would break existing consumers and duplicate authority.
- Keep both stores in sync by convention: rejected because parallel stores drift.

## Consequences

### Positive

- Existing consumers can continue to read canonical state.
- Migration stays incremental.
- Versioning becomes explicit.

### Negative

- Adapters add complexity.
- Compatibility testing becomes mandatory.

### Risks

- A weak adapter could hide a schema mismatch.
- Presets may need controlled updates to preserve old semantics.

## Compatibility and migration

Adapters must preserve current presets and Film Kit integrations. Migration can introduce the CreativeProject shape without deleting the legacy contract.

## Validation criteria

- No parallel project store exists.
- Existing presets still resolve.
- Film Kit consumers still resolve.
- Schema version mismatch fails safely.

## Open questions

- Whether schema version appears on every persisted record or only in adapter metadata.
- Which legacy fields should remain deprecated but readable.

## Source evidence

- Project Brain types, schema, validation, presets, serializers, and exporters.
- Repository audit findings on duplicate state concepts.
