// Server-only public wrapper for transactional episode repository
// Application code must import from this file, NOT from -core or -live-core
//
// This module enforces the server boundary via 'server-only'.
// Next.js will reject imports into Client Components.

import "server-only"

export {
  createTransactionalEpisodeRepository,
  type EpisodeRepository,
} from "./transactional-episode-repository-core.ts"
