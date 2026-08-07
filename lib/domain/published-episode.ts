// ─────────────────────────────────────────────────────────────
// Published Episode — Domain Type
// ─────────────────────────────────────────────────────────────
// Read-model for episodes that have been published to YouTube.
// Only canonical episodes with BOTH youtubeVideoId AND publishedAt
// appear in the published archive.
// ─────────────────────────────────────────────────────────────

export interface PublishedEpisode {
  episodeId: string
  episodeNumber?: number
  channelName: string
  title: string
  youtubeVideoId: string
  publishedAt: string
  stateVersion: number
}
