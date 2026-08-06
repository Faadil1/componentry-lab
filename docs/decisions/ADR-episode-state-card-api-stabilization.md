# ADR: Episode State Card API Stabilization

**Date:** 2026-08-06  
**Author:** Claude Code  
**Status:** Accepted  
**Affected Component:** `components/workflow/episode-state-card.tsx`

---

## Context

The Episode State Card has passed accessibility review (WCAG 2.2 AA, decision: PASS) and is ready for public API stabilization. The component currently exports a flat `EpisodeStateCardProps` interface with 17 props of mixed classification (canonical data, presentation, layout, unused).

### Current State

- 6 visual variants (`default`, `blocked`, `human-review-required`, `approved`, `published`, `unavailable`)
- 17 props: 5 canonical, 10 presentation, 2 layout
- 2 unused/dead props: `episodeId` (never rendered), `updatedAt` (never displayed)
- 1 invariant issue: unavailable variant requires props that only make sense for available variants

### Problems

1. **Dead Props:** `episodeId` and `updatedAt` increase API surface without value. They're cargo-cult props from the internal API.
2. **Variant Invariants:** The unavailable variant should NOT require `humanReviewStatus` or accept canonical data props that only apply to available states.
3. **Type Safety:** TypeScript cannot prevent invalid combinations like `variant="unavailable"` + `humanReviewStatus="required"`.
4. **Future Integration:** YouTube Operating Agent may need a structured view model (e.g., canonical episode DTO), but flat props allow accidental coupling.

---

## Decision

**Use discriminated union types to separate available and unavailable variants.**

### Structure

```tsx
type EpisodeStateCardProps =
  | EpisodeStateCardAvailableProps
  | EpisodeStateCardUnavailableProps
```

#### EpisodeStateCardAvailableProps
```tsx
interface EpisodeStateCardAvailableProps extends EpisodeStateCardSharedProps {
  variant: Exclude<EpisodeStateCardVariant, "unavailable">
  channelName: string
  episodeNumber?: number | null
  title: string
  workflowState: string
  workflowStateLabel?: string
  lastDecision?: EpisodeStateDecision | null
  blockers?: EpisodeStateBlocker[]
  nextExpectedState?: string | null
  nextAuthorizedAction?: string | null
  humanReviewStatus: Exclude<HumanReviewStatus, "unavailable">
  canonicalSource?: string
  manifestVersion?: string
  youtubeVideoId?: string
  publishedAt?: string
}
```

#### EpisodeStateCardUnavailableProps
```tsx
interface EpisodeStateCardUnavailableProps extends EpisodeStateCardSharedProps {
  variant: "unavailable"
  unavailableReason?: string
}
```

#### EpisodeStateCardSharedProps
```tsx
interface EpisodeStateCardSharedProps {
  reduceMotion?: boolean
  className?: string
}
```

### Prop Classification

| Category | Props | Rationale |
|----------|-------|-----------|
| **Canonical** | `channelName`, `title`, `workflowState`, `humanReviewStatus` | Define episode identity and state; required for available variants |
| **Presentation** | `episodeNumber`, `workflowStateLabel`, `lastDecision`, `blockers`, `nextExpectedState`, `nextAuthorizedAction`, `youtubeVideoId`, `publishedAt`, `canonicalSource`, `manifestVersion`, `unavailableReason` | Render optional context and metadata |
| **Layout** | `reduceMotion`, `className` | Control rendering behavior, not data |
| **Removed** | `episodeId`, `updatedAt` | Dead props; never rendered or used |

### Rationale for Discriminated Union

1. **Type Safety:** TypeScript prevents invalid prop combinations at compile time.
2. **Self-Documenting:** The type union clearly expresses that unavailable and available states have different requirements.
3. **Future Extensibility:** If YouTube Operating Agent needs a structured DTO (e.g., `canonicalEpisode?: CanonicalEpisodeDTO`), it can be added to `EpisodeStateCardAvailableProps` without affecting the unavailable variant.
4. **Minimal Breaking Change:** Existing call sites passing `variant="unavailable"` with extra props will now receive a TypeScript error (good — it was invalid). New code naturally separates concerns.

---

## Alternatives Considered

### 1. Flat Interface with Optional Mandatory Fields
```tsx
interface EpisodeStateCardProps {
  variant: EpisodeStateCardVariant
  channelName?: string  // Required if variant !== "unavailable"
  humanReviewStatus?: HumanReviewStatus
  // ...
}
```
**Rejected:** Type system cannot enforce "required if variant=X" constraints. Runtime errors still possible.

### 2. Structured View Model (Canonical + Presentation Separation)
```tsx
interface EpisodeStateCardProps {
  canonical: CanonicalEpisodeState
  presentation?: PresentationProps
  layout?: LayoutProps
}
```
**Rejected:** Over-engineered for current needs. Future YouTube Operating Agent integration may require a different shape. Discriminated union is simpler and can evolve.

### 3. Keep Flat Interface, Lint to Suppress Dead Props
```tsx
// eslint-disable-next-line
export interface EpisodeStateCardProps { episodeId?: string; ... }
```
**Rejected:** Does not address type safety or variant invariants. Linting comments are maintainability debt.

---

## Implementation Notes

### Breaking Changes
- **Removed:** `episodeId` and `updatedAt` props
- **Unavailable variant:** No longer accepts `channelName`, `title`, `workflowState`, `humanReviewStatus`
- **Impact:** Minimal — `episodeId` and `updatedAt` were unused; unavailable fixture is being updated

### Component Destructuring
The implementation uses a guard clause pattern:

```tsx
export const EpisodeStateCard = React.forwardRef<HTMLDivElement, EpisodeStateCardProps>(
  (props, ref) => {
    const { variant, reduceMotion = false, className } = props

    if (variant === "unavailable") {
      const { unavailableReason } = props  // Type-narrowed
      return <UnavailableCard ... />
    }

    const { channelName, episodeNumber, ... } = props  // Type-narrowed to available
    return <AvailableCard ... />
  }
)
```

TypeScript narrows `props` to the correct union member inside each branch.

### Test Coverage
20 new API stabilization tests cover:
- Type safety: All variants + prop combinations in TypeScript
- Runtime: Props are correctly destructured and rendered
- Invariants: Invalid combinations are rejected by linter
- Fixtures: All demo fixtures validate against new types

---

## Acceptance Criteria

- [x] Discriminated union types defined and exported
- [x] Component implementation updated to use type-narrowed destructuring
- [x] Fixtures updated (remove `episodeId`, respect unavailable variant)
- [x] Registry updated with prop classification
- [x] API documentation created (`docs/components/episode-state-card-api.md`)
- [x] This ADR created (`docs/decisions/ADR-episode-state-card-api-stabilization.md`)
- [x] 20 API stabilization tests added
- [x] All tests pass (lint, build, TS, unit)
- [x] Lint: 0 warnings
- [x] Build: PASS

---

## Consequences

### Positive
- **Type Safety:** Invalid prop combinations impossible.
- **Clarity:** API surface is explicit and documented.
- **Maintainability:** Removal of dead props reduces surface area.
- **Future-Proof:** Structure supports future integration (e.g., canonical DTO).
- **Accessibility:** No regression — WCAG 2.2 AA decision: PASS remains.

### Negative
- **Breaking Change:** Code using `episodeId` or passing unavailable with canonical props must be updated.
- **Fixture Migration:** Demo fixtures require removal of `episodeId`.

### Neutral
- **Complexity:** Discriminated unions add 2 new types but are a standard TypeScript pattern.

---

## Related Decisions

- **ADR: Accessibility Review — Episode State Card** — Established WCAG 2.2 AA compliance baseline
- **Mission: API Stabilization — Episode State Card** — Parent task defining stabilization scope

---

## Timeline

- **2026-08-06 10:00Z** — ADR drafted, component updated, tests added
- **2026-08-06 11:00Z** — Tests pass, registry updated
- **2026-08-06 12:00Z** — Documentation complete, decision: PASS, commit to master

