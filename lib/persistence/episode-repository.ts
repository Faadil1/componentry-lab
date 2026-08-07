// ─────────────────────────────────────────────────────────────
// Episode Repository (Server-Only)
// ─────────────────────────────────────────────────────────────
// Public server-side interface.
// Live PostgreSQL implementation for Neon or self-hosted.
// Re-exports core types and mock for tests.
// ─────────────────────────────────────────────────────────────

import "server-only"

// Core interface and mock are testable without server-only
export { createMockRepository, type EpisodeRepository } from "./episode-repository-core"

import type {
  CanonicalEpisodeEvent,
  CreateEpisodeEventInput,
  UpdateEpisodeStateInput,
} from "./canonical-types"
import type { EpisodeRepository } from "./episode-repository-core"

/**
 * Normalize timestamps to ISO strings.
 * Handles both Date objects and string values from postgres driver.
 *
 * postgres library returns unknown[] from queries, requiring type casting.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTimestamp(value: any): string {
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === "string") {
    return value
  }
  return new Date().toISOString()
}

/**
 * Row-to-domain conversion for episodes.
 * Handles type conversions and normalizations.
 *
 * postgres library returns unknown[] from queries, requiring type casting.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEpisode(row: any): any {
  return {
    episodeId: row.episode_id,
    episodeNumber: row.episode_number ?? undefined,
    channelName: row.channel_name,
    title: row.title,
    workflowState: row.workflow_state,
    reviewStatus: row.review_status,
    blockers: Array.isArray(row.blockers) ? row.blockers : [],
    latestDecision: row.latest_decision ?? undefined,
    youtubeVideoId: row.youtube_video_id ?? undefined,
    publishedAt: row.published_at ? normalizeTimestamp(row.published_at) : undefined,
    schemaVersion: row.schema_version,
    stateVersion: row.state_version,
    createdAt: normalizeTimestamp(row.created_at),
    updatedAt: normalizeTimestamp(row.updated_at),
  }
}

/**
 * Row-to-domain conversion for events.
 * Handles type conversions and normalizations.
 *
 * postgres library returns unknown[] from queries, requiring type casting.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEpisodeEvent(row: any): CanonicalEpisodeEvent {
  return {
    eventId: row.event_id,
    episodeId: row.episode_id,
    eventType: row.event_type,
    actor: row.actor,
    fromState: row.from_state ?? undefined,
    toState: row.to_state ?? undefined,
    payload: row.payload ?? undefined,
    idempotencyKey: row.idempotency_key ?? undefined,
    createdAt: normalizeTimestamp(row.created_at),
  }
}

/**
 * Create a live repository backed by PostgreSQL (Neon or self-hosted).
 * Only available on server-side (import "server-only" enforced above).
 *
 * @param sql postgres client (from 'postgres' npm package)
 * @returns EpisodeRepository implementation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEpisodeRepository(sql: any): EpisodeRepository {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getEpisodeById(episodeId: string): Promise<any> {
      const rows = await sql`
        SELECT * FROM episodes WHERE episode_id = ${episodeId}
      `
      if (rows.length === 0) return null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rowToEpisode(rows[0] as any)
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async listEpisodes(): Promise<any[]> {
      const rows = await sql`
        SELECT * FROM episodes
        ORDER BY episode_number DESC NULLS LAST, episode_id
      `
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rows.map((row: any) => rowToEpisode(row))
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createEpisode(input: any): Promise<any> {
      const now = new Date().toISOString()
      const rows = await sql`
        INSERT INTO episodes (
          episode_id,
          episode_number,
          channel_name,
          title,
          workflow_state,
          review_status,
          schema_version,
          state_version,
          created_at,
          updated_at
        )
        VALUES (
          ${input.episodeId},
          ${input.episodeNumber || null},
          ${input.channelName},
          ${input.title},
          ${input.workflowState},
          ${input.reviewStatus},
          1,
          1,
          ${now},
          ${now}
        )
        RETURNING *
      `
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rowToEpisode(rows[0] as any)
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateEpisodeState(input: UpdateEpisodeStateInput): Promise<any> {
      const now = new Date().toISOString()
      const updates: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      if (input.workflowState !== undefined) {
        updates.push(`workflow_state = $${paramIndex}`)
        values.push(input.workflowState)
        paramIndex++
      }

      if (input.reviewStatus !== undefined) {
        updates.push(`review_status = $${paramIndex}`)
        values.push(input.reviewStatus)
        paramIndex++
      }

      if (input.blockers !== undefined) {
        updates.push(`blockers = $${paramIndex}`)
        // Pass as object, postgres driver handles JSON encoding
        values.push(input.blockers)
        paramIndex++
      }

      if (input.latestDecision !== undefined) {
        updates.push(`latest_decision = $${paramIndex}`)
        // Pass as object or null, postgres driver handles JSON encoding
        values.push(input.latestDecision)
        paramIndex++
      }

      updates.push(`updated_at = $${paramIndex}`)
      values.push(now)
      paramIndex++

      const updateSQL = `
        UPDATE episodes
        SET
          state_version = state_version + 1,
          ${updates.join(",\n          ")}
        WHERE
          episode_id = $${paramIndex}
          AND state_version = $${paramIndex + 1}
        RETURNING state_version
      `

      values.push(input.episodeId)
      values.push(input.expectedStateVersion)

      const result = await sql.unsafe(updateSQL, values)

      if (result.length === 0) {
        // Zero rows updated: either episode doesn't exist or version mismatch
        // Check if episode exists
        const checkRows = await sql`
          SELECT state_version FROM episodes WHERE episode_id = ${input.episodeId}
        `

        if (checkRows.length === 0) {
          // Episode does not exist
          return {
            success: false,
            expectedVersion: input.expectedStateVersion,
            actualVersion: 0,
            reason: "not_found",
          }
        }

        // Episode exists but version mismatch (conflict)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actualVersion = (checkRows[0] as any).state_version
        return {
          success: false,
          expectedVersion: input.expectedStateVersion,
          actualVersion,
          reason: "conflict",
        }
      }

      // Success: state_version was incremented
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newVersion = (result[0] as any).state_version
      return {
        success: true,
        expectedVersion: input.expectedStateVersion,
        actualVersion: newVersion,
      }
    },

    async createEpisodeEvent(input: CreateEpisodeEventInput): Promise<CanonicalEpisodeEvent> {
      const now = new Date().toISOString()

      // INSERT ... ON CONFLICT for idempotency handling
      // If idempotency_key already exists, return the existing event
      const rows = await sql`
        INSERT INTO episode_events (
          episode_id,
          event_type,
          actor,
          from_state,
          to_state,
          payload,
          idempotency_key,
          created_at
        )
        VALUES (
          ${input.episodeId},
          ${input.eventType},
          ${input.actor},
          ${input.fromState || null},
          ${input.toState || null},
          ${input.payload || null},
          ${input.idempotencyKey || null},
          ${now}
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *
      `

      // If insert was successful, return the new event
      if (rows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rowToEpisodeEvent(rows[0] as any)
      }

      // If idempotencyKey was provided and insert did nothing, fetch existing event
      if (input.idempotencyKey) {
        const existing = await sql`
          SELECT * FROM episode_events
          WHERE idempotency_key = ${input.idempotencyKey}
        `
        if (existing.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return rowToEpisodeEvent(existing[0] as any)
        }
      }

      // If no key and still no rows, this is an unexpected state
      throw new Error(
        `Failed to create episode event: insert returned no rows and no idempotency key`
      )
    },

    async getEpisodeEvents(episodeId: string): Promise<CanonicalEpisodeEvent[]> {
      const rows = await sql`
        SELECT * FROM episode_events
        WHERE episode_id = ${episodeId}
        ORDER BY created_at DESC
      `
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rows.map((row: any) => rowToEpisodeEvent(row))
    },
  }
}
