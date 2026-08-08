// ─────────────────────────────────────────────────────────────
// Database Client (Server-Only)
// ─────────────────────────────────────────────────────────────
// Server-side boundary for PostgreSQL/Neon database client.
// Application code must import only from this module.
// Re-exports core with server-only enforcement.
// ─────────────────────────────────────────────────────────────

import "server-only"

export { getDatabaseCore as getDatabase, closeDatabaseCore as closeDatabase } from "./db-core.ts"
