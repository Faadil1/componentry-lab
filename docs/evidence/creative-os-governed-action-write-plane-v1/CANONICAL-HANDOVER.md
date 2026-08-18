# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = SLICES_I_J_K_COMPLETE / PREVIEW_QA_PASS / SLICE_L_NEXT
SOURCE_OF_TRUTH = GitHub feature/governed-action-write-plane-01
BASE_PRODUCTION_HEAD = e1be1978fb6109e2d7c302efcffc373c2ae91730
FEATURE_HEAD_BEFORE_HANDOVER = 9af5980b925ee13918a84ad918f1dd0478e750f9
FINAL_K_PREVIEW = dpl_a4SoXJNnigURaKrsA5bP4mAs1VFM
FINAL_K_PREVIEW_STATE = READY
COLLABORATION_ACTION_TESTS = 90 / 90 PASS
NEXT_COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
PREVIEW_ERROR_FATAL_LOGS = NONE
REAL_PREVIEW_DB_MUTATION = NONE
PRODUCTION_MODIFIED = NO
```

## Phase invariant

The Production-verified collaboration mesh remains the read/analyze/recommend plane. Mutation is layered on top through explicit typed contracts only.

> COLLABORATION MAY PROPOSE; ONLY A GOVERNED ACTION GATE MAY AUTHORIZE A WRITE; ONLY THE TARGET OWNER MAY APPLY IT.

The write sequence is:

```text
Collaborator proposal
  -> deterministic Governed Action Proposal
  -> before-state fingerprint
  -> exact owner approval bound to proposal fingerprint
  -> canonical owner authentication
  -> domain scope/authority validation
  -> target-owned executor
  -> bounded mutation
  -> immutable receipt
  -> re-read canonical state
```

No collaborator receives generic write authority.

## Slice I — COMPLETE — canonicalize a Director next action

Typed operation:

```text
PROJECT_BRAIN_APPEND_NEXT_ACTION
scope = project:next-action:append
authority = LOCAL_REVERSIBLE
approval = EXPLICIT
human review = REQUIRED
source = CREATIVE_DIRECTOR
target = PROJECT_BRAIN
```

Safety properties:
- proposal generation is pure/read-only;
- new actions enter only as `todo`;
- duplicate ID with different content is blocked;
- exact duplicate is idempotent `NO_CHANGE`;
- Project Brain must still match the approved SHA-256 precondition;
- local and Postgres paths use target-owned writers;
- Postgres persisted updates use compare-and-swap semantics;
- owner auth and domain authority are separate gates.

Key implementation:
- `lib/projects/fingerprint.ts`
- `lib/projects/next-action-writer.ts`
- `lib/creative-os/action-plane/types.ts`
- `lib/creative-os/action-plane/validation.ts`
- `lib/creative-os/action-plane/project-brain-next-action.ts`

## Slice J — COMPLETE — Director Live governed action surface

`/director/live` now exposes governed write intent without making proposal rendering mutative.

The browser is never trusted for identity or arbitrary mutation payloads. Approval forms submit only:

```text
projectId
proposalFingerprint
```

The server then:
1. reloads canonical Project Brain;
2. rebuilds the live Director projection;
3. regenerates the governed proposal;
4. compares the exact proposal fingerprint;
5. verifies canonical GitHub owner authentication;
6. invokes the typed target-owned executor only if all gates pass.

If OAuth or canonical owner configuration is absent for the environment, write controls remain visibly locked. There is no anonymous/development bypass.

Current live Project Brain projects already contain their Director-selected next actions, so the append surface correctly reports `ALREADY_CANONICAL` rather than duplicating them.

Key implementation:
- `lib/creative-os/action-plane/director-next-action.ts`
- `app/director/live/actions.ts`
- `components/director/governed-action-panel.tsx`
- `app/director/live/page.tsx`
- `components/auth/auth-controls.tsx`

## Slice K — COMPLETE — start one canonical next action

Second typed operation:

```text
PROJECT_BRAIN_START_NEXT_ACTION
scope = project:next-action:start
transition = todo -> doing
authority = LOCAL_REVERSIBLE
approval = EXPLICIT
human review = REQUIRED
source = CREATIVE_DIRECTOR
target = PROJECT_BRAIN
```

This is deliberately a lifecycle-state mutation only. It does NOT:
- change Project Brain phase;
- change overall project status;
- execute the actual work represented by the action;
- invoke Film Kit;
- execute a provider/reference/resource;
- mutate decisions/evidence truth state;
- make network/external side effects.

Lifecycle behavior:

```text
todo -> governed start proposal available
doing -> ALREADY_STARTED / no write
done -> ALREADY_COMPLETED / no write
blocked -> ACTION_BLOCKED / no write
missing canonical action -> ACTION_NOT_CANONICAL / no write
stale Project Brain fingerprint -> BLOCKED / no write
```

Only the selected action status and `updatedLabel` can change. Tests prove project phase, project status, decisions, evidence, blockers, and action count remain unchanged.

Key implementation:
- `lib/projects/next-action-status-writer.ts`
- `lib/creative-os/action-plane/project-brain-start-next-action.ts`
- generalized `lib/creative-os/action-plane/validation.ts`
- Director start intent in `director-next-action.ts`
- owner-approved server action `approveDirectorStartNextAction`
- second governed action panel in `/director/live`.

## Local + Postgres proof

No real Preview or Production database write was used to validate this phase.

Postgres parity is proven with fake SQL for both typed operations:

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

## Final Slice K Preview QA

```text
DEPLOYMENT = dpl_a4SoXJNnigURaKrsA5bP4mAs1VFM
COMMIT = 9af5980b925ee13918a84ad918f1dd0478e750f9
STATE = READY
TESTS = 90 / 90 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
/director/live = emitted dynamic route
ERROR/FATAL LOGS = NONE OBSERVED
ALIAS_ERROR = null
```

An earlier Slice K gate failed only because one test restored Vercel's Production-like environment before reading a local fixture. The test was corrected to keep all fixture reads inside its isolated local repository; no authority/runtime production code was weakened.

## Mutable surface now authorized by code

Exactly these Project Brain mutations are modeled by the new action plane:

```text
1. PROJECT_BRAIN_APPEND_NEXT_ACTION
   -> append one new canonical todo action

2. PROJECT_BRAIN_START_NEXT_ACTION
   -> change one existing canonical action from todo to doing
```

Project creation remains the pre-existing separately governed write path.

## Still explicitly blocked

- arbitrary JSON Patch / generic object mutation;
- project phase mutation;
- project overall status mutation;
- action completion `doing -> done` until separately modeled;
- action unblock/cancel/delete;
- decision approval/rejection mutation;
- evidence promotion/truth-status mutation;
- Registry V2 mutation;
- Component Library mutation;
- Film Kit execution/publishing;
- provider/reference/source/resource execution;
- external network side effects;
- implicit writes from Method/Playbook/Reference recommendations;
- authority widening through collaboration routing.

## Production auth nuance

Production source is still the prior stable baseline and has not received this feature branch.

Before any future Production write smoke, GitHub OAuth + canonical owner identity must be configured for Production. The existing app recognizes:

```text
GITHUB_ID or AUTH_GITHUB_ID
GITHUB_SECRET or AUTH_GITHUB_SECRET
AUTH_OWNER_GITHUB_ACCOUNT_ID
```

Do not guess or fabricate these values. Until configured, the future Production write UI must remain locked even after code promotion.

## Slice L — SELECTED NEXT

```text
GOVERNED ACTION COMPLETION + AUDIT RECEIPT PROJECTION
```

Slice L scope:
1. Add one more typed lifecycle mutation only: `PROJECT_BRAIN_COMPLETE_NEXT_ACTION` = `doing -> done`.
2. Preserve the same exact owner auth, explicit approval, scope, fingerprint, stale-state and target-owned-executor gates.
3. Never auto-complete an action merely because Director/Method says it is done.
4. Completion must require explicit human approval and an evidence reference or completion note sufficient for traceability.
5. Project phase/status must remain unchanged by action completion.
6. Project Brain Audit/Evidence feedback should receive an immutable receipt projection; receipt projection is not itself independent truth verification.
7. No external side effect or provider execution.
8. Preview QA must use local/fake SQL only; no real canonical DB mutation.
9. Production promotion remains a separate explicit gate.

## HANDOVER

Resume on `feature/governed-action-write-plane-01`.

Do not modify `master` until the intended phase passes Preview QA and Production promotion is explicitly authorized.

Do not reopen the completed collaboration mesh, weaken read-only defaults, remove owner authentication, or replace typed operations with arbitrary patch semantics.

## Exactly one next action

```text
SLICE L — IMPLEMENT PROJECT_BRAIN_COMPLETE_NEXT_ACTION + IMMUTABLE AUDIT RECEIPT PROJECTION + TESTS
```
