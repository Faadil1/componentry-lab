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
 * Matches postgres.js JSONValue type for JSON-serializable parameters.
 *
 * Supports:
 * - Scalars: string, number, boolean, Date, null
 * - Objects: plain objects with string/number keys (including custom types)
 * - Arrays: arrays of JSON-serializable values
 * - Objects with toJSON(): serialization hook
 *
 * This is the actual JSONValue type from postgres npm package, ensuring
 * compatibility with both template literals and sql.unsafe().
 */
export type SqlParameter = postgres.JSONValue

// Re-export error type for convenience
export { PostgresError } from "postgres"
