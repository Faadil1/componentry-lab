import type { EpisodeStateCardProps } from "@/components/workflow/episode-state-card"

export const episode14EditorialDevelopment: EpisodeStateCardProps = {
  channelName: "Wealth Decoded", episodeId: "14", episodeNumber: 14, title: "Editorial Development",
  workflowState: "EDITORIAL_DEVELOPMENT", variant: "default", humanReviewStatus: "not-required",
}

export const episode14Blocked: EpisodeStateCardProps = {
  channelName: "Wealth Decoded", episodeId: "14", episodeNumber: 14, title: "Packaging Review",
  workflowState: "PACKAGING_REVIEW", variant: "blocked", humanReviewStatus: "not-required", blockers: [],
}

export const episode13HumanReview: EpisodeStateCardProps = {
  channelName: "Wealth Decoded", episodeId: "13", episodeNumber: 13, title: "Master V2",
  workflowState: "HUMAN_REVIEW_REQUIRED", variant: "human-review-required", humanReviewStatus: "required",
}

export const episode13Approved: EpisodeStateCardProps = {
  channelName: "Wealth Decoded", episodeId: "13", episodeNumber: 13, title: "Master Approved",
  workflowState: "MASTER_APPROVED", variant: "approved", humanReviewStatus: "completed",
}

export const episode13Published: EpisodeStateCardProps = {
  channelName: "Wealth Decoded", episodeId: "13", episodeNumber: 13,
  title: "$1,000 a Month in Dividends: How Much Do You Need?", workflowState: "PUBLISHED",
  variant: "published", humanReviewStatus: "completed",
}

export const episodeUnavailable: EpisodeStateCardProps = {
  channelName: "Wealth Decoded", episodeId: "unknown", episodeNumber: null, title: "Unknown",
  workflowState: "UNAVAILABLE", variant: "unavailable", humanReviewStatus: "unavailable",
}
