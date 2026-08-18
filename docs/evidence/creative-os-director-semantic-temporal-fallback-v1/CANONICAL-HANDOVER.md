# CANONICAL HANDOVER — Director Semantic / Temporal Fallback Qualification V1

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = DIRECTOR SEMANTIC / TEMPORAL FALLBACK QUALIFICATION
PHASE_CODE = CREATIVE_OS_DIRECTOR_SEMANTIC_TEMPORAL_FALLBACK_V1
TRACK = READ / ORCHESTRATION SEMANTIC CORRECTNESS
STATUS = FEATURE_COMPLETE / BUILD_QA_PASS / PREVIEW_RUNTIME_ENV_BLOCKED
SOURCE_OF_TRUTH = GitHub branch feature/director-semantic-temporal-fallback-v1
BASELINE_MASTER = 670421af3b90dd471edd4e36067a5e58154ac243
FUNCTIONAL_HEAD = 3fcbf428e0fba7a319e36f725b14e43df93d4fd8
PREVIEW_DEPLOYMENT = dpl_HrLLYwnxHCj4NuKkaUFXEwXfaAuC
PREVIEW_STATE = READY
TESTS = 113 / 113 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
AUTHORITY_CHANGE = NONE
WRITER_CHANGE = NONE
PROJECT_BRAIN_MUTATION = NONE
PRODUCTION_PROMOTION = NOT_AUTHORIZED
```

## Why this phase exists

The prior Next-Action Canonicalization Decision Gate proved:

```text
FORMAL_PASS != SEMANTIC_PASS
```

After `stated.act1` became `done`, the Director correctly stopped selecting the completed action, but its mode-only HACKATHON fallback remained:

```text
Prepare hackathon demo review
```

The canonical Project Brain simultaneously said:

```text
deadlineLabel = 2026-08-15
evaluation date = 2026-08-18
nextRecommendedPhase = verify
unresolvedProofGaps = [Offline verification mode validation.]
pertinent risk = Session Reset Loss (open, medium/high)
```

Canonicalizing the static HACKATHON fallback would therefore have been formally writable but semantically under-qualified.

## V1 semantic qualification contract

Qualification applies only when no canonical non-terminal next action exists.

Priority remains:

```text
1. Existing canonical non-terminal action
2. Canonical blocker review
3. Invalid deadline metadata review (fail closed)
4. Post-deadline review
5. Unresolved proof-gap review
6. Pertinent risk review
7. nextRecommendedPhase review
8. Mode default fallback
```

A pertinent risk is currently bounded to:
- any `triggered` risk;
- an open `critical` or `high` severity risk;
- an open `medium` severity risk with `high` probability.

No risk is converted into a blocker automatically.

## Temporal context

`buildLiveDirectorProjection()` now accepts an explicit evaluation timestamp. Runtime default is the current timestamp, normalized to UTC day granularity:

```text
YYYY-MM-DDT00:00:00.000Z
```

Properties:
- the same `Project Brain + UTC evaluation day` remains deterministic;
- fingerprints remain stable during the same UTC day;
- a proposal carried across a UTC date boundary can become stale and must be reviewed again;
- an invalid explicit evaluation timestamp fails closed by returning no live projection.

Known V1 limitation:
- project timezone is not modeled yet; temporal comparison is UTC-day based.

## `stated` expected result on 2026-08-18

With `act1 = done`, no other non-terminal canonical action, and deadline `2026-08-15`:

```text
actionId = stated-verify-post-deadline-review
title = Run post-deadline verify review
phase = verify
authority = suggest
sideEffectPayload = null
```

Description preserves the relevant semantic context instead of claiming the proof gap itself has been resolved:
- deadline passed before evaluation;
- unresolved offline-verification proof gap;
- pertinent Session Reset Loss risk;
- next recommended phase = verify.

This intentionally frames the next step as a review, avoiding a false semantic implication that generic existing evidence is sufficient to close the proof gap.

## Files changed

Functional diff from baseline master:

```text
lib/director/semantic-fallback.ts                  NEW
lib/director/adapters.ts                           semantic fallback routing only
lib/director/live-projection.ts                    explicit day-stable evaluation context
tests/creative-os-live-director-projection.test.ts +5 semantic/temporal tests
```

No changes under:
- Project Brain writers;
- Director Server Actions;
- canonical owner auth;
- proposal fingerprint implementation;
- Postgres persistence writers;
- Registry V2;
- Film Kit;
- provider execution;
- external side-effect contracts.

Therefore:

```text
NEW_MUTATION_AUTHORITY = NO
GENERIC_PATCH_AUTHORITY = NO
PROJECT_PHASE_WRITE = NO
PROJECT_STATUS_WRITE = NO
OWNER_GATE_CHANGE = NO
FINGERPRINT_CONTRACT_CHANGE = NO
EXTERNAL_SIDE_EFFECT = NONE
```

## Proof

New tests:

```text
LIVE_DIRECTOR_EVALUATION_TIMESTAMP_IS_EXPLICIT_DAY_STABLE_AND_FAILS_CLOSED = PASS
LIVE_DIRECTOR_POST_DEADLINE_FALLBACK_ROUTES_TO_RECOMMENDED_PHASE_WITH_SEMANTIC_CONTEXT = PASS
LIVE_DIRECTOR_BEFORE_DEADLINE_PRIORITIZES_UNRESOLVED_PROOF_GAP = PASS
LIVE_DIRECTOR_BEFORE_DEADLINE_PRIORITIZES_PERTINENT_RISK_AFTER_PROOF_GAPS_CLEAR = PASS
LIVE_DIRECTOR_INVALID_DEADLINE_FAILS_CLOSED_TO_METADATA_REVIEW = PASS
LIVE_DIRECTOR_NEXT_RECOMMENDED_PHASE_QUALIFIES_FALLBACK_WHEN_NO_STRONGER_SIGNAL_EXISTS = PASS
```

Full prebuild/build gate:

```text
113 / 113 tests PASS
Next.js compile PASS
TypeScript PASS
93 / 93 static generation PASS
Preview deployment READY
```

The existing canonical-project immutability assertions remain green.

## Preview runtime note

Direct Preview GET to `/api/director/live?projectId=stated` returns 500 because this new branch does not have the branch-scoped Preview storage configuration.

Runtime log confirms the existing intentional boundary:

```text
COMPONENTRY_LAB_STORAGE_MODE must be set to 'postgres' in production.
Falling back to local-file is not allowed.
```

This is an environment-scope limitation, not a semantic fallback regression. Do not weaken storage fail-closed behavior.

## HANDOVER

Resume from `feature/director-semantic-temporal-fallback-v1`.

The semantic/temporal fallback is implemented and build-gated. The frozen Governed Write Plane V1 is unchanged.

## Exactly one next action

```text
PRODUCTION PROMOTION DECISION GATE

Before promotion:
- compare branch against current master;
- ensure master has not advanced incompatibly;
- confirm 113/113 prebuild proof and Preview READY;
- confirm no writer/auth/persistence authority files changed.

If promoted, perform READ-ONLY Production QA first:
- stated.act1 remains done;
- Director next action becomes `Run post-deadline verify review`;
- phase = verify;
- description names deadline 2026-08-15, evaluation date 2026-08-18, proof gap, pertinent risk, and nextRecommendedPhase;
- sideEffectPayload remains null;
- no Project Brain write is performed during promotion QA.
```
