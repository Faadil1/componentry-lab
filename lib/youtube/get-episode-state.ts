// ─────────────────────────────────────────────────────────────
// YouTube OS — Episode State Provider (Server-Only)
// ─────────────────────────────────────────────────────────────
// Server-side wrapper around core provider logic.
// Enforces server-only execution boundary.
//
// STUB / DEVELOPMENT SOURCE
// This provider currently resolves from development fixtures.
// Future: Replace with canonical n8n workflow state source.
// ─────────────────────────────────────────────────────────────

import "server-only"

import type { EpisodeStateSnapshot } from "../domain/episode-state"
import {
  getEpisodeState as getCoreEpisodeState,
  listEpisodes as listCoreEpisodes,
} from "./episode-state-provider-core"

/**
 * Retrieve episode state snapshot.
 *
 * Server-side only. Prevents accidental client-side imports.
 *
 * Returns:
 * - snapshot: episode state (may indicate unavailability)
 * - null: episode does not exist
 *
 * CURRENT: Fixture-backed development source
 * FUTURE: Replaces with canonical n8n workflow state
 *
 * @param episodeId - Episode identifier (e.g., "episode-014")
 * @returns EpisodeStateSnapshot or null if episode unknown
 */
export async function getEpisodeState(
  episodeId: string
): Promise<EpisodeStateSnapshot | null> {
  return getCoreEpisodeState(episodeId)
}

/**
 * List known episodes.
 *
 * Server-side only. Prevents accidental client-side imports.
 *
 * Future: Replace with canonical episode catalog.
 */
export async function listEpisodes(): Promise<
  Array<{ id: string; title: string; episodeNumber?: number }>
> {
  return listCoreEpisodes()
}
