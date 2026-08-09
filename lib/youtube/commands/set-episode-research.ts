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

  // Validate patch structure (basic field/content validation)
  const structureError = validateResearchPatchStructure(payload)
  if (structureError) {
    return structureError
  }

  // CREATE mode: expectedResearchVersion = null
  if (payload.expectedResearchVersion === null) {
    // Build complete packet for CREATE (all fields supplied or defaulted)
    const completePacket: CanonicalEpisodeResearch = {
      episodeId: payload.episodeId,
      summary: payload.summary,
      keyFindings: payload.keyFindings || [],
      sources: payload.sources || [],
      openQuestions: payload.openQuestions || [],
      contradictions: payload.contradictions || [],
      schemaVersion: 1,
      researchVersion: 0, // Not yet persisted
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Validate complete packet referential integrity
    const contentError = validateCanonicalResearchContent(completePacket)
    if (contentError) {
      return contentError
    }

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

  // For UPDATE, build and validate effective packet (merged payload + current research)
  const effectiveSources = payload.sources !== undefined ? payload.sources : currentResearch.sources
  const effectiveFindings = payload.keyFindings !== undefined ? payload.keyFindings : currentResearch.keyFindings
  const effectiveOpenQuestions = payload.openQuestions !== undefined ? payload.openQuestions : currentResearch.openQuestions
  const effectiveContradictions = payload.contradictions !== undefined ? payload.contradictions : currentResearch.contradictions
  const effectiveSummary = payload.summary !== undefined ? payload.summary : currentResearch.summary

  const effectivePacket: CanonicalEpisodeResearch = {
    episodeId: payload.episodeId,
    summary: effectiveSummary,
    keyFindings: effectiveFindings,
    sources: effectiveSources,
    openQuestions: effectiveOpenQuestions,
    contradictions: effectiveContradictions,
    schemaVersion: currentResearch.schemaVersion,
    researchVersion: currentResearch.researchVersion,
    createdAt: currentResearch.createdAt,
    updatedAt: currentResearch.updatedAt,
  }

  // Validate effective packet referential integrity
  const contentError = validateCanonicalResearchContent(effectivePacket)
  if (contentError) {
    return contentError
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
 * Validate research patch structure: field types and content.
 * Does NOT validate cross-field referential integrity.
 * Returns a CommandResult error if validation fails, null if valid.
 */
function validateResearchPatchStructure(payload: SetEpisodeResearchPayload): CommandResult<never> | null {
  // Validate summary if provided
  if (payload.summary !== undefined && typeof payload.summary !== "string") {
    return {
      success: false,
      reason: "invalid_input",
      message: "Summary must be a string",
    }
  }

  // Validate sources array structure
  if (payload.sources !== undefined) {
    if (!Array.isArray(payload.sources)) {
      return {
        success: false,
        reason: "invalid_input",
        message: "Sources must be an array",
      }
    }

    // Check for duplicate source IDs and validate each source field
    const sourceIdsSeen = new Set<string>()
    for (const source of payload.sources) {
      const fieldError = validateSource(source)
      if (fieldError) return fieldError

      if (sourceIdsSeen.has(source.id)) {
        return {
          success: false,
          reason: "invalid_input",
          message: `Duplicate source ID: ${source.id}`,
        }
      }
      sourceIdsSeen.add(source.id)
    }
  }

  // Validate keyFindings array structure
  if (payload.keyFindings !== undefined) {
    if (!Array.isArray(payload.keyFindings)) {
      return {
        success: false,
        reason: "invalid_input",
        message: "Key findings must be an array",
      }
    }

    // Check for duplicate finding IDs and validate each finding field
    const findingIdsSeen = new Set<string>()
    for (const finding of payload.keyFindings) {
      const fieldError = validateFinding(finding)
      if (fieldError) return fieldError

      if (findingIdsSeen.has(finding.id)) {
        return {
          success: false,
          reason: "invalid_input",
          message: `Duplicate finding ID: ${finding.id}`,
        }
      }
      findingIdsSeen.add(finding.id)
    }
  }

  // Validate openQuestions array structure
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

  // Validate contradictions array structure
  if (payload.contradictions !== undefined) {
    if (!Array.isArray(payload.contradictions)) {
      return {
        success: false,
        reason: "invalid_input",
        message: "Contradictions must be an array",
      }
    }

    // Check for duplicate contradiction IDs and validate each contradiction field
    const contradictionIdsSeen = new Set<string>()
    for (const contradiction of payload.contradictions) {
      const fieldError = validateContradiction(contradiction)
      if (fieldError) return fieldError

      if (contradictionIdsSeen.has(contradiction.id)) {
        return {
          success: false,
          reason: "invalid_input",
          message: `Duplicate contradiction ID: ${contradiction.id}`,
        }
      }
      contradictionIdsSeen.add(contradiction.id)
    }
  }

  return null
}

/**
 * Validate a complete canonical research packet including referential integrity.
 * Assumes all fields are defined (not partial patch).
 * Returns a CommandResult error if validation fails, null if valid.
 */
function validateCanonicalResearchContent(research: CanonicalEpisodeResearch): CommandResult<never> | null {
  // Check for duplicate source IDs across entire sources array
  const sourceIdsSeen = new Set<string>()
  const sourceIds = new Set<string>()
  for (const source of research.sources) {
    if (sourceIdsSeen.has(source.id)) {
      return {
        success: false,
        reason: "invalid_input",
        message: `Duplicate source ID: ${source.id}`,
      }
    }
    sourceIdsSeen.add(source.id)
    sourceIds.add(source.id)
  }

  // Validate findings referential integrity
  const findingIdsSeen = new Set<string>()
  for (const finding of research.keyFindings) {
    if (findingIdsSeen.has(finding.id)) {
      return {
        success: false,
        reason: "invalid_input",
        message: `Duplicate finding ID: ${finding.id}`,
      }
    }
    findingIdsSeen.add(finding.id)

    // Each finding must reference valid sources
    for (const refSourceId of finding.sourceIds) {
      if (!sourceIds.has(refSourceId)) {
        return {
          success: false,
          reason: "invalid_input",
          message: `Finding references non-existent source ID: ${refSourceId}`,
        }
      }
    }
  }

  // Validate contradictions referential integrity
  const contradictionIdsSeen = new Set<string>()
  for (const contradiction of research.contradictions) {
    if (contradictionIdsSeen.has(contradiction.id)) {
      return {
        success: false,
        reason: "invalid_input",
        message: `Duplicate contradiction ID: ${contradiction.id}`,
      }
    }
    contradictionIdsSeen.add(contradiction.id)

    // Each contradiction must reference valid sources
    for (const refSourceId of contradiction.sourceIds) {
      if (!sourceIds.has(refSourceId)) {
        return {
          success: false,
          reason: "invalid_input",
          message: `Contradiction references non-existent source ID: ${refSourceId}`,
        }
      }
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
 * Uses field-specific comparators (not JSON.stringify).
 */
function detectSemanticChanges(
  payload: SetEpisodeResearchPayload,
  currentResearch: CanonicalEpisodeResearch
): string[] {
  const changed: string[] = []

  // Summary: compare normalized values
  if (payload.summary !== undefined) {
    const normalizedPayload = normalizeString(payload.summary)
    const normalizedCurrent = normalizeString(currentResearch.summary)
    if (normalizedPayload !== normalizedCurrent) {
      changed.push("summary")
    }
  }

  // Key findings: ordered array comparison
  if (payload.keyFindings !== undefined) {
    const payloadFindings = payload.keyFindings || []
    const currentFindings = currentResearch.keyFindings || []
    if (!findingArraysEqual(payloadFindings, currentFindings)) {
      changed.push("keyFindings")
    }
  }

  // Sources: ordered array comparison
  if (payload.sources !== undefined) {
    const payloadSources = payload.sources || []
    const currentSources = currentResearch.sources || []
    if (!sourceArraysEqual(payloadSources, currentSources)) {
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
    if (!contradictionArraysEqual(payloadContradictions, currentContradictions)) {
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
 * Compare two ResearchSource objects for semantic equality.
 * Does not rely on JSON.stringify to handle JSONB key ordering.
 */
function sourcesEqual(a: ResearchSource, b: ResearchSource): boolean {
  if (a.id !== b.id) return false
  if (a.title !== b.title) return false
  if (normalizeString(a.url) !== normalizeString(b.url)) return false
  if (normalizeString(a.publisher) !== normalizeString(b.publisher)) return false
  if (normalizeString(a.author) !== normalizeString(b.author)) return false
  if ((a.publishedAt || undefined) !== (b.publishedAt || undefined)) return false
  if ((a.accessedAt || undefined) !== (b.accessedAt || undefined)) return false
  if (normalizeString(a.notes) !== normalizeString(b.notes)) return false
  return true
}

/**
 * Compare two ResearchFinding objects for semantic equality.
 * Does not rely on JSON.stringify to handle JSONB key ordering.
 */
function findingsEqual(a: ResearchFinding, b: ResearchFinding): boolean {
  if (a.id !== b.id) return false
  if (a.statement !== b.statement) return false
  if (normalizeString(a.notes) !== normalizeString(b.notes)) return false
  if (!sourceIdArraysEqual(a.sourceIds, b.sourceIds)) return false
  return true
}

/**
 * Compare two ResearchContradiction objects for semantic equality.
 * Does not rely on JSON.stringify to handle JSONB key ordering.
 */
function contradictionsEqual(a: ResearchContradiction, b: ResearchContradiction): boolean {
  if (a.id !== b.id) return false
  if (a.description !== b.description) return false
  if (!sourceIdArraysEqual(a.sourceIds, b.sourceIds)) return false
  return true
}

/**
 * Compare source ID arrays for equality (order matters).
 */
function sourceIdArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Normalize optional string fields (trim and convert empty to undefined).
 */
function normalizeString(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}

/**
 * Deep equality comparison for finding arrays.
 */
function findingArraysEqual(a: ResearchFinding[], b: ResearchFinding[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!findingsEqual(a[i], b[i])) return false
  }
  return true
}

/**
 * Deep equality comparison for source arrays.
 */
function sourceArraysEqual(a: ResearchSource[], b: ResearchSource[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!sourcesEqual(a[i], b[i])) return false
  }
  return true
}

/**
 * Deep equality comparison for contradiction arrays.
 */
function contradictionArraysEqual(a: ResearchContradiction[], b: ResearchContradiction[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!contradictionsEqual(a[i], b[i])) return false
  }
  return true
}
