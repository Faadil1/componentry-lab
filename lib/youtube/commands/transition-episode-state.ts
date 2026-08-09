import type { EpisodeRepository } from "@/lib/persistence/episode-repository-core.ts"
import type { CommandResult } from "./command-result.ts"
import { isValidTransition } from "./workflow-policy.ts"

export interface TransitionEpisodeStateInput {
  episodeId: string
  expectedStateVersion: number
  toState: string
  actor: string
  reason?: string
}

/**
 * Transition an episode to the next workflow state.
 * Uses optimistic locking with state_version.
 */
export async function transitionEpisodeState(
  repository: EpisodeRepository,
  input: TransitionEpisodeStateInput
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

  // Validate transition
  if (!isValidTransition(episode.workflowState, input.toState)) {
    return {
      success: false,
      reason: "invalid_transition",
      message: `Cannot transition from ${episode.workflowState} to ${input.toState}. Must advance to next stage.`,
      currentStateVersion: episode.stateVersion,
    }
  }

  // Update state (uses optimistic locking internally)
  const updateResult = await repository.updateEpisodeState({
    episodeId: input.episodeId,
    expectedStateVersion: input.expectedStateVersion,
    workflowState: input.toState,
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
    eventType: "state_transition",
    actor: input.actor,
    fromState: episode.workflowState,
    toState: input.toState,
    payload: input.reason
      ? {
          reason: input.reason,
        }
      : undefined,
  })

  return {
    success: true,
    stateVersion: updateResult.actualVersion,
  }
}
