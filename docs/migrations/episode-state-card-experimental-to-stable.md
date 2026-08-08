# Migration Guide: Episode State Card (Experimental â†’ Stable)

**From:** 0.1.0-experimental
**To:** 1.0.0
**Date:** 2026-08-06

---

## Overview

The Episode State Card stabilizes its API through **6 variant-specific discriminated union types** with compile-time invariants. Each variant enforces its own prop requirements via TypeScript's type system.

---

## New API Structure

### The 6 Variant-Specific Types

```tsx
export type EpisodeStateCardProps =
  | DefaultEpisodeStateCardProps
  | BlockedEpisodeStateCardProps
  | HumanReviewRequiredEpisodeStateCardProps
  | ApprovedEpisodeStateCardProps
  | PublishedEpisodeStateCardProps
  | UnavailableEpisodeStateCardProps
```

Each type enforces specific invariants at compile time via TypeScript `never` types.

---

## Breaking Changes

### 1. Removed: `reduceMotion` Prop (REMOVED)

**What was:** Lab demo control to simulate reduced motion preference
**Why removed:** Laboratory motion simulation is not part of a stable public API. The component always respects the system `prefers-reduced-motion` setting.

**Before:**
```tsx
<EpisodeStateCard
  variant="default"
  channelName="..."
  reduceMotion={demoMode}  // âŒ REMOVED
/>
```

**After:**
```tsx
<EpisodeStateCard
  variant="default"
  channelName="..."
  // Component automatically respects system preference
/>
```

**Motion behavior:** The component uses `useReducedMotion()` hook internally. It always respects the OS/browser `prefers-reduced-motion` setting. There is no public override.

### 2. HumanReviewStatus Now 3 Values (removed "unavailable")

**Before (experimental):** `"not-required" | "required" | "completed" | "unavailable"`

**After (stable):** `"not-required" | "required" | "completed"`

The `"unavailable"` state is now exclusively modeled by the `unavailable` variant branch.

### 3. Variant-Specific Props (not generic available/unavailable)

The old broad `EpisodeStateCardAvailableProps` is gone. Each of the 5 available variants now has its own type with specific invariants:

#### Default Variant

```tsx
variant: "default"
// Canonical (required)
channelName: string
title: string
workflowState: string
humanReviewStatus: HumanReviewStatus  // any of the 3 values
// Presentation (optional)
episodeNumber?: number | null
workflowStateLabel?: string
lastDecision?: EpisodeStateDecision | null
blockers?: EpisodeStateBlocker[]
nextExpectedState?: string | null
nextAuthorizedAction?: string | null
canonicalSource?: string
manifestVersion?: string
```

#### Blocked Variant

```tsx
variant: "blocked"
// Canonical (required)
channelName: string
title: string
workflowState: string
humanReviewStatus: HumanReviewStatus
blockers: readonly [EpisodeStateBlocker, ...EpisodeStateBlocker[]]  // NON-EMPTY
// Presentation (optional)
episodeNumber?: number | null
workflowStateLabel?: string
lastDecision?: EpisodeStateDecision | null
nextAuthorizedAction?: string | null
nextExpectedState?: string | null
canonicalSource?: string
manifestVersion?: string
```

**Invariant:** Blocked variant REQUIRES at least one blocker. Empty array is a compile error.

#### HumanReviewRequired Variant

```tsx
variant: "human-review-required"
humanReviewStatus: "required"  // MUST be exactly "required"
// Canonical
channelName: string
title: string
workflowState: string
// Presentation (optional, but not lastDecision or blockers)
episodeNumber?: number | null
workflowStateLabel?: string
nextAuthorizedAction?: string | null
nextExpectedState?: string | null
canonicalSource?: string
manifestVersion?: string
```

**Invariant:** `humanReviewStatus` must be `"required"`. Passing `"completed"` or `"not-required"` is a compile error. `lastDecision` and `blockers` are forbidden.

#### Approved Variant

```tsx
variant: "approved"
humanReviewStatus: "completed"  // MUST be exactly "completed"
// Canonical
channelName: string
title: string
workflowState: string
// Presentation (optional, but not blockers or nextAuthorizedAction)
episodeNumber?: number | null
workflowStateLabel?: string
lastDecision?: EpisodeStateDecision | null
nextExpectedState?: string | null
canonicalSource?: string
manifestVersion?: string
```

**Invariant:** `humanReviewStatus` must be `"completed"`. Blocking conditions and next-action prompts forbidden.

#### Published Variant

```tsx
variant: "published"
humanReviewStatus: "completed"  // MUST be exactly "completed"
youtubeVideoId: string          // REQUIRED
publishedAt: string             // REQUIRED (ISO8601)
// Canonical
channelName: string
title: string
workflowState: string
// Presentation (optional)
episodeNumber?: number | null
workflowStateLabel?: string
nextExpectedState?: string | null
canonicalSource?: string
manifestVersion?: string
```

**Invariants:** `youtubeVideoId` and `publishedAt` are required. `humanReviewStatus` must be `"completed"`. `lastDecision`, `blockers`, and `nextAuthorizedAction` forbidden.

#### Unavailable Variant

```tsx
variant: "unavailable"
unavailableReason?: string
className?: string
// All canonical and presentation props FORBIDDEN
// channelName: never
// title: never
// workflowState: never
// humanReviewStatus: never
// episodeNumber: never
// ... etc
```

**Invariant:** Unavailable is minimal. All workflow-related props forbidden.

---

## Removed Props (Prior Versions)

- **`episodeId`** (0.1.0-experimental) â€” Dead prop, never rendered. Used React.useId() instead.
- **`updatedAt`** (0.1.0-experimental) â€” Dead prop, never displayed.

---

## Migration Pattern: From One Fixture

**Before (experimental):**
```tsx
const fixture: EpisodeStateCardProps = {
  variant: "human-review-required",
  channelName: "Wealth Decoded",
  episodeNumber: 13,
  title: "Master V2",
  workflowState: "HUMAN_REVIEW_REQUIRED",
  humanReviewStatus: "required",
  lastDecision: {  // âŒ Not allowed in human-review-required
    label: "Automated QA: PASS",
    outcome: "pass",
  },
  nextAuthorizedAction: "Review Master V2",
  canonicalSource: "episode-013 manifest",
  manifestVersion: "1.1.0",
  reduceMotion: false,  // âŒ REMOVED
  episodeId: "13",      // âŒ REMOVED (prior)
}
```

**After (stable):**
```tsx
const fixture: EpisodeStateCardProps = {
  variant: "human-review-required",
  channelName: "Wealth Decoded",
  episodeNumber: 13,
  title: "Master V2",
  workflowState: "HUMAN_REVIEW_REQUIRED",
  humanReviewStatus: "required",  // âœ“ Enforced by type
  nextAuthorizedAction: "Review Master V2",
  canonicalSource: "episode-013 manifest",
  manifestVersion: "1.1.0",
  // âœ“ No reduceMotion (removed)
  // âœ“ No episodeId (removed)
  // âœ“ No lastDecision (forbidden for this variant)
}
```

---

## TypeScript Compile-Time Verification

The new API uses TypeScript's discriminated union and `never` type to prevent invalid combinations **at compile time**:

```tsx
// âœ… Valid: blocked variant with blocker
<EpisodeStateCard
  variant="blocked"
  channelName="..."
  blockers={[{ id: "1", label: "...", severity: "critical" }]}
/>

// âŒ Compile Error: blocked without blockers
<EpisodeStateCard
  variant="blocked"
  channelName="..."
  blockers={[]}  // TYPE ERROR: empty array not allowed
/>

// âŒ Compile Error: human-review-required with wrong status
<EpisodeStateCard
  variant="human-review-required"
  humanReviewStatus="completed"  // TYPE ERROR: must be "required"
/>

// âŒ Compile Error: unavailable with workflow props
<EpisodeStateCard
  variant="unavailable"
  channelName="..."  // TYPE ERROR: not allowed with unavailable
/>
```

---

## Final Reference

- **New union members:** 6 (DefaultEpisodeStateCardProps, BlockedEpisodeStateCardProps, HumanReviewRequiredEpisodeStateCardProps, ApprovedEpisodeStateCardProps, PublishedEpisodeStateCardProps, UnavailableEpisodeStateCardProps)
- **HumanReviewStatus:** `"not-required" | "required" | "completed"` (no "unavailable")
- **Motion handling:** No public prop. Always respects `prefers-reduced-motion`.
- **REMOVED props:** `reduceMotion`, `episodeId`, `updatedAt`
- **Version:** 1.0.0

See:
- `docs/components/episode-state-card-api.md` for full reference
- `docs/decisions/ADR-episode-state-card-api-stabilization.md` for rationale
