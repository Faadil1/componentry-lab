// Public SQL type boundary
// Stable type contracts for PostgreSQL client from postgres npm package
// Preferred usage: import from this module, NOT from episode-repository-live-core.ts

import type postgres from "postgres"

/**
 * Root SQL client type from postgres npm package.
 * Supports both standalone queries and transactions via begin().
 *
 * This is the public interface that commands, app code, and transaction runners
 * depend on. It ensures type safety without exposing internal live-core implementation.
 */
export type PostgresSql = postgres.Sql

/**
 * Transaction-scoped SQL client type.
 * Returned to the callback in sql.begin((txn: TransactionSql) => ...).
 *
 * This is the same interface as PostgresSql but exists within a transaction context.
 * All queries execute on the same connection and rollback on error.
 */
export type TransactionSql = postgres.TransactionSql

// Re-export error type for convenience
export { PostgresError } from "postgres"
