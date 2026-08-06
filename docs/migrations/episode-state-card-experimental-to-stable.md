# Migration Guide: Episode State Card (Experimental → Stable)

**From:** 0.1.0-experimental  
**To:** 1.0.0-stable  
**Date:** 2026-08-06  

---

## Overview

The Episode State Card stabilizes its API by removing dead props and enforcing variant invariants through a discriminated union type. This is a **breaking change** with minimal impact — most apps will only need to remove unused props.

---

## Breaking Changes

### 1. Removed Props

#### `episodeId: string` (REMOVED)

**Why:** Never rendered or used for DOM IDs. React.useId() now handles instance-specific IDs internally.

**Before:**
```tsx
<EpisodeStateCard
  episodeId="14"
  variant="default"
  channelName="Wealth Decoded"
  // ...
/>
```

**After:**
```tsx
<EpisodeStateCard
  variant="default"
  channelName="Wealth Decoded"
  // ...
/>
```

**Search & Replace:** Remove all `episodeId={...}` from your codebase.

---

#### `updatedAt: string` (REMOVED)

**Why:** Dead prop. Never displayed or used.

**Before:**
```tsx
<EpisodeStateCard
  updatedAt="2026-08-06T12:00:00Z"
  variant="default"
  // ...
/>
```

**After:**
```tsx
<EpisodeStateCard
  variant="default"
  // ...
/>
```

**Search & Replace:** Remove all `updatedAt={...}` from your codebase.

---

### 2. Unavailable Variant: Stricter Props

The `unavailable` variant no longer accepts canonical or presentation props (except `unavailableReason`).

#### Valid for Unavailable Variant (Only)

- ✓ `variant="unavailable"`
- ✓ `unavailableReason?: string`
- ✓ `reduceMotion?: boolean`
- ✓ `className?: string`

#### Now Invalid for Unavailable Variant

- ✗ `channelName`, `title`, `workflowState`, `humanReviewStatus` (canonical)
- ✗ `episodeNumber`, `workflowStateLabel`, `lastDecision`, `blockers`, `nextExpectedState`, `nextAuthorizedAction`, `youtubeVideoId`, `publishedAt`, `canonicalSource`, `manifestVersion` (presentation)

**Before (experimental — allowed but confusing):**
```tsx
<EpisodeStateCard
  variant="unavailable"
  channelName="Wealth Decoded"
  title="Unknown"
  workflowState="UNAVAILABLE"
  humanReviewStatus="unavailable"
  unavailableReason="Manifest fetch failed"
/>
```

**After (stable — stricter, clearer):**
```tsx
<EpisodeStateCard
  variant="unavailable"
  unavailableReason="Manifest fetch failed"
/>
```

**Rationale:** Unavailable state means the manifest is missing. Passing canonical props contradicts this condition. TypeScript now prevents this contradiction at compile time.

---

## Type Changes

### New Discriminated Union

The props type is now a discriminated union that enforces variant-specific requirements:

```tsx
// Before (experimental)
interface EpisodeStateCardProps {
  variant: EpisodeStateCardVariant
  episodeId: string  // ← Required but unused
  channelName?: string
  humanReviewStatus: HumanReviewStatus
  // ... all props optional or loosely typed
}

// After (stable)
type EpisodeStateCardProps =
  | EpisodeStateCardAvailableProps   // variant: default | blocked | ...
  | EpisodeStateCardUnavailableProps // variant: unavailable

interface EpisodeStateCardAvailableProps {
  variant: Exclude<EpisodeStateCardVariant, "unavailable">
  channelName: string  // ← Now required
  humanReviewStatus: Exclude<HumanReviewStatus, "unavailable">  // ← Stricter
  // ... other props with clear classification
}

interface EpisodeStateCardUnavailableProps {
  variant: "unavailable"
  unavailableReason?: string
  reduceMotion?: boolean
  className?: string
}
```

### TypeScript Validation

**Before (experimental):** No type error for invalid combinations

```tsx
// No TypeScript error, but logically wrong:
<EpisodeStateCard
  variant="unavailable"
  humanReviewStatus="required"  // ← Contradicts unavailability
  episodeId="14"
/>
```

**After (stable):** Type error (excellent!)

```tsx
// ✗ TypeScript Error:
// Type '{ variant: "unavailable"; humanReviewStatus: "required"; ... }'
// is not assignable to type 'EpisodeStateCardUnavailableProps'

<EpisodeStateCard
  variant="unavailable"
  humanReviewStatus="required"  // ← Type mismatch!
/>
```

---

## Migration Checklist

### 1. Remove Dead Props

Search your codebase for `episodeId` and `updatedAt`:

```bash
# Find all uses
grep -r "episodeId" src/ --include="*.tsx" --include="*.ts"
grep -r "updatedAt" src/ --include="*.tsx" --include="*.ts"
```

Remove the props from all `<EpisodeStateCard>` JSX elements.

### 2. Fix Unavailable Variant Calls

Search for `variant="unavailable"`:

```bash
grep -r 'variant="unavailable"' src/ --include="*.tsx" --include="*.ts"
```

For each occurrence, check if canonical or presentation props are passed. Remove them:

```tsx
// ❌ Before
const UnavailableCard = () => (
  <EpisodeStateCard
    variant="unavailable"
    channelName="Wealth Decoded"
    episodeNumber={14}
    title="Unknown"
    workflowState="UNAVAILABLE"
    humanReviewStatus="unavailable"
    unavailableReason="Manifest not found"
  />
)

// ✓ After
const UnavailableCard = () => (
  <EpisodeStateCard
    variant="unavailable"
    unavailableReason="Manifest not found"
  />
)
```

### 3. Run TypeScript Check

```bash
npm run build
# or
tsc --noEmit
```

TypeScript will now catch invalid prop combinations. Fix any type errors.

### 4. Run Tests

```bash
npm test
```

Existing tests should pass. If you have hardcoded fixtures, update them:

```tsx
// ❌ Before
const fixture: EpisodeStateCardProps = {
  episodeId: "14",
  episodeNumber: 14,
  // ...
}

// ✓ After
const fixture: EpisodeStateCardProps = {
  episodeNumber: 14,
  // ...
}
```

### 5. Update Storybook or Documentation

If you have Storybook stories or other docs using the component, update them to remove dead props and fix unavailable variant examples.

---

## API Reference Changes

### Canonical Props (New Classification)

These props are now **required** for all available variants:

- `channelName`
- `title`
- `workflowState`
- `humanReviewStatus` (but NOT "unavailable")

### Presentation Props (New Classification)

These props are **optional** and enriching:

- `episodeNumber`, `workflowStateLabel`, `lastDecision`, `blockers`
- `nextExpectedState`, `nextAuthorizedAction`, `youtubeVideoId`, `publishedAt`
- `canonicalSource`, `manifestVersion`

### Layout Props (New Classification)

These props control rendering, not data:

- `reduceMotion` (lab demo feature)
- `className` (Tailwind override)

See the full API reference: [`docs/components/episode-state-card-api.md`](../components/episode-state-card-api.md)

---

## Common Patterns

### Pattern 1: Building Props Dynamically

**Before:**
```tsx
const buildProps = (episode) => ({
  episodeId: episode.id,  // ← Removed
  channelName: episode.channelName,
  episodeNumber: episode.episodeNumber,
  title: episode.title,
  workflowState: episode.state,
  variant: episode.state === 'UNAVAILABLE' ? 'unavailable' : 'default',
  humanReviewStatus: episode.reviewStatus,
  updatedAt: episode.lastModified,  // ← Removed
})
```

**After:**
```tsx
const buildProps = (episode): EpisodeStateCardProps => {
  if (episode.state === 'UNAVAILABLE') {
    return {
      variant: 'unavailable',
      unavailableReason: episode.error,
    }
  }

  return {
    variant: 'default',  // or determine from episode.state
    channelName: episode.channelName,
    episodeNumber: episode.episodeNumber,
    title: episode.title,
    workflowState: episode.state,
    humanReviewStatus: episode.reviewStatus,
  }
}
```

### Pattern 2: Type-Safe Fixture Creation

**Before:**
```tsx
const fixture = {
  episodeId: '14',
  channelName: 'Wealth Decoded',
  // ...
}
```

**After:**
```tsx
const fixture: EpisodeStateCardAvailableProps = {
  variant: 'default',
  channelName: 'Wealth Decoded',
  title: 'Editorial Development',
  workflowState: 'EDITORIAL_DEVELOPMENT',
  humanReviewStatus: 'not-required',
  // ...
}
```

### Pattern 3: Conditional Rendering

**Before:**
```tsx
if (episode.unavailable) {
  return (
    <EpisodeStateCard
      variant="unavailable"
      channelName={episode.channelName}  // ← Still allowed
      unavailableReason={episode.error}
    />
  )
}
```

**After:**
```tsx
if (episode.unavailable) {
  return (
    <EpisodeStateCard
      variant="unavailable"
      unavailableReason={episode.error}
    />
  )
}
```

---

## Troubleshooting

### "Type X is not assignable to type EpisodeStateCardProps"

**Cause:** You're passing props that don't match the variant.

**Fix:** Check your `variant` prop. If it's `"unavailable"`, remove all canonical/presentation props except `unavailableReason`.

```tsx
// ❌ Error
<EpisodeStateCard
  variant="unavailable"
  channelName="Wealth Decoded"  // ← Remove this
/>

// ✓ Correct
<EpisodeStateCard
  variant="unavailable"
  unavailableReason="Manifest not found"
/>
```

### "Property 'episodeId' does not exist"

**Cause:** You're using the removed `episodeId` prop.

**Fix:** Remove it. DOM IDs are now handled internally via `React.useId()`.

```tsx
// ❌ Remove this line
<EpisodeStateCard episodeId="14" ... />

// ✓ Correct
<EpisodeStateCard ... />
```

### "Property 'updatedAt' does not exist"

**Cause:** You're using the removed `updatedAt` prop.

**Fix:** Remove it. It was never displayed or used.

```tsx
// ❌ Remove this line
<EpisodeStateCard updatedAt="2026-08-06T12:00:00Z" ... />

// ✓ Correct
<EpisodeStateCard ... />
```

---

## Testing Your Migration

After updating your code, run this checklist:

- [ ] No TypeScript errors (`npm run build`)
- [ ] All unit tests pass (`npm test`)
- [ ] Component renders correctly in all 6 variants
- [ ] Unavailable variant shows only unavailableReason (if provided)
- [ ] Available variants show all presentation props correctly
- [ ] Motion and layout props still work

---

## Support & Questions

- **Full API Reference:** `docs/components/episode-state-card-api.md`
- **Architecture Decision Record:** `docs/decisions/ADR-episode-state-card-api-stabilization.md`
- **API Surface Analysis:** `artifacts/episode-state-card/api-stabilization/api-surface.json`

