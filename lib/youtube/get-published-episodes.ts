// ─────────────────────────────────────────────────────────────
// YouTube OS — Published Episodes Provider (Server-Only)
// ─────────────────────────────────────────────────────────────
// Server-side provider with explicit source selection.
// Supports fixture (default) and database (Neon) backends.
// Enforces server-only execution boundary.
//
// Source control:
// YOUTUBE_EPISODE_SOURCE=fixture (default)
// YOUTUBE_EPISODE_SOURCE=database (requires DATABASE_URL)
// ─────────────────────────────────────────────────────────────

import "server-only"

import type { PublishedEpisode } from "../domain/published-episode"
import { listPublishedEpisodesFromFixture } from "./published-episodes-provider-core"
import { listPublishedEpisodesFromDatabase } from "./get-published-episodes-from-db.ts"

/**
 * Get the configured episode source.
 * Default: "fixture" (works without DATABASE_URL)
 * Options: "fixture" | "database"
 */
function getConfiguredSource(): "fixture" | "database" {
  const source = process.env.YOUTUBE_EPISODE_SOURCE
  if (source === "database") {
    return "database"
  }
  return "fixture"
}

/**
 * List published episodes.
 *
 * Server-side only. Prevents accidental client-side imports.
 *
 * Returns published episodes (both youtubeVideoId and publishedAt present),
 * sorted newest-first by publishedAt.
 *
 * Source selection via YOUTUBE_EPISODE_SOURCE env var:
 * - "fixture" (default): Development/demo data
 * - "database": Neon PostgreSQL (requires DATABASE_URL)
 *
 * @returns Array of PublishedEpisode, sorted newest-first
 * @throws if database mode and DATABASE_URL missing, or DB error
 */
export async function listPublishedEpisodes(): Promise<PublishedEpisode[]> {
  const source = getConfiguredSource()

  if (source === "database") {
    return listPublishedEpisodesFromDatabase()
  }

  return listPublishedEpisodesFromFixture()
}
