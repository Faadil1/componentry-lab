# Episode State Card

**Status**: EXPERIMENTAL

## Overview
Read-only workflow component displaying canonical episode state, decisions, blocking conditions, and required actions.

## Variants
- default
- blocked
- human-review-required
- approved
- published
- unavailable

## Component Props
```typescript
interface EpisodeStateCardProps {
  channelName: string
  episodeId: string
  episodeNumber?: number | null
  title: string
  workflowState: string
  variant: EpisodeStateCardVariant
  humanReviewStatus: HumanReviewStatus
  className?: string
}
```

## Authority
- Display state: READ_ONLY
- State transitions: NONE
- Publication: NONE
- Manifest write: NONE

## Next Steps
Ready for VISUAL_REVIEW after design and responsive validation.
