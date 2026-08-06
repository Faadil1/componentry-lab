# ADR-007: Quality gates and evidence

## Status
PROPOSED

## Context

The director needs universal gates, mode-specific extensions, and evidence-backed claims. Gates must control whether a next action can be authorized.

## Decision

Universal gates apply across modes, and mode-specific gates extend them. A gate cannot pass without the evidence it requires.

## Decision details

Proposed universal gates:
- canonical state available;
- mode resolved;
- phase resolved;
- authority resolved;
- evidence provenance attached;
- next action singular and authorized;
- no prohibited external action selected.

Mode-specific gates:
- Day Challenge: brevity and completion;
- Hackathon: submission readiness and bundle integrity;
- MARA: milestone coherence and phase continuity;
- Data Story: data traceability and claim verification.

Gate results:
- pass;
- fail;
- blocked;
- conditional.

Evidence rules:
- evidence provenance is mandatory;
- adapters may normalize evidence but may not invent it;
- failed evidence support fails the gate;
- a passed gate with missing evidence is invalid;
- gate status determines whether a next action can be authorized.

## Alternatives considered

- Gate by intuition or score alone: rejected because it is not auditable.
- Use only universal gates: rejected because modes need distinct proof.

## Consequences

### Positive

- Clear trace from evidence to action.
- Stronger auditability.
- Better mode precision.

### Negative

- More evidence wiring.
- More adapter maintenance.

### Risks

- Weak adapters may make evidence look stronger than it is.
- Conditional results may need careful UI handling.

## Compatibility and migration

Existing evidence vocabularies should map through adapters. No evidence format is abruptly replaced in the first slice.

## Validation criteria

- A gate cannot pass without required evidence.
- Gate status influences next-action authorization.
- Mode-specific gates remain distinct.

## Open questions

- Whether conditional outcomes are surfaced to users or only to internal evaluators.
- How strictly evidence freshness should be enforced.

## Source evidence

- Repository audit findings on evidence vocabularies and gate gaps.
- Attached Hackathon and UI/UX source bundles.
