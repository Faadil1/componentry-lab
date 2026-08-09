// Transactional command runner
// Ensures command mutations (state + event) execute atomically within a transaction

import type { PostgresSql } from "@/lib/persistence/episode-repository-live-core.ts"
import { createEpisodeRepository } from "@/lib/persistence/episode-repository-live-core.ts"
import type { EpisodeRepository } from "@/lib/persistence/episode-repository-core.ts"
import { runInTransaction } from "@/lib/persistence/transaction-runner.ts"
import type { CommandResult } from "./command-result.ts"

/**
 * Run a command within a PostgreSQL transaction.
 * Ensures state mutation + event creation are atomic.
 *
 * If the command or event creation fails, both roll back.
 * If state mutation succeeds but event creation fails, state rolls back.
 */
export async function runCommandInTransaction<T>(
  sql: PostgresSql,
  commandFn: (repository: EpisodeRepository) => Promise<CommandResult<T>>
): Promise<CommandResult<T>> {
  try {
    return await runInTransaction(sql, async (txnSql) => {
      const repository = createEpisodeRepository(txnSql as any)
      return await commandFn(repository)
    })
  } catch (error) {
    // Infrastructure error (not a business error from CommandResult)
    return {
      success: false,
      reason: "invalid_input",
      message: `Transaction failed: ${(error as Error).message}`,
    }
  }
}
