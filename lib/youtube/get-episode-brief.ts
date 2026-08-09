import "server-only"

import { getDatabase } from "@/lib/persistence/db"
import { createEpisodeRepository } from "@/lib/persistence/episode-repository"
import type { CanonicalEpisodeBrief } from "@/lib/persistence/canonical-types"

/**
 * Server-only provider to fetch canonical episode brief.
 * Returns null if episode or brief doesn't exist.
 */
export async function getEpisodeBrief(
  episodeId: string
): Promise<CanonicalEpisodeBrief | null> {
  const sql = getDatabase()
  const repository = createEpisodeRepository(sql)
  return repository.getEpisodeBrief(episodeId)
}
