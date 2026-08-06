import type { EpisodeStateCardProps } from "@/components/workflow/episode-state-card"

export const episode14EditorialDevelopment: EpisodeStateCardProps = {
  channelName: "Wealth Decoded",
  episodeNumber: 14,
  title: "Editorial Development",
  workflowState: "EDITORIAL_DEVELOPMENT",
  workflowStateLabel: "EDITORIAL DEVELOPMENT",
  variant: "default",
  humanReviewStatus: "not-required",
  lastDecision: {
    label: "Concept approved with conditions",
    outcome: "pass-with-conditions",
  },
  blockers: [
    {
      id: "packaging-not-selected",
      label: "Packaging not selected",
      severity: "warning",
    },
  ],
  nextAuthorizedAction: "Open Packaging Review",
  canonicalSource: "episode-014 manifest",
  manifestVersion: "draft",
}

export const episode14Blocked: EpisodeStateCardProps = {
  channelName: "Wealth Decoded",
  episodeNumber: 14,
  title: "Packaging Review",
  workflowState: "PACKAGING_REVIEW",
  workflowStateLabel: "BLOCKED",
  variant: "blocked",
  humanReviewStatus: "not-required",
  blockers: [
    {
      id: "thumbnail-direction",
      label: "Thumbnail direction not selected",
      severity: "critical",
    },
    {
      id: "title-promise",
      label: "Title promise requires clarification",
      severity: "warning",
    },
  ],
  nextAuthorizedAction: "Resolve blocking conditions",
  canonicalSource: "episode-014 manifest",
  manifestVersion: "draft",
}

export const episode13HumanReview: EpisodeStateCardProps = {
  channelName: "Wealth Decoded",
  episodeNumber: 13,
  title: "Master V2",
  workflowState: "HUMAN_REVIEW_REQUIRED",
  workflowStateLabel: "HUMAN REVIEW REQUIRED",
  variant: "human-review-required",
  humanReviewStatus: "required",
  nextAuthorizedAction: "Review Master V2",
  canonicalSource: "episode-013 manifest",
  manifestVersion: "1.1.0",
}

export const episode13Approved: EpisodeStateCardProps = {
  channelName: "Wealth Decoded",
  episodeNumber: 13,
  title: "Master Approved",
  workflowState: "MASTER_APPROVED",
  workflowStateLabel: "APPROVED",
  variant: "approved",
  humanReviewStatus: "completed",
  lastDecision: {
    label: "PASS",
    outcome: "pass",
  },
  nextExpectedState: "ASSET_REPLACEMENT",
  canonicalSource: "episode-013 manifest",
  manifestVersion: "1.1.0",
}

export const episode13Published: EpisodeStateCardProps = {
  channelName: "Wealth Decoded",
  episodeNumber: 13,
  title: "$1,000 a Month in Dividends: How Much Do You Need?",
  workflowState: "PUBLISHED",
  workflowStateLabel: "PUBLISHED",
  variant: "published",
  humanReviewStatus: "completed",
  youtubeVideoId: "ASluRm71I8o",
  publishedAt: "2026-08-05T02:06:47Z",
  nextExpectedState: "ANALYTICS_COLLECTING",
  manifestVersion: "2.0.0",
  canonicalSource: "episode-013 manifest",
}

export const episodeUnavailable: EpisodeStateCardProps = {
  variant: "unavailable",
  unavailableReason: "MANIFEST_FETCH_FAILED: upstream returned 404 for episode-014/manifest.json",
}
