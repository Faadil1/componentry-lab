# ADR: Episode State Card API Stabilization

**Date:** 2026-08-06  
**Author:** Claude Code  
**Status:** Accepted  
**Affected Component:** `components/workflow/episode-state-card.tsx`

---

## Context

The Episode State Card has passed accessibility review (WCAG 2.2 AA, decision: PASS) and is ready for public API stabilization. The component supports 6 visual variants and must enforce compile-time invariants via TypeScript.

---

## Decision

**Use 6 variant-specific discriminated union types with compile-time invariants enforced via TypeScript `never` types.**

```tsx
export type EpisodeStateCardProps =
  | DefaultEpisodeStateCardProps
  | BlockedEpisodeStateCardProps
  | HumanReviewRequiredEpisodeStateCardProps
  | ApprovedEpisodeStateCardProps
  | PublishedEpisodeStateCardProps
  | UnavailableEpisodeStateCardProps
```

### Variant Invariants

Each variant enforces specific compile-time requirements:

#### 1. Default

```tsx
type DefaultEpisodeStateCardProps = {
  variant: "default"
  channelName: string
  title: string
  workflowState: string
  humanReviewStatus: "not-required" | "required" | "completed"
  episodeNumber?: number | null
  workflowStateLabel?: string
  lastDecision?: EpisodeStateDecision | null
  blockers?: EpisodeStateBlocker[]
  nextExpectedState?: string | null
  nextAuthorizedAction?: string | null
  canonicalSource?: string
  manifestVersion?: string
  className?: string
}
```

#### 2. Blocked

```tsx
type BlockedEpisodeStateCardProps = {
  variant: "blocked"
  channelName: string
  title: string
  workflowState: string
  humanReviewStatus: "not-required" | "required" | "completed"
  blockers: readonly [EpisodeStateBlocker, ...EpisodeStateBlocker[]]  // Non-empty tuple
  episodeNumber?: number | null
  workflowStateLabel?: string
  lastDecision?: EpisodeStateDecision | null
  nextAuthorizedAction?: string | null
  nextExpectedState?: string | null
  canonicalSource?: string
  manifestVersion?: string
  className?: string
  // Forbidden: youtubeVideoId, publishedAt
}
```

**Invariant:** Requires non-empty blockers array (enforced as tuple).

#### 3. HumanReviewRequired

```tsx
type HumanReviewRequiredEpisodeStateCardProps = {
  variant: "human-review-required"
  channelName: string
  title: string
  workflowState: string
  humanReviewStatus: "required"  // Must be exactly "required"
  episodeNumber?: number | null
  workflowStateLabel?: string
  nextAuthorizedAction?: string | null
  nextExpectedState?: string | null
  canonicalSource?: string
  manifestVersion?: string
  className?: string
  // Forbidden: lastDecision, blockers, youtubeVideoId, publishedAt
}
```

**Invariant:** `humanReviewStatus` must be `"required"`. Forbidden: decision history, blockers, publication data.

#### 4. Approved

```tsx
type ApprovedEpisodeStateCardProps = {
  variant: "approved"
  channelName: string
  title: string
  workflowState: string
  humanReviewStatus: "completed"  // Must be exactly "completed"
  episodeNumber?: number | null
  workflowStateLabel?: string
  lastDecision?: EpisodeStateDecision | null
  nextExpectedState?: string | null
  canonicalSource?: string
  manifestVersion?: string
  className?: string
  // Forbidden: blockers, nextAuthorizedAction, youtubeVideoId, publishedAt
}
```

**Invariant:** `humanReviewStatus` must be `"completed"`. Forbidden: blockers (episode is approved), next-action prompts, publication data.

#### 5. Published

```tsx
type PublishedEpisodeStateCardProps = {
  variant: "published"
  channelName: string
  title: string
  workflowState: string
  humanReviewStatus: "completed"  // Must be exactly "completed"
  youtubeVideoId: string          // Required
  publishedAt: string             // Required (ISO8601)
  episodeNumber?: number | null
  workflowStateLabel?: string
  nextExpectedState?: string | null
  canonicalSource?: string
  manifestVersion?: string
  className?: string
  // Forbidden: lastDecision, blockers, nextAuthorizedAction
}
```

**Invariants:** `humanReviewStatus` must be `"completed"`. `youtubeVideoId` and `publishedAt` required. Forbidden: decision history, blockers, next-action prompts.

#### 6. Unavailable

```tsx
type UnavailableEpisodeStateCardProps = {
  variant: "unavailable"
  unavailableReason?: string
  className?: string
  // All canonical and presentation props forbidden with never type
  channelName?: never
  title?: never
  workflowState?: never
  humanReviewStatus?: never
  episodeNumber?: never
  workflowStateLabel?: never
  lastDecision?: never
  blockers?: never
  nextExpectedState?: never
  nextAuthorizedAction?: never
  youtubeVideoId?: never
  publishedAt?: never
  canonicalSource?: never
  manifestVersion?: never
}
```

**Invariant:** Minimal representation. No workflow-related props allowed.

### Motion Handling

- **Public prop:** `reduceMotion` is **NOT** part of the public API (removed).
- **Component behavior:** Always respects `prefers-reduced-motion` system setting via `useReducedMotion()` hook.
- **Lab simulation:** Not a production concern; removed from stable API.

### HumanReviewStatus Reduction

```tsx
// Old (experimental)
type HumanReviewStatus = "not-required" | "required" | "completed" | "unavailable"

// New (stable)
type HumanReviewStatus = "not-required" | "required" | "completed"
```

The `"unavailable"` state is now exclusively modeled by the `unavailable` variant branch.

---

## Rationale

### 1. Compile-Time Invariants

TypeScript discriminated unions with `never` types prevent invalid combinations at compile time, not runtime. Invalid configurations fail to type-check before any code runs.

**Example:**
```tsx
// ✅ Type-checks successfully
<EpisodeStateCard variant="blocked" blockers={[...]} />

// ❌ Type error: blockers cannot be empty
<EpisodeStateCard variant="blocked" blockers={[]} />

// ❌ Type error: humanReviewStatus must be "required" for this variant
<EpisodeStateCard variant="human-review-required" humanReviewStatus="completed" />
```

### 2. Separation of Concerns

Each variant is independent. Blocked doesn't need publication data. Unavailable doesn't need workflow metadata. This clarity improves API usability and maintainability.

### 3. Motion is System Concern, Not Component Concern

Laboratory simulation of reduced motion is a testing/demo concern, not a production component concern. The component always respects the system preference. No public override.

### 4. HumanReviewStatus is Not Unavailability

`"unavailable"` means the manifest is missing—a different domain than review status. Separating them reduces confusion and aligns types with semantics.

---

## Alternatives Considered

### 1. Single Flat Interface

```tsx
// Rejected
type EpisodeStateCardProps = {
  variant: EpisodeStateCardVariant
  channelName?: string
  humanReviewStatus?: HumanReviewStatus
  blockers?: EpisodeStateBlocker[]
  // ... all optional
}
```

**Problem:** TypeScript cannot enforce "required if variant=X" constraints. Invalid configurations possible at runtime.

### 2. Multiple Union with Shared Base

```tsx
// Rejected
type AvailableProps = { channelName: string; ... }
type UnavailableProps = { /* minimal */ }
type EpisodeStateCardProps = AvailableProps | UnavailableProps
```

**Problem:** Doesn't model variant-specific requirements (why does human-review-required have lastDecision?). Loose semantics.

### 3. Structured View Model

```tsx
// Rejected (premature generalization)
type EpisodeStateCardProps = {
  canonical: CanonicalEpisodeState
  presentation?: PresentationProps
  layout?: LayoutProps
}
```

**Problem:** Over-engineered for current needs. Future YouTube integration may require different structure. Better to stabilize flat props now, refactor later if needed.

---

## Implementation

- 6 variant-specific type definitions in `components/workflow/episode-state-card.tsx`
- Component uses TypeScript type narrowing (guard clauses) after variant check
- Fixtures updated to respect variant invariants
- All 20 API tests verify variant contracts
- Migration guide documents the 6-member union

---

## Acceptance Criteria

- [x] All 6 variant-specific types defined and exported
- [x] Compile-time invariants enforced via TypeScript `never` types
- [x] Component implementation type-checks cleanly
- [x] All fixtures respect new variant types
- [x] 20 API tests PASS (variant contracts verified)
- [x] No `reduceMotion` in public API
- [x] `HumanReviewStatus` reduced to 3 values
- [x] Migration guide documents breaking changes
- [x] ADR documents rationale and final structure
- [x] Accessibility contract unchanged (WCAG 2.2 AA PASS)
- [x] Lint: 0 errors, Build: PASS

---

## Consequences

### Positive

- **Type Safety:** Invalid prop combinations impossible; caught at compile time.
- **Self-Documenting:** Type signature expresses requirements clearly.
- **Reduced Surface:** No unused props across all variants.
- **Future-Proof:** Structure ready for integration scenarios.

### Negative

- **Breaking Change:** Code using experimental API must migrate.
- **Complexity:** More types to understand (but each type is simpler).

### Neutral

- **Migration Effort:** Moderate. Clear error messages guide updates.

---

## Timeline

- 2026-08-06 10:00Z — Analysis and decision
- 2026-08-06 11:00Z — Implementation complete
- 2026-08-06 11:30Z — Tests and documentation complete
- 2026-08-06 12:00Z — Registry updated, ready for approval review

---

## See Also

- `docs/components/episode-state-card-api.md` — Full API reference with examples
- `docs/migrations/episode-state-card-experimental-to-stable.md` — Migration guide
- `tests/episode-state-card-api.test.ts` — API contract tests
- `artifacts/episode-state-card/api-stabilization/api-surface.json` — API surface snapshot
