# CANONICAL HANDOVER — Director Post-Completion Routing V1

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = DIRECTOR POST-COMPLETION ROUTING
PHASE_CODE = CREATIVE_OS_DIRECTOR_POST_COMPLETION_ROUTING_V1
TRACK = READ / ORCHESTRATION CORRECTNESS
STATUS = PRODUCTION_PROMOTED / READ_ONLY_RUNTIME_QA_PASS
SOURCE_OF_TRUTH = GitHub master
V1_WRITE_PLANE_BASELINE = FROZEN
BASELINE_COMMIT = 60747d41bfa4d0393d27b2bd9503fd6ddef1bea8
FEATURE_FUNCTIONAL_HEAD = 23274b2c2c6f5b8756e31963dd723e3d01850020
FEATURE_GATE_HEAD = b95732e49e3115d97f3cd4d2f0e5e0809d877b19
PROMOTION_PR = #6
PROMOTION_MERGE = 4d088a83b958b6558889424620c2585f350ffda6
PRODUCTION_DEPLOYMENT = dpl_69AJKBxMNDEoYg84UWbShKLiPQc5
PRODUCTION_DEPLOYMENT_STATE = READY
LIVE_ALIAS = componentry-lab.vercel.app
TESTS = 108 / 108 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
PRODUCTION_API_DIRECTOR_LIVE = 200
PRODUCTION_DIRECTOR_LIVE = 200
PRODUCTION_ERROR_FATAL_LOGS = NONE OBSERVED
AUTHORITY_CHANGE = NONE
WRITER_CHANGE = NONE
PROJECT_BRAIN_MUTATION_DURING_PROMOTION_QA = NONE
```

## Problem proven after V1 completion smoke

After canonical `stated.act1` transitioned to `done`, the Director still selected that terminal action as its `one canonical next action`.

Root cause was isolated to `lib/director/adapters.ts`:

```text
mapActionCandidate()
  -> searched project.nextActions without excluding status = done
  -> terminal action could therefore remain the selected Director action
```

This was a read/orchestration defect, not a missing write capability.

## Fix

`mapActionCandidate()` now derives selection from non-terminal canonical actions only:

```text
nonTerminalActions = project.nextActions.filter(action => action.status !== "done")
matchingAction = phase-compatible non-terminal action
baseAction = matchingAction ?? first non-terminal action
```

If no non-terminal canonical action exists, the existing deterministic mode fallback is returned as a Director proposal.

For HACKATHON this remains:

```text
actionId = stated-hackathon-safe-action
title = Prepare hackathon demo review
sideEffectPayload = null
```

The fallback can flow through the frozen V1 `PROJECT_BRAIN_APPEND_NEXT_ACTION` contract only if the authenticated owner explicitly approves it. No new writer or scope was added.

## Proof

Two prebuild tests permanently gate this behavior:

```text
LIVE_DIRECTOR_SKIPS_DONE_ACTION_AND_ROUTES_TO_EXISTING_NON_TERMINAL_ACTION = PASS
LIVE_DIRECTOR_USES_DETERMINISTIC_READ_ONLY_FALLBACK_WHEN_ALL_CANONICAL_ACTIONS_ARE_DONE = PASS
```

Full Production build gate:

```text
108 / 108 tests PASS
Next.js compile PASS
TypeScript PASS
93 / 93 static generation PASS
Production deployment READY
```

The proof establishes:
- a `done` action is never reselected;
- an existing non-terminal canonical action is preferred if available;
- if all canonical actions are terminal, a deterministic read-only fallback is produced;
- same canonical input produces the same projection;
- `sideEffectPayload` remains `null`;
- the Project Brain input remains unchanged by the routing projection.

## Authority/diff audit

Functional diff from frozen V1 baseline contains only the Director selector change and tests, plus documentation:

```text
lib/director/adapters.ts
  +3 / -2

tests/creative-os-live-director-projection.test.ts
  +44 / -0

docs/evidence/creative-os-director-post-completion-routing-v1/CANONICAL-HANDOVER.md
  documentation only
```

No files under Project Brain writers, Server Actions, auth, Registry, Film Kit, persistence authority contracts, or collaboration envelopes changed.

Therefore:

```text
NEW_MUTATION_AUTHORITY = NO
GENERIC_PATCH_AUTHORITY = NO
PROJECT_PHASE_WRITE = NO
PROJECT_STATUS_WRITE = NO
OWNER_GATE_CHANGE = NO
FINGERPRINT_CHANGE = NO
EVIDENCE_GATE_CHANGE = NO
EXTERNAL_SIDE_EFFECT = NONE
```

## Production Promotion — PASS

The user explicitly authorized `PROMOTE` after the Production Promotion Decision Gate passed.

Promotion path:

```text
PR = #6
HEAD = feature/director-post-completion-routing-01
BASE = master
EXPECTED_HEAD = b95732e49e3115d97f3cd4d2f0e5e0809d877b19
MERGE = 4d088a83b958b6558889424620c2585f350ffda6
DEPLOYMENT = dpl_69AJKBxMNDEoYg84UWbShKLiPQc5
TARGET = production
STATE = READY
ALIAS_ERROR = null
LIVE_ALIAS = componentry-lab.vercel.app
```

Production read-only smoke after merge:

```text
GET /api/director/live?project=stated = 200
GET /director/live?project=stated = 200
stated.nextActions[act1].status = done
Director nextAction.actionId = stated-hackathon-safe-action
Director nextAction.title = Prepare hackathon demo review
Director nextAction.authorityRequirement = suggest
Director result.sideEffectPayload = null
Governed append status = PROPOSAL_READY
Start status = ACTION_NOT_CANONICAL
Complete status = ACTION_NOT_CANONICAL
POST / mutation during promotion QA = NONE
runtime error/fatal = NONE OBSERVED
```

This confirms the promoted routing fix operates on the real canonical Postgres-backed Project Brain state without reopening the completed `act1` lifecycle.

The fallback is visible as a governed append proposal only. Rendering it does not mutate Project Brain. The next action remains non-canonical until an authenticated owner explicitly approves the existing V1 append operation.

## Preview runtime note

The feature branch Preview runtime had returned 500 because the branch lacked branch-scoped Preview storage configuration:

```text
COMPONENTRY_LAB_STORAGE_MODE must be set to 'postgres' in production.
Falling back to local-file is not allowed.
```

That was the existing intentional storage fail-closed boundary and was not a routing regression. Production uses the correctly configured Postgres storage path and passed runtime QA.

## HANDOVER

Resume from `master` with Director Post-Completion Routing V1 promoted and verified in Production.

Current canonical `stated` lifecycle state:

```text
act1 = Integrate Audit Panel = done
```

Current Director result:

```text
One canonical next action = Prepare hackathon demo review
actionId = stated-hackathon-safe-action
authority = suggest
side effects = none
```

The frozen Governed Write Plane V1 remains unchanged and Production-proven:

```text
APPEND absent -> todo
START todo -> doing
COMPLETE doing -> done + canonical evidence
```

Do not weaken Production storage fail-closed behavior, owner authentication, fingerprint binding, evidence requirements, or typed write semantics.

Do not treat the deterministic Director fallback as already canonical merely because it is visible.

## Exactly one next action

```text
OPEN NEXT-ACTION CANONICALIZATION DECISION GATE

Candidate Director proposal =
  actionId: stated-hackathon-safe-action
  title: Prepare hackathon demo review
  operation if approved: PROJECT_BRAIN_APPEND_NEXT_ACTION
  transition: absent -> todo
  scope: project:next-action:append

Decision required before mutation:
- either keep the fallback advisory/read-only,
- or explicitly approve its canonicalization through the existing frozen V1 append gate.

No append write has been performed by this promotion QA.
```