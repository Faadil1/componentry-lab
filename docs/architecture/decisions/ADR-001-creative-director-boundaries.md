# ADR-001: Creative Director boundaries

## Status
PROPOSED

## Context

The repo already has Project Brain, Library, Playbooks, Film Kit, and Episode State Card contracts. The Creative Director must extend those systems without collapsing them into one mutable orchestration layer. The first slice must be deterministic, read-only, and incapable of external execution.

## Decision

Director Core owns deterministic analysis and next-action selection. Project Brain owns canonical project state. UI owns presentation. Skills own metadata-driven capability discovery, not hidden execution. External effects stay outside the first slice.

## Decision details

Director Core:
- reads canonical project state, evidence, mode, phase, authority, and skill metadata;
- computes exactly one authorized next action;
- emits read-only analysis objects;
- never mutates state;
- never performs network, file-system, publish, payment, delete, deploy, or merge actions.

Project Brain:
- remains the canonical project-state store;
- supplies contracts, presets, and adapters to existing consumers;
- accepts explicit writes only through governed pathways.

UI:
- renders director output and project state;
- does not invent authority or state transitions;
- may present preview and review surfaces only.

Skills:
- expose metadata first;
- load progressively based on mode, phase, and authority;
- do not behave like monolithic prompt blobs.

## Alternatives considered

- Merge Director state into Project Brain: rejected because it would blur ownership and create parallel mutation paths.
- Let skills execute actions directly: rejected because it would hide authority and break deterministic review.

## Consequences

### Positive

- Clear ownership.
- Predictable behavior.
- Easier tests.
- Lower risk of accidental mutation.

### Negative

- More adapter work.
- More explicit contracts.

### Risks

- Overlapping responsibilities may drift if adapters are not kept current.
- UI surfaces may outpace core contract work if not constrained.

## Compatibility and migration

Existing routes and consumers stay compatible through adapters. The first slice adds no external actions and no new parallel project store.

## Validation criteria

- Director output is deterministic for the same input.
- No external action methods exist in the first slice.
- Project Brain remains the only canonical state authority.

## Open questions

- Which analyzer modules are shipped first.
- How much of the existing Episode State Card should be reused directly versus wrapped.

## Source evidence

- Repository audit of Project Brain, Library, Playbooks, Film Kit, and Episode State Card.
- Attached Hackathon and UI/UX source bundles.
