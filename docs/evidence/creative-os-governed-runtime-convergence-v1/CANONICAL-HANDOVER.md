# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## Canonical state

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED RUNTIME CONVERGENCE — SELECTED
PHASE_CODE = CREATIVE_OS_GOVERNED_RUNTIME_CONVERGENCE_V1
TRACK = REGISTRY V2 → PROJECT BRAIN → CREATIVE DIRECTOR
STATUS = PHASE_DECISION_LOCKED
SOURCE_OF_TRUTH = GitHub master
BASELINE_MASTER_HEAD = 834daf1098e0d686903eddae2b77b78128fae666
PRODUCTION_REGISTRY_BASELINE = 34 entities / 0 warnings
FUNCTIONAL_INTEGRATION = NOT_STARTED
PRODUCTION_PROMOTION_FOR_THIS_PHASE = NOT_APPLICABLE_YET
```

This checkpoint selects the next product phase. It does not start the functional integration and does not expand runtime authority.

## Decision

The next product phase is:

```text
GOVERNED RUNTIME CONVERGENCE
Registry V2 → Project Brain → Creative Director
```

The purpose is to connect three already-mature product surfaces into one governed operating loop rather than creating another parallel subsystem.

## Why this phase now

### Project Brain already exists

Project Brain is already a substantial live workspace with project context, phase rail, positioning, design, proof, build mappings, capture, video, presentation, decisions, risks, outputs, audit, learnings, recommendations, and inspector surfaces. Rebuilding Project Brain would therefore be a false next phase.

### Creative Director already owns canonical next-action authority

Project Brain supporting recommendations intentionally do not control phase progression. The code explicitly leaves phase recommendations to the Creative Director. The Director already produces exactly one canonical next action and preserves a read-only/no-side-effect projection boundary.

### Registry V2 is now Production-ready but not yet the Director capability substrate

Registry V2 is now a cumulative, governed, Production-verified library with 34 entities and six governed internal methods. However, the live Project Brain → Director adapter still initializes `availableSkills` as an empty array, while the Director fixture path injects synthetic fixture skills. This leaves a real product gap between governed capability inventory and runtime selection.

### Project Brain still contains noncanonical registry recommendation IDs

Supporting registry recommendations still include static identifiers such as `capture-bridge` and `decision-systems`. These recommendations should resolve to canonical Registry V2 identities or explicitly report a missing capability; they must not fabricate registry identity.

## Architectural objective

Target operating loop:

```text
Project Brain
  supplies canonical live project context
      ↓
Registry V2
  supplies governed capability metadata, evidence, lineage and authority
      ↓
Creative Director
  selects eligible internal methods and produces one canonical next move
```

The first convergence target is internal deterministic Creative Methods only. External references, sources and providers remain discovery/evidence surfaces and do not become executable Director skills merely because they are present in Registry V2.

## Locked governance rules

- Preserve Project Brain as the canonical project context.
- Preserve Creative Director ownership of the single canonical next action.
- Preserve supporting recommendations as non-phase-mutating guidance.
- Preserve `sideEffectPayload = null` for the Director projection in this phase.
- Preserve Project Brain immutability through Director projection.
- Preserve fail-closed behavior for unknown authority, lifecycle, source identity, or compatibility.
- Do not promote `REFERENCE` entities to executable capability.
- Do not promote external `PROVIDER`, `SOURCE`, or `RESOURCE` entities to executable Director skills in this phase.
- Do not install external packages or repositories.
- Do not add generation spend or external provider execution.
- Do not expand Film Kit execution authority.
- Do not automatically mutate Project Brain persistent state.
- Do not rewrite legacy Registry V1.
- Do not reopen the historical external-findings inventory unless genuinely new evidence appears.
- Production promotion for functional work remains a separate explicit gate after preview QA.

## Phase slices

### Slice A — Registry V2 → Director capability projection

Create a pure canonical adapter from eligible Registry V2 `METHOD` entities to Director `SkillMetadata`.

Requirements:

- source from the cumulative live Registry V2 model;
- initially project only governed `METHOD` entities;
- project `MethodEntity.methodDefinition` into Director-compatible metadata;
- preserve canonical method/resource IDs, provenance and evidence lineage;
- normalize authority deliberately and conservatively rather than comparing raw enum strings;
- `SUGGEST` may map to Director `suggest`;
- `READ_ONLY` must never be widened beyond advisory behavior;
- fail closed on unknown or unmappable authority/lifecycle state;
- deterministic ordering;
- no external entity becomes executable skill.

### Slice B — Live Project Brain → Director input

Replace or augment the current empty live capability supply with Registry-derived eligible methods while preserving:

- canonical Project Brain object identity;
- Project Brain immutability;
- deterministic Director output;
- exactly one canonical next action;
- no write callback/path;
- `sideEffectPayload = null`.

### Slice C — Project Brain recommendation identity convergence

Replace fabricated/static registry recommendation identifiers with canonical Registry V2 entities, or emit an explicit missing-capability state.

Each governed registry recommendation should expose at minimum:

- canonical entity ID;
- entity kind;
- lifecycle state;
- authority ceiling or `NOT_MODELED` status;
- recommendation reason;
- provenance;
- limitations.

Supporting recommendations remain advisory and cannot mutate project phase.

### Slice D — Live Director projection

Move `/director` from fixture-only scenario projection toward a live Project Brain-aware projection.

Fixtures may remain for tests/development until the live path is validated.

The live surface should show:

- selected Project Brain project context;
- Registry-derived eligible internal methods;
- evidence/provenance;
- authority boundaries;
- one canonical next action.

It remains read-only in this phase.

### Slice E — Integration QA

The phase cannot close until the convergence path is proved without regression.

## Exit criteria

The phase is complete only when all of the following are demonstrated:

1. Registry V2 is a real source of Director-compatible capability metadata.
2. A real selected Project Brain project produces a Director result using Registry-derived eligible internal methods.
3. Director selects only mode-, phase-, lifecycle- and authority-compatible methods.
4. Project Brain registry recommendations cannot point at fabricated Registry IDs.
5. Evidence, provenance and authority remain traceable through the projection.
6. No `REFERENCE` or external provider is treated as an executable Director skill.
7. Unknown/unqualified entities remain fail-closed.
8. Director still produces exactly one canonical next action.
9. Project Brain remains immutable through projection.
10. Director retains no Project Brain write path and `sideEffectPayload` remains `null`.
11. Same input produces deterministic output.
12. No external provider call, package installation, generation spend, publication or submission is introduced.
13. Registry V2 remains valid at the Production baseline of 34 entities / 0 warnings unless a separately governed registry change is approved.
14. Tests and preview QA pass before any functional Production promotion decision.

## Explicitly out of scope

- external provider execution;
- Film Kit authority expansion;
- auto-installation of tools/repositories;
- making references executable;
- generation spend;
- publishing/submitting externally;
- automatic Project Brain state mutation;
- Registry V1 rewrite;
- new external-findings inventory pass;
- removal of Director fixtures before the live path is validated;
- changing the Director from one canonical next action to competing actions.

## Existing evidence supporting this decision

- Project Brain already renders a full project workspace from canonical repository data.
- Project Brain recommendation logic explicitly delegates phase recommendations to Creative Director.
- Project Brain registry recommendations still contain static/noncanonical target IDs.
- `adaptProjectBrainToDirectorInput(...)` currently initializes `availableSkills: []`.
- Director skill selection already filters by status, mode, phase and authority.
- Director UI is currently fixture-driven and fixtures inject a synthetic `director-core-readonly` skill.
- Registry V2 `MethodEntity` already contains method definition, authority policy, operation definition, lifecycle and evidence metadata.
- Creative Method definitions already contain supported modes, supported phases, capability gaps, inputs, quality gates and advisory authority.
- Six governed method definitions already exist in the canonical Creative Method registry.
- Creative Method runtime is deterministic, local, read-only, makes no external calls and returns `sideEffects: null`.
- Existing Project→Director regression tests already protect canonical project identity, deterministic output, one canonical next action, no phase mutation from supporting recommendations, no Project Brain write path and `sideEffectPayload: null`.

## Handover instructions

Resume from this checkpoint. The product-phase decision is complete; do not reopen the choice among Project Brain, Director, Film Kit, Registry inventory, or a new subsystem unless materially new evidence invalidates this decision.

Do not start with Director UI. First establish the pure governed capability projection contract and tests. Preserve all existing read-only and fail-closed boundaries.

The verified Production Registry V2 remains the baseline while this phase is developed on a non-production branch/preview path.

## Exactly one next action

```text
SLICE A — REGISTRY V2 → DIRECTOR CAPABILITY PROJECTION CONTRACT + TESTS
```
