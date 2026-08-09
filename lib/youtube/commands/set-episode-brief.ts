// Set episode brief command
// Handles both create (expectedBriefVersion: null) and update (expectedBriefVersion: N) cases
// Business errors return CommandResult; infrastructure errors throw

import type { EpisodeRepository } from "../../persistence/episode-repository-core.ts"
import type { CanonicalEpisodeBrief } from "../../persistence/canonical-types.ts"
import type { CommandResult } from "./command-result.ts"

export interface SetEpisodeBriefPayload {
  episodeId: string
  expectedBriefVersion: number | null  // null for create, N for update
  topic?: string
  angle?: string
  audience?: string
  coreQuestion?: string
  hook?: string
  thesis?: string
  editorialNotes?: string
  researchQuestions?: string[]
  actor: string
}

/**
 * Set or update an episode brief.
 *
 * CREATE (expectedBriefVersion = null):
 * - Creates brief only if none exists
 * - Topic required and non-empty
 * - Returns conflict if brief already exists
 *
 * UPDATE (expectedBriefVersion = N):
 * - Updates existing brief at version N
 * - All fields are optional; omitted fields retain existing values
 * - Increments briefVersion to N + 1
 * - Returns not_found if brief doesn't exist
 * - Returns conflict if briefVersion doesn't match
 *
 * Infrastructure failures throw.
 * Business errors return CommandResult with detailed reason.
 */
export async function setEpisodeBrief(
  repository: EpisodeRepository,
  payload: SetEpisodeBriefPayload
): Promise<CommandResult<CanonicalEpisodeBrief>> {
  // Validate input
  if (!payload.episodeId || payload.episodeId.trim() === "") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Episode ID is required",
    }
  }

  if (payload.expectedBriefVersion !== null && !Number.isInteger(payload.expectedBriefVersion)) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Expected brief version must be null or a positive integer",
    }
  }

  // CREATE mode: expectedBriefVersion = null
  if (payload.expectedBriefVersion === null) {
    if (!payload.topic || payload.topic.trim() === "") {
      return {
        success: false,
        reason: "invalid_input",
        message: "Topic is required when creating a brief",
      }
    }

    // Validate research questions if provided
    if (payload.researchQuestions !== undefined && !Array.isArray(payload.researchQuestions)) {
      return {
        success: false,
        reason: "invalid_input",
        message: "Research questions must be an array of strings",
      }
    }

    if (payload.researchQuestions) {
      for (const q of payload.researchQuestions) {
        if (typeof q !== "string") {
          return {
            success: false,
            reason: "invalid_input",
            message: "All research questions must be strings",
          }
        }
      }
    }

    // Attempt to create brief
    const result = await repository.setEpisodeBrief({
      episodeId: payload.episodeId,
      expectedBriefVersion: null,
      topic: payload.topic,
      angle: payload.angle,
      audience: payload.audience,
      coreQuestion: payload.coreQuestion,
      hook: payload.hook,
      thesis: payload.thesis,
      editorialNotes: payload.editorialNotes,
      researchQuestions: payload.researchQuestions,
    })

    if (!result.success) {
      if (result.reason === "episode_not_found") {
        return {
          success: false,
          reason: "not_found",
          message: "Episode not found",
        }
      }
      return {
        success: false,
        reason: result.reason,
        message: result.reason === "conflict"
          ? "A brief for this episode already exists"
          : "Failed to create brief",
      }
    }

    // Create audit event
    await repository.createEpisodeEvent({
      episodeId: payload.episodeId,
      eventType: "episode_brief_set",
      actor: payload.actor,
      payload: {
        operation: "created",
        briefVersionBefore: null,
        briefVersionAfter: 1,
        changedFields: getChangedFields(payload),
      },
    })

    return {
      success: true,
      value: result.brief,
      stateVersion: 1,
    }
  }

  // UPDATE mode: expectedBriefVersion = N
  const expectedVersion = payload.expectedBriefVersion
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Expected brief version must be a positive integer for updates",
    }
  }

  // Validate research questions if provided
  if (payload.researchQuestions !== undefined && !Array.isArray(payload.researchQuestions)) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Research questions must be an array of strings",
    }
  }

  if (payload.researchQuestions) {
    for (const q of payload.researchQuestions) {
      if (typeof q !== "string") {
        return {
          success: false,
          reason: "invalid_input",
          message: "All research questions must be strings",
        }
      }
    }
  }

  // Attempt to update brief
  const result = await repository.setEpisodeBrief({
    episodeId: payload.episodeId,
    expectedBriefVersion: expectedVersion,
    topic: payload.topic,
    angle: payload.angle,
    audience: payload.audience,
    coreQuestion: payload.coreQuestion,
    hook: payload.hook,
    thesis: payload.thesis,
    editorialNotes: payload.editorialNotes,
    researchQuestions: payload.researchQuestions,
  })

  if (!result.success) {
    if (result.reason === "episode_not_found") {
      return {
        success: false,
        reason: "not_found",
        message: "Episode not found",
      }
    }
    if (result.reason === "not_found") {
      return {
        success: false,
        reason: "not_found",
        message: "Brief not found for this episode",
      }
    }
    return {
      success: false,
      reason: "conflict",
      message: "Brief was modified elsewhere. Please reload and try again.",
      currentStateVersion: result.currentBriefVersion,
    }
  }

  // Create audit event
  const changedFields = getChangedFields(payload)
  if (changedFields.length > 0) {
    await repository.createEpisodeEvent({
      episodeId: payload.episodeId,
      eventType: "episode_brief_set",
      actor: payload.actor,
      payload: {
        operation: "updated",
        briefVersionBefore: expectedVersion,
        briefVersionAfter: expectedVersion + 1,
        changedFields,
      },
    })
  }

  return {
    success: true,
    value: result.brief,
    stateVersion: result.brief.briefVersion,
  }
}

/**
 * Determine which fields were actually changed in this operation.
 * Excludes actor and expectedBriefVersion.
 */
function getChangedFields(payload: SetEpisodeBriefPayload): string[] {
  const fields: string[] = []

  if (payload.topic !== undefined) fields.push("topic")
  if (payload.angle !== undefined) fields.push("angle")
  if (payload.audience !== undefined) fields.push("audience")
  if (payload.coreQuestion !== undefined) fields.push("coreQuestion")
  if (payload.hook !== undefined) fields.push("hook")
  if (payload.thesis !== undefined) fields.push("thesis")
  if (payload.editorialNotes !== undefined) fields.push("editorialNotes")
  if (payload.researchQuestions !== undefined) fields.push("researchQuestions")

  return fields
}
