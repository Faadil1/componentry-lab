// Transaction runner for atomic mutations
// Ensures state updates and audit events commit together or rollback together

import type { PostgresSql } from "./episode-repository-live-core.ts"

/**
 * Run a callback within a PostgreSQL transaction.
 * If callback throws, transaction rolls back automatically.
 * On success, transaction commits.
 *
 * @param sql postgres client
 * @param callback function receiving transaction-scoped sql client
 * @returns callback result
 */
export async function runInTransaction<T>(
  sql: PostgresSql,
  callback: (txn: PostgresSql) => Promise<T>
): Promise<T> {
  try {
    // Start transaction
    await sql`BEGIN`

    // Run callback with same client (transaction-scoped)
    const result = await callback(sql)

    // Commit
    await sql`COMMIT`

    return result
  } catch (error) {
    // Rollback on any error
    try {
      await sql`ROLLBACK`
    } catch {
      // Rollback failure - log but don't suppress original error
    }

    throw error
  }
}
