// ─────────────────────────────────────────────────────────────
// Episode State Provider (Database-Backed Core)
// ─────────────────────────────────────────────────────────────
// INTERNAL - TEST USE ONLY
// Core database provider logic without server-only boundary.
// Testable by Node for integration testing.
// Application code must import from get-episode-state-from-db.ts
// ─────────────────────────────────────────────────────────────

import { getDatabase } from "../persistence/db.ts"
import { createEpisodeRepository, type PostgresSql } from "../persistence/episode-repository-live-core.ts"
import { mapCanonicalEpisodeToSnapshot } from "./canonical-episode-to-snapshot.ts"
import type { EpisodeStateSnapshot } from "../domain/episode-state.ts"

/**
 * Get episode state from Neon database.
 * Requires DATABASE_URL to be set.
 *
 * @param episodeId episode identifier
 * @returns snapshot for rendering, or null if not found
 * @throws if DATABASE_URL is not set
 */
export async function getEpisodeStateFromDb(
  episodeId: string
): Promise<EpisodeStateSnapshot | null> {
  try {
    const sql = getDatabase()
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

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
 * Requires DATABASE_URL to be set.
 *
 * @returns array of snapshots
 * @throws if DATABASE_URL is not set
 */
export async function listEpisodeStatesFromDb(): Promise<EpisodeStateSnapshot[]> {
  try {
    const sql = getDatabase()
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const canonicals = await repository.listEpisodes()
    return canonicals.map(mapCanonicalEpisodeToSnapshot)
  } catch (err) {
    // Surface database errors - do NOT fall back to fixtures
    throw new Error(`Database provider failed to list episodes: ${(err as Error).message}`)
  }
}
