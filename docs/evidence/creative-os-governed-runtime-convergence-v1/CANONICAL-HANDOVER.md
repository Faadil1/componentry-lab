# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## Canonical state

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED SYSTEM COLLABORATION — SELECTED
PHASE_CODE = CREATIVE_OS_GOVERNED_SYSTEM_COLLABORATION_V1
TRACK = CROSS-SYSTEM COLLABORATION MESH
STATUS = PHASE_DECISION_REFINED_WITH_LEGACY_LIBRARY_PRESERVATION
SOURCE_OF_TRUTH = GitHub master
PREVIOUS_MASTER_HEAD = 30793d5590b2da81a956a5b63a2d495c7b6d133f
PRODUCTION_CREATIVE_OS_REGISTRY_BASELINE = 34 entities / 0 warnings
LEGACY_COMPONENT_LIBRARY = PRESERVE_AND_CROSSWALK
FUNCTIONAL_INTEGRATION = NOT_STARTED
PRODUCTION_PROMOTION_FOR_THIS_PHASE = NOT_APPLICABLE_YET
```

This checkpoint preserves the user requirement that all relevant systems collaborate and additionally locks the older Component Library as a first-class source of composition/build intelligence. The older Library must not be discarded merely because the newer Creative OS Registry V2 exists.

## Product decision — locked

The target is a governed collaboration mesh:

```text
                         Creative OS Registry V2
                    governance / authority / evidence
                                ↕
Project Brain ↔ Creative Director ↔ Collaboration Layer ↔ Creative Method Runtime
     ↕               ↕                 ↕                    ↕
 Decisions        Playbooks      Legacy Component       method results /
 Audit            References     Library / Recipes       quality evidence
 Learnings        Sources        Systems / Primitives
     ↕                                  ↕
     └────────────── Film Kit / capture / production ──────────────┘
```

The arrows describe governed information and capability collaboration, not unrestricted write authority.

## Two Library layers — do not collapse them

### 1. Creative OS Registry V2 — governance plane

Canonical implementation area: `lib/creative-os/library-v2` and `/creative-os/registry`.

Role:
- canonical identity for SOURCE / RESOURCE / REFERENCE / METHOD / PROVIDER;
- lifecycle and qualification state;
- evidence and provenance;
- authority ceilings;
- automation/execution policy;
- fail-closed handling of unknown/unqualified entities.

Current verified Production baseline:

```text
TOTAL = 34
SOURCE = 7
RESOURCE = 6
REFERENCE = 12
METHOD = 6
PROVIDER = 3
WARNINGS = 0
```

This layer remains the source of truth for governance. Nothing from the older Library may widen authority by inference.

### 2. Legacy Component Library — composition/build intelligence plane

Canonical implementation area: `lib/registry`, `components/library`, and `/library`.

This layer remains valuable and must be preserved. It contains concrete reusable product/build knowledge that is not represented by the Creative OS Registry V2 governance model.

Observed useful legacy concepts include:

- entry kinds: `interaction`, `foundation`, `layout`, `system`, `recipe`, `workflow`;
- categories for interaction, typography, visual foundations, layout, playback, decisions, capture, product composition, operational composition, editorial composition, broadcast composition, and workflow;
- concrete primitives/systems such as Spotlight, Split Flap, Scrub Input, Kinetic Text, Scroll Choreography, WebGL Liquid, Image Ripple, Typography, Visual Foundations, Layouts, Interaction Player, Decision Systems, Capture Bridge;
- recipes such as product launch, operational workspace, data story, and broadcast package;
- workflow components such as Episode State Card;
- sub-primitives including layout shell/stage/split, signal band, evidence ledger, decision gate/trace, capture workbench, and recipe workbench;
- maturity: `experimental`, `reusable`, `production-candidate`;
- capabilities such as deterministic, capture-ready, responsive, keyboard-accessible, reduced-motion, URL-restorable, stateful, timeline-controlled, evidence-driven, decision-traceable, clean-view, exportable, composition-ready, editorial, broadcast, operational, product, WebGL, SVG, CSS-driven, mobile-compatible, arbitrary-content;
- runtime compatibility (`react`, `css`, `svg`, `webgl`, browser API, server-compatible);
- viewport compatibility including desktop/laptop/tablet/mobile/broadcast/portrait-video;
- accessibility profiles;
- source paths and exported components/hooks;
- dependencies;
- usage examples;
- limitations;
- `recommendedFor` / `avoidFor` guidance;
- memory hooks and signature interactions/frames;
- relation graph semantics;
- search, facets, recommendations, system map, detail panel, export snapshots, and related playbooks.

The old Library is therefore not merely an old UI. It is a reusable composition knowledge base.

## Legacy relation graph — preserve conceptually

The old Library already models useful graph relations:

```text
uses
composes
extends
depends-on
demonstrated-by
alternative-to
supports
captured-by
controlled-by
```

These relations are valuable to the collaboration mesh because they explain how concrete build primitives compose systems and recipes. They should be projected into the new collaboration model rather than deleted.

## Legacy Library Workbench capabilities worth retaining

The existing `/library` workbench provides product behaviors that should inform the future unified experience:

- full-text weighted search across label, summary, description, tags, and exports;
- filters by kind, category, maturity, capability, viewport, and runtime;
- grid/list views;
- result counts/facets;
- detail inspection;
- “best matches” recommendations based on category/kind/common capabilities;
- composition system map for relations/dependencies;
- related Playbooks;
- TypeScript/JSON/usage/search-result export;
- filter snapshot export;
- deterministic/capture-ready/SSR-safe visibility;
- explicit limitations and source paths.

These behaviors are candidates for a future unified Library/Registry workbench, but UI unification is not the first step of this phase.

## Crosswalk rule — preserve both identities

Do not rename or silently merge old Component Library IDs into Creative OS Registry V2 IDs.

Introduce an explicit crosswalk when a meaningful semantic relationship exists.

Conceptual form:

```text
LegacyCompositionRef {
  legacyEntryId
  legacyKind
  categoryId
  capabilities
  maturity
  runtime/viewports
  relations
  sourcePaths
  limitations
}

GovernedCapabilityRef {
  creativeOsEntityId
  entityKind
  lifecycle
  authority
  provenance
  evidence
}

LibraryCrosswalk {
  legacyEntryId
  creativeOsEntityId | null
  relationship
  confidence/evidence
  limitations
}
```

A missing crosswalk is valid. Never invent a correspondence merely to make the graphs look complete.

## Core ownership model

### Project Brain
Owns canonical project state/context: phase, positioning, design, proof, build mappings, capture, presentation, decisions, risks, outputs, audit, learnings, recommendations.

### Creative Director
Owns computation of exactly one canonical next action. It may select collaborators/capabilities but does not inherit their write authority.

### Creative OS Registry V2
Owns governed identity, lifecycle, evidence, provenance, authority and execution policy.

### Legacy Component Library
Owns reusable composition/build metadata and concrete component/system/recipe knowledge. It does **not** define global authority.

### Creative Method Runtime
Owns deterministic, local, read-only execution of internal Creative Methods and quality-gate evidence.

### Film Kit
Remains a specialized film/video production collaborator with its existing authority limits.

### Playbooks / References / Sources
Remain knowledge/evidence collaborators unless separately qualified for execution.

### Decisions / Audit / Learnings / Evidence
Form the cross-system feedback plane.

## Collaboration envelope

Every cross-system interaction should use explicit request/result contracts. Minimum request fields:

```text
projectId
correlationId
sourceSystem
targetSystem
intent
projectPhase
projectMode
capabilityRefs
compositionRefs
authorityContext
structuredInputs / inputRefs
evidenceRefs
requestedEffectClass
status
```

Minimum result fields:

```text
correlationId
sourceSystem
targetSystem
capabilityUsed
compositionArtifactsUsed
resultStatus
structuredOutput
quality/evaluation results
evidence/provenance
limitations
recommendedNextStep
sideEffectRequest | null
```

The envelope coordinates collaboration; it never grants authority by itself.

## Collaboration invariants

1. Project Brain remains canonical owner of project state.
2. Creative Director retains ownership of exactly one canonical next action.
3. Creative OS Registry V2 remains the governance source of truth.
4. Legacy Component Library metadata may enrich selection/composition but may not widen authority.
5. Legacy IDs remain distinct from Creative OS Registry IDs unless an explicit crosswalk maps them.
6. Unknown crosswalks remain unknown; no fabricated identity mapping.
7. `REFERENCE` entities never become executors by routing accident.
8. External SOURCE / RESOURCE / PROVIDER entities gain no new execution rights through this phase.
9. Old Library `production-candidate` or `capture-ready` status does not equal permission to execute externally.
10. Persistent writes require the owner system's explicit write path and applicable approval.
11. No hidden cross-system writes or shared mutable global state.
12. Collaboration cycles must be bounded and traceable.
13. Every result preserves provenance, limitations and authority context.
14. Existing legacy Library and Creative OS Registry V2 data must both remain readable while the crosswalk is developed.
15. Do not rewrite the legacy Library merely to make the new architecture cleaner.
16. Production promotion remains a separate explicit gate after preview QA.

## Phase slices

### Slice A — Cross-system collaboration contract foundation

Create canonical request/result envelopes, system identities, effect classification, authority pass-through, correlation semantics, composition references, capability references and fail-closed validation.

Slice A must already be capable of referring separately to:
- Creative OS governed capability IDs;
- Legacy Component Library composition IDs;
- Project Brain project IDs;
- specialized collaborator IDs.

No side effects or UI rewiring.

### Slice B — Dual-Library projection and crosswalk foundation

Build two read-only projections:

1. Creative OS Registry V2 → collaboration-safe governed capability descriptors.
2. Legacy Component Library → collaboration-safe composition descriptors.

Then add an explicit, conservative crosswalk layer between them.

No bulk migration and no inferred authority.

### Slice C — Project Brain collaboration adapter

Expose canonical Project Brain context and allow it to receive proposals/evidence without direct mutation.

### Slice D — Creative Director orchestration

Director should be able to reason with both:
- governed methods/resources from Creative OS Registry V2;
- relevant concrete composition primitives/recipes from the Legacy Component Library.

This allows recommendations such as “use this governed method, then compose with these concrete Library primitives” while preserving separate identity and authority.

### Slice E — Creative Method Runtime result collaboration

Execute eligible internal Creative Methods through the collaboration contract and return structured advisory outputs + quality evidence.

### Slice F — Composition/build planning collaboration

Use Legacy Component Library metadata to support build planning: component selection, alternatives, dependencies, limitations, runtime/viewport constraints, capture readiness, accessibility, related recipes and playbooks.

This is planning/composition intelligence first; execution authority remains separate.

### Slice G — Supporting systems

Connect Film Kit, capture surfaces, playbooks, references and other specialized systems through adapters without authority merging.

### Slice H — Feedback / audit / decision trace

Surface cross-system requests/results, chosen capabilities, chosen composition elements, quality results, evidence and limitations.

### Slice I — Integrated preview QA

Prove representative multi-system workflows before any Production promotion decision.

## Representative target flow

```text
Project Brain context
→ Creative Director
→ Creative OS Registry V2: which governed methods/capabilities are eligible?
→ Legacy Component Library: which concrete primitives/systems/recipes fit the build?
→ Creative Method Runtime and/or specialist collaborator
→ result + composition plan + evidence + limitations
→ Creative Director interpretation
→ Project Brain-visible canonical next action + supporting evidence
```

Film/video path may additionally route through Film Kit and capture-aware Legacy Library metadata.

## Exit criteria

The phase is not complete until:

1. Shared collaboration contracts exist and are tested.
2. Creative OS Registry V2 and Legacy Component Library are both first-class read-only collaborators.
3. A conservative crosswalk exists without fabricated mappings.
4. Director can consume governed capability descriptors plus concrete composition descriptors.
5. At least one real Project Brain project exercises the combined path.
6. At least one internal Creative Method executes through the contract and returns quality evidence.
7. Legacy Library relations, limitations, runtime/viewport and capture metadata materially influence a recommendation/build plan.
8. No legacy metadata widens authority.
9. No fabricated Registry IDs remain in governed recommendations.
10. No REFERENCE is executed.
11. Project Brain remains immutable through projection paths.
12. Director still emits exactly one canonical next action.
13. Cross-system results remain traceable and fail closed on unknowns.
14. No external provider execution, installation, spend, publication or submission occurs without separate authorization.
15. Production Creative OS Registry baseline remains 34 / 0 unless separately governed.
16. Tests and preview QA pass before Production promotion.

## Explicitly out of scope

- deleting the older Component Library;
- force-migrating every legacy entry into Creative OS Registry V2;
- treating legacy maturity/capture readiness as authority;
- global mutable state;
- unrestricted point-to-point writes;
- external provider execution by default;
- Film Kit authority expansion;
- automatic Project Brain mutation;
- making references executable;
- rewriting legacy Registry/Library data merely for naming consistency;
- reopening historical external findings without new evidence.

## Handover instructions

Resume from this checkpoint. Preserve both Library layers. The Creative OS Registry V2 is the governance plane; the older Component Library is the composition/build intelligence plane. Build collaboration contracts first, then dual projections/crosswalks, then connect Project Brain, Director, Creative Methods and specialized collaborators.

Do not begin by replacing `/library` or `/creative-os/registry` UI. Do not merge IDs by guesswork.

## Exactly one next action

```text
SLICE A — CROSS-SYSTEM COLLABORATION CONTRACT FOUNDATION + TESTS
WITH DISTINCT capabilityRefs + compositionRefs
```
