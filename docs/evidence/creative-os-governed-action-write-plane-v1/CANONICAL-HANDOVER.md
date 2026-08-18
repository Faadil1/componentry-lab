# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = FEATURE_PHASE_COMPLETE / PREVIEW_QA_PASS / PRODUCTION_PROMOTION_NOT_AUTHORIZED
SOURCE_OF_TRUTH = GitHub feature/governed-action-write-plane-01
BASE_PRODUCTION_HEAD = e1be1978fb6109e2d7c302efcffc373c2ae91730
FEATURE_FUNCTIONAL_HEAD = 837e0e0ffef55b3c36c588ebd01458cd8ac5023f
FINAL_PREVIEW = dpl_B6eJicW8E8iRwFsJ5SVnjyqbjKAV
FINAL_PREVIEW_STATE = READY
COLLABORATION_ACTION_TESTS = 104 / 104 PASS
NEXT_COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
/director/live = emitted dynamic route
PREVIEW_ERROR_FATAL_LOGS = NONE
REAL_PREVIEW_DB_MUTATION = NONE
PRODUCTION_MODIFIED = NO
```

## Phase invariant

The Production-verified collaboration mesh remains the read/analyze/recommend plane. Mutation is layered on top through explicit typed contracts only.

> COLLABORATION MAY PROPOSE; ONLY A GOVERNED ACTION GATE MAY AUTHORIZE A WRITE; ONLY THE TARGET OWNER MAY APPLY IT.

Canonical write sequence:

```text
Collaborator proposal
  -> deterministic Governed Action Proposal
  -> before-state SHA-256 fingerprint
  -> exact human approval bound to proposal fingerprint
  -> canonical GitHub owner authentication
  -> domain authority + exact scope validation
  -> target-owned executor
  -> bounded mutation
  -> immutable execution receipt
  -> read-only Audit/Evidence projection
```

No collaborator receives generic mutation authority.

## Completed typed operations

### 1. PROJECT_BRAIN_APPEND_NEXT_ACTION

```text
scope = project:next-action:append
transition = absent -> canonical todo action
authority = LOCAL_REVERSIBLE
approval = EXPLICIT
source = CREATIVE_DIRECTOR
target = PROJECT_BRAIN
```

Rules:
- proposal generation is pure/read-only;
- action enters as `todo` only;
- duplicate ID with different content is blocked;
- exact duplicate is idempotent `NO_CHANGE`;
- stale Project Brain fingerprint blocks the write;
- local and Postgres target-owned executors are supported.

### 2. PROJECT_BRAIN_START_NEXT_ACTION

```text
scope = project:next-action:start
transition = todo -> doing
authority = LOCAL_REVERSIBLE
approval = EXPLICIT
source = CREATIVE_DIRECTOR
target = PROJECT_BRAIN
```

Rules:
- only an existing canonical Director action may be started;
- `doing` returns `ALREADY_STARTED` / no write;
- `done` returns `ALREADY_COMPLETED` / no write;
- `blocked` fails closed;
- no phase/status/external execution is implied.

### 3. PROJECT_BRAIN_COMPLETE_NEXT_ACTION

```text
scope = project:next-action:complete
transition = doing -> done
authority = LOCAL_REVERSIBLE
approval = EXPLICIT
source = CREATIVE_DIRECTOR
target = PROJECT_BRAIN
canonical completion evidence = REQUIRED
```

Rules:
- only an existing `doing` canonical Director action may be completed;
- completion requires a Project Brain evidence item with `status=available`;
- Director completion intent uses Director-required `evidenceNeededAfterCompletion` when an available canonical evidence item matches;
- the browser never supplies arbitrary `evidenceId`, mutation payload, or approving identity;
- `done` is idempotent `NO_CHANGE`;
- stale state, missing evidence, unavailable evidence, wrong lifecycle state, wrong scope, wrong authority, wrong owner, or proposal mismatch all produce zero mutation;
- completion changes only the selected action status and `updatedLabel`.

## Director Live governed-action surface — COMPLETE

`/director/live` now renders three bounded action-plane states:

```text
Canonicalize -> PROJECT_BRAIN_APPEND_NEXT_ACTION
Start        -> PROJECT_BRAIN_START_NEXT_ACTION
Complete     -> PROJECT_BRAIN_COMPLETE_NEXT_ACTION
```

The browser sends only:

```text
projectId
proposalFingerprint
```

The server then:
1. reloads canonical Project Brain;
2. rebuilds the live Director projection;
3. regenerates the intended governed proposal from canonical state;
4. compares the exact proposal fingerprint;
5. verifies canonical owner authentication;
6. invokes only the operation-specific target-owned executor;
7. returns the execution receipt.

There is no anonymous/development bypass and no generic JSON Patch path.

Current preview OAuth/owner configuration is absent, so Preview correctly renders the governed write controls as locked rather than bypassing identity checks.

## Audit / Evidence receipt projection — COMPLETE

Completion receipts are projected through the existing `AUDIT_EVIDENCE` collaboration adapter as read-only trace metadata.

Projection properties:

```text
requestedEffectClass = NONE
requestedAuthority = READ_ONLY
persistenceApplied = false
mutationApplied = false
```

Evidence refs include:
- the canonical Project Brain completion evidence;
- `governed-action-receipt:<receiptId>`.

The receipt/audit projection explicitly does NOT claim that the underlying evidence was independently verified.

A final Slice L gate initially failed because the audit adapter request incorrectly included the current `CREATIVE_DIRECTOR -> AUDIT_EVIDENCE` hop inside `hopTrace`. The collaboration contract defines `hopTrace` as prior hops and correctly rejects a repeated current hop. The adapter was fixed to preserve only the prior `PROJECT_BRAIN -> CREATIVE_DIRECTOR` hop. No validation or authority rule was weakened.

## Local + Postgres parity proof

No real Preview or Production database mutation was used for feature QA.

All three typed operations have fake-SQL Postgres parity tests covering:

```text
seed/unpersisted canonical project
-> INSERT runtime overlay

persisted project matching approved fingerprint
-> conditional UPDATE

stale persisted payload
-> STALE_PRECONDITION / zero update

concurrent write race
-> compare-and-swap returns zero rows
-> STALE_PRECONDITION / zero update
```

Local repository tests also prove exact field isolation for lifecycle writes.

## Final Preview QA

```text
DEPLOYMENT = dpl_B6eJicW8E8iRwFsJ5SVnjyqbjKAV
COMMIT = 837e0e0ffef55b3c36c588ebd01458cd8ac5023f
STATE = READY
TESTS = 104 / 104 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
/director/live = emitted
ERROR/FATAL LOGS = NONE OBSERVED
```

Real preview smoke of `/director/live` confirmed:
- all three typed action surfaces render;
- current Project Brain action is recognized as already canonical;
- Start proposal is available for a canonical `todo` action;
- Complete remains `ACTION_NOT_STARTED` until lifecycle precondition is satisfied;
- Preview write controls remain locked when OAuth/owner configuration is absent.

## Mutable surface authorized by this feature

Exactly these new Project Brain mutations are modeled:

```text
1. append one canonical todo next action
2. start one canonical next action: todo -> doing
3. complete one canonical next action: doing -> done, with canonical available evidence
```

Project creation remains the pre-existing separately governed write path.

## Still explicitly blocked

- arbitrary JSON Patch / generic object mutation;
- project phase mutation;
- project overall status mutation;
- action delete/cancel/unblock/reopen;
- decision approval/rejection mutation;
- evidence creation/promotion/truth-status mutation;
- Registry V2 mutation;
- Component Library mutation;
- Film Kit execution/publishing;
- provider/reference/source/resource execution;
- external network side effects;
- implicit writes from Method/Playbook/Reference recommendations;
- authority widening through collaboration routing;
- automatic action completion from Director/Method output alone.

## Production auth prerequisite

Production source remains on the pre-feature stable baseline until explicit promotion authorization.

Before a real Production governed-write smoke can succeed, Production must have valid GitHub OAuth + canonical owner identity configured. The app recognizes:

```text
GITHUB_ID or AUTH_GITHUB_ID
GITHUB_SECRET or AUTH_GITHUB_SECRET
AUTH_OWNER_GITHUB_ACCOUNT_ID
```

Do not guess or fabricate these values. If absent after code promotion, the site may still render but governed write controls must remain locked.

## HANDOVER

Resume from `feature/governed-action-write-plane-01` at this checkpoint.

Do not rebuild Slices I-L, reopen the completed collaboration mesh, weaken read-only defaults, remove owner authentication, or replace typed operations with arbitrary patch semantics.

The feature phase is complete and Preview QA is green. Production has not been modified by this feature branch.

## Exactly one next action

```text
PRODUCTION PROMOTION DECISION GATE
-> only merge feature/governed-action-write-plane-01 into master if explicitly authorized by the user
-> after merge, verify Production build/runtime without exercising a write unless Production OAuth + canonical owner identity are configured
```
