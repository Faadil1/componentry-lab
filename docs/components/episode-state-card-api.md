# Episode State Card — Public API Reference

**Status:** Stable (1.0.0)  
**React Version:** 18.2+  
**Component Path:** `@/components/workflow/episode-state-card`  

---

## Overview

The `EpisodeStateCard` is a read-only workflow component that displays episode state through variant-specific discriminated union types. Each of the 6 visual variants enforces compile-time prop requirements via TypeScript's type system.

---

## Variant-Specific Props

The component uses **discriminated union types** where the `variant` prop determines which other props are valid. This is enforced at compile time by TypeScript.

### Default Variant

```tsx
type DefaultEpisodeStateCardProps = {
  variant: "default"
  channelName: string
  title: string
  workflowState: string
  humanReviewStatus: HumanReviewStatus
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

**Usage:** In-progress workflow state with optional decision history.

### Blocked Variant

```tsx
type BlockedEpisodeStateCardProps = {
  variant: "blocked"
  channelName: string
  title: string
  workflowState: string
  humanReviewStatus: HumanReviewStatus
  blockers: readonly [EpisodeStateBlocker, ...EpisodeStateBlocker[]]  // REQUIRED, at least 1
  episodeNumber?: number | null
  workflowStateLabel?: string
  lastDecision?: EpisodeStateDecision | null
  nextAuthorizedAction?: string | null
  nextExpectedState?: string | null
  canonicalSource?: string
  manifestVersion?: string
  className?: string
}
```

**Compile-time guarantee:** `blockers` must have at least one element (tuple form enforces this).

### HumanReviewRequired Variant

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
  // Forbidden:
  // lastDecision: never
  // blockers: never
}
```

**Compile-time guarantee:** `humanReviewStatus` must be `"required"`. `lastDecision` and `blockers` forbidden.

### Approved Variant

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
  // Forbidden:
  // blockers: never
  // nextAuthorizedAction: never
}
```

**Compile-time guarantee:** `humanReviewStatus` must be `"completed"`. Blocking conditions forbidden.

### Published Variant

```tsx
type PublishedEpisodeStateCardProps = {
  variant: "published"
  channelName: string
  title: string
  workflowState: string
  humanReviewStatus: "completed"  // Must be exactly "completed"
  youtubeVideoId: string          // REQUIRED
  publishedAt: string             // REQUIRED (ISO8601)
  episodeNumber?: number | null
  workflowStateLabel?: string
  nextExpectedState?: string | null
  canonicalSource?: string
  manifestVersion?: string
  className?: string
  // Forbidden:
  // lastDecision: never
  // blockers: never
  // nextAuthorizedAction: never
}
```

**Compile-time guarantee:** `youtubeVideoId` and `publishedAt` are required strings. `humanReviewStatus` must be `"completed"`.

### Unavailable Variant

```tsx
type UnavailableEpisodeStateCardProps = {
  variant: "unavailable"
  unavailableReason?: string
  className?: string
  // Forbidden (all canonical/presentation props):
  // channelName: never
  // title: never
  // workflowState: never
  // humanReviewStatus: never
  // episodeNumber: never
  // workflowStateLabel: never
  // lastDecision: never
  // blockers: never
  // nextExpectedState: never
  // nextAuthorizedAction: never
  // youtubeVideoId: never
  // publishedAt: never
  // canonicalSource: never
  // manifestVersion: never
}
```

**Compile-time guarantee:** No canonical or presentation props allowed. Minimal representation.

---

## Exported Types

### Discriminant and Status Types

```tsx
export type EpisodeStateCardVariant =
  | "default"
  | "blocked"
  | "human-review-required"
  | "approved"
  | "published"
  | "unavailable"

export type HumanReviewStatus =
  | "not-required"
  | "required"
  | "completed"
```

**Note:** `HumanReviewStatus` does NOT include `"unavailable"`. Only available variants use it.

### Support Types

```tsx
export interface EpisodeStateDecision {
  label: string
  outcome?: "pass" | "pass-with-conditions" | "rework" | "stop"
  decidedAt?: string    // ISO8601 timestamp
  decidedBy?: string    // Decision maker ID
}

export interface EpisodeStateBlocker {
  id: string
  label: string
  severity: "info" | "warning" | "critical"
}
```

### Variant-Specific Props

```tsx
export type DefaultEpisodeStateCardProps = { ... }
export type BlockedEpisodeStateCardProps = { ... }
export type HumanReviewRequiredEpisodeStateCardProps = { ... }
export type ApprovedEpisodeStateCardProps = { ... }
export type PublishedEpisodeStateCardProps = { ... }
export type UnavailableEpisodeStateCardProps = { ... }

export type EpisodeStateCardProps =
  | DefaultEpisodeStateCardProps
  | BlockedEpisodeStateCardProps
  | HumanReviewRequiredEpisodeStateCardProps
  | ApprovedEpisodeStateCardProps
  | PublishedEpisodeStateCardProps
  | UnavailableEpisodeStateCardProps
```

---

## Accessibility (WCAG 2.2 AA)

- **Semantic Structure:** `role="region"` with composed `aria-labelledby`
- **Unique IDs:** Per-instance via `React.useId()` — no duplicate-ID violations
- **Screen Reader Labels:** Severity text via `sr-only` span
- **Motion:** Always respects system `prefers-reduced-motion` setting; never exposes motion override to public API
- **Contrast:** All text ≥7:1 on colored backgrounds (AAA)
- **Icons:** All hidden via `aria-hidden="true"`

---

## Motion Behavior

The component respects the system `prefers-reduced-motion` setting internally. There is **no public prop** to override this.

**Production behavior:**
- Respects OS/browser reduced-motion preference
- Stagger and y-offset disabled in reduced-motion mode
- Durations: 0.3s (normal) → 0.15s (reduced-motion)

---

## Styling

**Framework:** Tailwind CSS  
**Approach:** Utility-first, no CSS-in-JS  
**Override:** Pass `className` prop for Tailwind overrides

Color variants:

| Variant | Border | Background | Accent |
|---------|--------|-----------|--------|
| default | `border-slate-300` | `bg-slate-50` | `bg-slate-200` |
| blocked | `border-amber-300` | `bg-amber-50` | `bg-amber-200` |
| human-review-required | `border-violet-300` | `bg-violet-50` | `bg-violet-200` |
| approved | `border-emerald-300` | `bg-emerald-50` | `bg-emerald-200` |
| published | `border-cyan-300` | `bg-cyan-50` | `bg-cyan-200` |
| unavailable | `border-neutral-300` | `bg-neutral-100` | `bg-neutral-200` |

---

## Usage Examples

### Default Variant

```tsx
<EpisodeStateCard
  variant="default"
  channelName="Wealth Decoded"
  episodeNumber={14}
  title="Editorial Development"
  workflowState="EDITORIAL_DEVELOPMENT"
  humanReviewStatus="not-required"
  blockers={[
    { id: "pkg", label: "Packaging not selected", severity: "warning" }
  ]}
  canonicalSource="episode-014 manifest"
  manifestVersion="draft"
/>
```

### Published Variant

```tsx
<EpisodeStateCard
  variant="published"
  channelName="Wealth Decoded"
  episodeNumber={13}
  title="$1,000 a Month in Dividends"
  workflowState="PUBLISHED"
  humanReviewStatus="completed"
  youtubeVideoId="ASluRm71I8o"
  publishedAt="2026-08-05T02:06:47Z"
  nextExpectedState="ANALYTICS_COLLECTING"
/>
```

### Unavailable Variant

```tsx
<EpisodeStateCard
  variant="unavailable"
  unavailableReason="MANIFEST_FETCH_FAILED: upstream returned 404"
/>
```

---

## Removed Features

### `reduceMotion` — REMOVED

**REMOVED in 1.0.0-stable:** The `reduceMotion` prop was a laboratory demo control. Laboratory simulation is not part of the stable public API. The component always respects the system `prefers-reduced-motion` setting automatically.

**If you need to simulate reduced motion for testing or demos:**
- Use your page wrapper's own motion state management
- Control it separately; do not pass it to the component
- Example: Set `prefers-reduced-motion: reduce` via browser DevTools

### `episodeId` (REMOVED)

Never rendered or used for DOM IDs. Removed in prior stabilization phases.

### `updatedAt` (REMOVED)

Dead prop; never displayed. Removed in prior stabilization phases.

---

## Rendering Behavior

- **Ref forwarding:** Supported (`React.forwardRef<HTMLDivElement>`)
- **Display name:** `"EpisodeStateCard"`
- **No side effects:** No network, no DOM writes beyond render
- **Motion:** Framer Motion with variant stagger (respects reduced-motion)

---

## Migration from Experimental API

### Breaking Changes

1. **removed:** `reduceMotion` prop (lab demo control) — removed in 1.0.0-stable
2. **removed:** `episodeId` prop (dead; never rendered)
3. **removed:** `updatedAt` prop (dead; never displayed)
4. **Changed:** `HumanReviewStatus` no longer includes `"unavailable"`
5. **Enforced:** Variant-specific prop contracts via discriminated union

### Type-Safe Migration

```tsx
// ❌ Before (experimental)
<EpisodeStateCard
  variant="unavailable"
  channelName="..."       // Not allowed anymore
  humanReviewStatus="..."  // Not allowed anymore
  reduceMotion={demo}      // removed - not a public prop
  episodeId="14"           // removed - dead prop
/>

// ✓ After (stable)
<EpisodeStateCard
  variant="unavailable"
  unavailableReason="..."
/>
```

See `docs/migrations/episode-state-card-experimental-to-stable.md` for complete guide.

---

## Reference

- **Architecture Decision Record:** `docs/decisions/ADR-episode-state-card-api-stabilization.md`
- **API Surface Analysis:** `artifacts/episode-state-card/api-stabilization/api-surface.json`
- **Migration Guide:** `docs/migrations/episode-state-card-experimental-to-stable.md`
