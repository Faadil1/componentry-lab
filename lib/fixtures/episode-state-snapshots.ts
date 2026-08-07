// ─────────────────────────────────────────────────────────────
// Episode State Snapshots — Test Fixtures
// ─────────────────────────────────────────────────────────────
// Domain-level fixtures for testing adapter behavior.
// Cover all variants and edge cases.
// ─────────────────────────────────────────────────────────────

import type { EpisodeStateSnapshot } from "@/lib/domain/episode-state"

// ── DEFAULT VARIANT ────────────────────────────────────────

export const snapshotDefaultEditorial: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "EDITORIAL",
  workflowStateLabel: "EDITORIAL DEVELOPMENT",
  reviewStatus: "not-required",
  blockers: [],
  source: {
    version: "1.0",
    fetchedAt: "2026-08-06T12:00:00Z",
  },
}

export const snapshotDefaultPackaging: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "PACKAGING",
  workflowStateLabel: "PACKAGING DESIGN",
  reviewStatus: "not-required",
  blockers: [],
  nextAuthorizedAction: "Review packaging direction",
  source: {
    version: "1.0",
    fetchedAt: "2026-08-06T12:30:00Z",
  },
}

export const snapshotDefaultMasterEdit: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "MASTER_EDIT_REMOTION",
  workflowStateLabel: "REMOTION MASTER COMPOSITION",
  reviewStatus: "not-required",
  blockers: [],
  source: {
    version: "1.1",
    fetchedAt: "2026-08-06T14:00:00Z",
  },
}

// ── BLOCKED VARIANT ────────────────────────────────────────

export const snapshotBlockedThumbnail: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "PACKAGING",
  workflowStateLabel: "PACKAGING DESIGN",
  reviewStatus: "not-required",
  blockers: [
    {
      id: "thumbnail-direction",
      label: "Thumbnail direction not selected",
      severity: "critical",
    },
    {
      id: "title-clarity",
      label: "Title promise requires clarification",
      severity: "warning",
    },
  ],
  nextAuthorizedAction: "Resolve blocking conditions",
  source: {
    version: "1.0",
    fetchedAt: "2026-08-06T13:00:00Z",
  },
}

export const snapshotBlockedWithResolvedBlockers: EpisodeStateSnapshot = {
  episodeId: "episode-013",
  episodeNumber: 13,
  channelName: "Wealth Decoded",
  title: "$1,000 a Month in Dividends",
  workflowState: "QA",
  workflowStateLabel: "QUALITY ASSURANCE",
  reviewStatus: "not-required",
  blockers: [
    {
      id: "audio-level",
      label: "Audio level spike at 3:45",
      severity: "critical",
      resolvedAt: "2026-08-06T15:30:00Z",
    },
  ],
  source: {
    version: "1.1",
    fetchedAt: "2026-08-06T16:00:00Z",
  },
}

// ── HUMAN-REVIEW-REQUIRED VARIANT ──────────────────────────

export const snapshotHumanReviewRequired: EpisodeStateSnapshot = {
  episodeId: "episode-013",
  episodeNumber: 13,
  channelName: "Wealth Decoded",
  title: "$1,000 a Month in Dividends",
  workflowState: "CANDIDATE_ASSET_REVIEW",
  workflowStateLabel: "HUMAN REVIEW REQUIRED",
  reviewStatus: "required",
  blockers: [],
  nextAuthorizedAction: "Review master edit and approve or reject",
  source: {
    version: "1.1",
    fetchedAt: "2026-08-06T14:30:00Z",
  },
}

export const snapshotHumanReviewWithBlockers: EpisodeStateSnapshot = {
  episodeId: "episode-013",
  episodeNumber: 13,
  channelName: "Wealth Decoded",
  title: "$1,000 a Month in Dividends",
  workflowState: "CANDIDATE_ASSET_REVIEW",
  workflowStateLabel: "HUMAN REVIEW REQUIRED",
  reviewStatus: "required",
  blockers: [
    {
      id: "asset-quality",
      label: "One asset does not meet quality standard",
      severity: "warning",
    },
  ],
  nextAuthorizedAction: "Review findings and decide outcome",
  source: {
    version: "1.1",
    fetchedAt: "2026-08-06T15:00:00Z",
  },
}

// ── APPROVED VARIANT ───────────────────────────────────────

export const snapshotApproved: EpisodeStateSnapshot = {
  episodeId: "episode-013",
  episodeNumber: 13,
  channelName: "Wealth Decoded",
  title: "$1,000 a Month in Dividends",
  workflowState: "MASTER_APPROVED",
  workflowStateLabel: "APPROVED FOR PUBLICATION",
  reviewStatus: "completed",
  blockers: [],
  lastDecision: {
    label: "PASS — All gates completed successfully",
    outcome: "pass",
    decidedBy: "claude-code",
    decidedAt: "2026-08-06T16:30:00Z",
  },
  source: {
    version: "1.1",
    fetchedAt: "2026-08-06T16:45:00Z",
  },
}

export const snapshotApprovedWithConditions: EpisodeStateSnapshot = {
  episodeId: "episode-012",
  episodeNumber: 12,
  channelName: "Wealth Decoded",
  title: "Stock Market Basics",
  workflowState: "MASTER_APPROVED",
  workflowStateLabel: "APPROVED FOR PUBLICATION",
  reviewStatus: "completed",
  blockers: [],
  lastDecision: {
    label: "PASS — With minor corrections addressed",
    outcome: "pass-with-conditions",
    decidedBy: "claude-code",
    decidedAt: "2026-08-05T10:00:00Z",
  },
  source: {
    version: "1.0",
    fetchedAt: "2026-08-05T10:15:00Z",
  },
}

// ── PUBLISHED VARIANT ──────────────────────────────────────

export const snapshotPublished: EpisodeStateSnapshot = {
  episodeId: "episode-013",
  episodeNumber: 13,
  channelName: "Wealth Decoded",
  title: "$1,000 a Month in Dividends: How Much Do You Need?",
  workflowState: "PUBLISHED",
  workflowStateLabel: "PUBLISHED TO YOUTUBE",
  reviewStatus: "completed",
  blockers: [],
  lastDecision: {
    label: "PASS",
    outcome: "pass",
    decidedBy: "youtube-operating-system",
    decidedAt: "2026-08-05T02:06:47Z",
  },
  publication: {
    youtubeVideoId: "ASluRm71I8o",
    publishedAt: "2026-08-05T02:06:47Z",
  },
  source: {
    version: "2.0.0",
    fetchedAt: "2026-08-05T14:00:00Z",
  },
}

export const snapshotPublishedWithStaleBlockers: EpisodeStateSnapshot = {
  episodeId: "episode-012",
  episodeNumber: 12,
  channelName: "Wealth Decoded",
  title: "Stock Market Basics",
  workflowState: "PUBLISHED",
  workflowStateLabel: "PUBLISHED TO YOUTUBE",
  reviewStatus: "completed",
  blockers: [
    {
      id: "old-audio-issue",
      label: "Audio level spike (pre-publication, now resolved)",
      severity: "critical",
      resolvedAt: "2026-08-04T18:00:00Z",
    },
  ],
  publication: {
    youtubeVideoId: "dQw4w9WgXcQ",
    publishedAt: "2026-08-04T16:30:00Z",
  },
  source: {
    version: "2.0.0",
    fetchedAt: "2026-08-04T20:00:00Z",
  },
}

// ── UNAVAILABLE VARIANT ────────────────────────────────────

export const snapshotUnavailableNull = null

export const snapshotUnavailableManifestFetchFailed: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "UNKNOWN",
  reviewStatus: "not-required",
  blockers: [],
  unavailableReason: "MANIFEST_FETCH_FAILED: upstream returned 404",
  source: {
    fetchedAt: "2026-08-06T17:00:00Z",
  },
}

// ── EDGE CASES ─────────────────────────────────────────────

export const snapshotUnknownWorkflowState: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "FUTURE_WORKFLOW_STAGE_ADDED_BY_N8N",
  workflowStateLabel: "UNKNOWN STAGE",
  reviewStatus: "not-required",
  blockers: [],
  source: {
    version: "1.5",
    fetchedAt: "2026-08-06T17:30:00Z",
  },
}

export const snapshotCompletedReviewWithoutExplicitApproval: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "CANDIDATE_ASSET_REVIEW",
  reviewStatus: "completed",
  blockers: [],
  source: {
    version: "1.0",
    fetchedAt: "2026-08-06T18:00:00Z",
  },
}

export const snapshotMalformedPublicationMissingId: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "PUBLISHED",
  reviewStatus: "completed",
  blockers: [],
  publication: {
    youtubeVideoId: "",
    publishedAt: "2026-08-06T19:00:00Z",
  },
  source: {
    version: "2.0.0",
    fetchedAt: "2026-08-06T19:15:00Z",
  },
}

export const snapshotMalformedPublicationMissingDate: EpisodeStateSnapshot = {
  episodeId: "episode-014",
  episodeNumber: 14,
  channelName: "Wealth Decoded",
  title: "Dividend Investing Explained",
  workflowState: "PUBLISHED",
  reviewStatus: "completed",
  blockers: [],
  publication: {
    youtubeVideoId: "dQw4w9WgXcQ",
    publishedAt: "",
  },
  source: {
    version: "2.0.0",
    fetchedAt: "2026-08-06T19:15:00Z",
  },
}

export const snapshotReworkDecision: EpisodeStateSnapshot = {
  episodeId: "episode-015",
  episodeNumber: 15,
  channelName: "Wealth Decoded",
  title: "Investment Portfolio Rebalancing",
  workflowState: "CANDIDATE_ASSET_REVIEW",
  reviewStatus: "completed",
  blockers: [
    {
      id: "factual-error",
      label: "Factual error in economic explanation",
      severity: "critical",
    },
  ],
  lastDecision: {
    label: "REWORK — Major factual errors must be addressed",
    outcome: "rework",
    decidedBy: "claude-code",
    decidedAt: "2026-08-06T20:00:00Z",
  },
  source: {
    version: "1.0",
    fetchedAt: "2026-08-06T20:15:00Z",
  },
}
