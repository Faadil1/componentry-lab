import type { EpisodeRepository } from "@/lib/persistence/episode-repository-core.ts"
import type { CanonicalDecision } from "@/lib/persistence/canonical-types.ts"
import type { CommandResult } from "./command-result.ts"

export interface RecordHumanDecisionInput {
  episodeId: string
  expectedStateVersion: number
  outcome: "pass" | "pass-with-conditions" | "rework" | "stop"
  label: string
  actor: string
  decidedAt?: string
}

/**
 * Record a human decision (approval/rejection gate).
 * Does NOT automatically advance workflow state.
 */
export async function recordHumanDecision(
  repository: EpisodeRepository,
  input: RecordHumanDecisionInput
): Promise<CommandResult<void>> {
  // Load current episode
  const episode = await repository.getEpisodeById(input.episodeId)

  if (!episode) {
    return {
      success: false,
      reason: "not_found",
      message: `Episode ${input.episodeId} not found`,
      currentStateVersion: 0,
    }
  }

  // Check version conflict
  if (episode.stateVersion !== input.expectedStateVersion) {
    return {
      success: false,
      reason: "conflict",
      message: "Episode state changed since page load. Refresh and try again.",
      currentStateVersion: episode.stateVersion,
    }
  }

  // Create decision record
  const decision: CanonicalDecision = {
    outcome: input.outcome,
    decidedBy: input.actor,
    decidedAt: input.decidedAt || new Date().toISOString(),
    notes: input.label,
  }

  // Map outcome to review status
  const reviewStatus = input.outcome === "pass" ? "completed" : "in-progress"

  // Update state
  const updateResult = await repository.updateEpisodeState({
    episodeId: input.episodeId,
    expectedStateVersion: input.expectedStateVersion,
    latestDecision: decision,
    reviewStatus,
  })

  if (!updateResult.success) {
    return {
      success: false,
      reason: updateResult.reason === "conflict" ? "conflict" : "not_found",
      message:
        updateResult.reason === "conflict"
          ? "Episode state changed. Refresh and try again."
          : "Episode not found",
      currentStateVersion: updateResult.actualVersion,
    }
  }

  // Append audit event
  await repository.createEpisodeEvent({
    episodeId: input.episodeId,
    eventType: "human_decision",
    actor: input.actor,
    payload: {
      outcome: input.outcome,
      label: input.label,
      decidedAt: decision.decidedAt,
    },
  })

  return {
    success: true,
    stateVersion: updateResult.actualVersion,
  }
}
