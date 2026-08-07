// ─────────────────────────────────────────────────────────────
// Episode History Provider — Core Logic (Fixtures)
// ─────────────────────────────────────────────────────────────
// Pure fixture-based provider for development/testing.
// Returns production timeline events for development episodes.
// ─────────────────────────────────────────────────────────────

import type { EpisodeHistory, EpisodeHistoryEvent } from "../domain/episode-history"

// Fixture history events for development episodes
const FIXTURE_HISTORY: Record<string, EpisodeHistoryEvent[]> = {
  "episode-014": [
    {
      eventId: "evt-001",
      episodeId: "episode-014",
      eventType: "state_transition",
      actor: "n8n",
      fromState: "TOPIC",
      toState: "RESEARCH",
      createdAt: "2026-08-01T10:00:00Z",
    },
    {
      eventId: "evt-002",
      episodeId: "episode-014",
      eventType: "state_transition",
      actor: "n8n",
      fromState: "RESEARCH",
      toState: "SCRIPT",
      createdAt: "2026-08-02T14:30:00Z",
    },
    {
      eventId: "evt-003",
      episodeId: "episode-014",
      eventType: "state_transition",
      actor: "n8n",
      fromState: "SCRIPT",
      toState: "EDITORIAL",
      createdAt: "2026-08-03T09:15:00Z",
    },
  ],
  "episode-013": [
    {
      eventId: "evt-004",
      episodeId: "episode-013",
      eventType: "state_transition",
      actor: "n8n",
      fromState: "TOPIC",
      toState: "RESEARCH",
      createdAt: "2026-07-28T11:00:00Z",
    },
    {
      eventId: "evt-005",
      episodeId: "episode-013",
      eventType: "human_decision",
      actor: "youtube-operating-system",
      payload: { outcome: "pass" },
      createdAt: "2026-08-05T02:06:47Z",
    },
  ],
}

/**
 * Get episode production history from fixtures.
 * Returns empty array for unknown episodes (not an error).
 *
 * @param episodeId episode identifier
 * @returns episode history with events (may be empty)
 */
export function getEpisodeHistoryFromFixture(episodeId: string): EpisodeHistory {
  const events = FIXTURE_HISTORY[episodeId] ?? []
  return {
    episodeId,
    events: Object.freeze([...events]),
  }
}
