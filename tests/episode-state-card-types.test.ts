/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  EpisodeStateCardProps,
  DefaultEpisodeStateCardProps,
  BlockedEpisodeStateCardProps,
  HumanReviewRequiredEpisodeStateCardProps,
  ApprovedEpisodeStateCardProps,
  PublishedEpisodeStateCardProps,
  UnavailableEpisodeStateCardProps,
  HumanReviewStatus,
  EpisodeStateBlocker,
  EpisodeStateDecision,
} from "@/components/workflow/episode-state-card"

// ============================================================================
// VALID CASES — These must compile without errors
// ============================================================================

// Valid: default variant with not-required
const defaultValidNotRequired: EpisodeStateCardProps = {
  variant: "default",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "EDITORIAL",
  humanReviewStatus: "not-required",
}

// Valid: default variant with completed
const defaultValidCompleted: EpisodeStateCardProps = {
  variant: "default",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "EDITORIAL",
  humanReviewStatus: "completed",
}

// Valid: blocked with 1 blocker
const blockedValid1Blocker: EpisodeStateCardProps = {
  variant: "blocked",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PACKAGING",
  humanReviewStatus: "not-required",
  blockers: [
    { id: "b1", label: "Missing thumbnail", severity: "critical" },
  ],
}

// Valid: blocked with 2+ blockers
const blockedValid2Blockers: EpisodeStateCardProps = {
  variant: "blocked",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PACKAGING",
  humanReviewStatus: "required",
  blockers: [
    { id: "b1", label: "Missing thumbnail", severity: "critical" },
    { id: "b2", label: "Title needs review", severity: "warning" },
  ],
}

// Valid: human-review-required with status='required'
const humanReviewValid: EpisodeStateCardProps = {
  variant: "human-review-required",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "HUMAN_REVIEW",
  humanReviewStatus: "required",
}

// Valid: approved with status='completed'
const approvedValid: EpisodeStateCardProps = {
  variant: "approved",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "MASTER_APPROVED",
  humanReviewStatus: "completed",
}

// Valid: published with videoId and publishedAt
const publishedValid: EpisodeStateCardProps = {
  variant: "published",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PUBLISHED",
  humanReviewStatus: "completed",
  youtubeVideoId: "ASluRm71I8o",
  publishedAt: "2026-08-05T00:00:00Z",
}

// Valid: unavailable with optional reason
const unavailableValid1: EpisodeStateCardProps = {
  variant: "unavailable",
}

const unavailableValid2: EpisodeStateCardProps = {
  variant: "unavailable",
  unavailableReason: "Manifest fetch failed",
}

// ============================================================================
// INVALID CASES — These must NOT compile (using @ts-expect-error)
// ============================================================================

// Invalid: default with humanReviewStatus='required' (not allowed for default)
// @ts-expect-error default variant forbids humanReviewStatus='required'
const defaultInvalidRequired: EpisodeStateCardProps = {
  variant: "default",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "EDITORIAL",
  humanReviewStatus: "required",
}

// Invalid: blocked without blockers (blockers required)
// @ts-expect-error blockers is required for blocked variant
const blockedInvalidNoBlockers: EpisodeStateCardProps = {
  variant: "blocked",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PACKAGING",
  humanReviewStatus: "not-required",
}

// Invalid: blocked with empty array (non-empty tuple required)
// @ts-expect-error blockers must be non-empty tuple
const blockedInvalidEmptyArray: EpisodeStateCardProps = {
  variant: "blocked",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PACKAGING",
  humanReviewStatus: "not-required",
  blockers: [],
}

// Invalid: human-review-required with status='not-required'
// @ts-expect-error humanReviewStatus must be 'required' for human-review-required
const humanReviewInvalidNotRequired: EpisodeStateCardProps = {
  variant: "human-review-required",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "HUMAN_REVIEW",
  humanReviewStatus: "not-required",
}

// Invalid: human-review-required with status='completed'
// @ts-expect-error humanReviewStatus must be 'required' for human-review-required
const humanReviewInvalidCompleted: EpisodeStateCardProps = {
  variant: "human-review-required",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "HUMAN_REVIEW",
  humanReviewStatus: "completed",
}

// Invalid: approved with status='not-required'
// @ts-expect-error humanReviewStatus must be 'completed' for approved
const approvedInvalidNotRequired: EpisodeStateCardProps = {
  variant: "approved",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "MASTER_APPROVED",
  humanReviewStatus: "not-required",
}

// Invalid: published without youtubeVideoId
// @ts-expect-error youtubeVideoId is required for published
const publishedInvalidNoId: EpisodeStateCardProps = {
  variant: "published",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PUBLISHED",
  humanReviewStatus: "completed",
  publishedAt: "2026-08-05T00:00:00Z",
}

// Invalid: published without publishedAt
// @ts-expect-error publishedAt is required for published
const publishedInvalidNoDate: EpisodeStateCardProps = {
  variant: "published",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PUBLISHED",
  humanReviewStatus: "completed",
  youtubeVideoId: "ASluRm71I8o",
}

// Invalid: unavailable with channelName (never type)
// @ts-expect-error channelName not allowed for unavailable
const unavailableInvalidChannelName: EpisodeStateCardProps = {
  variant: "unavailable",
  channelName: "Wealth Decoded",
}

// Invalid: unavailable with title (never type)
// @ts-expect-error title not allowed for unavailable
const unavailableInvalidTitle: EpisodeStateCardProps = {
  variant: "unavailable",
  title: "Episode 1",
}

// ============================================================================
// VARIANT DISCRIMINATOR VERIFICATION
// ============================================================================

// Type narrowing works correctly after checking variant
function handleProps(props: EpisodeStateCardProps) {
  if (props.variant === "default") {
    // humanReviewStatus is "not-required" | "completed"
    const status: "not-required" | "completed" = props.humanReviewStatus
  } else if (props.variant === "blocked") {
    // blockers is non-empty tuple
    const firstBlocker: EpisodeStateBlocker = props.blockers[0]
    // humanReviewStatus can be any of the three values
    const anyStatus: HumanReviewStatus = props.humanReviewStatus
  } else if (props.variant === "human-review-required") {
    // humanReviewStatus must be exactly "required"
    const status: "required" = props.humanReviewStatus
  } else if (props.variant === "approved") {
    // humanReviewStatus must be exactly "completed"
    const status: "completed" = props.humanReviewStatus
  } else if (props.variant === "published") {
    // youtubeVideoId and publishedAt are required strings
    const videoId: string = props.youtubeVideoId
    const publishDate: string = props.publishedAt
    // humanReviewStatus must be "completed"
    const status: "completed" = props.humanReviewStatus
  } else if (props.variant === "unavailable") {
    // only unavailableReason is allowed (optional)
    const reason: string | undefined = props.unavailableReason
  }
}

export { handleProps }
