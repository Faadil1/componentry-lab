// ─────────────────────────────────────────────────────────────
// Episode Repository — Core Logic (Testable, No DB)
// ─────────────────────────────────────────────────────────────
// Pure interface and in-memory mock implementation.
// No Next.js or database dependencies.
// ─────────────────────────────────────────────────────────────

import type {
  CanonicalEpisode,
  CanonicalEpisodeEvent,
  CanonicalEpisodeBrief,
  OptimisticLockResult,
  CreateEpisodeInput,
  CreateEpisodeRepositoryResult,
  UpdateEpisodeStateInput,
  CreateEpisodeEventInput,
  SetEpisodeBriefInput,
  SetEpisodeBriefRepositoryResult,
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
  getEpisodeBrief(episodeId: string): Promise<CanonicalEpisodeBrief | null>
  setEpisodeBrief(input: SetEpisodeBriefInput): Promise<SetEpisodeBriefRepositoryResult>
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
  const briefs = new Map<string, CanonicalEpisodeBrief>()
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

    async getEpisodeBrief(episodeId: string): Promise<CanonicalEpisodeBrief | null> {
      return briefs.get(episodeId) || null
    },

    async setEpisodeBrief(input: SetEpisodeBriefInput): Promise<SetEpisodeBriefRepositoryResult> {
      // Verify episode exists
      if (!episodes.has(input.episodeId)) {
        return {
          success: false,
          reason: "episode_not_found",
        }
      }

      const now = new Date().toISOString()
      const existingBrief = briefs.get(input.episodeId)

      // CREATE mode: expectedBriefVersion = null
      if (input.expectedBriefVersion === null) {
        if (existingBrief) {
          return {
            success: false,
            reason: "conflict",
            currentBriefVersion: existingBrief.briefVersion,
          }
        }

        // Create new brief with topic required
        if (!input.topic || input.topic.trim() === "") {
          return {
            success: false,
            reason: "conflict", // Using conflict to signal validation, let command layer handle
          }
        }

        const newBrief: CanonicalEpisodeBrief = {
          episodeId: input.episodeId,
          topic: input.topic,
          angle: input.angle,
          audience: input.audience,
          coreQuestion: input.coreQuestion,
          hook: input.hook,
          thesis: input.thesis,
          editorialNotes: input.editorialNotes,
          researchQuestions: input.researchQuestions || [],
          schemaVersion: 1,
          briefVersion: 1,
          createdAt: now,
          updatedAt: now,
        }
        briefs.set(input.episodeId, newBrief)
        return {
          success: true,
          brief: newBrief,
        }
      }

      // UPDATE mode: expectedBriefVersion = N
      if (!existingBrief) {
        return {
          success: false,
          reason: "not_found",
        }
      }

      if (existingBrief.briefVersion !== input.expectedBriefVersion) {
        return {
          success: false,
          reason: "conflict",
          currentBriefVersion: existingBrief.briefVersion,
        }
      }

      // Perform update
      const updatedBrief: CanonicalEpisodeBrief = {
        episodeId: input.episodeId,
        topic: input.topic ?? existingBrief.topic,
        angle: input.angle !== undefined ? input.angle : existingBrief.angle,
        audience: input.audience !== undefined ? input.audience : existingBrief.audience,
        coreQuestion: input.coreQuestion !== undefined ? input.coreQuestion : existingBrief.coreQuestion,
        hook: input.hook !== undefined ? input.hook : existingBrief.hook,
        thesis: input.thesis !== undefined ? input.thesis : existingBrief.thesis,
        editorialNotes: input.editorialNotes !== undefined ? input.editorialNotes : existingBrief.editorialNotes,
        researchQuestions: input.researchQuestions ?? existingBrief.researchQuestions,
        schemaVersion: existingBrief.schemaVersion,
        briefVersion: existingBrief.briefVersion + 1,
        createdAt: existingBrief.createdAt,
        updatedAt: now,
      }
      briefs.set(input.episodeId, updatedBrief)
      return {
        success: true,
        brief: updatedBrief,
      }
    },
  }
}
