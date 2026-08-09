// Set episode research command
// Handles both create (expectedResearchVersion: null) and update (expectedResearchVersion: N) cases
// Business errors return CommandResult; infrastructure errors throw

import type { EpisodeRepository } from "../../persistence/episode-repository-core.ts"
import type { CanonicalEpisodeResearch, ResearchFinding, ResearchSource, ResearchContradiction } from "../../persistence/canonical-types.ts"
import type { CommandResult } from "./command-result.ts"

export interface SetEpisodeResearchPayload {
  episodeId: string
  expectedResearchVersion: number | null  // null for create, N for update
  summary?: string
  keyFindings?: ResearchFinding[]
  sources?: ResearchSource[]
  openQuestions?: string[]
  contradictions?: ResearchContradiction[]
  actor: string
}

/**
 * Set or update an episode research packet.
 *
 * CREATE (expectedResearchVersion = null):
 * - Creates research only if none exists
 * - Returns conflict if research already exists
 *
 * UPDATE (expectedResearchVersion = N):
 * - Updates existing research at version N
 * - All fields are optional; omitted fields retain existing values
 * - Increments researchVersion to N + 1 only if fields actually changed
 * - Returns not_found if research doesn't exist
 * - Returns conflict if researchVersion doesn't match
 * - No-op updates (same values) return success without mutation/versioning
 *
 * Infrastructure failures throw.
 * Business errors return CommandResult with detailed reason.
 */
export async function setEpisodeResearch(
  repository: EpisodeRepository,
  payload: SetEpisodeResearchPayload
): Promise<CommandResult<CanonicalEpisodeResearch>> {
  // Validate input
  if (!payload.episodeId || payload.episodeId.trim() === "") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Episode ID is required",
    }
  }

  if (payload.expectedResearchVersion !== null && !Number.isInteger(payload.expectedResearchVersion)) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Expected research version must be null or a positive integer",
    }
  }

  // Validate arrays and their contents
  const validationError = validateResearchPayload(payload)
  if (validationError) {
    return validationError
  }

  // CREATE mode: expectedResearchVersion = null
  if (payload.expectedResearchVersion === null) {
    // Attempt to create research
    const result = await repository.setEpisodeResearch({
      episodeId: payload.episodeId,
      expectedResearchVersion: null,
      summary: payload.summary,
      keyFindings: payload.keyFindings,
      sources: payload.sources,
      openQuestions: payload.openQuestions,
      contradictions: payload.contradictions,
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
          ? "Research for this episode already exists"
          : "Failed to create research",
      }
    }

    // Create audit event
    await repository.createEpisodeEvent({
      episodeId: payload.episodeId,
      eventType: "episode_research_set",
      actor: payload.actor,
      payload: {
        operation: "created",
        researchVersionBefore: null,
        researchVersionAfter: 1,
        changedFields: getChangedFields(payload),
      },
    })

    return {
      success: true,
      value: result.research,
      stateVersion: 1,
    }
  }

  // UPDATE mode: expectedResearchVersion = N
  const expectedVersion = payload.expectedResearchVersion
  if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Expected research version must be a positive integer for updates",
    }
  }

  // Fetch current research to detect no-op updates
  const currentResearch = await repository.getEpisodeResearch(payload.episodeId)

  if (!currentResearch) {
    return {
      success: false,
      reason: "not_found",
      message: "Research not found for this episode",
    }
  }

  if (currentResearch.researchVersion !== expectedVersion) {
    return {
      success: false,
      reason: "conflict",
      message: "Research was modified elsewhere. Please reload and try again.",
      currentStateVersion: currentResearch.researchVersion,
    }
  }

  // Detect semantic changes
  const changedFields = detectSemanticChanges(payload, currentResearch)

  // No-op: return current research without mutation
  if (changedFields.length === 0) {
    return {
      success: true,
      value: currentResearch,
      stateVersion: currentResearch.researchVersion,
    }
  }

  // Actual changes detected: perform update
  const result = await repository.setEpisodeResearch({
    episodeId: payload.episodeId,
    expectedResearchVersion: expectedVersion,
    summary: payload.summary,
    keyFindings: payload.keyFindings,
    sources: payload.sources,
    openQuestions: payload.openQuestions,
    contradictions: payload.contradictions,
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
        message: "Research not found for this episode",
      }
    }
    return {
      success: false,
      reason: "conflict",
      message: "Research was modified elsewhere. Please reload and try again.",
      currentStateVersion: result.currentResearchVersion,
    }
  }

  // Create audit event
  await repository.createEpisodeEvent({
    episodeId: payload.episodeId,
    eventType: "episode_research_set",
    actor: payload.actor,
    payload: {
      operation: "updated",
      researchVersionBefore: expectedVersion,
      researchVersionAfter: expectedVersion + 1,
      changedFields,
    },
  })

  return {
    success: true,
    value: result.research,
    stateVersion: result.research.researchVersion,
  }
}

/**
 * Validate research payload fields.
 * Returns a CommandResult error if validation fails, null if valid.
 */
function validateResearchPayload(payload: SetEpisodeResearchPayload): CommandResult<never> | null {
  // Validate summary if provided
  if (payload.summary !== undefined && typeof payload.summary !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Summary must be a string",
    }
  }

  // Validate keyFindings array
  if (payload.keyFindings !== undefined) {
    if (!Array.isArray(payload.keyFindings)) {
      return {
        success: false,
        reason: "invalid_input",
        message: "Key findings must be an array",
      }
    }

    for (const finding of payload.keyFindings) {
      const fieldError = validateFinding(finding)
      if (fieldError) return fieldError
    }
  }

  // Validate sources array
  if (payload.sources !== undefined) {
    if (!Array.isArray(payload.sources)) {
      return {
        success: false,
        reason: "invalid_input",
        message: "Sources must be an array",
      }
    }

    for (const source of payload.sources) {
      const fieldError = validateSource(source)
      if (fieldError) return fieldError
    }
  }

  // Validate openQuestions array
  if (payload.openQuestions !== undefined) {
    if (!Array.isArray(payload.openQuestions)) {
      return {
        success: false,
        reason: "invalid_input",
        message: "Open questions must be an array",
      }
    }

    for (const question of payload.openQuestions) {
      if (typeof question !== "string") {
        return {
          success: false,
          reason: "invalid_input",
          message: "All open questions must be strings",
        }
      }
      if (question.trim() === "") {
        return {
          success: false,
          reason: "invalid_input",
          message: "Open questions cannot be blank",
        }
      }
    }
  }

  // Validate contradictions array
  if (payload.contradictions !== undefined) {
    if (!Array.isArray(payload.contradictions)) {
      return {
        success: false,
        reason: "invalid_input",
        message: "Contradictions must be an array",
      }
    }

    for (const contradiction of payload.contradictions) {
      const fieldError = validateContradiction(contradiction)
      if (fieldError) return fieldError
    }
  }

  return null
}

function validateFinding(finding: ResearchFinding): CommandResult<never> | null {
  if (!finding.id || typeof finding.id !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Finding ID must be a non-empty string",
    }
  }

  if (!finding.statement || typeof finding.statement !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Finding statement must be a non-empty string",
    }
  }

  if (finding.statement.trim() === "") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Finding statement cannot be blank",
    }
  }

  if (!Array.isArray(finding.sourceIds)) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Finding sourceIds must be an array",
    }
  }

  for (const sourceId of finding.sourceIds) {
    if (typeof sourceId !== "string" || sourceId.trim() === "") {
      return {
        success: false,
        reason: "invalid_input",
        message: "All finding source IDs must be non-empty strings",
      }
    }
  }

  if (finding.notes !== undefined && typeof finding.notes !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Finding notes must be a string",
    }
  }

  return null
}

function validateSource(source: ResearchSource): CommandResult<never> | null {
  if (!source.id || typeof source.id !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source ID must be a non-empty string",
    }
  }

  if (!source.title || typeof source.title !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source title must be a non-empty string",
    }
  }

  if (source.title.trim() === "") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source title cannot be blank",
    }
  }

  if (source.url !== undefined && typeof source.url !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source URL must be a string",
    }
  }

  if (source.publisher !== undefined && typeof source.publisher !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source publisher must be a string",
    }
  }

  if (source.author !== undefined && typeof source.author !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source author must be a string",
    }
  }

  if (source.publishedAt !== undefined && typeof source.publishedAt !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source publishedAt must be a string",
    }
  }

  if (source.accessedAt !== undefined && typeof source.accessedAt !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source accessedAt must be a string",
    }
  }

  if (source.notes !== undefined && typeof source.notes !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Source notes must be a string",
    }
  }

  return null
}

function validateContradiction(contradiction: ResearchContradiction): CommandResult<never> | null {
  if (!contradiction.id || typeof contradiction.id !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Contradiction ID must be a non-empty string",
    }
  }

  if (!contradiction.description || typeof contradiction.description !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Contradiction description must be a non-empty string",
    }
  }

  if (contradiction.description.trim() === "") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Contradiction description cannot be blank",
    }
  }

  if (!Array.isArray(contradiction.sourceIds)) {
    return {
      success: false,
      reason: "invalid_input",
      message: "Contradiction sourceIds must be an array",
    }
  }

  for (const sourceId of contradiction.sourceIds) {
    if (typeof sourceId !== "string" || sourceId.trim() === "") {
      return {
        success: false,
        reason: "invalid_input",
        message: "All contradiction source IDs must be non-empty strings",
      }
    }
  }

  return null
}

/**
 * Determine which fields were actually changed in this operation for CREATE.
 * Excludes actor and expectedResearchVersion.
 */
function getChangedFields(payload: SetEpisodeResearchPayload): string[] {
  const fields: string[] = []

  if (payload.summary !== undefined) fields.push("summary")
  if (payload.keyFindings !== undefined) fields.push("keyFindings")
  if (payload.sources !== undefined) fields.push("sources")
  if (payload.openQuestions !== undefined) fields.push("openQuestions")
  if (payload.contradictions !== undefined) fields.push("contradictions")

  return fields
}

/**
 * Detect semantic changes between payload and current research.
 * Compares arrays by deep equality.
 */
function detectSemanticChanges(
  payload: SetEpisodeResearchPayload,
  currentResearch: CanonicalEpisodeResearch
): string[] {
  const changed: string[] = []

  // Normalize string field: trim and convert empty to undefined
  const normalize = (value: string | undefined): string | undefined => {
    if (value === undefined) return undefined
    const trimmed = value.trim()
    return trimmed === "" ? undefined : trimmed
  }

  // Summary: compare normalized values
  if (payload.summary !== undefined) {
    const normalizedPayload = normalize(payload.summary)
    const normalizedCurrent = normalize(currentResearch.summary)
    if (normalizedPayload !== normalizedCurrent) {
      changed.push("summary")
    }
  }

  // Key findings: ordered array comparison
  if (payload.keyFindings !== undefined) {
    const payloadFindings = payload.keyFindings || []
    const currentFindings = currentResearch.keyFindings || []
    if (!deepArraysEqual(payloadFindings, currentFindings)) {
      changed.push("keyFindings")
    }
  }

  // Sources: ordered array comparison
  if (payload.sources !== undefined) {
    const payloadSources = payload.sources || []
    const currentSources = currentResearch.sources || []
    if (!deepArraysEqual(payloadSources, currentSources)) {
      changed.push("sources")
    }
  }

  // Open questions: ordered array comparison
  if (payload.openQuestions !== undefined) {
    const payloadQuestions = payload.openQuestions || []
    const currentQuestions = currentResearch.openQuestions || []
    if (!arraysEqual(payloadQuestions, currentQuestions)) {
      changed.push("openQuestions")
    }
  }

  // Contradictions: ordered array comparison
  if (payload.contradictions !== undefined) {
    const payloadContradictions = payload.contradictions || []
    const currentContradictions = currentResearch.contradictions || []
    if (!deepArraysEqual(payloadContradictions, currentContradictions)) {
      changed.push("contradictions")
    }
  }

  return changed
}

/**
 * Compare two arrays of strings for equality (order matters).
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Deep equality comparison for objects (findings, sources, contradictions).
 */
function deepArraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false
  }
  return true
}
