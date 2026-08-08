// ─────────────────────────────────────────────────────────────
// Episode State Provider (Database-Backed, Server-Only)
// ─────────────────────────────────────────────────────────────
// Server-only wrapper for database provider.
// Wires dependencies: database client and episode repository.
// Used when YOUTUBE_EPISODE_SOURCE=database.
// ─────────────────────────────────────────────────────────────

import "server-only"

import { getDatabase } from "../persistence/db.ts"
import { createEpisodeRepository, type PostgresSql } from "../persistence/episode-repository.ts"
import {
  getEpisodeStateFromDb as getEpisodeStateFromDbCore,
  listEpisodeStatesFromDb as listEpisodeStatesFromDbCore,
} from "./get-episode-state-from-db-core.ts"
import type { EpisodeStateSnapshot } from "../domain/episode-state.ts"

/**
 * Get episode state from Neon database (server-only wrapper).
 * Constructs dependencies and calls core provider logic.
 *
 * @param episodeId episode identifier
 * @returns snapshot for rendering, or null if not found
 * @throws if DATABASE_URL is not set or database operation fails
 */
export async function getEpisodeStateFromDb(
  episodeId: string
): Promise<EpisodeStateSnapshot | null> {
  const sql = getDatabase()
  const repository = createEpisodeRepository(sql as unknown as PostgresSql)
  return getEpisodeStateFromDbCore(repository, episodeId)
}

/**
 * List all episodes from database (server-only wrapper).
 *
 * @returns array of snapshots
 * @throws if DATABASE_URL is not set or database operation fails
 */
export async function listEpisodeStatesFromDb(): Promise<EpisodeStateSnapshot[]> {
  const sql = getDatabase()
  const repository = createEpisodeRepository(sql as unknown as PostgresSql)
  return listEpisodeStatesFromDbCore(repository)
}
