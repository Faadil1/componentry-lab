# CANONICAL HANDOVER — Director Post-Completion Routing V1

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = DIRECTOR POST-COMPLETION ROUTING
PHASE_CODE = CREATIVE_OS_DIRECTOR_POST_COMPLETION_ROUTING_V1
TRACK = READ / ORCHESTRATION CORRECTNESS
STATUS = FEATURE_COMPLETE / BUILD_QA_PASS / PRODUCTION_PROMOTION_NOT_AUTHORIZED
SOURCE_OF_TRUTH = GitHub branch feature/director-post-completion-routing-01
V1_WRITE_PLANE_BASELINE = FROZEN
BASELINE_COMMIT = 60747d41bfa4d0393d27b2bd9503fd6ddef1bea8
FUNCTIONAL_HEAD = 23274b2c2c6f5b8756e31963dd723e3d01850020
PREVIEW_DEPLOYMENT = dpl_47LxCL6kwzZbwTcnHsKkL6YxNVY3
PREVIEW_STATE = READY
TESTS = 108 / 108 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
AUTHORITY_CHANGE = NONE
WRITER_CHANGE = NONE
PROJECT_BRAIN_MUTATION = NONE
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

The fallback can already flow through the frozen V1 `PROJECT_BRAIN_APPEND_NEXT_ACTION` contract if the authenticated owner explicitly approves it later. No new writer or scope was added.

## Proof

Two new prebuild tests were added:

```text
LIVE_DIRECTOR_SKIPS_DONE_ACTION_AND_ROUTES_TO_EXISTING_NON_TERMINAL_ACTION = PASS
LIVE_DIRECTOR_USES_DETERMINISTIC_READ_ONLY_FALLBACK_WHEN_ALL_CANONICAL_ACTIONS_ARE_DONE = PASS
```

Full gate:

```text
108 / 108 tests PASS
Next.js compile PASS
TypeScript PASS
93 / 93 static generation PASS
Preview deployment READY
```

The test proves:
- a `done` action is never reselected;
- an existing non-terminal canonical action is preferred if available;
- if all canonical actions are terminal, a deterministic read-only fallback is produced;
- same canonical input produces the same projection;
- `sideEffectPayload` remains `null`;
- the Project Brain input remains byte-for-byte unchanged.

## Authority/diff audit

Diff from frozen V1 baseline contains exactly two files:

```text
lib/director/adapters.ts
  +3 / -2

tests/creative-os-live-director-projection.test.ts
  +44 / -0
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

## Preview runtime note

Direct Preview runtime GET returned 500 because this new branch does not have the branch-scoped Preview storage configuration:

```text
COMPONENTRY_LAB_STORAGE_MODE must be set to 'postgres' in production.
Falling back to local-file is not allowed.
```

This is the existing intentional storage fail-closed boundary. It is not a routing regression. The build/prebuild proof executes independently and is green.

Do not weaken storage fail-closed behavior merely to make this branch Preview runtime load.

## HANDOVER

Resume from `feature/director-post-completion-routing-01` with the routing defect fixed and fully gated.

The frozen Governed Write Plane V1 remains unchanged and Production-proven.

## Exactly one next action

```text
PRODUCTION PROMOTION DECISION GATE

Candidate = merge feature/director-post-completion-routing-01 into master
Expected Production behavior for stated after merge =
  canonical act1 remains done
  Director no longer selects act1
  Director returns deterministic HACKATHON fallback "Prepare hackathon demo review"
  Governed append plane may expose that fallback as a proposal, but no write occurs without owner approval

After merge, verify read-only Production GET first.
Do not perform the append write during promotion QA.
```
