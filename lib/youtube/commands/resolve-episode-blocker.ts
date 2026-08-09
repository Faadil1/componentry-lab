import type { EpisodeRepository } from "@/lib/persistence/episode-repository-core.ts"
import type { CommandResult } from "./command-result.ts"

export interface ResolveEpisodeBlockerInput {
  episodeId: string
  expectedStateVersion: number
  blockerId: string
  actor: string
  resolvedAt?: string
}

/**
 * Resolve (mark as resolved) an episode blocker.
 * Does not delete blocker history.
 */
export async function resolveEpisodeBlocker(
  repository: EpisodeRepository,
  input: ResolveEpisodeBlockerInput
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

  // Find blocker
  const blocker = episode.blockers.find((b) => b.id === input.blockerId)
  if (!blocker) {
    return {
      success: false,
      reason: "not_found",
      message: `Blocker ${input.blockerId} not found`,
      currentStateVersion: episode.stateVersion,
    }
  }

  // Check if already resolved
  if (blocker.resolvedAt) {
    return {
      success: false,
      reason: "already_resolved",
      message: `Blocker ${input.blockerId} is already resolved`,
      currentStateVersion: episode.stateVersion,
    }
  }

  // Update blocker with resolved timestamp
  const now = input.resolvedAt || new Date().toISOString()
  const updatedBlockers = episode.blockers.map((b) =>
    b.id === input.blockerId ? { ...b, resolvedAt: now } : b
  )

  const updateResult = await repository.updateEpisodeState({
    episodeId: input.episodeId,
    expectedStateVersion: input.expectedStateVersion,
    blockers: updatedBlockers,
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
    eventType: "blocker_resolved",
    actor: input.actor,
    payload: {
      blockerId: input.blockerId,
      resolvedAt: now,
    },
  })

  return {
    success: true,
    stateVersion: updateResult.actualVersion,
  }
}
