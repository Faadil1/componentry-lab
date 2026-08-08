// ─────────────────────────────────────────────────────────────
// Episode State Provider (Database-Backed Core)
// ─────────────────────────────────────────────────────────────
// INTERNAL - Pure provider logic, testable by Node.
// Accepts EpisodeRepository as dependency (not imported directly).
// Application code must use get-episode-state-from-db.ts wrapper.
// ─────────────────────────────────────────────────────────────

import type { EpisodeRepository } from "../persistence/episode-repository-core.ts"
import { mapCanonicalEpisodeToSnapshot } from "./canonical-episode-to-snapshot.ts"
import type { EpisodeStateSnapshot } from "../domain/episode-state.ts"

/**
 * Get episode state from Neon database.
 *
 * @param repository episode repository instance
 * @param episodeId episode identifier
 * @returns snapshot for rendering, or null if not found
 * @throws if database operation fails
 */
export async function getEpisodeStateFromDb(
  repository: EpisodeRepository,
  episodeId: string
): Promise<EpisodeStateSnapshot | null> {
  try {
    const canonical = await repository.getEpisodeById(episodeId)
    if (!canonical) {
      return null
    }

    return mapCanonicalEpisodeToSnapshot(canonical)
  } catch (err) {
    // Surface database errors - do NOT fall back to fixtures
    throw new Error(
      `Database provider failed for episode ${episodeId}: ${(err as Error).message}`
    )
  }
}

/**
 * List all episodes from database.
 *
 * @param repository episode repository instance
 * @returns array of snapshots
 * @throws if database operation fails
 */
export async function listEpisodeStatesFromDb(
  repository: EpisodeRepository
): Promise<EpisodeStateSnapshot[]> {
  try {
    const canonicals = await repository.listEpisodes()
    return canonicals.map(mapCanonicalEpisodeToSnapshot)
  } catch (err) {
    // Surface database errors - do NOT fall back to fixtures
    throw new Error(`Database provider failed to list episodes: ${(err as Error).message}`)
  }
}
