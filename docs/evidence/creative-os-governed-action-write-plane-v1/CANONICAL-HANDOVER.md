# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = PRODUCTION_PROMOTED / OWNER_AUTH_VERIFIED / SERVER_ACTION_HOTFIX_PROMOTED / FIRST_WRITE_RETRY_PENDING
SOURCE_OF_TRUTH = GitHub master
FEATURE_PROMOTION_PR = #3
FEATURE_PROMOTION_MERGE = 3d9f3b70d35360cf9953027e22c37f4315fbc58e
SSR_HOTFIX_PR = #4
SSR_HOTFIX_MERGE = 2a3ca36a0143547acc22cde0a3804e5293023bb7
SERVER_ACTION_HOTFIX_PR = #5
SERVER_ACTION_HOTFIX_MERGE = 3664c8123fc9cb83a7cdebfc6ce02f7874c794ed
SERVER_ACTION_HOTFIX_PRODUCTION_DEPLOYMENT = dpl_8tcs959xA4r65aYkbpHN9oSSfPFy
SERVER_ACTION_HOTFIX_DEPLOYMENT_STATE = READY
LIVE_ALIAS = componentry-lab.vercel.app
PRODUCTION_OAUTH_CONFIGURED = YES
PRODUCTION_OWNER_ACCOUNT_CONFIGURED = YES
OWNER_AUTHENTICATED_SESSION = VERIFIED IN REAL BROWSER
OWNER_APPROVAL_CONTROL_AVAILABLE = YES
FIRST_WRITE_ATTEMPT = FAILED BEFORE MUTATION
FIRST_WRITE_ATTEMPT_DIGEST = 1821632126@E352
CANONICAL_STATED_ACT1_STATUS_AFTER_FAILED_ATTEMPT = todo
REAL_GOVERNED_WRITE_SMOKE = RETRY PENDING
TESTS = 106 / 106 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
DIRECTOR_LIVE_GET = 200
DIRECTOR_LIVE_API_GET = 200
PRODUCTION_ERROR_FATAL_LOGS_AFTER_HOTFIX = NONE OBSERVED
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

Governed Write Plane promotion:

```text
PR #3 = MERGED
MERGE_COMMIT = 3d9f3b70d35360cf9953027e22c37f4315fbc58e
```

A real Production SSR regression on `/director/live` was discovered immediately after promotion (`replaceAll` on an undefined client-boundary value). It was fixed fail-closed without weakening any authority, storage or mutation contract:

```text
PR #4 = MERGED
SSR_HOTFIX_MERGE = 2a3ca36a0143547acc22cde0a3804e5293023bb7
```

## Production OAuth runtime — VERIFIED

Production Vercel configuration contains separate Production-scoped values for:

```text
GITHUB_ID
GITHUB_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL = https://componentry-lab.vercel.app
AUTH_OWNER_GITHUB_ACCOUNT_ID
DATABASE_URL
COMPONENTRY_LAB_STORAGE_MODE = postgres
```

No secret value is stored in this handover.

The first OAuth attempt failed because the Production Vercel `GITHUB_ID` pointed to a different GitHub OAuth application than `Componentry Lab Owner Access`. The user corrected the Production OAuth credential pair so that `GITHUB_ID` and `GITHUB_SECRET` belong to the same GitHub OAuth application whose callback is:

```text
https://componentry-lab.vercel.app/api/auth/callback/github
```

Real browser verification then proved the canonical owner boundary: the UI changed from `Sign in with GitHub` to the owner-only `Approve start action` control.

Therefore:

```text
REAL_GITHUB_OAUTH_REDIRECT = PASS
OWNER_BROWSER_SESSION = PASS
OWNER_GATE_IDENTITY_MATCH = PASS
OWNER_AUTHENTICATED != WRITE_ALREADY_EXECUTED
```

## First real governed-write attempt — FAILED SAFE

The user explicitly clicked the owner-only `Approve start action` control for canonical project `stated` and action `act1` (`Integrate Audit Panel`).

Expected transition:

```text
PROJECT_BRAIN_START_NEXT_ACTION
todo -> doing
```

The browser returned a server-error page with digest:

```text
1821632126@E352
```

Production runtime logs identified the exact failure:

```text
Error: A "use server" file can only export async functions, found object.
POST /director/live = 500
```

Root cause: `app/director/live/actions.ts` was a `"use server"` module that still exported the runtime object `INITIAL_GOVERNED_DIRECTOR_ACTION_STATE`. GET/render paths did not exercise the Server Action module validation, but the authenticated POST did.

Critical integrity check immediately after the failed POST:

```text
GET /api/director/live?project=stated = 200
stated.nextActions[act1].status = todo
MUTATION_PERFORMED = NO
```

Thus the failure occurred before the target-owned Project Brain writer applied any mutation. No partial `todo -> doing` transition occurred.

## Server Action boundary hotfix — PR #5

Hotfix branch:

```text
hotfix/governed-action-use-server-boundary
```

The fix:
- moved `GovernedDirectorActionState` into neutral `app/director/live/action-state.ts`;
- removed the runtime object export from `app/director/live/actions.ts`;
- kept `actions.ts` as a `"use server"` module whose only runtime exports are the three async Server Actions;
- preserved proposal regeneration, owner auth, exact fingerprint checks, scopes, stale-state checks, canonical evidence requirements and target-owned writers unchanged;
- added regression test `DIRECTOR_USE_SERVER_BOUNDARY_EXPORTS_ONLY_ASYNC_RUNTIME_FUNCTIONS` to the existing Vercel prebuild suite.

Preview gate:

```text
BRANCH_HEAD = 272dd2026d79ae93375011948e56b1632215b5eb
PREVIEW_DEPLOYMENT = dpl_BgfWAfEUyozBd4Q3oNHueuY8LckG
TESTS = 106 / 106 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
STATE = READY
```

Production promotion:

```text
PR #5 = MERGED
MERGE_COMMIT = 3664c8123fc9cb83a7cdebfc6ce02f7874c794ed
PRODUCTION_DEPLOYMENT = dpl_8tcs959xA4r65aYkbpHN9oSSfPFy
TARGET = production
STATE = READY
ALIAS = componentry-lab.vercel.app
ALIAS_ERROR = null
TESTS = 106 / 106 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
GET /director/live = 200
GET /api/director/live?project=stated = 200
ERROR/FATAL LOGS AFTER HOTFIX = NONE OBSERVED
```

The canonical action remains `todo`; the hotfix itself performed no Project Brain mutation.

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

Resume from `master` after PR #5 with Production healthy, owner OAuth verified, and the first failed write attempt proven to have caused zero canonical mutation.

Do not bypass the browser owner approval, replay the failed POST programmatically, weaken `use server` restrictions, loosen owner/fingerprint/scope/evidence gates, or replace the typed mutations with generic patch semantics.

## Exactly one next action

```text
RETRY FIRST REAL GOVERNED WRITE SMOKE ONCE
PROJECT = stated
OPERATION = PROJECT_BRAIN_START_NEXT_ACTION
CURRENT CANONICAL STATUS = todo
EXPECTED TRANSITION = todo -> doing
USER ACTION = refresh https://componentry-lab.vercel.app/director/live and click `Approve start action` exactly once
THEN VERIFY =
  POST no longer fails with the `use server` export error
  persisted Project Brain action status = doing
  Director reload reflects doing
  Start no longer proposes todo -> doing
  Complete becomes eligible only if canonical available evidence requirements are satisfied
  execution receipt exists
  no unrelated Project Brain field changed
  no external/provider side effect occurred
```
