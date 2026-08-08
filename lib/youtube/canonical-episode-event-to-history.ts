// ─────────────────────────────────────────────────────────────
// Canonical Episode Event → Episode History Event Mapper
// ─────────────────────────────────────────────────────────────
// Pure mapping function: transforms canonical event rows to
// timeline read model without interpretation.
// ─────────────────────────────────────────────────────────────

import type { CanonicalEpisodeEvent } from "../persistence/canonical-types"
import type { EpisodeHistoryEvent } from "../domain/episode-history"

/**
 * Map a canonical episode event to history event.
 * Preserves all fields without derivation.
 *
 * @param canonical event record from database
 * @returns history event for timeline display
 */
export function mapCanonicalEventToHistory(
  canonical: CanonicalEpisodeEvent
): EpisodeHistoryEvent {
  return {
    eventId: canonical.eventId,
    episodeId: canonical.episodeId,
    eventType: canonical.eventType,
    actor: canonical.actor,
    fromState: canonical.fromState,
    toState: canonical.toState,
    payload: canonical.payload,
    createdAt: canonical.createdAt,
  }
}
