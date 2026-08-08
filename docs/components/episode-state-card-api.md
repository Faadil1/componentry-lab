# Episode State Card â€” Public API Reference

**Status:** Stable
**Version:** `1.0.0`
**Component:** `@/components/workflow/episode-state-card`

## Contract

`EpisodeStateCard` is a read-only projection of canonical episode state. It exposes no mutation, transition, publishing, or inference callbacks.

The public props are a six-member discriminated union:

```ts
type EpisodeStateCardProps =
  | DefaultEpisodeStateCardProps
  | BlockedEpisodeStateCardProps
  | HumanReviewRequiredEpisodeStateCardProps
  | ApprovedEpisodeStateCardProps
  | PublishedEpisodeStateCardProps
  | UnavailableEpisodeStateCardProps
```

## Shared public props

- `variant` â€” discriminant
- `className?` â€” root styling escape hatch

`reduceMotion` has been removed from the public API. Motion always respects the user/system `prefers-reduced-motion` preference through Framer Motion `useReducedMotion()`.

## HumanReviewStatus

```ts
type HumanReviewStatus = "not-required" | "required" | "completed"
```

`unavailable` is modeled by the `variant: "unavailable"` branch, not by `HumanReviewStatus`.

## Variant invariants

### default
Requires `channelName`, `title`, `workflowState`, and `humanReviewStatus`. Supports optional decision, blocker, next-state, provenance, and next-action presentation fields.

### blocked
Requires the available core fields and a non-empty blocker tuple:

```ts
blockers: readonly [EpisodeStateBlocker, ...EpisodeStateBlocker[]]
```

### human-review-required
Requires:

```ts
variant: "human-review-required"
humanReviewStatus: "required"
```

`lastDecision`, `blockers`, `youtubeVideoId`, and `publishedAt` are forbidden.

### approved
Requires:

```ts
variant: "approved"
humanReviewStatus: "completed"
```

`blockers`, `youtubeVideoId`, and `publishedAt` are forbidden.

### published
Requires:

```ts
variant: "published"
humanReviewStatus: "completed"
youtubeVideoId: string
publishedAt: string
```

`blockers` and `nextAuthorizedAction` are forbidden.

### unavailable
Only `variant`, optional `unavailableReason`, and optional `className` are valid. Canonical workflow, review, action, blocker, provenance, and publication props are forbidden with `never`.

## Public exports

- `EpisodeStateCard`
- `EpisodeStateCardProps`
- `EpisodeStateCardVariant`
- `HumanReviewStatus`
- `EpisodeStateDecision`
- `EpisodeStateBlocker`
- `DefaultEpisodeStateCardProps`
- `BlockedEpisodeStateCardProps`
- `HumanReviewRequiredEpisodeStateCardProps`
- `ApprovedEpisodeStateCardProps`
- `PublishedEpisodeStateCardProps`
- `UnavailableEpisodeStateCardProps`

## Accessibility

The stable contract preserves the reviewed accessibility behavior:

- per-instance IDs via `React.useId()`
- composed accessible names with `aria-labelledby`
- screen-reader-only blocker severity text
- decorative icons hidden from assistive technology
- system reduced-motion preference always respected

Previously validated deployed accessibility baseline: `3de31ebfa3d6001fb633d261de495f862757fc3a` â€” 17/17 regression tests PASS.

## Migration from Experimental

Remove the following props from call sites:

- `episodeId` (REMOVED)
- `updatedAt` (REMOVED)
- `reduceMotion` (REMOVED)

Replace the old broad available/unavailable union with the appropriate variant-specific branch. In particular:

- blocked states must include at least one blocker;
- human-review-required must use `humanReviewStatus: "required"`;
- approved/published must use `humanReviewStatus: "completed"`;
- published must include `youtubeVideoId` and `publishedAt`;
- unavailable must not carry normal workflow props.

## Example

```tsx
<EpisodeStateCard
  variant="published"
  channelName="Wealth Decoded"
  episodeNumber={13}
  title="$1,000 a Month in Dividends: How Much Do You Need?"
  workflowState="PUBLISHED"
  humanReviewStatus="completed"
  youtubeVideoId="ASluRm71I8o"
  publishedAt="2026-08-05T02:06:47Z"
/>
```
