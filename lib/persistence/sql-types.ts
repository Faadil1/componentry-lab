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

/**
 * Valid SQL parameter value type for use with sql.unsafe().
 * Re-exported directly from postgres npm package for type safety.
 *
 * Supports: scalars, null, Date, objects, arrays, and postgres Helper/Parameter types.
 * This is the exact type expected by Sql.unsafe(query, parameters).
 */
export type SqlParameter<T = never> = postgres.ParameterOrJSON<T>

// Re-export error type for convenience
export { PostgresError } from "postgres"
