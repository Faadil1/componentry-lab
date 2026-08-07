// ─────────────────────────────────────────────────────────────
// YouTube OS — Episode State Provider
// ─────────────────────────────────────────────────────────────
// STUB / DEVELOPMENT SOURCE
// This provider currently resolves from development fixtures.
// Future: Replace with canonical n8n workflow state source.
// ─────────────────────────────────────────────────────────────

import type { EpisodeStateSnapshot } from "../domain/episode-state"
import {
  snapshotDefaultEditorial,
  snapshotBlockedThumbnail,
  snapshotHumanReviewRequired,
  snapshotApproved,
  snapshotPublished,
} from "../fixtures/episode-state-snapshots"

// Episode ID → fixture mapping (development only)
const fixtureMap: Record<string, EpisodeStateSnapshot> = {
  "episode-014": snapshotDefaultEditorial,
  "episode-014-blocked": snapshotBlockedThumbnail,
  "episode-013": snapshotHumanReviewRequired,
  "episode-013-approved": snapshotApproved,
  "episode-013-published": snapshotPublished,
}

/**
 * Retrieve episode state snapshot.
 *
 * CURRENT: Fixture-backed development source
 * FUTURE: Replaces with canonical n8n workflow state
 *
 * @param episodeId - Episode identifier (e.g., "episode-014")
 * @returns EpisodeStateSnapshot or null if not found
 */
export async function getEpisodeState(
  episodeId: string
): Promise<EpisodeStateSnapshot | null> {
  // Simulate async operation (future: n8n fetch)
  await new Promise((resolve) => setTimeout(resolve, 0))

  const snapshot = fixtureMap[episodeId]

  if (!snapshot) {
    return null
  }

  // Never mutate fixtures — return independent copy
  return structuredClone(snapshot)
}

/**
 * List available episodes for development.
 * Future: Remove when integrated with canonical episode catalog.
 */
export async function listEpisodes(): Promise<
  Array<{ id: string; title: string; episodeNumber?: number }>
> {
  return [
    {
      id: "episode-014",
      title: "Dividend Investing Explained",
      episodeNumber: 14,
    },
    {
      id: "episode-014-blocked",
      title: "Dividend Investing Explained (Blocked)",
      episodeNumber: 14,
    },
    {
      id: "episode-013",
      title: "$1,000 a Month in Dividends (In Review)",
      episodeNumber: 13,
    },
    {
      id: "episode-013-approved",
      title: "$1,000 a Month in Dividends (Approved)",
      episodeNumber: 13,
    },
    {
      id: "episode-013-published",
      title: "$1,000 a Month in Dividends (Published)",
      episodeNumber: 13,
    },
  ]
}
