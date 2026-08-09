// ─────────────────────────────────────────────────────────────
// Episode Row Mappers
// ─────────────────────────────────────────────────────────────
// Pure, testable conversion from database rows to domain types.
// No Next.js, no server-only, no external dependencies.
// ─────────────────────────────────────────────────────────────

import type {
  CanonicalEpisode,
  CanonicalEpisodeEvent,
  CanonicalEpisodeBrief,
  CanonicalBlocker,
  CanonicalDecision,
} from "./canonical-types"

/**
 * Database row representation for episodes.
 * Reflects actual PostgreSQL column types and names.
 */
export interface EpisodeRow {
  episode_id: string
  episode_number: number | null
  channel_name: string
  title: string
  workflow_state: string
  review_status: string
  blockers: CanonicalBlocker[] | null
  latest_decision: CanonicalDecision | null
  youtube_video_id: string | null
  published_at: string | Date | null
  schema_version: number
  state_version: number
  created_at: string | Date
  updated_at: string | Date
}

/**
 * Database row representation for events.
 * Reflects actual PostgreSQL column types and names.
 */
export interface EpisodeEventRow {
  event_id: string
  episode_id: string
  event_type: string
  actor: string
  from_state: string | null
  to_state: string | null
  payload: unknown | null
  idempotency_key: string | null
  created_at: string | Date
}

/**
 * Database row representation for episode briefs.
 * Reflects actual PostgreSQL column types and names.
 */
export interface EpisodeBriefRow {
  episode_id: string
  topic: string
  angle: string | null
  audience: string | null
  core_question: string | null
  hook: string | null
  thesis: string | null
  editorial_notes: string | null
  research_questions: string[] | null
  schema_version: number
  brief_version: number
  created_at: string | Date
  updated_at: string | Date
}

/**
 * Normalize timestamp to ISO 8601 string.
 *
 * @param value - timestamp from database (Date, string, or null)
 * @param fieldName - field name for error messages
 * @param isRequired - whether null is allowed
 * @returns ISO 8601 string or undefined
 * @throws if required field is missing or invalid type
 */
export function normalizeTimestamp(
  value: unknown,
  fieldName: string,
  isRequired: boolean = true
): string | undefined {
  // Handle null/undefined
  if (value === null || value === undefined) {
    if (isRequired) {
      throw new Error(`Required field ${fieldName} is missing`)
    }
    return undefined
  }

  // Date object: convert to ISO string
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new Error(`Field ${fieldName} has invalid Date: ${value}`)
    }
    return value.toISOString()
  }

  // String: validate it's ISO 8601-like
  if (typeof value === "string") {
    // Basic ISO 8601 validation: should contain T and Z or +/-
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return value
    }
    throw new Error(`Field ${fieldName} is not ISO 8601 format: ${value}`)
  }

  throw new Error(`Field ${fieldName} has unexpected type: ${typeof value}`)
}

/**
 * Convert database row to canonical episode domain object.
 *
 * @param row - database row
 * @returns canonical episode with normalized types
 * @throws if required fields are missing or malformed
 */
export function mapRowToEpisode(row: EpisodeRow): CanonicalEpisode {
  return {
    episodeId: row.episode_id,
    episodeNumber: row.episode_number ?? undefined,
    channelName: row.channel_name,
    title: row.title,
    workflowState: row.workflow_state,
    reviewStatus: row.review_status as "not-required" | "pending" | "in-progress" | "completed",
    blockers: row.blockers ?? [],
    latestDecision: row.latest_decision ?? undefined,
    youtubeVideoId: row.youtube_video_id ?? undefined,
    publishedAt: row.published_at ? (normalizeTimestamp(row.published_at, "published_at", false) || undefined) : undefined,
    schemaVersion: row.schema_version,
    stateVersion: row.state_version,
    createdAt: normalizeTimestamp(row.created_at, "created_at", true) || "",
    updatedAt: normalizeTimestamp(row.updated_at, "updated_at", true) || "",
  }
}

/**
 * Convert database row to canonical event domain object.
 *
 * @param row - database row
 * @returns canonical event with normalized types
 * @throws if required fields are missing or malformed
 */
export function mapRowToEpisodeEvent(row: EpisodeEventRow): CanonicalEpisodeEvent {
  return {
    eventId: row.event_id,
    episodeId: row.episode_id,
    eventType: row.event_type,
    actor: row.actor,
    fromState: row.from_state ?? undefined,
    toState: row.to_state ?? undefined,
    payload: (row.payload ?? undefined) as Record<string, unknown> | undefined,
    idempotencyKey: row.idempotency_key ?? undefined,
    createdAt: normalizeTimestamp(row.created_at, "created_at", true) || "",
  }
}

/**
 * Convert database row to canonical episode brief domain object.
 *
 * @param row - database row
 * @returns canonical episode brief with normalized types
 * @throws if required fields are missing or malformed
 */
export function mapRowToEpisodeBrief(row: EpisodeBriefRow): CanonicalEpisodeBrief {
  // Ensure research_questions is always an array
  let questions: string[] = []
  if (row.research_questions) {
    if (Array.isArray(row.research_questions)) {
      questions = row.research_questions
    } else if (typeof row.research_questions === "string") {
      try {
        questions = JSON.parse(row.research_questions)
        if (!Array.isArray(questions)) {
          questions = []
        }
      } catch {
        questions = []
      }
    }
  }

  return {
    episodeId: row.episode_id,
    topic: row.topic,
    angle: row.angle ?? undefined,
    audience: row.audience ?? undefined,
    coreQuestion: row.core_question ?? undefined,
    hook: row.hook ?? undefined,
    thesis: row.thesis ?? undefined,
    editorialNotes: row.editorial_notes ?? undefined,
    researchQuestions: questions,
    schemaVersion: row.schema_version,
    briefVersion: row.brief_version,
    createdAt: normalizeTimestamp(row.created_at, "created_at", true) || "",
    updatedAt: normalizeTimestamp(row.updated_at, "updated_at", true) || "",
  }
}
