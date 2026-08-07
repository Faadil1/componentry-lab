import type { EpisodeHistory, EpisodeHistoryEvent } from "@/lib/domain/episode-history"

interface EpisodeHistoryTimelineProps {
  history: EpisodeHistory
  className?: string
}

/**
 * Event type to friendly label mapping.
 * Unknown types render with normalized fallback.
 */
function getEventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    state_transition: "Workflow state changed",
    human_decision: "Human decision recorded",
    blocker_added: "Blocker added",
    blocker_resolved: "Blocker resolved",
    publication: "Published",
  }
  return labels[eventType] ?? eventType
}

/**
 * Format event timestamp for display.
 */
function formatEventTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Extract safe payload values for display.
 */
function getPayloadDisplay(event: EpisodeHistoryEvent): React.ReactNode | null {
  if (!event.payload || typeof event.payload !== "object") {
    return null
  }

  const payload = event.payload as Record<string, unknown>

  // Display decision outcome if present
  if ("outcome" in payload && typeof payload.outcome === "string") {
    return `Decision: ${payload.outcome}`
  }

  // Display blocker label if present
  if ("label" in payload && typeof payload.label === "string") {
    return `${payload.label}`
  }

  // Display video ID for publication if present
  if ("youtubeVideoId" in payload && typeof payload.youtubeVideoId === "string") {
    return `Video: ${payload.youtubeVideoId}`
  }

  return null
}

/**
 * Episode History Timeline
 *
 * Displays production workflow events in chronological order (oldest → newest).
 * Renders state transitions, human decisions, and other tracked events.
 */
export function EpisodeHistoryTimeline({
  history,
  className,
}: EpisodeHistoryTimelineProps) {
  if (history.events.length === 0) {
    return (
      <section className={`rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center ${className ?? ""}`}>
        <p className="text-sm font-medium text-neutral-600">
          No production history recorded yet.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Workflow events will appear here as this episode moves through production.
        </p>
      </section>
    )
  }

  return (
    <section className={`space-y-4 ${className ?? ""}`}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-neutral-900">
          Production History
        </h3>
        <p className="text-sm text-neutral-600">
          {history.events.length} event{history.events.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-neutral-200" />

        {/* Timeline events */}
        <div className="space-y-4">
          {history.events.map((event, index) => (
            <div key={event.eventId} className="relative pl-14">
              {/* Timeline dot */}
              <div className="absolute left-0 top-2 h-9 w-9 rounded-full border-2 border-white bg-neutral-300" />

              {/* Event card */}
              <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">
                      {getEventLabel(event.eventType)}
                    </p>

                    {/* State transition */}
                    {event.fromState && event.toState && (
                      <p className="mt-1 text-sm text-neutral-600">
                        <span className="font-mono">{event.fromState}</span>
                        {" → "}
                        <span className="font-mono">{event.toState}</span>
                      </p>
                    )}

                    {/* Payload display */}
                    {getPayloadDisplay(event) && (
                      <p className="mt-1 text-sm text-neutral-600">
                        {getPayloadDisplay(event)}
                      </p>
                    )}

                    {/* Actor and timestamp */}
                    <p className="mt-2 text-xs text-neutral-500">
                      {event.actor} · {formatEventTime(event.createdAt)}
                    </p>
                  </div>

                  {/* Index badge */}
                  {history.events.length > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-neutral-100 text-xs font-medium text-neutral-600">
                      {index + 1}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
