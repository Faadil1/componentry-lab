// ─────────────────────────────────────────────────────────────
// Episode Repository Live Core (INTERNAL - TEST USE ONLY)
// ─────────────────────────────────────────────────────────────
// PostgreSQL implementation. Testable by Node (no server-only).
//
// ⚠️  APPLICATION CODE MUST NOT IMPORT THIS DIRECTLY.
// Application code must import only from episode-repository.ts
// which enforces the server-only boundary.
//
// Live tests may import this directly for Neon validation.
// ─────────────────────────────────────────────────────────────

import type {
  CanonicalEpisode,
  CanonicalEpisodeEvent,
  CreateEpisodeEventInput,
  CreateEpisodeInput,
  CreateEpisodeRepositoryResult,
  UpdateEpisodeStateInput,
  OptimisticLockResult,
} from "./canonical-types.ts"
import type { EpisodeRepository } from "./episode-repository-core.ts"
import type { EpisodeRow, EpisodeEventRow } from "./episode-row-mappers.ts"
import { mapRowToEpisode, mapRowToEpisodeEvent } from "./episode-row-mappers.ts"

/**
 * Structural type for postgres npm package SQL client.
 * Represents the callable interface and unsafe method.
 */
export type PostgresSql = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Array<Record<string, unknown>>>
  unsafe: (query: string, values: unknown[]) => Promise<Array<Record<string, unknown>>>
}

/**
 * Create a live repository backed by PostgreSQL (Neon or self-hosted).
 *
 * @param sql postgres client from 'postgres' npm package
 * @returns EpisodeRepository implementation with proper typing
 */
export function createEpisodeRepository(sql: PostgresSql): EpisodeRepository {
  return {
    async getEpisodeById(episodeId: string): Promise<CanonicalEpisode | null> {
      const rows = await sql`
        SELECT * FROM episodes WHERE episode_id = ${episodeId}
      `
      if (rows.length === 0) return null
      return mapRowToEpisode(rows[0] as unknown as EpisodeRow)
    },

    async listEpisodes(): Promise<CanonicalEpisode[]> {
      const rows = await sql`
        SELECT * FROM episodes
        ORDER BY episode_number DESC NULLS LAST, episode_id
      `
      return rows.map((row) => mapRowToEpisode(row as unknown as EpisodeRow))
    },

    async createEpisode(input: CreateEpisodeInput): Promise<CreateEpisodeRepositoryResult> {
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
          ${input.episodeNumber ?? null},
          ${input.channelName},
          ${input.title},
          ${input.workflowState},
          ${input.reviewStatus},
          1,
          1,
          ${now},
          ${now}
        )
        ON CONFLICT (episode_id) DO NOTHING
        RETURNING *
      `
      if (rows.length === 0) {
        return { success: false, reason: "conflict" }
      }
      return { success: true, episode: mapRowToEpisode(rows[0] as unknown as EpisodeRow) }
    },

    async updateEpisodeState(input: UpdateEpisodeStateInput): Promise<OptimisticLockResult> {
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
        values.push(input.blockers)
        paramIndex++
      }

      if (input.latestDecision !== undefined) {
        updates.push(`latest_decision = $${paramIndex}`)
        values.push(input.latestDecision)
        paramIndex++
      }

      if (input.youtubeVideoId !== undefined) {
        updates.push(`youtube_video_id = $${paramIndex}`)
        values.push(input.youtubeVideoId)
        paramIndex++
      }

      if (input.publishedAt !== undefined) {
        updates.push(`published_at = $${paramIndex}`)
        values.push(input.publishedAt)
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
        const checkRows = await sql`
          SELECT state_version FROM episodes WHERE episode_id = ${input.episodeId}
        `

        if (checkRows.length === 0) {
          return {
            success: false,
            expectedVersion: input.expectedStateVersion,
            actualVersion: 0,
            reason: "not_found",
          }
        }

        const actualVersion = (checkRows[0] as unknown as { state_version: number }).state_version
        return {
          success: false,
          expectedVersion: input.expectedStateVersion,
          actualVersion,
          reason: "conflict",
        }
      }

      const newVersion = (result[0] as unknown as { state_version: number }).state_version
      return {
        success: true,
        expectedVersion: input.expectedStateVersion,
        actualVersion: newVersion,
      }
    },

    async createEpisodeEvent(input: CreateEpisodeEventInput): Promise<CanonicalEpisodeEvent> {
      const now = new Date().toISOString()

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
          ${input.fromState ?? null},
          ${input.toState ?? null},
          ${input.payload ?? null},
          ${input.idempotencyKey ?? null},
          ${now}
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *
      `

      if (rows.length > 0) {
        return mapRowToEpisodeEvent(rows[0] as unknown as EpisodeEventRow)
      }

      if (input.idempotencyKey) {
        const existing = await sql`
          SELECT * FROM episode_events
          WHERE idempotency_key = ${input.idempotencyKey}
        `
        if (existing.length > 0) {
          return mapRowToEpisodeEvent(existing[0] as unknown as EpisodeEventRow)
        }
      }

      throw new Error(
        `Failed to create episode event: insert returned no rows and no idempotency key`
      )
    },

    async getEpisodeEvents(episodeId: string): Promise<CanonicalEpisodeEvent[]> {
      const rows = await sql`
        SELECT * FROM episode_events
        WHERE episode_id = ${episodeId}
        ORDER BY created_at DESC, event_id DESC
      `
      return rows.map((row) => mapRowToEpisodeEvent(row as unknown as EpisodeEventRow))
    },
  }
}
