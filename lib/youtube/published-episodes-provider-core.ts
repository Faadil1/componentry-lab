// ─────────────────────────────────────────────────────────────
// Published Episodes Provider — Core Logic (Fixtures)
// ─────────────────────────────────────────────────────────────
// Pure fixture-based provider for development/testing.
// Returns published episodes that have both youtubeVideoId and publishedAt.
// ─────────────────────────────────────────────────────────────

import type { PublishedEpisode } from "../domain/published-episode"

// Fixture published episodes: only those with both videoId and publishedAt
const FIXTURE_PUBLISHED_EPISODES: PublishedEpisode[] = [
  {
    episodeId: "episode-013",
    episodeNumber: 13,
    channelName: "Wealth Decoded",
    title: "$1,000 a Month in Dividends: How Much Do You Need?",
    youtubeVideoId: "ASluRm71I8o",
    publishedAt: "2026-08-05T02:06:47Z",
    stateVersion: 2,
  },
  {
    episodeId: "episode-012",
    episodeNumber: 12,
    channelName: "Wealth Decoded",
    title: "Stock Market Basics",
    youtubeVideoId: "dZxHY_rvpms",
    publishedAt: "2026-08-04T10:30:00Z",
    stateVersion: 1,
  },
  {
    episodeId: "episode-011",
    episodeNumber: 11,
    channelName: "Wealth Decoded",
    title: "Understanding ETFs",
    youtubeVideoId: "hXN6gxUq3l0",
    publishedAt: "2026-08-03T15:45:00Z",
    stateVersion: 1,
  },
]

/**
 * List published episodes from fixtures.
 * Sorted newest-first by publishedAt.
 *
 * @returns published episodes
 */
export function listPublishedEpisodesFromFixture(): PublishedEpisode[] {
  return FIXTURE_PUBLISHED_EPISODES.map((ep) => ({
    ...ep,
  }))
}
