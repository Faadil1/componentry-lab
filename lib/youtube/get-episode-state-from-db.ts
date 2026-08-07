// ─────────────────────────────────────────────────────────────
// Episode State Provider (Database-Backed, Server-Only)
// ─────────────────────────────────────────────────────────────
// Server-only wrapper for database provider.
// Used when YOUTUBE_EPISODE_SOURCE=database.
// Re-exports core with server-only boundary.
// ─────────────────────────────────────────────────────────────

import "server-only"

export { getEpisodeStateFromDb, listEpisodeStatesFromDb } from "./get-episode-state-from-db-core.ts"
