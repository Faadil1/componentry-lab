// ─────────────────────────────────────────────────────────────
// Episode Repository — Core Logic (Testable, No DB)
// ─────────────────────────────────────────────────────────────
// Pure interface and in-memory mock implementation.
// No Next.js or database dependencies.
// ─────────────────────────────────────────────────────────────

import type {
  CanonicalEpisode,
  CanonicalEpisodeEvent,
  OptimisticLockResult,
  CreateEpisodeInput,
  CreateEpisodeRepositoryResult,
  UpdateEpisodeStateInput,
  CreateEpisodeEventInput,
} from "./canonical-types"

/**
 * Episode repository interface.
 * Implemented by both live (PostgreSQL) and mock repositories.
 */
export interface EpisodeRepository {
  getEpisodeById(episodeId: string): Promise<CanonicalEpisode | null>
  listEpisodes(): Promise<CanonicalEpisode[]>
  createEpisode(input: CreateEpisodeInput): Promise<CreateEpisodeRepositoryResult>
  updateEpisodeState(input: UpdateEpisodeStateInput): Promise<OptimisticLockResult>
  createEpisodeEvent(input: CreateEpisodeEventInput): Promise<CanonicalEpisodeEvent>
  getEpisodeEvents(episodeId: string): Promise<CanonicalEpisodeEvent[]>
}

/**
 * Create a no-op repository for development without database.
 * Useful for local testing when DATABASE_URL is not available.
 *
 * Implements full contract semantics:
 * - Optimistic locking with version conflicts
 * - Idempotency key deduplication
 * - Immutable audit trail
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

    async createEpisode(input: CreateEpisodeInput): Promise<CreateEpisodeRepositoryResult> {
      // Simulate PostgreSQL ON CONFLICT DO NOTHING semantics
      // Return conflict result if duplicate, not throwing
      if (episodes.has(input.episodeId)) {
        return { success: false, reason: "conflict" }
      }

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
      return { success: true, episode }
    },

    async updateEpisodeState(input: UpdateEpisodeStateInput): Promise<OptimisticLockResult> {
      const episode = episodes.get(input.episodeId)

      // Episode does not exist
      if (!episode) {
        return {
          success: false,
          expectedVersion: input.expectedStateVersion,
          actualVersion: 0,
          reason: "not_found",
        }
      }

      // Episode exists but version mismatch
      if (episode.stateVersion !== input.expectedStateVersion) {
        return {
          success: false,
          expectedVersion: input.expectedStateVersion,
          actualVersion: episode.stateVersion,
          reason: "conflict",
        }
      }

      // Success: update with incremented version
      const now = new Date().toISOString()
      const updated: CanonicalEpisode = {
        ...episode,
        workflowState: input.workflowState ?? episode.workflowState,
        reviewStatus: (input.reviewStatus ?? episode.reviewStatus) as "not-required" | "pending" | "in-progress" | "completed",
        blockers: input.blockers ?? episode.blockers,
        latestDecision: input.latestDecision !== undefined ? input.latestDecision || undefined : episode.latestDecision,
        youtubeVideoId: input.youtubeVideoId ?? episode.youtubeVideoId,
        publishedAt: input.publishedAt ?? episode.publishedAt,
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
      // Idempotency: if key provided, check if event already exists
      if (input.idempotencyKey) {
        const existing = events.find((e) => e.idempotencyKey === input.idempotencyKey)
        if (existing) {
          return existing
        }
      }

      const event: CanonicalEpisodeEvent = {
        eventId: Math.random().toString(36).substring(7),
        ...input,
        createdAt: new Date().toISOString(),
      }
      events.push(event)
      return event
    },

    async getEpisodeEvents(episodeId: string): Promise<CanonicalEpisodeEvent[]> {
      return events
        .filter((e) => e.episodeId === episodeId)
        .sort((a, b) => {
          const timeA = new Date(b.createdAt).getTime()
          const timeB = new Date(a.createdAt).getTime()
          if (timeA !== timeB) {
            return timeA - timeB
          }
          // Tie-break by eventId descending for determinism
          return b.eventId.localeCompare(a.eventId)
        })
    },
  }
}
