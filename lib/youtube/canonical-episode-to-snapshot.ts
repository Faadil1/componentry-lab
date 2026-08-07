// ─────────────────────────────────────────────────────────────
// Canonical Episode to Snapshot Mapper
// ─────────────────────────────────────────────────────────────
// Pure, testable conversion from persistence layer to domain.
// Maps CanonicalEpisode (Neon) -> EpisodeStateSnapshot (UI contract).
// ─────────────────────────────────────────────────────────────

import type {
  CanonicalEpisode,
  CanonicalBlocker,
  CanonicalDecision,
} from "../persistence/canonical-types.ts"
import type {
  EpisodeStateSnapshot,
  EpisodeWorkflowBlocker,
  EpisodeWorkflowDecision,
} from "../domain/episode-state.ts"

/**
 * Map persistence blocker to domain blocker.
 */
function mapBlocker(blocker: CanonicalBlocker): EpisodeWorkflowBlocker {
  return {
    id: blocker.id,
    label: blocker.label,
    severity: blocker.severity === "high" ? "critical" : "warning",
    resolvedAt: blocker.resolvedAt,
  }
}

/**
 * Map persistence decision to domain decision.
 */
function mapDecision(decision: CanonicalDecision): EpisodeWorkflowDecision {
  return {
    label: decision.outcome.split("-").join(" "),
    outcome: decision.outcome as "pass" | "pass-with-conditions" | "rework" | "stop",
    decidedBy: decision.decidedBy,
    decidedAt: decision.decidedAt,
  }
}

/**
 * Map canonical episode from persistence layer to domain snapshot for UI.
 *
 * @param canonical episode from Neon
 * @returns snapshot suitable for UI rendering
 */
export function mapCanonicalEpisodeToSnapshot(
  canonical: CanonicalEpisode
): EpisodeStateSnapshot {
  const snapshot: EpisodeStateSnapshot = {
    episodeId: canonical.episodeId,
    episodeNumber: canonical.episodeNumber,
    channelName: canonical.channelName,
    title: canonical.title,

    workflowState: canonical.workflowState,
    reviewStatus: canonical.reviewStatus as "not-required" | "required" | "completed",

    blockers: canonical.blockers.map(mapBlocker),

    lastDecision: canonical.latestDecision ? mapDecision(canonical.latestDecision) : undefined,

    source: {
      version: "database",
      fetchedAt: new Date().toISOString(),
    },
  }

  // Add publication info if published
  if (canonical.youtubeVideoId) {
    snapshot.publication = {
      youtubeVideoId: canonical.youtubeVideoId,
      publishedAt: canonical.publishedAt || new Date().toISOString(),
    }
  }

  return snapshot
}
