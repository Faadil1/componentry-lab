# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## Canonical state

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED SYSTEM COLLABORATION — SELECTED
PHASE_CODE = CREATIVE_OS_GOVERNED_SYSTEM_COLLABORATION_V1
TRACK = CROSS-SYSTEM COLLABORATION MESH
STATUS = PHASE_DECISION_REFINED_AND_LOCKED
SOURCE_OF_TRUTH = GitHub master
BASELINE_MASTER_HEAD = 4ac948dffbf128a41de933f852c79cbe1f3ab44b
PRODUCTION_REGISTRY_BASELINE = 34 entities / 0 warnings
FUNCTIONAL_INTEGRATION = NOT_STARTED
PRODUCTION_PROMOTION_FOR_THIS_PHASE = NOT_APPLICABLE_YET
```

This checkpoint refines the previous Governed Runtime Convergence decision. The target is not a one-way Registry V2 → Project Brain → Creative Director pipeline. The target is a governed collaboration mesh in which the relevant Componentry Lab / Creative OS systems exchange context, capability requests, results, evidence, recommendations, and explicit mutation requests while preserving their separate authority boundaries.

## Product decision — refined and locked

The next product phase is:

```text
GOVERNED SYSTEM COLLABORATION

Project Brain ↔ Creative Director ↔ Registry V2 ↔ Creative Method Runtime
        ↕                  ↕                 ↕
   Decisions/Audit      Playbooks        References/Sources
        ↕                                    ↕
      Film Kit / specialized production surfaces when applicable
```

The arrows describe governed information/capability collaboration, not unrestricted write authority.

The objective is to make the existing product systems work as one operating system instead of a collection of adjacent surfaces.

## Core collaboration principle

Every participating system must be able to collaborate through explicit contracts, but no system may silently become the owner of another system's state.

Collaboration means:

- canonical project context can be requested and consumed;
- governed capabilities can be discovered and selected;
- a system can request work from another system;
- results can be returned with provenance and evidence;
- recommendations can flow back to the project context;
- decisions, risks, outputs, and evidence can be surfaced across systems;
- specialized systems such as Film Kit can participate when the project requires them;
- any persistent mutation must pass through the authority boundary of the system that owns that state.

Collaboration does NOT mean:

- shared mutable global state without ownership;
- every module calling every other module directly;
- hidden circular writes;
- authority escalation through routing;
- references becoming executors;
- external providers becoming executable merely because they are visible in Registry V2.

## System roles — preserve ownership

### Project Brain — canonical project state and shared context hub

Project Brain owns the canonical project context and remains the place where project-specific state is represented: phase, positioning, design, proof, build mappings, capture, presentation, decisions, risks, outputs, audit, learnings, and supporting recommendations.

It can supply context to other systems and receive governed proposals/results, but another system may not silently mutate Project Brain.

### Creative Director — orchestration and canonical next-action reasoning

Creative Director owns the computation of exactly one canonical next action for the current project context.

It consumes Project Brain context and governed capabilities. It may coordinate or recommend use of another subsystem, but does not inherit that subsystem's write authority.

### Registry V2 — governed capability/evidence discovery plane

Registry V2 owns canonical identities and governance metadata for sources, resources, references, methods, and providers.

It tells other systems what exists, what is qualified, what authority ceiling applies, what evidence/provenance exists, and what remains unknown. It is not itself the executor of every listed entity.

### Creative Method Runtime — deterministic advisory method execution

The Creative Method Runtime owns deterministic execution of internal Creative Methods. It remains local, read-only, and side-effect free unless a future separately governed authority expansion is approved.

It receives a structured request and returns structured advisory output, quality-gate results, and evidence.

### Film Kit — specialized production collaborator

Film Kit remains a specialized production system. When the Director or project context establishes that film/video production is relevant, Film Kit may receive governed production context and return plans/results/evidence through explicit contracts.

This phase does not grant new Film Kit execution authority and does not make Film Kit the global orchestrator.

### Playbooks / references / sources — knowledge collaborators

Playbooks, references, and sources can inform planning, routing, evaluation, and art direction according to their modeled usage and authority status.

They remain evidence/knowledge surfaces unless separately qualified as executable capabilities.

### Decisions / audit / learnings / evidence — feedback plane

Cross-system work must return traceable evidence so Project Brain and other authorized surfaces can explain:

- what system acted or reasoned;
- which capability or method was used;
- what inputs were supplied;
- what output was produced;
- what quality gates passed or failed;
- what authority applied;
- what remains unresolved.

## Collaboration architecture

The preferred pattern is hub-and-contract collaboration, not uncontrolled point-to-point coupling.

### Shared collaboration envelope

Introduce a canonical cross-system request/result contract carrying at minimum:

```text
projectId
correlationId
sourceSystem
targetSystem
intent
projectPhase
projectMode
capabilityRefs
authorityContext
inputRefs / structuredInputs
evidenceRefs
requestedEffectClass
status
```

A collaboration result should carry at minimum:

```text
correlationId
sourceSystem
targetSystem
capabilityUsed
resultStatus
structuredOutput
quality/evaluation results
evidence/provenance
limitations
recommendedNextStep
sideEffectRequest or null
```

The envelope is a coordination contract. It does not itself authorize mutations.

## Collaboration invariants

1. `projectId` is shared across systems; canonical project ownership remains with Project Brain.
2. Canonical capability identity comes from Registry V2 when Registry-governed entities are involved.
3. Creative Director retains ownership of the single canonical next action.
4. Supporting recommendations remain advisory and cannot independently advance project phase.
5. Every cross-system request is deterministic where the underlying collaborator is deterministic.
6. Every result is traceable to source system, capability, provenance, and authority context.
7. Unknown lifecycle, authority, compatibility, or source identity fails closed.
8. `REFERENCE` entities never become executors by routing accident.
9. External `SOURCE`, `RESOURCE`, or `PROVIDER` entities do not gain execution authority through this collaboration phase.
10. Persistent writes require an explicit owner-system write path and applicable approval.
11. No collaborator may silently mutate another collaborator's canonical state.
12. Cross-system loops must avoid recursive/circular execution without an explicit bounded orchestration contract.
13. Human approval requirements remain intact.
14. Registry V1 remains unchanged.
15. Production promotion remains a separate explicit gate after preview QA.

## Why this phase now

The major systems already exist, but their collaboration is incomplete:

- Project Brain is already a substantial live project workspace.
- Creative Director already owns canonical next-action reasoning.
- Registry V2 is Production-verified with 34 governed entities and six governed internal methods.
- Creative Method Runtime already provides deterministic local read-only execution.
- Film Kit and other specialized surfaces already exist.
- Project Brain → Director still initializes `availableSkills` as an empty array.
- Director fixtures still inject synthetic skills.
- Some supporting recommendations still use static/noncanonical registry identifiers.
- There is no single explicit collaboration contract that all participating systems can use to exchange requests, results, evidence, and authority context.

Therefore the next product milestone is not to strengthen only one link. It is to establish the collaboration substrate and then connect the existing systems through it.

## Phase slices

### Slice A — Cross-system collaboration contract foundation

Create the pure canonical request/result envelopes, system identity types, effect classification, authority pass-through, correlation semantics, and fail-closed validation.

Requirements:

- no runtime side effects;
- no system-specific UI work;
- no external execution;
- deterministic serialization/validation;
- explicit system ownership;
- explicit authority context;
- bounded recursion/no hidden cycles;
- tests proving invalid/unknown collaboration requests fail closed.

### Slice B — Registry V2 ↔ collaboration capability projection

Project eligible Registry V2 entities into collaboration-safe capability descriptors.

Initially, executable collaboration is limited to governed internal `METHOD` entities. References and unqualified external entities remain advisory/discovery-only.

### Slice C — Project Brain ↔ collaboration hub adapter

Expose canonical Project Brain project context through the collaboration envelope and define how collaboration results/proposals are returned without direct mutation.

Project Brain remains immutable through the read/projection path.

### Slice D — Creative Director ↔ collaboration orchestration

Replace the empty/synthetic capability supply with Registry-derived governed capability descriptors and allow Director to select an eligible collaborator/capability while still producing exactly one canonical next action.

### Slice E — Creative Method Runtime ↔ collaboration execution/result return

Allow a Director-selected internal Creative Method to receive structured collaboration input and return structured advisory output + quality evidence through the shared result contract.

No external calls or side effects are introduced.

### Slice F — Supporting system participation

Connect relevant specialized collaborators through adapters, not authority merging. This includes Film Kit and knowledge/evidence surfaces where the project/mode/phase requires them.

This slice must preserve each subsystem's existing authority limits.

### Slice G — Feedback / audit / decision trace

Make cross-system collaboration visible as traceable project evidence: request, selected capability, result, gates, limitations, and any proposed follow-up.

No automatic project mutation is required to prove the collaboration path.

### Slice H — Integrated preview QA

Prove representative multi-system workflows end-to-end without regression before any Production promotion decision.

## Representative target collaboration flows

The phase should prove more than one linear route.

### Creative planning flow

```text
Project Brain context
→ Director
→ Registry V2 capability lookup
→ Creative Method Runtime
→ method result + quality evidence
→ Director interpretation
→ Project Brain-visible proposal/evidence
```

### Film/production flow

```text
Project Brain context
→ Director determines production need
→ Registry/knowledge lookup as applicable
→ Film Kit receives governed production request
→ Film Kit returns plan/result/evidence
→ Director incorporates result into canonical next action
→ Project Brain-visible evidence/proposal
```

### Knowledge/reference flow

```text
Project Brain / Director need
→ Registry V2
→ eligible Reference/Source/Playbook
→ read/advisory evidence only
→ Director or specialist consumes evidence
→ traceable recommendation
```

No reference is executed in this flow.

## Exit criteria

The phase is complete only when all of the following are demonstrated:

1. A canonical collaboration request/result contract exists and is tested.
2. Every participating system has an explicit identity and ownership boundary.
3. Project Brain can supply canonical context to collaborators without losing ownership or immutability.
4. Registry V2 can supply canonical capability/evidence metadata to collaborators.
5. Director uses Registry-derived governed capabilities rather than only empty/fixture capability supply.
6. At least one internal Creative Method executes through the collaboration contract and returns quality/evidence data.
7. At least one specialized-system collaboration path is demonstrated where applicable, without authority escalation.
8. Collaboration results can be surfaced back to the project as traceable proposals/evidence.
9. Director still produces exactly one canonical next action.
10. Supporting recommendations cannot mutate project phase.
11. No Registry recommendation points at fabricated Registry identities.
12. No `REFERENCE` is treated as executable.
13. Unknown/unqualified entities remain fail-closed.
14. Cross-system recursion/cycles are bounded and tested.
15. Every cross-system result preserves provenance and authority context.
16. No external provider call, package installation, generation spend, publication, or submission is introduced without a separate authority decision.
17. Film Kit authority is not expanded by this phase.
18. Registry V2 remains valid at the Production baseline of 34 entities / 0 warnings unless a separately governed registry change is approved.
19. Tests and preview QA pass before any functional Production promotion decision.

## Explicitly out of scope

- turning every system into a global orchestrator;
- unrestricted point-to-point writes;
- shared mutable state without ownership;
- external provider execution by default;
- Film Kit authority expansion;
- auto-installation of tools/repositories;
- making references executable;
- generation spend;
- publishing/submitting externally;
- automatic Project Brain state mutation;
- Registry V1 rewrite;
- reopening the historical external-findings inventory without new evidence.

## Handover instructions

Resume from this checkpoint. The product target is now the collaboration of the existing systems as a governed whole, not merely a one-way Registry → Project Brain → Director connection.

Do not begin by wiring UIs together directly. First build the shared collaboration contracts and ownership/authority semantics, then attach Registry, Project Brain, Director, Creative Method Runtime, and specialized collaborators through adapters.

The verified Production Registry V2 remains the baseline while this phase is developed through a non-production functional branch/preview path.

## Exactly one next action

```text
SLICE A — CROSS-SYSTEM COLLABORATION CONTRACT FOUNDATION + TESTS
```
