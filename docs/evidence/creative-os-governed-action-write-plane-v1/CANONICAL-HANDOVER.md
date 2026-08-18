# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = PRODUCTION_PROMOTED / OWNER_AUTH_VERIFIED / FIRST_REAL_GOVERNED_WRITE_PASS
SOURCE_OF_TRUTH = GitHub master
FEATURE_PROMOTION_PR = #3
FEATURE_PROMOTION_MERGE = 3d9f3b70d35360cf9953027e22c37f4315fbc58e
SSR_HOTFIX_PR = #4
SSR_HOTFIX_MERGE = 2a3ca36a0143547acc22cde0a3804e5293023bb7
SERVER_ACTION_HOTFIX_PR = #5
SERVER_ACTION_HOTFIX_MERGE = 3664c8123fc9cb83a7cdebfc6ce02f7874c794ed
FIRST_WRITE_RUNTIME_DEPLOYMENT = dpl_5Ea3DiukofZreWrnC5ZW57zYGbVR
FIRST_WRITE_RUNTIME_DEPLOYMENT_STATE = READY
LIVE_ALIAS = componentry-lab.vercel.app
PRODUCTION_OAUTH_CONFIGURED = YES
PRODUCTION_OWNER_ACCOUNT_CONFIGURED = YES
OWNER_AUTHENTICATED_SESSION = VERIFIED IN REAL BROWSER
OWNER_APPROVAL_CONTROL_AVAILABLE = YES
REAL_GOVERNED_WRITE_SMOKE = PASS
PROJECT = stated
ACTION_ID = act1
ACTION = Integrate Audit Panel
OPERATION = PROJECT_BRAIN_START_NEXT_ACTION
TRANSITION = todo -> doing
PERSISTED_STATUS = doing
EXECUTION_RESULT = APPLIED
EXECUTION_RECEIPT = gact-receipt-7612f2b47761d1903dedaef6
POST_DIRECTOR_LIVE = 200
DIRECTOR_RELOAD_STATUS = ALREADY_STARTED
COMPLETION_STATUS = PROPOSAL_READY
COMPLETION_EVIDENCE = project-brain:stated:evidence:ev1
EXTERNAL_PROVIDER_SIDE_EFFECT = NONE
TESTS = 106 / 106 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
```

## Locked phase invariant

The collaboration mesh remains the read/analyze/recommend plane. Mutation is layered on top only through explicit typed contracts.

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

## Production-promoted typed operations

Exactly three Project Brain mutations are modeled:

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

All three require explicit approval, canonical owner authentication, exact proposal fingerprint, stale-state rejection, exact scope and a target-owned executor. Local and Postgres paths preserve compare-and-swap behavior. Completion receipts project to `AUDIT_EVIDENCE` as immutable/read-only trace metadata and do not claim independent verification of evidence.

## Production code / QA baseline

```text
PR #3 = Governed Action / Write Plane promotion
MERGE = 3d9f3b70d35360cf9953027e22c37f4315fbc58e

PR #4 = Director live SSR boundary hotfix
MERGE = 2a3ca36a0143547acc22cde0a3804e5293023bb7

PR #5 = Server Action async-only export boundary hotfix
MERGE = 3664c8123fc9cb83a7cdebfc6ce02f7874c794ed

TESTS = 106 / 106 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
GET /director/live = 200
GET /api/director/live?project=stated = 200
```

Production OAuth is configured with the canonical GitHub owner gate. No secret values are stored in this handover.

## First write incident — FAILED SAFE, THEN FIXED

The first owner-approved `PROJECT_BRAIN_START_NEXT_ACTION` attempt failed before mutation because `app/director/live/actions.ts` was a `"use server"` module that exported a non-async runtime object. Runtime error:

```text
A "use server" file can only export async functions, found object.
```

The failed attempt left canonical `stated.act1.status = todo`; no partial mutation occurred.

PR #5 isolated the action-state type into a neutral module and preserved `actions.ts` as async Server Actions only. A regression test permanently gates this boundary:

```text
DIRECTOR_USE_SERVER_BOUNDARY_EXPORTS_ONLY_ASYNC_RUNTIME_FUNCTIONS = PASS
```

No owner, fingerprint, scope, evidence, stale-state, storage, or target-writer rule was weakened.

## First real governed write smoke — PASS

The user reloaded Production while authenticated as the canonical GitHub owner and clicked `Approve start action` exactly once for:

```text
PROJECT = stated
ACTION_ID = act1
ACTION = Integrate Audit Panel
OPERATION = PROJECT_BRAIN_START_NEXT_ACTION
EXPECTED = todo -> doing
```

Browser result supplied by the user:

```text
No additional write required.
This canonical next action is already in progress. Current status: “doing”.

Execution result: APPLIED
Receipt: gact-receipt-7612f2b47761d1903dedaef6
```

Runtime verification:

```text
POST /director/live = 200
DEPLOYMENT = dpl_5Ea3DiukofZreWrnC5ZW57zYGbVR
TARGET = production
STATE = READY
ALIAS = componentry-lab.vercel.app
```

Canonical API verification after the POST:

```text
GET /api/director/live?project=stated = 200
stated.nextActions[act1].status = doing
```

Director lifecycle re-projection after persistence:

```text
Canonicalize = ALREADY_CANONICAL
Start = ALREADY_STARTED
Complete = PROPOSAL_READY
Canonical completion evidence = project-brain:stated:evidence:ev1
Completion proposal fingerprint = 4f0d97f50498c8ea2a34fc5dd19d45376d92b727b820a2c7ce0fa4dcf72c0df3
```

The Start writer's explicit mutation surface is bounded in `lib/projects/next-action-status-writer.ts`:

```text
1. selected nextActions[actionIndex].status: todo -> doing
2. project.updatedLabel: execution date
```

The project is cloned first, validated, and persisted with the approved precondition fingerprint. In Postgres, the update uses compare-and-swap semantics against the exact persisted JSON payload. No project phase/status, decision, evidence truth status, Registry, Component Library, Film Kit, provider or external side-effect mutation is part of this writer.

Therefore:

```text
FIRST_REAL_OWNER_APPROVED_WRITE = PASS
TARGET_OWNED_PERSISTENCE = PASS
PERSISTED_AFTER_STATE = PASS
START_IDEMPOTENCE_REPROJECTION = PASS
COMPLETION_ELIGIBILITY_REPROJECTION = PASS
CANONICAL_EVIDENCE_REQUIREMENT = PASS
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

## HANDOVER

Resume from `master` with the Governed Action / Write Plane promoted and its first real Production owner-approved mutation proven end-to-end.

The system has now demonstrated:

```text
Director proposal
-> exact owner approval
-> Server Action boundary
-> proposal regeneration/fingerprint check
-> typed start scope
-> target-owned Project Brain writer
-> Postgres persistence
-> persisted after-state
-> idempotent Director re-projection
-> execution receipt surfaced to owner
```

Do not reopen the collaboration mesh, weaken Production storage fail-closed behavior, bypass owner authentication, loosen fingerprints/scopes/evidence requirements, or replace typed operations with arbitrary patch semantics.

The next unproven lifecycle boundary is the first real evidence-backed completion mutation.

## Exactly one next action

```text
PERFORM FIRST REAL GOVERNED COMPLETION SMOKE
PROJECT = stated
ACTION_ID = act1
OPERATION = PROJECT_BRAIN_COMPLETE_NEXT_ACTION
CURRENT CANONICAL STATUS = doing
CANONICAL EVIDENCE = project-brain:stated:evidence:ev1
EXPECTED TRANSITION = doing -> done
USER ACTION = while authenticated owner, click `Approve completion` exactly once
THEN VERIFY =
  POST /director/live = 200
  persisted Project Brain action status = done
  Complete re-projects as ALREADY_COMPLETED
  execution receipt exists
  audit trace ref is returned
  completion used canonical ev1
  project phase/status remain unchanged
  no external/provider side effect occurred
```
