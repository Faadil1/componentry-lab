// Transactional command runner
// Ensures command mutations (state + event) execute atomically within a transaction
// Business errors return CommandResult; infrastructure errors throw
//
// Internal use only. Imports testable core (not server-only wrapper).

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
