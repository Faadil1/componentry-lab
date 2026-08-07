// ─────────────────────────────────────────────────────────────
// Episode History Provider (Database-Backed Core)
// ─────────────────────────────────────────────────────────────
// INTERNAL - Pure provider logic, testable by Node.
// Accepts EpisodeRepository as dependency (not imported directly).
// Application code must use get-episode-history-from-db.ts wrapper.
// ─────────────────────────────────────────────────────────────

import type { EpisodeRepository } from "../persistence/episode-repository-core.ts"
import { mapCanonicalEventToHistory } from "./canonical-episode-event-to-history.ts"
import type { EpisodeHistory, EpisodeHistoryEvent } from "../domain/episode-history.ts"

/**
 * Get episode production history from Neon database.
 * Returns events in chronological order (oldest → newest) for timeline.
 *
 * @param repository episode repository instance
 * @param episodeId episode identifier
 * @returns episode history with events (may be empty)
 * @throws if database operation fails
 */
export async function getEpisodeHistoryFromDb(
  repository: EpisodeRepository,
  episodeId: string
): Promise<EpisodeHistory> {
  try {
    const canonicals = await repository.getEpisodeEvents(episodeId)

    // Repository returns DESC (newest first), reverse for timeline (oldest first)
    const events: EpisodeHistoryEvent[] = canonicals
      .map(mapCanonicalEventToHistory)
      .reverse()

    return {
      episodeId,
      events: Object.freeze(events),
    }
  } catch (err) {
    throw new Error(
      `Database provider failed to get episode history for ${episodeId}: ${(err as Error).message}`
    )
  }
}
