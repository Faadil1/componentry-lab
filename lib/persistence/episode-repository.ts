// ─────────────────────────────────────────────────────────────
// Episode Repository (Server-Only)
// ─────────────────────────────────────────────────────────────
// Public server-side interface for PostgreSQL backend.
// Re-exports live implementation with server-only boundary.
// ─────────────────────────────────────────────────────────────

import "server-only"

export { createMockRepository, type EpisodeRepository } from "./episode-repository-core"
export { createEpisodeRepository, type PostgresSql } from "./episode-repository-live-impl"
