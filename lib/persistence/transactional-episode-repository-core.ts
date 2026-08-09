// Testable transactional episode repository factory
// INTERNAL: Core factory for use by tests and the server-only public wrapper
//
// This module is NOT server-only so it can be tested directly by Node.
// Tests may import this directly. Application code must NOT.
// Application code must import from transactional-episode-repository.ts (server-only).

import type { TransactionSql } from "./sql-types.ts"
import type { EpisodeRepository } from "./episode-repository-core.ts"
import { createEpisodeRepository } from "./episode-repository-live-core.ts"

/**
 * Create a transaction-scoped episode repository.
 *
 * This is the testable core factory. Tests import this directly.
 * Application code must import from transactional-episode-repository.ts instead.
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
