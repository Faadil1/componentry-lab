import "server-only"

import { getDatabase } from "@/lib/persistence/db"
import { createEpisodeRepository } from "@/lib/persistence/episode-repository"
import type { CanonicalEpisodeResearch } from "@/lib/persistence/canonical-types"

/**
 * Server-only provider to fetch canonical episode research packet.
 * Returns null if episode or research doesn't exist.
 */
export async function getEpisodeResearch(
  episodeId: string
): Promise<CanonicalEpisodeResearch | null> {
  const sql = getDatabase()
  const repository = createEpisodeRepository(sql)
  return repository.getEpisodeResearch(episodeId)
}
