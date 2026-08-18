# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = PRODUCTION_PROMOTED / READ_RUNTIME_QA_PASS / GOVERNED_WRITES_AUTH_LOCKED
SOURCE_OF_TRUTH = GitHub master
PRE_FEATURE_PRODUCTION_HEAD = e1be1978fb6109e2d7c302efcffc373c2ae91730
FEATURE_PROMOTION_PR = #3
FEATURE_PROMOTION_MERGE = 3d9f3b70d35360cf9953027e22c37f4315fbc58e
SSR_HOTFIX_PR = #4
CURRENT_PRODUCTION_CODE_HEAD = 2a3ca36a0143547acc22cde0a3804e5293023bb7
CURRENT_PRODUCTION_DEPLOYMENT = dpl_Dythe6LpxnUNAGD4ey5kHBmQG8HQ
CURRENT_PRODUCTION_STATE = READY
LIVE_ALIAS = componentry-lab.vercel.app
TESTS = 105 / 105 PASS
NEXT_COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
ROOT_GET = 200
PROJECTS_GET = 200
DIRECTOR_LIVE_GET = 200
DIRECTOR_LIVE_API_GET = 200
PRODUCTION_ERROR_FATAL_LOGS = NONE OBSERVED
REAL_GOVERNED_WRITE_SMOKE = NOT PERFORMED
PRODUCTION_OAUTH_CONFIGURED = NO
PRODUCTION_OWNER_ACCOUNT_CONFIGURED = NO
GOVERNED_WRITE_CONTROLS = LOCKED FAIL-CLOSED
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

Preview runtime remained intentionally unusable for Project Brain SSR because that branch lacked Preview `COMPONENTRY_LAB_STORAGE_MODE=postgres`; production storage fail-closed behavior was not changed.

## Final Production QA

Production deployment after PR #4:

```text
DEPLOYMENT = dpl_Dythe6LpxnUNAGD4ey5kHBmQG8HQ
COMMIT = 2a3ca36a0143547acc22cde0a3804e5293023bb7
TARGET = production
STATE = READY
ALIAS_ERROR = null
ALIASES =
  componentry-lab.vercel.app
  componentry-lab-faadil1s-projects.vercel.app
  componentry-lab-git-master-faadil1s-projects.vercel.app
TESTS = 105 / 105 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
```

Read-only Production smoke after the hotfix:

```text
GET / = 200
GET /projects = 200
GET /director/live = 200
GET /api/director/live = 200
ERROR/FATAL RUNTIME LOGS = NONE OBSERVED
```

`/director/live` now renders the expected governed lifecycle states for the canonical `stated` action:

```text
Canonicalize = ALREADY_CANONICAL
Start = PROPOSAL_READY
Complete = ACTION_NOT_STARTED
```

No action was submitted during Production QA.

## Production authentication / write state

The code is live, but Production mutation remains intentionally locked because GitHub OAuth and the canonical owner account are not configured.

Observed live state:

```text
OAuth configured = no
canonical owner account configured = no
owner authorized = false
write UI = locked
anonymous/development bypass = none
```

The app recognizes these configuration keys:

```text
GITHUB_ID or AUTH_GITHUB_ID
GITHUB_SECRET or AUTH_GITHUB_SECRET
AUTH_OWNER_GITHUB_ACCOUNT_ID
```

Never guess, fabricate, or expose these secret values. Until valid Production auth is configured, no real governed-write smoke should be attempted.

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

## HANDOVER

Resume from `master` after this production-close checkpoint.

Do not rebuild Slices I-L, reopen the completed collaboration mesh, weaken Production storage fail-closed behavior, remove owner authentication, or replace the three typed operations with arbitrary patch semantics.

The Governed Action / Write Plane is now promoted and healthy for read/render paths in Production. The mutation path is present but correctly inaccessible until canonical GitHub owner authentication is configured.

## Exactly one next action

```text
CONFIGURE PRODUCTION GITHUB OAUTH + CANONICAL OWNER ACCOUNT
-> use the project's real GitHub OAuth credentials and canonical owner account id
-> do not expose secrets in chat
-> redeploy Production after environment changes
-> verify owner authentication
-> then perform the first governed write smoke using a typed action only
```
