# CANONICAL HANDOVER — Director Semantic / Temporal Fallback Qualification V1

Date: 2026-08-18

## ÉTAT CANONIQUE COURANT

```text
PROJECT = Componentry Lab / Creative OS
PHASE = DIRECTOR SEMANTIC / TEMPORAL FALLBACK QUALIFICATION
PHASE_CODE = CREATIVE_OS_DIRECTOR_SEMANTIC_TEMPORAL_FALLBACK_V1
TRACK = READ / ORCHESTRATION SEMANTIC CORRECTNESS
STATUS = FEATURE_COMPLETE / TARGETED_REWORK_PASS / PROMOTION_RECOMMENDED
SOURCE_OF_TRUTH = GitHub branch feature/director-semantic-temporal-fallback-v1
BASELINE_MASTER = 670421af3b90dd471edd4e36067a5e58154ac243
FUNCTIONAL_HEAD = 62da42b54ebf6390bf5d73cbac916b47a56ddcbd
FUNCTIONAL_PREVIEW = dpl_2BNSXXxTNr3aPisk3JPr1fC8fvoi
PREVIEW_STATE = READY
TESTS = 114 / 114 PASS
COMPILE = PASS
TYPESCRIPT = PASS
STATIC_GENERATION = 93 / 93 PASS
AUTHORITY_CHANGE = NONE
WRITER_CHANGE = NONE
PROJECT_BRAIN_MUTATION = NONE
PRODUCTION_PROMOTION = RECOMMENDED / NOT YET AUTHORIZED
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

`buildLiveDirectorProjection()` accepts an explicit evaluation timestamp. Runtime default is the current timestamp, normalized to UTC day granularity:

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

Description preserves the relevant semantic context:
- deadline passed before evaluation;
- unresolved offline-verification proof gap;
- pertinent Session Reset Loss risk;
- next recommended phase = verify.

## Targeted rework found during Production Promotion Decision Gate

The first promotion audit found a material evidence-binding gap:

```text
semantic fallback was context-qualified
BUT
evidenceNeededAfterCompletion = every Project Brain evidence id
```

For `stated`, `ev1` is the Commitment hash audit receipt while the unresolved proof gap is Offline verification mode validation. `ev1` must not be treated as sufficient evidence to close that generated review action.

Targeted rework now guarantees:

```text
GENERATED DIRECTOR FALLBACK
→ evidenceNeededAfterCompletion = []
→ may be proposed
→ may be canonicalized through existing V1 owner gate
→ may be started through existing V1 owner gate
→ completion = EVIDENCE_REQUIRED until specific canonical proof is explicitly linked
```

This property persists even after the generated fallback has become a canonical `doing` Project Brain action. Existing non-generated canonical actions preserve their V1 behavior.

Generated fallback identity remains deterministic and namespaced under the project id. No writer schema or persistence contract was expanded.

## Files changed

Final diff from baseline master:

```text
docs/evidence/creative-os-director-semantic-temporal-fallback-v1/CANONICAL-HANDOVER.md
lib/director/semantic-fallback.ts
lib/director/adapters.ts
lib/director/live-projection.ts
tests/creative-os-live-director-projection.test.ts
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

Semantic/temporal tests include:

```text
LIVE_DIRECTOR_EVALUATION_TIMESTAMP_IS_EXPLICIT_DAY_STABLE_AND_FAILS_CLOSED = PASS
LIVE_DIRECTOR_POST_DEADLINE_FALLBACK_ROUTES_TO_RECOMMENDED_PHASE_WITH_SEMANTIC_CONTEXT = PASS
LIVE_DIRECTOR_BEFORE_DEADLINE_PRIORITIZES_UNRESOLVED_PROOF_GAP = PASS
LIVE_DIRECTOR_BEFORE_DEADLINE_PRIORITIZES_PERTINENT_RISK_AFTER_PROOF_GAPS_CLEAR = PASS
LIVE_DIRECTOR_INVALID_DEADLINE_FAILS_CLOSED_TO_METADATA_REVIEW = PASS
LIVE_DIRECTOR_NEXT_RECOMMENDED_PHASE_QUALIFIES_FALLBACK_WHEN_NO_STRONGER_SIGNAL_EXISTS = PASS
LIVE_DIRECTOR_CANONICALIZED_SEMANTIC_FALLBACK_STAYS_EVIDENCE_BLOCKED_UNTIL_SPECIFIC_PROOF_EXISTS = PASS
```

Full final build gate on functional head `62da42b54ebf6390bf5d73cbac916b47a56ddcbd`:

```text
114 / 114 tests PASS
Next.js compile PASS
TypeScript PASS
93 / 93 static generation PASS
Preview deployment READY
Alias error = null
```

The existing canonical-project immutability and all frozen Governed Write Plane V1 tests remain green.

## Preview runtime note

Direct Preview runtime remains blocked on this custom branch because it does not have branch-scoped Preview storage configuration.

The known fail-closed error is:

```text
COMPONENTRY_LAB_STORAGE_MODE must be set to 'postgres' in production.
Falling back to local-file is not allowed.
```

This is an environment-scope limitation, not a semantic fallback regression. Do not weaken storage fail-closed behavior.

## Production Promotion Decision Gate

Final branch comparison against current `master`:

```text
MASTER = 670421af3b90dd471edd4e36067a5e58154ac243
BRANCH = feature/director-semantic-temporal-fallback-v1
STATUS = ahead
BEHIND = 0
FUNCTIONAL_HEAD = 62da42b54ebf6390bf5d73cbac916b47a56ddcbd
```

Gate verdict:

```text
PROMOTION_RECOMMENDED
```

Reason:
- semantic/temporal correctness gap fixed;
- completion evidence-binding gap found during gate and fixed fail-closed;
- 114/114 tests green;
- build/TypeScript/static generation green;
- no write authority, auth, persistence, Registry, Film Kit, or external-effect contract changed.

## HANDOVER

Resume from `feature/director-semantic-temporal-fallback-v1`.

The frozen Governed Write Plane V1 remains unchanged. This phase only changes Director read/orchestration semantics and tightens evidence requirements for generated fallbacks.

## Exactly one next action

```text
PRODUCTION PROMOTION EXECUTION

Only after explicit user authorization:
1. merge feature/director-semantic-temporal-fallback-v1 into master;
2. wait for Production deployment READY;
3. perform READ-ONLY Production QA first;
4. verify stated.act1 remains done;
5. verify Director next action = Run post-deadline verify review;
6. verify phase = verify;
7. verify description carries deadline/proof-gap/risk/nextRecommendedPhase context;
8. verify evidenceNeededAfterCompletion = [] for the generated fallback;
9. verify sideEffectPayload = null;
10. perform no Project Brain write during promotion QA.
```
