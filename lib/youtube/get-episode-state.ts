// ─────────────────────────────────────────────────────────────
// YouTube OS — Episode State Provider (Server-Only)
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

import type { EpisodeStateSnapshot } from "../domain/episode-state"
import {
  getEpisodeState as getCoreEpisodeState,
  listEpisodes as listCoreEpisodes,
} from "./episode-state-provider-core"
import {
  getEpisodeStateFromDb,
  listEpisodeStatesFromDb,
} from "./get-episode-state-from-db-core.ts"

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
 * Retrieve episode state snapshot.
 *
 * Server-side only. Prevents accidental client-side imports.
 *
 * Returns:
 * - snapshot: episode state (may indicate unavailability)
 * - null: episode does not exist
 *
 * Source selection via YOUTUBE_EPISODE_SOURCE env var:
 * - "fixture" (default): Development/demo data
 * - "database": Neon PostgreSQL (requires DATABASE_URL)
 *
 * @param episodeId - Episode identifier (e.g., "episode-014")
 * @returns EpisodeStateSnapshot or null if episode unknown
 * @throws if database mode and DATABASE_URL missing, or DB error
 */
export async function getEpisodeState(
  episodeId: string
): Promise<EpisodeStateSnapshot | null> {
  const source = getConfiguredSource()

  if (source === "database") {
    return getEpisodeStateFromDb(episodeId)
  }

  return getCoreEpisodeState(episodeId)
}

/**
 * List known episodes.
 *
 * Server-side only. Prevents accidental client-side imports.
 *
 * Source selection via YOUTUBE_EPISODE_SOURCE env var.
 */
export async function listEpisodes(): Promise<
  Array<{ id: string; title: string; episodeNumber?: number }>
> {
  const source = getConfiguredSource()

  if (source === "database") {
    const snapshots = await listEpisodeStatesFromDb()
    return snapshots.map((s) => ({
      id: s.episodeId,
      title: s.title,
      episodeNumber: s.episodeNumber,
    }))
  }

  return listCoreEpisodes()
}
