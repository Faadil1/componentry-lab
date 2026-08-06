# Episode State Card — API Surface Analysis

**Version:** `1.0.0-stable`  
**Status:** API_STABILIZED

## Final shape

The public API is a six-member discriminated union keyed by `variant`:

- `DefaultEpisodeStateCardProps`
- `BlockedEpisodeStateCardProps`
- `HumanReviewRequiredEpisodeStateCardProps`
- `ApprovedEpisodeStateCardProps`
- `PublishedEpisodeStateCardProps`
- `UnavailableEpisodeStateCardProps`

The previous broad `EpisodeStateCardAvailableProps | EpisodeStateCardUnavailableProps` model was removed because it allowed invalid combinations between available variants.

## Compile-time invariants

- `blocked` requires a non-empty blocker tuple.
- `human-review-required` requires `humanReviewStatus: "required"`.
- `approved` requires `humanReviewStatus: "completed"` and forbids blockers/publication fields.
- `published` requires `humanReviewStatus: "completed"`, `youtubeVideoId`, and `publishedAt`.
- `unavailable` forbids normal canonical, action, review, blocker, provenance, and publication fields.

## HumanReviewStatus

Final values:

```ts
"not-required" | "required" | "completed"
```

`unavailable` is represented solely by the unavailable variant branch.

## Removed public props

- `episodeId` — unused; DOM identity uses `React.useId()`.
- `updatedAt` — unused presentation prop.
- `reduceMotion` — lab-only control removed from the production contract.

Motion now follows `prefers-reduced-motion` through Framer Motion `useReducedMotion()` with no public override.

## Read-only boundary

No public action callbacks are exposed. The card cannot mutate canonical state, transition workflow state, publish, submit, infer missing state, or perform network actions.

## Accessibility contract

Preserved from the accepted accessibility review:

- unique per-instance IDs;
- composed region names via `aria-labelledby`;
- screen-reader blocker severity labels;
- decorative SVG icons hidden;
- system reduced-motion honored.

Validated deployed baseline: `3de31ebfa3d6001fb633d261de495f862757fc3a` — 17/17 accessibility regression tests PASS.

## API tests

Canonical stabilization suite: 20 tests. Final expected result: 20/20 PASS.
