# CANONICAL HANDOVER — Componentry Lab / Creative OS

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = GOVERNED ACTION / WRITE PLANE
PHASE_CODE = CREATIVE_OS_GOVERNED_ACTION_WRITE_PLANE_V1
TRACK = CONTROLLED CROSS-SYSTEM WRITES
STATUS = PRODUCTION_PROMOTED / OAUTH_OWNER_SESSION_VERIFIED / FIRST_WRITE_NOT_YET_EXECUTED
SOURCE_OF_TRUTH = GitHub master
FEATURE_PROMOTION_PR = #3
FEATURE_PROMOTION_MERGE = 3d9f3b70d35360cf9953027e22c37f4315fbc58e
SSR_HOTFIX_PR = #4
SSR_HOTFIX_MERGE = 2a3ca36a0143547acc22cde0a3804e5293023bb7
PRODUCTION_OAUTH_CONFIGURED = YES
PRODUCTION_OWNER_ACCOUNT_CONFIGURED = YES
OWNER_AUTHENTICATED_SESSION = VERIFIED IN REAL BROWSER
OWNER_APPROVAL_CONTROL_AVAILABLE = YES
REAL_GOVERNED_WRITE_SMOKE = NOT YET PERFORMED
LIVE_ALIAS = componentry-lab.vercel.app
TESTS = 105 / 105 PASS
ROOT_GET = 200
PROJECTS_GET = 200
DIRECTOR_LIVE_GET = 200
DIRECTOR_LIVE_API_GET = 200
AUTH_PROVIDERS_GET = 200
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

Validated baseline:

```text
TESTS = 105 / 105 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
GET / = 200
GET /projects = 200
GET /director/live = 200
GET /api/director/live = 200
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

The first OAuth attempt failed because the Production Vercel `GITHUB_ID` pointed to a different GitHub OAuth application than `Componentry Lab Owner Access`. GitHub rejected the otherwise-correct callback URI as not associated with that client ID.

The user then corrected the Production OAuth credential pair so that `GITHUB_ID` and `GITHUB_SECRET` belong to the same GitHub OAuth application whose callback is:

```text
https://componentry-lab.vercel.app/api/auth/callback/github
```

Runtime had already proven:

```text
GET /api/auth/providers = 200
provider github = PRESENT
signinUrl = https://componentry-lab.vercel.app/api/auth/signin/github
callbackUrl = https://componentry-lab.vercel.app/api/auth/callback/github
oauthConfigured = true
ownerAccountConfigured = true
```

## Real owner-browser verification — PASS

The user supplied a real Production browser recording after correcting the OAuth pair.

Observed on:

```text
https://componentry-lab.vercel.app/director/live?project=stated
```

Before authenticated owner verification the UI showed `Sign in with GitHub`. In the supplied post-login recording the Start panel instead renders the authenticated owner control:

```text
Approve start action
```

The same recording shows the canonical `stated` action remains:

```text
Canonicalize = ALREADY CANONICAL
Start = PROPOSAL READY
Complete = ACTION NOT STARTED
Current canonical action status = todo
```

Therefore:

```text
REAL_GITHUB_OAUTH_REDIRECT = PASS
OWNER_BROWSER_SESSION = PASS
OWNER_GATE_IDENTITY_MATCH = PASS AS EVIDENCED BY OWNER-ONLY APPROVAL CONTROL
MUTATION_PERFORMED = NO
```

This proves the authentication/authorization boundary while preserving the intended distinction:

```text
OWNER_AUTHENTICATED != WRITE_ALREADY_EXECUTED
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

Resume from `master` with the Governed Action / Write Plane promoted, Production read paths healthy, GitHub OAuth configured, and a real canonical-owner browser session verified.

Do not rebuild Slices I-L, reopen the collaboration mesh, weaken Production storage fail-closed behavior, remove owner authentication, or replace typed operations with arbitrary patch semantics.

The only remaining unproven boundary in this phase is the first real bounded Project Brain mutation plus its persisted after-state and audit receipt.

## Exactly one next action

```text
PERFORM FIRST REAL GOVERNED WRITE SMOKE
PROJECT = stated
OPERATION = PROJECT_BRAIN_START_NEXT_ACTION
EXPECTED TRANSITION = todo -> doing
USER ACTION = click `Approve start action` exactly once
THEN VERIFY =
  persisted Project Brain action status = doing
  Director reload reflects doing
  Start no longer proposes todo -> doing
  Complete becomes eligible only if canonical available evidence requirements are satisfied
  execution receipt exists
  no unrelated Project Brain field changed
  no external/provider side effect occurred
```
