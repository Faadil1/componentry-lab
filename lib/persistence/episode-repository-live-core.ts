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
  CanonicalEpisodeBrief,
  CreateEpisodeEventInput,
  CreateEpisodeInput,
  CreateEpisodeRepositoryResult,
  UpdateEpisodeStateInput,
  OptimisticLockResult,
  SetEpisodeBriefInput,
  SetEpisodeBriefRepositoryResult,
} from "./canonical-types.ts"
import type { EpisodeRepository } from "./episode-repository-core.ts"
import type { EpisodeRow, EpisodeEventRow, EpisodeBriefRow } from "./episode-row-mappers.ts"
import { mapRowToEpisode, mapRowToEpisodeEvent, mapRowToEpisodeBrief } from "./episode-row-mappers.ts"

// Re-export from sql-types for tests that import directly from this module
export type { PostgresSql } from "./sql-types.ts"
import type { PostgresSql, SqlParameter } from "./sql-types.ts"

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
      const values: SqlParameter[] = []
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
        values.push(JSON.stringify(input.blockers))
        paramIndex++
      }

      if (input.latestDecision !== undefined) {
        updates.push(`latest_decision = $${paramIndex}`)
        values.push(input.latestDecision ? JSON.stringify(input.latestDecision) : null)
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
          ${input.payload ? JSON.stringify(input.payload) : null},
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

    async getEpisodeBrief(episodeId: string): Promise<CanonicalEpisodeBrief | null> {
      const rows = await sql`
        SELECT * FROM episode_briefs WHERE episode_id = ${episodeId}
      `
      if (rows.length === 0) return null
      return mapRowToEpisodeBrief(rows[0] as unknown as EpisodeBriefRow)
    },

    async setEpisodeBrief(input: SetEpisodeBriefInput): Promise<SetEpisodeBriefRepositoryResult> {
      // Verify episode exists
      const episodeCheck = await sql`
        SELECT episode_id FROM episodes WHERE episode_id = ${input.episodeId}
      `
      if (episodeCheck.length === 0) {
        return {
          success: false,
          reason: "episode_not_found",
        }
      }

      const now = new Date().toISOString()

      // CREATE mode: expectedBriefVersion = null
      if (input.expectedBriefVersion === null) {
        // Validate topic is provided and non-empty
        if (!input.topic || input.topic.trim() === "") {
          return {
            success: false,
            reason: "conflict", // Validation error, let command layer handle as invalid_input
          }
        }

        const rows = await sql`
          INSERT INTO episode_briefs (
            episode_id,
            topic,
            angle,
            audience,
            core_question,
            hook,
            thesis,
            editorial_notes,
            research_questions,
            schema_version,
            brief_version,
            created_at,
            updated_at
          )
          VALUES (
            ${input.episodeId},
            ${input.topic},
            ${input.angle ?? null},
            ${input.audience ?? null},
            ${input.coreQuestion ?? null},
            ${input.hook ?? null},
            ${input.thesis ?? null},
            ${input.editorialNotes ?? null},
            ${JSON.stringify(input.researchQuestions || [])},
            1,
            1,
            ${now},
            ${now}
          )
          ON CONFLICT (episode_id) DO NOTHING
          RETURNING *
        `

        if (rows.length === 0) {
          // Brief already exists, fetch current version for conflict response
          const existing = await sql`
            SELECT brief_version FROM episode_briefs WHERE episode_id = ${input.episodeId}
          `
          if (existing.length > 0) {
            const currentVersion = (existing[0] as unknown as { brief_version: number }).brief_version
            return {
              success: false,
              reason: "conflict",
              currentBriefVersion: currentVersion,
            }
          }
          // Shouldn't reach here, but handle gracefully
          return {
            success: false,
            reason: "conflict",
          }
        }

        return {
          success: true,
          brief: mapRowToEpisodeBrief(rows[0] as unknown as EpisodeBriefRow),
        }
      }

      // UPDATE mode: expectedBriefVersion = N
      // Build dynamic update query with only provided fields
      const updates: string[] = []
      const values: SqlParameter[] = []
      let paramIndex = 1

      if (input.topic !== undefined) {
        updates.push(`topic = $${paramIndex}`)
        values.push(input.topic)
        paramIndex++
      }

      if (input.angle !== undefined) {
        updates.push(`angle = $${paramIndex}`)
        values.push(input.angle || null)
        paramIndex++
      }

      if (input.audience !== undefined) {
        updates.push(`audience = $${paramIndex}`)
        values.push(input.audience || null)
        paramIndex++
      }

      if (input.coreQuestion !== undefined) {
        updates.push(`core_question = $${paramIndex}`)
        values.push(input.coreQuestion || null)
        paramIndex++
      }

      if (input.hook !== undefined) {
        updates.push(`hook = $${paramIndex}`)
        values.push(input.hook || null)
        paramIndex++
      }

      if (input.thesis !== undefined) {
        updates.push(`thesis = $${paramIndex}`)
        values.push(input.thesis || null)
        paramIndex++
      }

      if (input.editorialNotes !== undefined) {
        updates.push(`editorial_notes = $${paramIndex}`)
        values.push(input.editorialNotes || null)
        paramIndex++
      }

      if (input.researchQuestions !== undefined) {
        updates.push(`research_questions = $${paramIndex}`)
        values.push(JSON.stringify(input.researchQuestions))
        paramIndex++
      }

      updates.push(`updated_at = $${paramIndex}`)
      values.push(now)
      paramIndex++

      const updateSQL = `
        UPDATE episode_briefs
        SET
          brief_version = brief_version + 1,
          ${updates.join(",\n          ")}
        WHERE
          episode_id = $${paramIndex}
          AND brief_version = $${paramIndex + 1}
        RETURNING *
      `

      values.push(input.episodeId)
      values.push(input.expectedBriefVersion)

      const result = await sql.unsafe(updateSQL, values)

      if (result.length === 0) {
        // Check if brief exists
        const checkRows = await sql`
          SELECT brief_version FROM episode_briefs WHERE episode_id = ${input.episodeId}
        `

        if (checkRows.length === 0) {
          return {
            success: false,
            reason: "not_found",
          }
        }

        const actualVersion = (checkRows[0] as unknown as { brief_version: number }).brief_version
        return {
          success: false,
          reason: "conflict",
          currentBriefVersion: actualVersion,
        }
      }

      return {
        success: true,
        brief: mapRowToEpisodeBrief(result[0] as unknown as EpisodeBriefRow),
      }
    },
  }
}
