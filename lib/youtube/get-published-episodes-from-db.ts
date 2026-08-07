import "server-only"

// ─────────────────────────────────────────────────────────────
// Published Episodes Provider (Database-Backed Wrapper)
// ─────────────────────────────────────────────────────────────
// Server-only public API for application code.
// Enforces server boundary and wires dependencies.
// ─────────────────────────────────────────────────────────────

import { getDatabase } from "../persistence/db.ts"
import { createEpisodeRepository, type PostgresSql } from "../persistence/episode-repository.ts"
import { listPublishedEpisodesFromDb } from "./get-published-episodes-from-db-core.ts"
import type { PublishedEpisode } from "../domain/published-episode.ts"

/**
 * List published episodes from Neon database (server-only).
 *
 * @returns published episodes, sorted newest first
 * @throws if database connection or query fails
 */
export async function listPublishedEpisodesFromDatabase(): Promise<
  PublishedEpisode[]
> {
  const sql = getDatabase()
  const repository = createEpisodeRepository(sql as unknown as PostgresSql)
  return listPublishedEpisodesFromDb(repository)
}
