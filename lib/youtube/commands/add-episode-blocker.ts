import type { EpisodeRepository } from "@/lib/persistence/episode-repository-core.ts"
import type { CanonicalBlocker } from "@/lib/persistence/canonical-types.ts"
import type { CommandResult } from "./command-result.ts"

export interface AddEpisodeBlockerInput {
  episodeId: string
  expectedStateVersion: number
  blockerId: string
  label: string
  severity: "low" | "medium" | "high"
  actor: string
}

/**
 * Add a blocker to an episode.
 * Rejects duplicate unresolved blocker IDs.
 */
export async function addEpisodeBlocker(
  repository: EpisodeRepository,
  input: AddEpisodeBlockerInput
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

  // Check for duplicate unresolved blocker
  const existingBlocker = episode.blockers.find(
    (b) => b.id === input.blockerId && !b.resolvedAt
  )
  if (existingBlocker) {
    return {
      success: false,
      reason: "invalid_input",
      message: `Blocker ${input.blockerId} already exists and is unresolved`,
      currentStateVersion: episode.stateVersion,
    }
  }

  // Create new blocker
  const now = new Date().toISOString()
  const blocker: CanonicalBlocker = {
    id: input.blockerId,
    code: input.blockerId.toUpperCase(),
    label: input.label,
    severity: input.severity,
    source: input.actor,
    createdAt: now,
  }

  // Update blockers list
  const updatedBlockers = [...episode.blockers, blocker]

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
    eventType: "blocker_added",
    actor: input.actor,
    payload: {
      blockerId: input.blockerId,
      label: input.label,
      severity: input.severity,
    },
  })

  return {
    success: true,
    stateVersion: updateResult.actualVersion,
  }
}
