import type { EpisodeRepository } from "@/lib/persistence/episode-repository-core.ts"
import type { CommandResult } from "./command-result.ts"

export interface RecordPublicationInput {
  episodeId: string
  expectedStateVersion: number
  youtubeVideoId: string
  publishedAt: string
  actor: string
}

/**
 * Record that an episode has been published to YouTube.
 * Validates workflow state is appropriate for publication.
 */
export async function recordPublication(
  repository: EpisodeRepository,
  input: RecordPublicationInput
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

  // Validate input
  if (!input.youtubeVideoId || input.youtubeVideoId.trim().length === 0) {
    return {
      success: false,
      reason: "invalid_input",
      message: "YouTube video ID is required",
      currentStateVersion: episode.stateVersion,
    }
  }

  const publishedDate = new Date(input.publishedAt)
  if (isNaN(publishedDate.getTime())) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Invalid publishedAt timestamp",
      currentStateVersion: episode.stateVersion,
    }
  }

  // Check if already published
  if (episode.youtubeVideoId) {
    return {
      success: false,
      reason: "already_published",
      message: `Episode already published with video ID: ${episode.youtubeVideoId}`,
      currentStateVersion: episode.stateVersion,
    }
  }

  // Validate workflow state is appropriate
  const publishableStates = ["FINAL_RENDER", "PUBLISH"]
  if (!publishableStates.includes(episode.workflowState)) {
    return {
      success: false,
      reason: "invalid_transition",
      message: `Episode must be in ${publishableStates.join(" or ")} state to publish. Current: ${episode.workflowState}`,
      currentStateVersion: episode.stateVersion,
    }
  }

  // Update episode with publication info
  const updateResult = await repository.updateEpisodeState({
    episodeId: input.episodeId,
    expectedStateVersion: input.expectedStateVersion,
    workflowState: "PUBLISH",
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

  // Create publication event with metadata
  await repository.createEpisodeEvent({
    episodeId: input.episodeId,
    eventType: "publication",
    actor: input.actor,
    toState: "PUBLISH",
    payload: {
      youtubeVideoId: input.youtubeVideoId,
      publishedAt: input.publishedAt,
    },
  })

  return {
    success: true,
    stateVersion: updateResult.actualVersion,
  }
}
