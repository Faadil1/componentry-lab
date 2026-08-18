# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = V1_BASELINE_FROZEN / PRODUCTION_PROVEN / START_AND_COMPLETION_SMOKES_PASS
SOURCE_OF_TRUTH = GitHub master

FEATURE_PROMOTION_PR = #3
FEATURE_PROMOTION_MERGE = 3d9f3b70d35360cf9953027e22c37f4315fbc58e
SSR_HOTFIX_PR = #4
SSR_HOTFIX_MERGE = 2a3ca36a0143547acc22cde0a3804e5293023bb7
SERVER_ACTION_HOTFIX_PR = #5
SERVER_ACTION_HOTFIX_MERGE = 3664c8123fc9cb83a7cdebfc6ce02f7874c794ed

LIVE_ALIAS = componentry-lab.vercel.app
PRODUCTION_DEPLOYMENT = dpl_FULJp14Lr35wPXvTzhim5bScJ3ea
PRODUCTION_DEPLOYMENT_STATE = READY

PRODUCTION_OAUTH_CONFIGURED = YES
PRODUCTION_OWNER_ACCOUNT_CONFIGURED = YES
OWNER_AUTHENTICATED_SESSION = VERIFIED IN REAL BROWSER

TESTS = 106 / 106 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
PRODUCTION_ERROR_FATAL_LOGS = NONE OBSERVED

PROJECT = stated
ACTION_ID = act1
ACTION = Integrate Audit Panel
CURRENT_CANONICAL_STATUS = done
```

## Locked invariant

> COLLABORATION MAY PROPOSE; ONLY A GOVERNED ACTION GATE MAY AUTHORIZE A WRITE; ONLY THE TARGET OWNER MAY APPLY IT.

Canonical write sequence:

```text
Collaborator proposal
-> deterministic Governed Action Proposal
-> before-state SHA-256 fingerprint
-> exact human approval bound to proposal fingerprint
-> canonical GitHub owner authentication
-> exact domain scope/authority validation
-> target-owned Project Brain executor
-> bounded mutation
-> immutable execution receipt
-> read-only Audit/Evidence projection
```

No collaborator receives generic mutation authority.

## V1 baseline freeze

Governed Action / Write Plane V1 is now frozen as the stable Production baseline.

The freeze means:
- the three typed mutation contracts below are the complete V1 writable surface;
- no additional mutation authority is implied by collaboration, Director output, Registry visibility, evidence availability, or owner authentication alone;
- future capabilities must be isolated on a new branch/phase and earn their own contract, fail-closed tests, Preview QA, Production promotion decision, and real smoke proof;
- V1 may receive security/correctness hotfixes, but its authority model must not be widened silently.

## Production-promoted typed operations

Exactly three Project Brain mutation types are modeled:

```text
1. PROJECT_BRAIN_APPEND_NEXT_ACTION
   scope = project:next-action:append
   transition = absent -> todo

2. PROJECT_BRAIN_START_NEXT_ACTION
   scope = project:next-action:start
   transition = todo -> doing

3. PROJECT_BRAIN_COMPLETE_NEXT_ACTION
   scope = project:next-action:complete
   transition = doing -> done
   canonical ProjectEvidence(status=available) = REQUIRED
```

All three require explicit approval, canonical owner authentication, exact proposal fingerprint, stale-state rejection, exact scope and a target-owned executor. Postgres writes preserve compare-and-swap behavior.

## First real governed start smoke — PASS

User approved exactly once:

```text
PROJECT = stated
ACTION_ID = act1
OPERATION = PROJECT_BRAIN_START_NEXT_ACTION
TRANSITION = todo -> doing
```

Verified result:

```text
POST /director/live = 200
EXECUTION_RESULT = APPLIED
EXECUTION_RECEIPT = gact-receipt-7612f2b47761d1903dedaef6
PERSISTED_STATUS = doing
DIRECTOR_START_REPROJECTION = ALREADY_STARTED
DIRECTOR_COMPLETE_REPROJECTION = PROPOSAL_READY
COMPLETION_EVIDENCE = project-brain:stated:evidence:ev1
```

The start writer mutates only the selected action status plus `updatedLabel`.

## First real governed completion smoke — PASS

User then approved exactly once:

```text
PROJECT = stated
ACTION_ID = act1
OPERATION = PROJECT_BRAIN_COMPLETE_NEXT_ACTION
CANONICAL_EVIDENCE = project-brain:stated:evidence:ev1
TRANSITION = doing -> done
```

Real browser result:

```text
Execution result: APPLIED
Receipt: gact-receipt-ce79ecdd221b88febde694bd
Audit trace: audit-evidence:stated:audit:gact-receipt-ce79ecdd221b88febde694bd
```

Runtime verification:

```text
POST /director/live = 200
DEPLOYMENT = dpl_FULJp14Lr35wPXvTzhim5bScJ3ea
TARGET = production
STATE = READY
ERROR/FATAL = NONE OBSERVED
```

Canonical API verification after completion:

```text
GET /api/director/live?project=stated = 200
stated.nextActions[act1].status = done
project.status = building
project.currentPhase = build
project.evidence[ev1].status = available
```

Director lifecycle re-projection:

```text
Canonicalize = ALREADY CANONICAL
Start = ALREADY COMPLETED
Complete = ALREADY COMPLETED
Current canonical status = done
```

The completion writer in `lib/projects/next-action-complete-writer.ts` requires canonical evidence to exist and have `status = available`. Its bounded mutation surface is:

```text
1. selected nextActions[actionIndex].status: doing -> done
2. project.updatedLabel: execution date
```

The project is cloned first, validated, and persisted under the approved fingerprint precondition. No project phase/status, decision, evidence truth status, Registry, Component Library, Film Kit, provider, reference, source, resource, publishing or external side-effect mutation is part of this writer.

The Audit/Evidence identifier returned to the browser is a read-only trace projection. It does not mutate canonical Project Brain and does not claim independent verification of `ev1`.

Therefore:

```text
FIRST_REAL_OWNER_APPROVED_START = PASS
FIRST_REAL_OWNER_APPROVED_COMPLETION = PASS
TARGET_OWNED_POSTGRES_PERSISTENCE = PASS
CANONICAL_EVIDENCE_PREREQUISITE = PASS
PERSISTED_AFTER_STATE = PASS
IDEMPOTENT_LIFECYCLE_REPROJECTION = PASS
EXECUTION_RECEIPT = PASS
AUDIT_TRACE_PROJECTION = PASS
GENERIC_PATCH_AUTHORITY = NOT GRANTED
EXTERNAL_SIDE_EFFECT = NONE
```

## Still explicitly blocked

- anonymous or unauthenticated writes;
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

## Post-completion routing finding

After the real `doing -> done` smoke, the live Director still returns `act1` as its one canonical next action. Root cause is read/orchestration logic: `mapActionCandidate()` currently selects a phase-matching action without excluding terminal `done` actions.

This is a routing defect, not a need for new write authority.

Therefore the next phase must fix post-completion selection before considering any additional mutation contract.

## HANDOVER

Resume from the frozen V1 Production baseline. Do not widen V1 mutation authority.

The next work belongs on a separate branch and remains read-only with respect to new authority.

## Exactly one next action

```text
OPEN POST-COMPLETION ROUTING PHASE
GOAL = terminal done actions must not be selected as the Director's next canonical action
AUTHORITY_CHANGE = NONE
EXPECTED = choose an existing non-terminal canonical action if one exists; otherwise return a bounded deterministic fallback/proposal that does not mutate Project Brain
REQUIRED_PROOF = fail-closed tests + Preview QA before any Production promotion decision
```
