// ─────────────────────────────────────────────────────────────
// Canonical Episode → Published Episode Mapper
// ─────────────────────────────────────────────────────────────
// Pure mapping function: filters canonical episodes to only those
// that have been published (both youtubeVideoId AND publishedAt present).
// ─────────────────────────────────────────────────────────────

import type { CanonicalEpisode } from "../persistence/canonical-types"
import type { PublishedEpisode } from "../domain/published-episode"

/**
 * Map a canonical episode to published episode if fully published.
 *
 * An episode is considered published ONLY when BOTH are present:
 * - youtubeVideoId
 * - publishedAt
 *
 * @param canonical episode record from database
 * @returns published episode, or null if not fully published
 */
export function mapCanonicalEpisodeToPublished(
  canonical: CanonicalEpisode
): PublishedEpisode | null {
  if (!canonical.youtubeVideoId || !canonical.publishedAt) {
    return null
  }

  return {
    episodeId: canonical.episodeId,
    episodeNumber: canonical.episodeNumber,
    channelName: canonical.channelName,
    title: canonical.title,
    youtubeVideoId: canonical.youtubeVideoId,
    publishedAt: canonical.publishedAt,
    stateVersion: canonical.stateVersion,
  }
}
