# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = PRODUCTION_PROMOTED / OAUTH_RUNTIME_CONFIGURED / OWNER_SIGNIN_NOT_YET_VERIFIED
SOURCE_OF_TRUTH = GitHub master
PRE_FEATURE_PRODUCTION_HEAD = e1be1978fb6109e2d7c302efcffc373c2ae91730
FEATURE_PROMOTION_PR = #3
FEATURE_PROMOTION_MERGE = 3d9f3b70d35360cf9953027e22c37f4315fbc58e
SSR_HOTFIX_PR = #4
SSR_HOTFIX_MERGE = 2a3ca36a0143547acc22cde0a3804e5293023bb7
PRE_OAUTH_CANONICAL_HEAD = 5eaa90ed988fcb8dab832f32881c661df340f81f
OAUTH_REDEPLOYMENT = dpl_HtgWg4Ppo7AuJVMWRcwA2oN9d6rd
OAUTH_REDEPLOYMENT_STATE = READY
LIVE_ALIAS = componentry-lab.vercel.app
TESTS = 105 / 105 PASS
NEXT_COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
ROOT_GET = 200
PROJECTS_GET = 200
DIRECTOR_LIVE_GET = 200
DIRECTOR_LIVE_API_GET = 200
AUTH_PROVIDERS_GET = 200
PRODUCTION_ERROR_FATAL_LOGS = NONE OBSERVED
PRODUCTION_OAUTH_CONFIGURED = YES
PRODUCTION_OWNER_ACCOUNT_CONFIGURED = YES
OWNER_AUTHENTICATED_SESSION = NOT YET VERIFIED
OWNER_AUTHORIZED = FALSE UNTIL SIGN-IN
REAL_GOVERNED_WRITE_SMOKE = NOT PERFORMED
```

## Phase invariant

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

Exactly three new Project Brain mutations are modeled:

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

All three require explicit approval, canonical owner authentication, exact proposal fingerprint, stale-state rejection, exact scope and a target-owned executor. Local and Postgres paths preserve compare-and-swap behavior. Completion receipts project to `AUDIT_EVIDENCE` as immutable/read-only trace metadata and do not claim independent verification of the evidence.

## Production promotion — PR #3

The user explicitly authorized Production promotion.

```text
PR = #3
TITLE = feat(creative-os): promote governed action write plane
HEAD = feature/governed-action-write-plane-01
HEAD_SHA = d7ec78a1cc8f3893fb874437d12af74c78ffcba6
BASE = master
BASE_SHA = e1be1978fb6109e2d7c302efcffc373c2ae91730
MERGE_COMMIT = 3d9f3b70d35360cf9953027e22c37f4315fbc58e
```

Initial Production build from PR #3 passed:

```text
DEPLOYMENT = dpl_8QjSGDgZ5zUVZA4b6B6sHdSt99c4
TESTS = 104 / 104 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
STATE = READY
```

Initial GET smoke:

```text
/ = 200
/projects = 200
/api/director/live = 200
/director/live = 500
```

The `/director/live` failure was a real SSR rendering error:

```text
TypeError: Cannot read properties of undefined (reading 'replaceAll')
```

Postgres `relation already exists, skipping` messages were benign notices and were not the cause.

## Production SSR recovery — PR #4

The failure was isolated to the governed action client rendering boundary. No authority, mutation, storage or executor contract needed weakening.

Hotfix branch:
`hotfix/director-live-client-action-state`

Fixes:
- keep `useActionState` initial value client-local rather than importing the runtime value from a `use server` module;
- normalize missing panel status to `INVALID_PROPOSAL`, which is fail-closed and never approvable;
- remove both Write Plane `replaceAll` rendering calls and use safe status labeling;
- preserve all server actions, exact scopes, owner auth, fingerprints, stale-state checks, evidence requirements and Project Brain-owned writers unchanged;
- add an SSR-boundary regression test.

```text
PR = #4
TITLE = fix(director): harden governed action SSR status boundary
HEAD_SHA = a527076b670e80b1c7b0949824f87c0a2c61b6a8
MERGE_COMMIT = 2a3ca36a0143547acc22cde0a3804e5293023bb7
```

Hotfix Preview gate:

```text
TESTS = 105 / 105 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
PREVIEW_STATE = READY
```

## Production authentication configuration — COMPLETE AT RUNTIME CONFIG LEVEL

The Production GitHub OAuth configuration was added through Vercel as separate Production-scoped values without mutating the existing Preview branch-specific records.

Production variables now include:

```text
GITHUB_ID = configured / sensitive
GITHUB_SECRET = configured / sensitive
NEXTAUTH_SECRET = configured / sensitive
NEXTAUTH_URL = configured for https://componentry-lab.vercel.app
AUTH_OWNER_GITHUB_ACCOUNT_ID = configured / sensitive
DATABASE_URL = configured / sensitive
COMPONENTRY_LAB_STORAGE_MODE = postgres
```

No secret value is recorded in this handover.

Vercel automatically redeployed the existing canonical master after these environment changes:

```text
DEPLOYMENT = dpl_HtgWg4Ppo7AuJVMWRcwA2oN9d6rd
SOURCE = redeploy of master head 5eaa90ed988fcb8dab832f32881c661df340f81f
TARGET = production
STATE = READY
ALIAS = componentry-lab.vercel.app
ALIAS_ERROR = null
TESTS = 105 / 105 PASS
COMPILE = PASS
TYPESCRIPT = PASS
```

Runtime proof:

```text
GET /api/auth/providers = 200
provider github = PRESENT
signinUrl = https://componentry-lab.vercel.app/api/auth/signin/github
callbackUrl = https://componentry-lab.vercel.app/api/auth/callback/github
GET /director/live = 200
oauthConfigured = true
ownerAccountConfigured = true
ownerAuthorized = false
ERROR/FATAL LOGS = NONE OBSERVED
```

`ownerAuthorized=false` is expected before a real browser owner session signs in. Configuration presence is now proven; identity match is not yet proven.

## Current governed-action UI state

For canonical project `stated`:

```text
Canonicalize = ALREADY_CANONICAL
Start = PROPOSAL_READY
Complete = ACTION_NOT_STARTED
```

The Start operation remains a proposal only until an authenticated owner explicitly approves it.

No Project Brain mutation was submitted during OAuth configuration QA.

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

Resume from `master` after the Production OAuth runtime-configuration checkpoint.

Do not rebuild Slices I-L, reopen the completed collaboration mesh, weaken Production storage fail-closed behavior, remove owner authentication, or replace the three typed operations with arbitrary patch semantics.

The Governed Action / Write Plane is promoted and healthy in Production. GitHub OAuth and the canonical owner-account configuration are now detected by the runtime. The remaining unverified boundary is the real owner browser sign-in and providerAccountId match.

## Exactly one next action

```text
VERIFY REAL OWNER SIGN-IN
-> open https://componentry-lab.vercel.app/director/live
-> click Sign in with GitHub
-> complete GitHub authorization using the canonical owner account
-> confirm the page returns with ownerAuthorized=true / approval control available
-> do NOT execute the governed write until the authenticated-owner boundary is confirmed
-> only after that confirmation perform the first typed governed write smoke: PROJECT_BRAIN_START_NEXT_ACTION (todo -> doing)
```
