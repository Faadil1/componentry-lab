# Episode State Card — API Surface Analysis

**Component:** `EpisodeStateCard`  
**Version:** 1.0.0-stable  
**Analyzed:** 2026-08-06T10:00:00Z  
**Status:** API_STABILIZED  

---

## Summary

The Episode State Card stabilizes its public API through a **discriminated union type** that enforces variant invariants at compile time. The component removes dead props (`episodeId`, `updatedAt`) and clarifies prop classification:

- **4 shared props** (variant, reduceMotion, className)
- **13 available-only props** (canonical data + presentation)
- **1 unavailable-only prop** (unavailableReason)
- **6 visual variants** (default, blocked, human-review-required, approved, published, unavailable)

---

## Prop Inventory

### Shared Props (All Variants)

```tsx
variant: "default" | "blocked" | "human-review-required" | "approved" | "published" | "unavailable"
reduceMotion?: boolean
className?: string
```

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| `variant` | string | ✓ | — | Discriminant; determines component render path |
| `reduceMotion` | boolean | — | false | Override `prefers-reduced-motion` (lab demo) |
| `className` | string | — | undefined | Tailwind class override on root |

---

### Available Variant Props

**Applicable to:** `default`, `blocked`, `human-review-required`, `approved`, `published`

#### Canonical (Required for all available variants)

| Prop | Type | Description |
|------|------|-------------|
| `channelName` | string | Channel name (e.g., "Wealth Decoded") |
| `title` | string | Episode title |
| `workflowState` | string | Technical state ID (e.g., "EDITORIAL_DEVELOPMENT") |
| `humanReviewStatus` | HumanReviewStatus | One of: `not-required`, `required`, `completed` |

#### Presentation (Optional for available variants)

| Prop | Type | Description |
|------|------|-------------|
| `episodeNumber` | number \| null | Episode sequence number |
| `workflowStateLabel` | string | Custom state label (overrides variant default) |
| `lastDecision` | EpisodeStateDecision \| null | Recent decision + outcome |
| `blockers` | EpisodeStateBlocker[] | Blocking conditions |
| `nextExpectedState` | string \| null | Next anticipated state |
| `nextAuthorizedAction` | string \| null | Next human action |
| `youtubeVideoId` | string | YouTube video ID (published variant) |
| `publishedAt` | string | ISO8601 publish timestamp |
| `canonicalSource` | string | Source system ID |
| `manifestVersion` | string | Manifest schema version |

---

### Unavailable Variant Props

**Applicable to:** `unavailable` only

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `unavailableReason` | string | — | Technical error reason |

**Forbidden props** for unavailable variant:
- `channelName`, `title`, `workflowState`, `humanReviewStatus` (canonical)
- `episodeNumber`, `workflowStateLabel`, `lastDecision`, `blockers`, `nextExpectedState`, `nextAuthorizedAction`, `youtubeVideoId`, `publishedAt`, `canonicalSource`, `manifestVersion` (presentation)

---

## Prop Classification

### Canonical Props (Identity & State)

Canonical props define the episode's core identity and current workflow state. **Required** for all available variants.

```
channelName, title, workflowState, humanReviewStatus
```

**Rationale:** These four props answer: "What episode is this? What channel? What state is it in? Has a human reviewed it?"

**Governance:** Changes to these props should be rare. They map to canonical episode data from a source-of-truth system.

### Presentation Props (Context & Metadata)

Presentation props render optional contextual information: decisions, blockers, next actions, publication data.

```
episodeNumber, workflowStateLabel, lastDecision, blockers, nextExpectedState, 
nextAuthorizedAction, youtubeVideoId, publishedAt, canonicalSource, manifestVersion
```

**Rationale:** These props enrich the UI without changing the component's core purpose. All are optional.

**Governance:** New presentation props should be added as optional fields. Consider whether they belong in a separate structured payload (e.g., `metadata?: {...}`) if the count grows beyond ~12.

### Layout Props (Rendering Control)

Layout props do not carry data; they control how the component renders.

```
reduceMotion, className
```

**Rationale:** Motion behavior and CSS customization are orthogonal to data presentation.

**Governance:** Stable. `reduceMotion` is a temporary lab demo feature; `className` is the standard Tailwind escape hatch.

### Removed Props (Dead)

| Prop | Reason | Migration |
|------|--------|-----------|
| `episodeId` | Never rendered; DOM IDs now use `React.useId()` | Delete from all call sites |
| `updatedAt` | Never displayed; never read | Delete from all call sites |

---

## Variant Invariants

Each variant has a distinct semantic meaning and typical prop set:

### default
- **Meaning:** Normal workflow state with decision history
- **Required:** channelName, title, workflowState, humanReviewStatus
- **Typical:** episodeNumber, lastDecision, blockers, nextAuthorizedAction

### blocked
- **Meaning:** Episode blocked by critical/warning conditions
- **Required:** channelName, title, workflowState, humanReviewStatus
- **Typical:** episodeNumber, blockers, nextAuthorizedAction

### human-review-required
- **Meaning:** Awaiting human judgment
- **Required:** channelName, title, workflowState, humanReviewStatus='required'
- **Typical:** episodeNumber, nextAuthorizedAction
- **Invariant:** `humanReviewStatus === "required"`

### approved
- **Meaning:** Decision approved; ready to proceed to next state
- **Required:** channelName, title, workflowState, humanReviewStatus='completed'
- **Typical:** episodeNumber, lastDecision, nextExpectedState
- **Invariant:** `humanReviewStatus === "completed"`

### published
- **Meaning:** Episode live on YouTube
- **Required:** channelName, title, workflowState, humanReviewStatus='completed'
- **Typical:** episodeNumber, youtubeVideoId, publishedAt, nextExpectedState='ANALYTICS_COLLECTING'
- **Invariant:** `humanReviewStatus === "completed"`, `youtubeVideoId` should be present

### unavailable
- **Meaning:** Canonical manifest could not be loaded; no workflow action authorized
- **Required:** (none; minimal card)
- **Optional:** unavailableReason, workflowState
- **Invariant:** No canonical or presentation props allowed

---

## Type Safety

### Discriminated Union Pattern

```tsx
type EpisodeStateCardProps =
  | EpisodeStateCardAvailableProps  // variant: default | blocked | human-review-required | approved | published
  | EpisodeStateCardUnavailableProps // variant: unavailable
```

**Benefits:**

1. **Compile-Time Validation:** TypeScript prevents `variant="unavailable"` + `humanReviewStatus="required"`
2. **Exhaustive Checking:** Switch statements on `variant` must handle all cases
3. **Intellisense:** Editors suggest only valid props for each variant

**Example:** This is now a **compile error**:

```tsx
// ❌ TypeScript error: humanReviewStatus is not assignable to type never
<EpisodeStateCard
  variant="unavailable"
  humanReviewStatus="required"  // ← Invalid for unavailable variant
/>
```

Correct usage:

```tsx
// ✓ TypeScript passes
<EpisodeStateCard
  variant="unavailable"
  unavailableReason="..."
/>

// ✓ TypeScript passes
<EpisodeStateCard
  variant="approved"
  channelName="..."
  humanReviewStatus="completed"
  // ← Cannot use unavailableReason here
/>
```

---

## Removed Props Analysis

### episodeId: string (REMOVED)

**What It Was:**
- Declared as required in experimental API
- Never used in component logic
- Not rendered in the DOM
- DOM IDs now derived from `React.useId()`

**Why Removed:**
- Dead cargo-cult prop from internal API
- Reduces surface area
- Prevents confusion about ID semantics (see useId pattern in component)

**Migration:**
Remove from all call sites:

```tsx
// Before
<EpisodeStateCard episodeId="14" variant="default" ... />

// After
<EpisodeStateCard variant="default" ... />
```

### updatedAt: string (REMOVED)

**What It Was:**
- Declared as optional in experimental API
- Never displayed in any variant
- Never read by component logic

**Why Removed:**
- Completely dead; no rendering or business logic uses it
- Increases prop count without value
- Maintenance burden (API surface area)

**Migration:**
Remove from all call sites:

```tsx
// Before
<EpisodeStateCard updatedAt="2026-08-06T12:00:00Z" variant="default" ... />

// After
<EpisodeStateCard variant="default" ... />
```

---

## Future Extensibility

### YouTube Operating Agent Integration

**Candidate:** Structured view model for canonical episode DTO

If YouTube Operating Agent needs deep integration (not just rendering `youtubeVideoId`), a future major version may introduce:

```tsx
interface CanonicalEpisode {
  id: string
  title: string
  channelId: string
  workflowState: string
  // ... other canonical fields
}

type EpisodeStateCardAvailableProps = EpisodeStateCardSharedProps & {
  variant: Exclude<EpisodeStateCardVariant, "unavailable">
  canonical?: CanonicalEpisode  // ← New structured prop
  // ... existing props (gradually deprecated)
}
```

**Current State:** Flat props with optional presentation fields are sufficient.

### Extended Blocking Conditions

**Candidate:** Hierarchical blocker dependencies

Current: Flat array of blockers with severity.  
Future: Parent/child dependency graph for complex blocking scenarios.

---

## Accessibility Review

**Standard:** WCAG 2.2 AA  
**Decision:** PASS

### Key Features

- ✓ Semantic `role="region"` with `aria-labelledby` composed heading
- ✓ Per-instance unique IDs via `React.useId()` (no duplicate-ID violations)
- ✓ Screen-reader-only severity text (icon + sr-only label)
- ✓ All icons `aria-hidden="true"`
- ✓ Respects `prefers-reduced-motion: reduce`
- ✓ 7:1+ contrast on all text (exceeds AAA)
- ✓ 17 regression tests covering a11y invariants

---

## Version & Stability

| Field | Value |
|-------|-------|
| **Current Version** | 1.0.0-stable |
| **Previous Version** | 0.1.0-experimental |
| **Release Date** | 2026-08-06 |
| **Breaking Changes** | Yes (removed episodeId, updatedAt; unavailable variant stricter) |
| **Migration Guide** | `docs/migrations/episode-state-card-experimental-to-stable.md` |

---

## Test Coverage

### API Stabilization Tests (20 total)

1. Discriminated union enforcement (TypeScript)
2. Available variant with all props
3. Available variant with minimal props
4. Unavailable variant alone
5. Unavailable variant rejects canonical props
6. Type guards work correctly in JSX
7. Props are correctly destructured
8. Props are correctly rendered
9. Accessibility props present and correct
10. Motion props respected
11. Layout props applied
12. Ref forwarding works
13. displayName set correctly
14. Fixtures validate against new types
15. No TypeScript errors on build
16. Lint: 0 warnings
17. Prop deprecation warnings (if applicable)
18. Variant invariant enforcement (humanReviewStatus)
19. Dynamic prop combinations (all 6 variants)
20. Edge cases (null values, undefined, empty arrays)

---

## Registry Entry

```yaml
status: API_STABILIZATION
api_stabilized: true
api_surface: artifacts/episode-state-card/api-stabilization/api-surface.json
api_documentation: docs/components/episode-state-card-api.md
adr: docs/decisions/ADR-episode-state-card-api-stabilization.md
accessibility_review: PASS
regression_tests: tests/episode-state-card-accessibility.test.ts
api_tests: tests/episode-state-card-api.test.ts
```

