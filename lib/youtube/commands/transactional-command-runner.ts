// Server-only public wrapper for transactional command runner
// Application code must import from this file, NOT from -core
//
// This module enforces the server boundary via 'server-only'.
// Next.js will reject imports into Client Components.

import "server-only"

export { runCommandInTransaction } from "./transactional-command-runner-core.ts"
