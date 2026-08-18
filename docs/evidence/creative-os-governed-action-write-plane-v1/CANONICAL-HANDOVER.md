# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = SLICE_I_COMPLETE / PREVIEW_QA_PASS / SLICE_J_NEXT
SOURCE_OF_TRUTH = GitHub feature/governed-action-write-plane-01
BASE_PRODUCTION_HEAD = e1be1978fb6109e2d7c302efcffc373c2ae91730
PRODUCTION_RUNTIME_BASELINE = PRODUCTION_PROMOTION_COMPLETE / RUNTIME_QA_PASS
FEATURE_HEAD_BEFORE_HANDOVER = a3e9ccaeeacde674e5a589be5197efe9aa477b54
SLICE_I_PREVIEW = dpl_ASLVe1r9E8X1oHFgVWsDyoecpojw
SLICE_I_PREVIEW_STATE = READY
COLLABORATION_ACTION_TESTS = 71 / 71 PASS
NEXT_COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
PREVIEW_ERROR_FATAL_LOGS = NONE
PRODUCTION_MODIFIED = NO
```

## Why this phase exists

The governed collaboration mesh is Production-verified, but most collaborators are intentionally read-only/advisory. This phase introduces bounded, auditable mutation without collapsing collaboration into unrestricted cross-system writes.

Core invariant:

> COLLABORATION MAY PROPOSE; ONLY A GOVERNED ACTION GATE MAY AUTHORIZE A WRITE; ONLY THE TARGET OWNER MAY APPLY IT.

## Authority architecture

The collaboration mesh remains the read/analyze/recommend plane.

The action/write plane mediates state mutation:

```text
Collaborator proposal
  -> Governed Action Proposal
  -> deterministic validation + before/after fingerprint
  -> explicit owner approval bound to exact proposal fingerprint
  -> canonical write-access check
  -> target-owned executor
  -> mutation
  -> immutable execution receipt
  -> collaboration/audit feedback
```

No collaborator receives unrestricted write authority.

## Slice I — COMPLETE

The first executable mutation is intentionally narrow:

```text
PROJECT_BRAIN_APPEND_NEXT_ACTION
```

Required scope:

```text
project:next-action:append
```

Required authority and identity:

```text
LOCAL_REVERSIBLE
explicit human approval
canonical owner authentication
```

### Implemented substrate

- `lib/projects/fingerprint.ts`
  - canonical JSON normalization;
  - SHA-256 Project Brain fingerprinting.
- `lib/projects/next-action-writer.ts`
  - target-owned bounded writer;
  - local-file atomic runtime overlay;
  - Postgres seed INSERT and persisted UPDATE paths;
  - compare-and-swap stale-state protection;
  - duplicate identity protection;
  - exact duplicate idempotency.
- `lib/creative-os/action-plane/types.ts`
  - versioned proposal / approval / receipt contracts.
- `lib/creative-os/action-plane/validation.ts`
  - fail-closed contract validation.
- `lib/creative-os/action-plane/project-brain-next-action.ts`
  - pure proposal generation;
  - exact proposal-fingerprint approval binding;
  - canonical owner authentication;
  - target-owned execution;
  - immutable receipt creation.

### Mutation safety

A proposal itself never mutates canonical state.

An executable Slice I write must satisfy all of these conditions:

```text
sourceSystem = CREATIVE_DIRECTOR
targetSystem = PROJECT_BRAIN
operation = PROJECT_BRAIN_APPEND_NEXT_ACTION
effectClass = OWNER_STATE_MUTATION
requiredAuthority = LOCAL_REVERSIBLE
approvalRequirement = EXPLICIT
humanReviewRequired = true
requiredScopes = [project:next-action:append]
proposalFingerprint = exact approved proposal
Project Brain beforeFingerprint = exact current canonical state
owner session = authenticated canonical owner
```

If any one condition fails, no mutation occurs.

New actions must enter as `todo`. Existing IDs cannot be overwritten. An exact duplicate is idempotent and returns `NO_CHANGE`.

## Local + Postgres parity proof

The final `test:collaboration` gate includes 14 Slice I tests in addition to the prior 57 collaboration tests.

Postgres parity is tested with fake SQL only — no Preview or Production database mutation was performed.

Proven paths:

```text
unpersisted seed Project Brain
-> INSERT runtime overlay

persisted Project Brain matching approved fingerprint
-> conditional UPDATE

persisted Project Brain with stale fingerprint
-> STALE_PRECONDITION / zero write

concurrent change between read and write
-> compare-and-swap returns zero rows
-> STALE_PRECONDITION / zero write
```

Final Preview QA:

```text
DEPLOYMENT = dpl_ASLVe1r9E8X1oHFgVWsDyoecpojw
STATE = READY
TESTS = 71 / 71 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
ERROR/FATAL LOGS = NONE OBSERVED
```

## Explicitly still blocked

Slice I does NOT authorize:

- arbitrary JSON Patch / arbitrary field mutation;
- project phase mutation;
- project status mutation;
- decision approval/rejection mutation;
- evidence promotion or truth-status mutation;
- Registry V2 mutation;
- Component Library mutation;
- Film Kit execution/publishing;
- external provider execution;
- network/external side effects;
- writes initiated solely because a method/reference/playbook recommends them;
- implicit authority elevation through collaboration routing.

The collaboration mesh remains read-only unless a separately validated governed action reaches a target-owned executor.

## Important live-product nuance

The current Director often selects its canonical next action from an action that is already present in `ProjectBrain.nextActions`. Therefore `PROJECT_BRAIN_APPEND_NEXT_ACTION` is a valid foundational write capability but may legitimately return `NO_CHANGE` for the current live Project Brain state.

Do not fabricate a second copy merely to demonstrate mutation.

The next product slice should expose governed write intent visibly and then introduce only the minimum additional typed operation needed for a useful live workflow.

## Slice J — SELECTED NEXT

```text
DIRECTOR LIVE GOVERNED ACTION PREVIEW + OWNER APPROVAL UX
```

Slice J rules:

1. `/director/live` may display the governed action proposal, exact operation, scope, authority, and before-state fingerprint.
2. Proposal rendering remains pure/read-only.
3. Application requires the authenticated canonical GitHub owner.
4. Approval must bind to the exact server-generated proposal fingerprint.
5. The server must regenerate/revalidate canonical Project Brain state before execution.
6. Client identity and arbitrary client mutation payloads are never trusted.
7. If GitHub OAuth is not configured for the environment, the write control is visibly locked; no development/anonymous bypass is allowed.
8. Existing Director action already canonical in Project Brain should be shown as idempotent/already represented rather than duplicated.
9. A useful second typed operation may be considered only if it preserves the same explicit approval, scope, fingerprint and target-owned executor guarantees.
10. Production promotion remains a separate explicit decision after Preview QA.

## HANDOVER

Resume on `feature/governed-action-write-plane-01`.

Do not modify `master` until Preview QA passes for the intended phase and Production promotion is explicitly authorized.

Do not reopen the completed collaboration mesh, weaken its read-only defaults, remove owner authentication, or replace typed operations with arbitrary patch semantics.

## Exactly one next action

```text
SLICE J — ADD DIRECTOR LIVE GOVERNED ACTION PREVIEW + OWNER-APPROVAL SURFACE
```
