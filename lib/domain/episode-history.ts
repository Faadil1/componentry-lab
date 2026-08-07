// ─────────────────────────────────────────────────────────────
// Episode History — Domain Read Model
// ─────────────────────────────────────────────────────────────
// Read-model for episode production history timeline.
// Represents audit trail events from episode_events table.
// ─────────────────────────────────────────────────────────────

export interface EpisodeHistoryEvent {
  eventId: string
  episodeId: string
  eventType: string
  actor: string
  fromState?: string
  toState?: string
  payload?: unknown
  createdAt: string
}

export interface EpisodeHistory {
  episodeId: string
  events: readonly EpisodeHistoryEvent[]
}
