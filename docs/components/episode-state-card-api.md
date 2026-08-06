# Episode State Card — Public API Reference

**Status:** Stable  
**React Version:** 18.2+  
**Component Path:** `@/components/workflow/episode-state-card`  

---

## Overview

The `EpisodeStateCard` is a read-only workflow component that displays the current state of a video episode through a canonical data source. It supports six visual variants representing different workflow states and is optimized for accessibility (WCAG 2.2 AA) and responsive design.

---

## Discriminated Union Type

The component uses **discriminated union types** to enforce variant invariants. The `variant` prop discriminates which other props are valid.

### Available vs. Unavailable Variants

```tsx
// Available variants: default, blocked, human-review-required, approved, published
type EpisodeStateCardAvailableProps = {
  variant: Exclude<EpisodeStateCardVariant, "unavailable">
  channelName: string
  humanReviewStatus: Exclude<HumanReviewStatus, "unavailable">
  // ... other props
}

// Unavailable variant (manifest fetch failed)
type EpisodeStateCardUnavailableProps = {
  variant: "unavailable"
  unavailableReason?: string
}

type EpisodeStateCardProps = 
  | EpisodeStateCardAvailableProps 
  | EpisodeStateCardUnavailableProps
```

---

## Canonical Props (Always Required)

These props define the episode's core identity and state. They are required for all available variants.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `variant` | `EpisodeStateCardVariant` | ✓ | Visual state: `default`, `blocked`, `human-review-required`, `approved`, `published`, or `unavailable` |
| `channelName` | `string` | ✓ | Channel name (e.g., "Wealth Decoded") |
| `title` | `string` | ✓ | Episode title |
| `workflowState` | `string` | ✓ | Technical state identifier (e.g., `EDITORIAL_DEVELOPMENT`) |
| `humanReviewStatus` | `HumanReviewStatus` | ✓ (available) | `not-required`, `required`, `completed`, or `unavailable` |

---

## Presentation Props (Optional)

These props render contextual information but are not required for core functionality.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `episodeNumber` | `number \| null` | `undefined` | Episode sequence number for display |
| `workflowStateLabel` | `string` | Derived from `variant` | Custom label for the current state |
| `lastDecision` | `EpisodeStateDecision \| null` | `undefined` | Recent human decision and outcome |
| `blockers` | `EpisodeStateBlocker[]` | `[]` | Critical/warning/info blocking conditions |
| `nextExpectedState` | `string \| null` | `undefined` | Next anticipated workflow state |
| `nextAuthorizedAction` | `string \| null` | `undefined` | Next human action required |
| `youtubeVideoId` | `string` | `undefined` | YouTube video ID (published variant) |
| `publishedAt` | `string` | `undefined` | ISO8601 publication timestamp |
| `canonicalSource` | `string` | `undefined` | Source system identifier |
| `manifestVersion` | `string` | `undefined` | Manifest schema version |
| `unavailableReason` | `string` | `undefined` | Technical reason for unavailable state |

---

## Layout Props (Optional)

These props control rendering behavior and do not affect data presentation.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `reduceMotion` | `boolean` | `false` | Override `prefers-reduced-motion` system setting (lab demo only) |
| `className` | `string` | `undefined` | Tailwind CSS class override for root container |

---

## Exported Types

### `EpisodeStateCardVariant`

```tsx
type EpisodeStateCardVariant =
  | "default"           // In-progress workflow
  | "blocked"           // Blocked by conditions
  | "human-review-required"  // Awaiting human judgment
  | "approved"          // Decision approved
  | "published"         // Live on YouTube
  | "unavailable"       // Manifest fetch failed
```

### `HumanReviewStatus`

```tsx
type HumanReviewStatus =
  | "not-required"      // No human judgment needed
  | "required"          // Awaiting human decision
  | "completed"         // Human has decided
  | "unavailable"       // State unknown
```

### `EpisodeStateDecision`

```tsx
interface EpisodeStateDecision {
  label: string
  outcome?: "pass" | "pass-with-conditions" | "rework" | "stop"
  decidedAt?: string    // ISO8601 timestamp
  decidedBy?: string    // Decision maker identifier
}
```

### `EpisodeStateBlocker`

```tsx
interface EpisodeStateBlocker {
  id: string
  label: string
  severity: "info" | "warning" | "critical"
}
```

---

## Variant Invariants

### Default Variant
- Displays channel, episode number, and title
- Shows last decision (if provided)
- Shows blockers with severity indicators
- State label defaults to "IN PROGRESS"

### Blocked Variant
- Emphasizes blockers (typically critical or warning)
- Blocks further workflow progression
- "BLOCKED" state label

### Human Review Required
- Awaits human decision
- Highlights decision-required state
- "HUMAN REVIEW REQUIRED" state label

### Approved Variant
- Decision has been made and approved
- Ready to proceed to next state
- "APPROVED" state label

### Published Variant
- Episode is live on YouTube
- Shows YouTube video ID and publication timestamp
- "PUBLISHED" state label
- `nextExpectedState` typically "ANALYTICS_COLLECTING"

### Unavailable Variant
- Manifest could not be loaded
- Minimal props required (variant, channelName optional)
- Cannot proceed with any workflow action
- Shows optional `unavailableReason` for debugging

---

## Accessibility (WCAG 2.2 AA)

- **Semantic Structure:** Each card is a `role="region"` with `aria-labelledby` composed of channel/episode heading + state heading
- **Unique IDs:** Per-instance React.useId() prevents duplicate-ID violations
- **Severity Labels:** `aria-hidden` icons paired with screen-reader-only severity text
- **Motion:** Respects `prefers-reduced-motion: reduce` system setting; stagger and y-offset disabled
- **Contrast:** All text ≥7:1 contrast ratio on colored backgrounds (WCAG AAA)
- **SVG Icons:** All hidden via `aria-hidden="true"`

---

## Motion Behavior

Card content animates on entry using Framer Motion:
- Container: opacity fade-in + staggered children
- Items: opacity + subtle y-offset (disabled in reduced-motion mode)
- Durations: 0.3s normal, 0.15s reduced-motion

Stagger delay: 50ms (normal), 0ms (reduced-motion)

---

## Styling

The component uses **Tailwind CSS** for all styling. No CSS-in-JS. Color variants map to semantic Tailwind palette:

| Variant | Border | Background | Accent |
|---------|--------|-----------|--------|
| `default` | `border-slate-300` | `bg-slate-50` | `bg-slate-200` |
| `blocked` | `border-amber-300` | `bg-amber-50` | `bg-amber-200` |
| `human-review-required` | `border-violet-300` | `bg-violet-50` | `bg-violet-200` |
| `approved` | `border-emerald-300` | `bg-emerald-50` | `bg-emerald-200` |
| `published` | `border-cyan-300` | `bg-cyan-50` | `bg-cyan-200` |
| `unavailable` | `border-neutral-300` | `bg-neutral-100` | `bg-neutral-200` |

---

## Usage Example

### Available Variant (Approved)

```tsx
import { EpisodeStateCard } from "@/components/workflow/episode-state-card"

export function EpisodeStatusPage() {
  return (
    <EpisodeStateCard
      variant="approved"
      channelName="Wealth Decoded"
      episodeNumber={13}
      title="Master Approved"
      workflowState="MASTER_APPROVED"
      workflowStateLabel="APPROVED"
      humanReviewStatus="completed"
      lastDecision={{
        label: "PASS",
        outcome: "pass",
        decidedBy: "Sarah Chen",
      }}
      nextExpectedState="ASSET_REPLACEMENT"
      canonicalSource="episode-013 manifest"
      manifestVersion="1.1.0"
    />
  )
}
```

### Unavailable Variant

```tsx
<EpisodeStateCard
  variant="unavailable"
  channelName="Wealth Decoded"
  workflowState="UNAVAILABLE"
  unavailableReason="MANIFEST_FETCH_FAILED: upstream returned 404"
/>
```

---

## Migration from Experimental API

### Removed Props

- **`episodeId`** — Was never rendered or used for DOM IDs (now uses React.useId). Remove from all call sites.
- **`updatedAt`** — Dead prop, never displayed. Remove if present.

### Type Adjustments

```tsx
// Before (experimental)
const props: EpisodeStateCardProps = {
  episodeId: "14",  // REMOVED
  updatedAt: "2026-08-06T12:00:00Z",  // REMOVED
  humanReviewStatus: "unavailable",  // OK if variant !== "unavailable"
  // ...
}

// After (stable)
const props: EpisodeStateCardProps = {
  variant: "unavailable",
  channelName: "Wealth Decoded",
  workflowState: "UNAVAILABLE",
  // NO episodeId, NO updatedAt
  // humanReviewStatus only if variant !== "unavailable"
}
```

---

## Rendering Behavior

- Component is `React.forwardRef<HTMLDivElement>` — ref forwarding supported
- displayName: "EpisodeStateCard"
- No external DOM side effects
- No implicit network requests
- Motion can be disabled via `prefers-reduced-motion` or `reduceMotion={true}`

---

## Future Considerations

- **YouTube Operating Agent Integration:** Currently supports `youtubeVideoId` and `publishedAt` as presentation props. Full structured integration (canonical view model) may be introduced in a future major version.
- **Extended Blocking Conditions:** Blocker list is currently flat. Hierarchical blocking (parent/child dependencies) is a candidate for future extension.

