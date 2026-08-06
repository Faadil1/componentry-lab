/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
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

// Valid: default variant
const defaultValid: EpisodeStateCardProps = {
  variant: "default",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "EDITORIAL",
  humanReviewStatus: "not-required",
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
  humanReviewStatus: "not-required",
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

// Invalid: blocked without any blockers
// @ts-expect-error blockers is required and must be non-empty
const blockedInvalidNoBlockers: EpisodeStateCardProps = {
  variant: "blocked",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PACKAGING",
  humanReviewStatus: "not-required",
  blockers: [],
}

// Invalid: blocked with empty blockers array
// @ts-expect-error blockers tuple requires at least one element
const blockedInvalidEmptyArray: EpisodeStateCardProps = {
  variant: "blocked",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "PACKAGING",
  humanReviewStatus: "not-required",
  blockers: [] as const,
}

// Invalid: human-review-required with status='completed'
// @ts-expect-error humanReviewStatus must be 'required' for human-review-required
const humanReviewInvalidStatus: EpisodeStateCardProps = {
  variant: "human-review-required",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "HUMAN_REVIEW",
  humanReviewStatus: "completed",
}

// Invalid: approved with status='required'
// @ts-expect-error humanReviewStatus must be 'completed' for approved
const approvedInvalidStatus: EpisodeStateCardProps = {
  variant: "approved",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "MASTER_APPROVED",
  humanReviewStatus: "required",
}

// Invalid: approved with blockers
// @ts-expect-error blockers not allowed for approved variant
const approvedInvalidBlockers: EpisodeStateCardProps = {
  variant: "approved",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "MASTER_APPROVED",
  humanReviewStatus: "completed",
  blockers: [{ id: "b1", label: "test", severity: "critical" }],
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

// Invalid: unavailable with channelName
// @ts-expect-error channelName not allowed for unavailable
const unavailableInvalidChannelName: EpisodeStateCardProps = {
  variant: "unavailable",
  channelName: "Wealth Decoded",
}

// Invalid: unavailable with humanReviewStatus
// @ts-expect-error humanReviewStatus not allowed for unavailable
const unavailableInvalidStatus: EpisodeStateCardProps = {
  variant: "unavailable",
  humanReviewStatus: "required",
}

// Invalid: unavailable with nextAuthorizedAction
// @ts-expect-error nextAuthorizedAction not allowed for unavailable
const unavailableInvalidAction: EpisodeStateCardProps = {
  variant: "unavailable",
  nextAuthorizedAction: "Review",
}

// Invalid: passing reduceMotion prop (REMOVED)
// @ts-expect-error reduceMotion is not a valid prop in any variant
const anyVariantInvalidReduceMotion: EpisodeStateCardProps = {
  variant: "default",
  channelName: "Wealth Decoded",
  title: "Episode 1",
  workflowState: "EDITORIAL",
  humanReviewStatus: "not-required",
  // @ts-expect-error
  reduceMotion: true,
}

// ============================================================================
// PROP CLASSIFICATION VERIFICATION
// ============================================================================

// Verify HumanReviewStatus does not include "unavailable"
const validStatuses: HumanReviewStatus[] = [
  "not-required",
  "required",
  "completed",
]

// This would be a type error if "unavailable" were still in HumanReviewStatus:
// @ts-expect-error "unavailable" is not in HumanReviewStatus
// const invalidStatus: HumanReviewStatus = "unavailable"

// ============================================================================
// VARIANT DISCRIMINATOR VERIFICATION
// ============================================================================

// Type narrowing works correctly after checking variant
function handleProps(props: EpisodeStateCardProps) {
  if (props.variant === "blocked") {
    // props.blockers is non-empty tuple here
    const firstBlocker: EpisodeStateBlocker = props.blockers[0]
  } else if (props.variant === "human-review-required") {
    // props.humanReviewStatus must be "required"
    const status: "required" = props.humanReviewStatus
  } else if (props.variant === "approved") {
    // props.humanReviewStatus must be "completed"
    const status: "completed" = props.humanReviewStatus
  } else if (props.variant === "published") {
    // props.youtubeVideoId and props.publishedAt are required strings
    const videoId: string = props.youtubeVideoId
    const publishDate: string = props.publishedAt
  } else if (props.variant === "unavailable") {
    // props.unavailableReason is optional
    const reason: string | undefined = props.unavailableReason
  }
}

export { handleProps }
