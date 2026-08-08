// ─────────────────────────────────────────────────────────────
// Episode State — Domain Snapshot
// ─────────────────────────────────────────────────────────────
// First integration boundary for EpisodeStateCard.
// Minimal shape representing only information needed to render the card.
// Does not assume canonical YouTube OS state structure — this is a preliminary contract.
// ─────────────────────────────────────────────────────────────

export interface EpisodeWorkflowBlocker {
  id: string
  label: string
  severity: "critical" | "warning"
  resolvedAt?: string
}

export interface EpisodeWorkflowDecision {
  label: string
  outcome: "pass" | "pass-with-conditions" | "rework" | "stop"
  decidedBy?: string
  decidedAt?: string
}

export type EpisodeReviewStatus = "not-required" | "required" | "completed"

export interface EpisodeStateSnapshot {
  // Identity
  episodeId: string
  episodeNumber?: number
  channelName: string
  title: string

  // Workflow progression
  workflowState: string
  workflowStateLabel?: string

  // Review gate status
  reviewStatus: EpisodeReviewStatus

  // Blocking issues
  blockers: readonly EpisodeWorkflowBlocker[]

  // Decision trail (most recent relevant decision)
  lastDecision?: EpisodeWorkflowDecision

  // Next authorized action (human-readable)
  nextAuthorizedAction?: string

  // Publication confirmation (only when published)
  publication?: {
    youtubeVideoId: string
    publishedAt: string
  }

  // Source and versioning
  source?: {
    version?: string
    fetchedAt?: string
  }

  // Optional error context (for unavailable states)
  unavailableReason?: string
}
