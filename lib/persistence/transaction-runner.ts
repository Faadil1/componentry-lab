// Transaction runner for atomic mutations
// Ensures state updates and audit events commit together or rollback together
// Uses native postgres.js transaction API for proper connection pooling

import type { PostgresSql, TransactionSql } from "./sql-types.ts"
// Documented cast: postgres.js sql.begin() has complex type unwrapping for Promise<T>

/**
 * Run a callback within a PostgreSQL transaction using native postgres.js API.
 * All queries in callback execute on the same connection within the transaction.
 * On error, transaction automatically rolls back.
 *
 * @param sql postgres client
 * @param callback function receiving transaction-scoped sql client
 * @returns callback result
 * @throws if callback or transaction fails
 */
export async function runInTransaction<T>(
  sql: PostgresSql,
  callback: (txn: TransactionSql) => Promise<T>
): Promise<T> {
  // Use native postgres.js transaction API
  // sql.begin() ensures all queries execute on same connection
  // and handles BEGIN/COMMIT/ROLLBACK automatically
  // postgres.js sql.begin() has complex type unwrapping;  for Promise<T> it returns T directly
  return sql.begin((txn) => callback(txn)) as Promise<T>
}
