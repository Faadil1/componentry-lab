// Testable transactional command runner
// INTERNAL: Core runner for use by tests and the server-only public wrapper
//
// This module is NOT server-only so it can be tested directly by Node.
// Tests may import this directly. Application code must NOT.
// Application code must import from transactional-command-runner.ts (server-only).

import type { PostgresSql } from "../../persistence/sql-types.ts"
import { createTransactionalEpisodeRepository } from "../../persistence/transactional-episode-repository-core.ts"
import type { EpisodeRepository } from "../../persistence/episode-repository-core.ts"
import { runInTransaction } from "../../persistence/transaction-runner.ts"
import type { CommandResult } from "./command-result.ts"

/**
 * Run a command within a PostgreSQL transaction.
 * Ensures state mutation + event creation are atomic.
 *
 * Business failures (not_found, conflict, invalid_input) return CommandResult.
 * Infrastructure failures (transaction failure, database error) throw.
 * Caller (Server Action) handles infrastructure errors at UI boundary.
 *
 * This is the testable core runner. Tests import this directly.
 * Application code must import from transactional-command-runner.ts instead.
 */
export async function runCommandInTransaction<T>(
  sql: PostgresSql,
  commandFn: (repository: EpisodeRepository) => Promise<CommandResult<T>>
): Promise<CommandResult<T>> {
  // Let infrastructure errors throw through
  // Server Action catches at UI boundary
  return runInTransaction(sql, async (txnSql) => {
    const repository = createTransactionalEpisodeRepository(txnSql)
    return await commandFn(repository)
  })
}
