import "server-only"

// ─────────────────────────────────────────────────────────────
// Episode History Provider (Database-Backed Wrapper)
// ─────────────────────────────────────────────────────────────
// Server-only public API for application code.
// Enforces server boundary and wires dependencies.
// ─────────────────────────────────────────────────────────────

import { getDatabase } from "../persistence/db.ts"
import { createEpisodeRepository, type PostgresSql } from "../persistence/episode-repository.ts"
import { getEpisodeHistoryFromDb } from "./get-episode-history-from-db-core.ts"
import type { EpisodeHistory } from "../domain/episode-history.ts"

/**
 * Get episode production history from Neon database (server-only).
 * Returns chronological timeline of workflow events.
 *
 * @param episodeId episode identifier
 * @returns episode history with events (may be empty for no events)
 * @throws if DATABASE_URL is not set or database operation fails
 */
export async function getEpisodeHistoryFromDatabase(
  episodeId: string
): Promise<EpisodeHistory> {
  const sql = getDatabase()
  const repository = createEpisodeRepository(sql as unknown as PostgresSql)
  return getEpisodeHistoryFromDb(repository, episodeId)
}
