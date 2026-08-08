// ─────────────────────────────────────────────────────────────
// Published Episodes Provider (Database-Backed Core)
// ─────────────────────────────────────────────────────────────
// INTERNAL - Pure provider logic, testable by Node.
// Accepts EpisodeRepository as dependency (not imported directly).
// Application code must use get-published-episodes-from-db.ts wrapper.
// ─────────────────────────────────────────────────────────────

import type { EpisodeRepository } from "../persistence/episode-repository-core.ts"
import { mapCanonicalEpisodeToPublished } from "./canonical-episode-to-published.ts"
import type { PublishedEpisode } from "../domain/published-episode.ts"

/**
 * List published episodes from Neon database.
 * Filters to only episodes with BOTH youtubeVideoId AND publishedAt.
 * Sorted newest-first by publishedAt.
 *
 * @param repository episode repository instance
 * @returns published episodes, sorted newest first
 * @throws if database operation fails
 */
export async function listPublishedEpisodesFromDb(
  repository: EpisodeRepository
): Promise<PublishedEpisode[]> {
  try {
    const canonicals = await repository.listEpisodes()
    const published = canonicals
      .map(mapCanonicalEpisodeToPublished)
      .filter((ep): ep is PublishedEpisode => ep !== null)

    // Sort newest-first by publishedAt
    published.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    return published
  } catch (err) {
    throw new Error(
      `Database provider failed to list published episodes: ${(err as Error).message}`
    )
  }
}
