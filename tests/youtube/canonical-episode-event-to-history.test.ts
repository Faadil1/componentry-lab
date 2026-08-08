import { test, describe } from "node:test"
import * as assert from "node:assert"
import { mapCanonicalEventToHistory } from "../../lib/youtube/canonical-episode-event-to-history.ts"
import type { CanonicalEpisodeEvent } from "../../lib/persistence/canonical-types.ts"

describe("mapCanonicalEventToHistory", () => {
  test("1. maps all required fields", () => {
    const canonical: CanonicalEpisodeEvent = {
      eventId: "evt-001",
      episodeId: "episode-014",
      eventType: "state_transition",
      actor: "n8n",
      fromState: "TOPIC",
      toState: "RESEARCH",
      createdAt: "2026-08-01T10:00:00Z",
    }

    const result = mapCanonicalEventToHistory(canonical)

    assert.strictEqual(result.eventId, "evt-001")
    assert.strictEqual(result.episodeId, "episode-014")
    assert.strictEqual(result.eventType, "state_transition")
    assert.strictEqual(result.actor, "n8n")
    assert.strictEqual(result.fromState, "TOPIC")
    assert.strictEqual(result.toState, "RESEARCH")
    assert.strictEqual(result.createdAt, "2026-08-01T10:00:00Z")
  })

  test("2. preserves optional fromState/toState", () => {
    const canonical: CanonicalEpisodeEvent = {
      eventId: "evt-002",
      episodeId: "episode-013",
      eventType: "human_decision",
      actor: "editor",
      fromState: "REVIEW",
      toState: "APPROVED",
      createdAt: "2026-08-02T14:00:00Z",
    }

    const result = mapCanonicalEventToHistory(canonical)

    assert.strictEqual(result.fromState, "REVIEW")
    assert.strictEqual(result.toState, "APPROVED")
  })

  test("3. omits missing fromState/toState", () => {
    const canonical: CanonicalEpisodeEvent = {
      eventId: "evt-003",
      episodeId: "episode-014",
      eventType: "human_decision",
      actor: "youtube-operating-system",
      createdAt: "2026-08-05T02:06:47Z",
    }

    const result = mapCanonicalEventToHistory(canonical)

    assert.strictEqual(result.fromState, undefined)
    assert.strictEqual(result.toState, undefined)
  })

  test("4. preserves payload", () => {
    const payload = { outcome: "pass", notes: "Ready to publish" }
    const canonical: CanonicalEpisodeEvent = {
      eventId: "evt-004",
      episodeId: "episode-014",
      eventType: "human_decision",
      actor: "youtube-operating-system",
      payload,
      createdAt: "2026-08-05T02:06:47Z",
    }

    const result = mapCanonicalEventToHistory(canonical)

    assert.deepStrictEqual(result.payload, payload)
  })

  test("5. handles missing payload", () => {
    const canonical: CanonicalEpisodeEvent = {
      eventId: "evt-005",
      episodeId: "episode-014",
      eventType: "state_transition",
      actor: "n8n",
      fromState: "RESEARCH",
      toState: "SCRIPT",
      createdAt: "2026-08-02T09:00:00Z",
    }

    const result = mapCanonicalEventToHistory(canonical)

    assert.strictEqual(result.payload, undefined)
  })

  test("6. exact timestamp preservation", () => {
    const timestamp = "2026-08-07T15:45:30.123Z"
    const canonical: CanonicalEpisodeEvent = {
      eventId: "evt-006",
      episodeId: "episode-014",
      eventType: "publication",
      actor: "n8n",
      createdAt: timestamp,
    }

    const result = mapCanonicalEventToHistory(canonical)

    assert.strictEqual(result.createdAt, timestamp)
  })

  test("7. unknown event type preserved", () => {
    const canonical: CanonicalEpisodeEvent = {
      eventId: "evt-007",
      episodeId: "episode-014",
      eventType: "future_event_type",
      actor: "system",
      createdAt: "2026-08-06T10:00:00Z",
    }

    const result = mapCanonicalEventToHistory(canonical)

    assert.strictEqual(result.eventType, "future_event_type")
  })

  test("8. does not derive or invent fields", () => {
    const canonical: CanonicalEpisodeEvent = {
      eventId: "evt-008",
      episodeId: "episode-014",
      eventType: "state_transition",
      actor: "n8n",
      fromState: "TOPIC",
      toState: "RESEARCH",
      createdAt: "2026-08-01T10:00:00Z",
    }

    const result = mapCanonicalEventToHistory(canonical)

    // Verify no extra fields were added
    const keys = new Set(Object.keys(result))
    const expectedKeys = [
      "eventId",
      "episodeId",
      "eventType",
      "actor",
      "fromState",
      "toState",
      "payload",
      "createdAt",
    ]
    for (const key of expectedKeys) {
      assert.ok(keys.has(key), `Expected key ${key} not found`)
    }
  })
})
