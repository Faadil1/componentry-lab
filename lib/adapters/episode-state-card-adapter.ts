// ─────────────────────────────────────────────────────────────
// Episode State Card Adapter
// ─────────────────────────────────────────────────────────────
// Pure function: EpisodeStateSnapshot → EpisodeStateCardProps
// Deterministic mapping from domain state to UI contract.
// No side effects, no network, no mutations.
// ─────────────────────────────────────────────────────────────

import type { EpisodeStateCardProps } from "@/components/workflow/episode-state-card"
import type {
  EpisodeStateSnapshot,
  EpisodeWorkflowBlocker,
} from "@/lib/domain/episode-state"

/**
 * Maps an episode state snapshot to EpisodeStateCard props.
 * Returns a discriminated union satisfying EpisodeStateCardProps.
 *
 * Variant selection rules (in order of evaluation):
 * 1. null/invalid snapshot → unavailable
 * 2. Valid publication (videoId + publishedAt) → published
 * 3. Explicit approval + completed review → approved
 * 4. Review required (reviewStatus === "required") → human-review-required
 * 5. Unresolved blockers → blocked
 * 6. Otherwise → default
 *
 * DESIGN DECISION: Published state takes precedence.
 * Rationale: A published episode is immutable and represents completion,
 * so stale blockers from pre-publication stages must not degrade it.
 * Approval also takes precedence over blockers to represent the gate outcome.
 */
export function episodeStateSnapshotToCardProps(
  snapshot: EpisodeStateSnapshot | null
): EpisodeStateCardProps {
  // Rule 1: Missing or invalid snapshot
  if (!snapshot) {
    return {
      variant: "unavailable",
    }
  }

  // Rule 1b: Snapshot with unavailable reason (explicit source failure)
  if (snapshot.unavailableReason) {
    return {
      variant: "unavailable",
      unavailableReason: snapshot.unavailableReason,
    }
  }

  // Rule 2: Valid publication (both fields required)
  if (
    snapshot.publication?.youtubeVideoId &&
    snapshot.publication?.publishedAt
  ) {
    return {
      variant: "published",
      channelName: snapshot.channelName,
      title: snapshot.title,
      workflowState: snapshot.workflowState,
      workflowStateLabel: snapshot.workflowStateLabel,
      humanReviewStatus: "completed",
      youtubeVideoId: snapshot.publication.youtubeVideoId,
      publishedAt: snapshot.publication.publishedAt,
      episodeNumber: snapshot.episodeNumber,
      lastDecision: snapshot.lastDecision,
      canonicalSource: `episode-${snapshot.episodeId}`,
      manifestVersion: snapshot.source?.version,
    }
  }

  // Rule 3: Explicit approval (completed review + lastDecision indicating pass or pass-with-conditions)
  if (
    snapshot.reviewStatus === "completed" &&
    (snapshot.lastDecision?.outcome === "pass" ||
      snapshot.lastDecision?.outcome === "pass-with-conditions")
  ) {
    return {
      variant: "approved",
      channelName: snapshot.channelName,
      title: snapshot.title,
      workflowState: snapshot.workflowState,
      workflowStateLabel: snapshot.workflowStateLabel,
      humanReviewStatus: "completed",
      episodeNumber: snapshot.episodeNumber,
      lastDecision: snapshot.lastDecision,
      nextExpectedState: "ASSET_REPLACEMENT",
      canonicalSource: `episode-${snapshot.episodeId}`,
      manifestVersion: snapshot.source?.version,
    }
  }

  // Rule 4: Review required (explicit gate waiting for review)
  if (snapshot.reviewStatus === "required") {
    return {
      variant: "human-review-required",
      channelName: snapshot.channelName,
      title: snapshot.title,
      workflowState: snapshot.workflowState,
      workflowStateLabel: snapshot.workflowStateLabel,
      humanReviewStatus: "required",
      episodeNumber: snapshot.episodeNumber,
      nextAuthorizedAction:
        snapshot.nextAuthorizedAction || "Proceed with review",
      canonicalSource: `episode-${snapshot.episodeId}`,
      manifestVersion: snapshot.source?.version,
    }
  }

  // Rule 5: Unresolved blockers
  if (snapshot.blockers.length > 0) {
    const unresolvedBlockers = snapshot.blockers.filter((b) => !b.resolvedAt)
    if (unresolvedBlockers.length > 0) {
      const blockers: readonly [
        EpisodeWorkflowBlocker,
        ...EpisodeWorkflowBlocker[]
      ] = [unresolvedBlockers[0], ...unresolvedBlockers.slice(1)]
      return {
        variant: "blocked" as const,
        channelName: snapshot.channelName,
        title: snapshot.title,
        workflowState: snapshot.workflowState,
        workflowStateLabel: snapshot.workflowStateLabel,
        humanReviewStatus: snapshot.reviewStatus,
        blockers,
        episodeNumber: snapshot.episodeNumber,
        lastDecision: snapshot.lastDecision,
        nextAuthorizedAction:
          snapshot.nextAuthorizedAction || "Resolve blocking conditions",
        canonicalSource: `episode-${snapshot.episodeId}`,
        manifestVersion: snapshot.source?.version,
      }
    }
  }

  // Rule 6: Default state (in progress, no blockers, no review gate)
  return {
    variant: "default",
    channelName: snapshot.channelName,
    title: snapshot.title,
    workflowState: snapshot.workflowState,
    workflowStateLabel: snapshot.workflowStateLabel,
    humanReviewStatus: snapshot.reviewStatus,
    episodeNumber: snapshot.episodeNumber,
    lastDecision: snapshot.lastDecision,
    nextAuthorizedAction: snapshot.nextAuthorizedAction,
    canonicalSource: `episode-${snapshot.episodeId}`,
    manifestVersion: snapshot.source?.version,
  }
}
