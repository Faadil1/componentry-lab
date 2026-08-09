// Public transactional episode repository factory
// ONLY this file imports episode-repository-live-core (internal implementation)
// Application code must import from this factory, NOT directly from live-core

import type { TransactionSql } from "./sql-types.ts"
import type { EpisodeRepository } from "./episode-repository-core.ts"
import { createEpisodeRepository } from "./episode-repository-live-core.ts"

/**
 * Create a transaction-scoped episode repository.
 *
 * This factory bridges the internal live-core implementation with the public
 * type boundary. Only this module imports episode-repository-live-core.
 *
 * @param txnSql Transaction-scoped SQL client from sql.begin()
 * @returns EpisodeRepository for use within a transaction
 */
export function createTransactionalEpisodeRepository(
  txnSql: TransactionSql
): EpisodeRepository {
  // Cast is safe: TransactionSql extends ISql which satisfies the minimal
  // PostgresSql interface. The repository only uses template-tagged queries,
  // unsafe(), and methods that both types support.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createEpisodeRepository(txnSql as any)
}
