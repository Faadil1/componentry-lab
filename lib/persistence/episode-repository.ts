// ─────────────────────────────────────────────────────────────
// Episode Repository (Server-Only)
// ─────────────────────────────────────────────────────────────
// Public server-side interface for PostgreSQL backend.
// Application code MUST import only from this module.
// Re-exports live implementation with server-only boundary.
// ─────────────────────────────────────────────────────────────

import "server-only"

export { createMockRepository, type EpisodeRepository } from "./episode-repository-core"
export { createEpisodeRepository } from "./episode-repository-live-core"
export type { PostgresSql } from "./sql-types"
