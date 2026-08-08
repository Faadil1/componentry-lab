// ─────────────────────────────────────────────────────────────
// Episode State Provider — Core Logic
// ─────────────────────────────────────────────────────────────
// Pure fixture-backed provider logic, testable by Node.
// No React / Next.js / server-only dependencies.
// This module is imported by the server-only wrapper.
// ─────────────────────────────────────────────────────────────

import type { EpisodeStateSnapshot } from "../domain/episode-state.ts"
import {
  snapshotDefaultEditorial,
  snapshotBlockedThumbnail,
  snapshotHumanReviewRequired,
  snapshotApproved,
  snapshotPublished,
  snapshotUnavailableManifestFetchFailed,
} from "../fixtures/episode-state-snapshots.ts"

// ── CATALOG ────────────────────────────────────────────────
// Known episode IDs and metadata. Existence is independent of
// state availability.

interface CatalogEntry {
  id: string
  title: string
  episodeNumber?: number
}

export const episodeCatalog: CatalogEntry[] = [
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
  {
    id: "episode-015",
    title: "State Source Unavailable (Development Test Case)",
    episodeNumber: 15,
  },
]

// ── STATE MAP ──────────────────────────────────────────────
// Known snapshots indexed by catalog ID.
// Missing entries or null values indicate unavailable state.

const stateMap: Record<string, EpisodeStateSnapshot | null> = {
  "episode-014": snapshotDefaultEditorial,
  "episode-014-blocked": snapshotBlockedThumbnail,
  "episode-013": snapshotHumanReviewRequired,
  "episode-013-approved": snapshotApproved,
  "episode-013-published": snapshotPublished,
  // episode-015 is in catalog but has unavailable state
  "episode-015": {
    // Use as base and override unavailableReason
    ...snapshotUnavailableManifestFetchFailed,
    episodeId: "episode-015",
    episodeNumber: 15,
    title: "State Source Unavailable (Development Test Case)",
    unavailableReason:
      "STATE_SOURCE_UNAVAILABLE: development simulation for testing unavailable behavior",
  },
}

/**
 * Check if episode exists in catalog.
 * Does not indicate state availability.
 */
export function episodeExistsInCatalog(episodeId: string): boolean {
  return episodeCatalog.some((ep) => ep.id === episodeId)
}

/**
 * Retrieve episode state snapshot.
 *
 * Return values:
 * - snapshot: state available (may have unavailableReason field)
 * - null: episode does not exist in catalog
 *
 * DEVELOPMENT: Fixture-backed.
 * FUTURE: Replace with canonical n8n workflow state.
 *
 * @param episodeId - Episode identifier (e.g., "episode-014")
 * @returns EpisodeStateSnapshot or null if episode unknown
 */
export async function getEpisodeState(
  episodeId: string
): Promise<EpisodeStateSnapshot | null> {
  // Simulate async operation (future: n8n fetch)
  await new Promise((resolve) => setTimeout(resolve, 0))

  // Unknown episode (not in catalog)
  if (!episodeExistsInCatalog(episodeId)) {
    return null
  }

  // Known episode, get state (may be unavailable)
  const snapshot = stateMap[episodeId]

  if (!snapshot) {
    // Known in catalog but state is not available
    // Return unavailable snapshot
    const catalogEntry = episodeCatalog.find((ep) => ep.id === episodeId)
    return {
      episodeId,
      episodeNumber: catalogEntry?.episodeNumber,
      channelName: "Wealth Decoded",
      title: catalogEntry?.title || episodeId,
      workflowState: "UNKNOWN",
      reviewStatus: "not-required",
      blockers: [],
      unavailableReason: "STATE_SOURCE_UNAVAILABLE: state not available in development",
      source: {
        fetchedAt: new Date().toISOString(),
      },
    }
  }

  // Never mutate fixtures — return independent copy
  return structuredClone(snapshot)
}

/**
 * List known episodes from catalog.
 * Future: Replace with canonical episode catalog.
 */
export async function listEpisodes(): Promise<
  Array<{ id: string; title: string; episodeNumber?: number }>
> {
  return structuredClone(episodeCatalog)
}
