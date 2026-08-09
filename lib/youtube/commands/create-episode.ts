// Create episode command
// Establishes a new canonical episode with deterministic initial state
// Business errors return CommandResult; infrastructure errors throw

import type { EpisodeRepository } from "../../persistence/episode-repository-core.ts"
import type { CanonicalEpisode } from "../../persistence/canonical-types.ts"
import type { CommandResult } from "./command-result.ts"

export interface CreateEpisodePayload {
  episodeId: string
  episodeNumber: number
  channelName: string
  title: string
  actor: string
}

/**
 * Create a new episode.
 * Initial state: TOPIC, stateVersion=1, reviewStatus="not-required"
 * Duplicate episodeId returns conflict reason.
 * Infrastructure failures throw.
 */
export async function createEpisode(
  repository: EpisodeRepository,
  payload: CreateEpisodePayload
): Promise<CommandResult<CanonicalEpisode>> {
  // Validate input
  if (!payload.episodeId || payload.episodeId.trim() === "") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Episode ID is required",
    }
  }

  if (!Number.isInteger(payload.episodeNumber) || payload.episodeNumber < 1) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Episode number must be an integer >= 1",
    }
  }

  if (!payload.channelName || payload.channelName.trim() === "") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Channel name is required",
    }
  }

  if (!payload.title || payload.title.trim() === "") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Title is required",
    }
  }

  // Attempt to create episode
  // Deterministic initial state:
  // - workflowState = TOPIC (first stage)
  // - reviewStatus = not-required (default, immutable via command)
  // - stateVersion = 1 (always 1 for new episode)
  // - schemaVersion = 1 (current schema)
  // - blockers = [] (empty, set by repository)
  // - publication fields absent (no youtubeVideoId/publishedAt)
  try {
    const episode = await repository.createEpisode({
      episodeId: payload.episodeId,
      episodeNumber: payload.episodeNumber,
      channelName: payload.channelName,
      title: payload.title,
      workflowState: "TOPIC",
      reviewStatus: "not-required",
    })

    return {
      success: true,
      value: episode,
      stateVersion: 1,
    }
  } catch (error) {
    // Classify only PostgreSQL unique constraint violation (23505) as conflict
    // All other errors throw (infrastructure_error)
    const err = error as { code?: string; message?: string }
    if (err.code === "23505") {
      return {
        success: false,
        reason: "conflict",
        message: "An episode with this ID already exists",
      }
    }

    // Infrastructure error: let it throw
    throw error
  }
}
