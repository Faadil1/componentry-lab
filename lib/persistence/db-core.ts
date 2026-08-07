// ─────────────────────────────────────────────────────────────
// Database Client Core (INTERNAL)
// ─────────────────────────────────────────────────────────────
// Internal/testable PostgreSQL client factory.
// ⚠️  APPLICATION CODE MUST NOT IMPORT THIS DIRECTLY.
// Application code must import only from db.ts which enforces the
// server-only boundary.
// ─────────────────────────────────────────────────────────────

import postgres from "postgres"

let cachedSql: ReturnType<typeof postgres> | null = null

/**
 * Get or create the shared PostgreSQL client.
 * Fails with a clear error if DATABASE_URL is not configured.
 *
 * @returns postgres client from 'postgres' npm package
 * @throws if DATABASE_URL is not set
 */
export function getDatabaseCore(): ReturnType<typeof postgres> {
  // Return cached client if already created
  if (cachedSql) {
    return cachedSql
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required for database mode.\n" +
        "Set it in .env.local and ensure it's loaded in your environment."
    )
  }

  try {
    cachedSql = postgres(databaseUrl)
    return cachedSql
  } catch (err) {
    throw new Error(
      `Failed to create database connection: ${(err as Error).message}`
    )
  }
}

/**
 * Close the database client (for cleanup in tests).
 * Safe to call even if client was never created.
 */
export async function closeDatabaseCore(): Promise<void> {
  if (cachedSql) {
    try {
      await cachedSql.end()
      cachedSql = null
    } catch (err) {
      console.error("Warning: Failed to close database connection gracefully")
    }
  }
}
