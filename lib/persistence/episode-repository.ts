// ─────────────────────────────────────────────────────────────
// Episode Repository
// ─────────────────────────────────────────────────────────────
// Data access boundary for canonical episode state.
// Handles SQL mapping, type conversion, optimistic locking.
// ─────────────────────────────────────────────────────────────

import type {
  CanonicalEpisode,
  CanonicalEpisodeEvent,
  OptimisticLockResult,
  CreateEpisodeInput,
  UpdateEpisodeStateInput,
  CreateEpisodeEventInput,
  EpisodeRow,
  EpisodeEventRow,
} from "./canonical-types"

export interface EpisodeRepository {
  getEpisodeById(episodeId: string): Promise<CanonicalEpisode | null>
  listEpisodes(): Promise<CanonicalEpisode[]>
  createEpisode(input: CreateEpisodeInput): Promise<CanonicalEpisode>
  updateEpisodeState(input: UpdateEpisodeStateInput): Promise<OptimisticLockResult>
  createEpisodeEvent(input: CreateEpisodeEventInput): Promise<CanonicalEpisodeEvent>
  getEpisodeEvents(episodeId: string): Promise<CanonicalEpisodeEvent[]>
}

/**
 * Row-to-domain conversion.
 * Maps snake_case database rows to camelCase domain types.
 */
function rowToEpisode(row: EpisodeRow): CanonicalEpisode {
  return {
    episodeId: row.episode_id,
    episodeNumber: row.episode_number ?? undefined,
    channelName: row.channel_name,
    title: row.title,
    workflowState: row.workflow_state,
    reviewStatus: row.review_status as "not-required" | "pending" | "in-progress" | "completed",
    blockers: row.blockers || [],
    latestDecision: row.latest_decision || undefined,
    youtubeVideoId: row.youtube_video_id || undefined,
    publishedAt: row.published_at || undefined,
    schemaVersion: row.schema_version,
    stateVersion: row.state_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToEpisodeEvent(row: EpisodeEventRow): CanonicalEpisodeEvent {
  return {
    eventId: row.event_id,
    episodeId: row.episode_id,
    eventType: row.event_type,
    actor: row.actor,
    fromState: row.from_state || undefined,
    toState: row.to_state || undefined,
    payload: row.payload || undefined,
    idempotencyKey: row.idempotency_key || undefined,
    createdAt: row.created_at,
  }
}

type PostgresClient = ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>) & {
  unsafe: (query: string, values: unknown[]) => Promise<Array<{ state_version: number }>>
}

/**
 * Create a repository instance.
 * Requires a postgres client connection.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEpisodeRepository(sql: any): EpisodeRepository {
  return {
    async getEpisodeById(episodeId: string): Promise<CanonicalEpisode | null> {
      const rows = await sql`
        SELECT * FROM episodes WHERE episode_id = ${episodeId}
      `
      if (rows.length === 0) return null
      return rowToEpisode(rows[0] as EpisodeRow)
    },

    async listEpisodes(): Promise<CanonicalEpisode[]> {
      const rows = await sql`
        SELECT * FROM episodes
        ORDER BY episode_number DESC NULLS LAST, episode_id
      `
      return rows.map((row: EpisodeRow) => rowToEpisode(row))
    },

    async createEpisode(input: CreateEpisodeInput): Promise<CanonicalEpisode> {
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
      return rowToEpisode(rows[0] as EpisodeRow)
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
        values.push(JSON.stringify(input.blockers))
        paramIndex++
      }

      if (input.latestDecision !== undefined) {
        updates.push(`latest_decision = $${paramIndex}`)
        values.push(input.latestDecision ? JSON.stringify(input.latestDecision) : null)
        paramIndex++
      }

      updates.push(`updated_at = $${paramIndex}`)
      values.push(now)
      paramIndex++

      // Always increment state_version and add WHERE condition
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

      try {
        // Use raw query with positional parameters
        const result = await sql.unsafe(updateSQL, values)

        if (result.length === 0) {
          // Query executed but no rows updated - conflict
          // Fetch current version for debugging
          const currentRows = await sql`
            SELECT state_version FROM episodes WHERE episode_id = ${input.episodeId}
          `
          const actualVersion = currentRows.length > 0 ? currentRows[0].state_version : -1

          return {
            success: false,
            expectedVersion: input.expectedStateVersion,
            actualVersion,
            reason: "conflict",
          }
        }

        // Success - state_version was incremented
        const newVersion = result[0].state_version
        return {
          success: true,
          expectedVersion: input.expectedStateVersion,
          actualVersion: newVersion,
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("no rows returned")) {
          return {
            success: false,
            expectedVersion: input.expectedStateVersion,
            actualVersion: -1,
            reason: "not_found",
          }
        }
        throw error
      }
    },

    async createEpisodeEvent(input: CreateEpisodeEventInput): Promise<CanonicalEpisodeEvent> {
      const now = new Date().toISOString()

      try {
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
            ${input.payload ? JSON.stringify(input.payload) : null},
            ${input.idempotencyKey || null},
            ${now}
          )
          RETURNING *
        `
        return rowToEpisodeEvent(rows[0] as EpisodeEventRow)
      } catch (error) {
        // Handle unique constraint violation on idempotency_key
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("idempotency_key")) {
          // Return the existing event
          const existing = await sql`
            SELECT * FROM episode_events
            WHERE idempotency_key = ${input.idempotencyKey}
          `
          if (existing.length > 0) {
            return rowToEpisodeEvent(existing[0] as EpisodeEventRow)
          }
        }
        throw error
      }
    },

    async getEpisodeEvents(episodeId: string): Promise<CanonicalEpisodeEvent[]> {
      const rows = await sql`
        SELECT * FROM episode_events
        WHERE episode_id = ${episodeId}
        ORDER BY created_at DESC
      `
      return rows.map((row: EpisodeEventRow) => rowToEpisodeEvent(row))
    },
  }
}

/**
 * Create a no-op repository for development without database.
 * Useful for local testing when DATABASE_URL is not available.
 */
export function createMockRepository(): EpisodeRepository {
  const episodes = new Map<string, CanonicalEpisode>()
  const events: CanonicalEpisodeEvent[] = []

  return {
    async getEpisodeById(episodeId: string): Promise<CanonicalEpisode | null> {
      return episodes.get(episodeId) || null
    },

    async listEpisodes(): Promise<CanonicalEpisode[]> {
      return Array.from(episodes.values())
    },

    async createEpisode(input: CreateEpisodeInput): Promise<CanonicalEpisode> {
      const now = new Date().toISOString()
      const episode: CanonicalEpisode = {
        ...input,
        blockers: [],
        schemaVersion: 1,
        stateVersion: 1,
        createdAt: now,
        updatedAt: now,
      }
      episodes.set(input.episodeId, episode)
      return episode
    },

    async updateEpisodeState(input: UpdateEpisodeStateInput): Promise<OptimisticLockResult> {
      const episode = episodes.get(input.episodeId)
      if (!episode) {
        return {
          success: false,
          expectedVersion: input.expectedStateVersion,
          actualVersion: -1,
          reason: "not_found",
        }
      }

      if (episode.stateVersion !== input.expectedStateVersion) {
        return {
          success: false,
          expectedVersion: input.expectedStateVersion,
          actualVersion: episode.stateVersion,
          reason: "conflict",
        }
      }

      const now = new Date().toISOString()
      const updated: CanonicalEpisode = {
        ...episode,
        workflowState: input.workflowState ?? episode.workflowState,
        reviewStatus: (input.reviewStatus ?? episode.reviewStatus) as "not-required" | "pending" | "in-progress" | "completed",
        blockers: input.blockers ?? episode.blockers,
        latestDecision: input.latestDecision !== undefined ? input.latestDecision || undefined : episode.latestDecision,
        stateVersion: episode.stateVersion + 1,
        updatedAt: now,
      }
      episodes.set(input.episodeId, updated)

      return {
        success: true,
        expectedVersion: input.expectedStateVersion,
        actualVersion: updated.stateVersion,
      }
    },

    async createEpisodeEvent(input: CreateEpisodeEventInput): Promise<CanonicalEpisodeEvent> {
      const event: CanonicalEpisodeEvent = {
        eventId: Math.random().toString(36).substring(7),
        ...input,
        createdAt: new Date().toISOString(),
      }
      events.push(event)
      return event
    },

    async getEpisodeEvents(episodeId: string): Promise<CanonicalEpisodeEvent[]> {
      return events.filter((e) => e.episodeId === episodeId).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    },
  }
}
