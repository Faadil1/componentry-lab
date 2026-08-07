// ─────────────────────────────────────────────────────────────
// YouTube OS — Episode History Provider (Server-Only)
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

import type { EpisodeHistory } from "../domain/episode-history"
import { getEpisodeHistoryFromFixture } from "./episode-history-provider-core"
import { getEpisodeHistoryFromDatabase } from "./get-episode-history-from-db.ts"

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
 * Get episode production history.
 *
 * Server-side only. Prevents accidental client-side imports.
 *
 * Returns production timeline events in chronological order (oldest → newest).
 * Unknown episodes return empty event list (not an error).
 *
 * Source selection via YOUTUBE_EPISODE_SOURCE env var:
 * - "fixture" (default): Development/demo data
 * - "database": Neon PostgreSQL (requires DATABASE_URL)
 *
 * @param episodeId episode identifier (e.g., "episode-014")
 * @returns EpisodeHistory with events (may be empty)
 * @throws if database mode and DATABASE_URL missing, or DB error
 */
export async function getEpisodeHistory(
  episodeId: string
): Promise<EpisodeHistory> {
  const source = getConfiguredSource()

  if (source === "database") {
    return getEpisodeHistoryFromDatabase(episodeId)
  }

  return getEpisodeHistoryFromFixture(episodeId)
}
