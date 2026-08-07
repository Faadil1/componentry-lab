import { test, describe } from "node:test"
import * as assert from "node:assert"
import {
  normalizeTimestamp,
  mapRowToEpisode,
  mapRowToEpisodeEvent,
  type EpisodeRow,
  type EpisodeEventRow,
} from "../../lib/persistence/episode-row-mappers.ts"

describe("Episode Row Mappers", () => {
  describe("normalizeTimestamp", () => {
    test("1. converts Date to ISO string", () => {
      const date = new Date("2026-08-07T12:30:00Z")
      const result = normalizeTimestamp(date, "test_field", true)
      assert.strictEqual(result, "2026-08-07T12:30:00.000Z")
    })

    test("2. accepts valid ISO 8601 string", () => {
      const isoString = "2026-08-07T12:30:00.000Z"
      const result = normalizeTimestamp(isoString, "test_field", true)
      assert.strictEqual(result, isoString)
    })

    test("3. throws for invalid Date object", () => {
      const invalidDate = new Date("invalid")
      assert.throws(
        () => normalizeTimestamp(invalidDate, "test_field", true),
        /invalid Date/
      )
    })

    test("4. throws for invalid ISO string", () => {
      assert.throws(
        () => normalizeTimestamp("not-a-date", "test_field", true),
        /not ISO 8601/
      )
    })

    test("5. throws for required null field", () => {
      assert.throws(
        () => normalizeTimestamp(null, "test_field", true),
        /Required field test_field is missing/
      )
    })

    test("6. returns undefined for optional null field", () => {
      const result = normalizeTimestamp(null, "test_field", false)
      assert.strictEqual(result, undefined)
    })

    test("7. throws for unexpected type", () => {
      assert.throws(
        () => normalizeTimestamp(123, "test_field", true),
        /unexpected type/
      )
    })
  })

  describe("mapRowToEpisode", () => {
    test("1. maps all required fields", () => {
      const row: EpisodeRow = {
        episode_id: "episode-001",
        episode_number: 1,
        channel_name: "Test Channel",
        title: "Test Episode",
        workflow_state: "TOPIC",
        review_status: "not-required",
        blockers: [],
        latest_decision: null,
        youtube_video_id: null,
        published_at: null,
        schema_version: 1,
        state_version: 1,
        created_at: "2026-08-07T10:00:00Z",
        updated_at: "2026-08-07T10:00:00Z",
      }

      const episode = mapRowToEpisode(row)

      assert.strictEqual(episode.episodeId, "episode-001")
      assert.strictEqual(episode.channelName, "Test Channel")
      assert.strictEqual(episode.title, "Test Episode")
      assert.strictEqual(episode.workflowState, "TOPIC")
      assert.strictEqual(episode.stateVersion, 1)
      assert.ok(episode.createdAt)
      assert.ok(episode.updatedAt)
    })

    test("2. handles Date timestamps from database", () => {
      const now = new Date()
      const row: EpisodeRow = {
        episode_id: "ep-001",
        episode_number: null,
        channel_name: "Ch",
        title: "T",
        workflow_state: "RESEARCH",
        review_status: "not-required",
        blockers: null,
        latest_decision: null,
        youtube_video_id: null,
        published_at: null,
        schema_version: 1,
        state_version: 1,
        created_at: now,
        updated_at: now,
      }

      const episode = mapRowToEpisode(row)

      assert.ok(episode.createdAt.includes("T"))
      assert.ok(episode.updatedAt.includes("T"))
      assert.strictEqual(typeof episode.createdAt, "string")
      assert.strictEqual(typeof episode.updatedAt, "string")
    })

    test("3. omits optional null fields", () => {
      const row: EpisodeRow = {
        episode_id: "ep-001",
        episode_number: null,
        channel_name: "Ch",
        title: "T",
        workflow_state: "TOPIC",
        review_status: "not-required",
        blockers: null,
        latest_decision: null,
        youtube_video_id: null,
        published_at: null,
        schema_version: 1,
        state_version: 1,
        created_at: "2026-08-07T10:00:00Z",
        updated_at: "2026-08-07T10:00:00Z",
      }

      const episode = mapRowToEpisode(row)

      assert.strictEqual(episode.episodeNumber, undefined)
      assert.strictEqual(episode.youtubeVideoId, undefined)
      assert.strictEqual(episode.publishedAt, undefined)
      assert.deepStrictEqual(episode.blockers, [])
      assert.strictEqual(episode.latestDecision, undefined)
    })

    test("4. preserves blockers array", () => {
      const blockers = [
        {
          id: "b1",
          code: "BLOCKER_1",
          label: "Issue",
          severity: "high" as const,
          source: "test",
          createdAt: "2026-08-07T10:00:00Z",
        },
      ]

      const row: EpisodeRow = {
        episode_id: "ep-001",
        episode_number: null,
        channel_name: "Ch",
        title: "T",
        workflow_state: "TOPIC",
        review_status: "not-required",
        blockers,
        latest_decision: null,
        youtube_video_id: null,
        published_at: null,
        schema_version: 1,
        state_version: 1,
        created_at: "2026-08-07T10:00:00Z",
        updated_at: "2026-08-07T10:00:00Z",
      }

      const episode = mapRowToEpisode(row)

      assert.strictEqual(episode.blockers.length, 1)
      assert.strictEqual(episode.blockers[0].id, "b1")
      assert.strictEqual(episode.blockers[0].severity, "high")
    })

    test("5. preserves decision object", () => {
      const decision = {
        outcome: "pass" as const,
        decidedBy: "alice@test.com",
        decidedAt: "2026-08-07T10:00:00Z",
        notes: "Looks good",
      }

      const row: EpisodeRow = {
        episode_id: "ep-001",
        episode_number: null,
        channel_name: "Ch",
        title: "T",
        workflow_state: "TOPIC",
        review_status: "completed",
        blockers: null,
        latest_decision: decision,
        youtube_video_id: null,
        published_at: null,
        schema_version: 1,
        state_version: 1,
        created_at: "2026-08-07T10:00:00Z",
        updated_at: "2026-08-07T10:00:00Z",
      }

      const episode = mapRowToEpisode(row)

      assert.ok(episode.latestDecision)
      assert.strictEqual(episode.latestDecision.outcome, "pass")
      assert.strictEqual(episode.latestDecision.decidedBy, "alice@test.com")
    })
  })

  describe("mapRowToEpisodeEvent", () => {
    test("1. maps all event fields", () => {
      const row: EpisodeEventRow = {
        event_id: "evt-001",
        episode_id: "ep-001",
        event_type: "STATE_CHANGED",
        actor: "n8n",
        from_state: "TOPIC",
        to_state: "RESEARCH",
        payload: { reason: "approved" },
        idempotency_key: "n8n-exec-123",
        created_at: "2026-08-07T10:00:00Z",
      }

      const event = mapRowToEpisodeEvent(row)

      assert.strictEqual(event.eventId, "evt-001")
      assert.strictEqual(event.episodeId, "ep-001")
      assert.strictEqual(event.eventType, "STATE_CHANGED")
      assert.strictEqual(event.actor, "n8n")
      assert.strictEqual(event.fromState, "TOPIC")
      assert.strictEqual(event.toState, "RESEARCH")
      assert.deepStrictEqual(event.payload, { reason: "approved" })
      assert.strictEqual(event.idempotencyKey, "n8n-exec-123")
    })

    test("2. handles null optional fields", () => {
      const row: EpisodeEventRow = {
        event_id: "evt-001",
        episode_id: "ep-001",
        event_type: "EPISODE_CREATED",
        actor: "system",
        from_state: null,
        to_state: null,
        payload: null,
        idempotency_key: null,
        created_at: "2026-08-07T10:00:00Z",
      }

      const event = mapRowToEpisodeEvent(row)

      assert.strictEqual(event.fromState, undefined)
      assert.strictEqual(event.toState, undefined)
      assert.strictEqual(event.payload, undefined)
      assert.strictEqual(event.idempotencyKey, undefined)
    })

    test("3. preserves payload objects", () => {
      const payload = { custom: "data", nested: { value: 123 } }

      const row: EpisodeEventRow = {
        event_id: "evt-001",
        episode_id: "ep-001",
        event_type: "CUSTOM_EVENT",
        actor: "test",
        from_state: null,
        to_state: null,
        payload,
        idempotency_key: null,
        created_at: "2026-08-07T10:00:00Z",
      }

      const event = mapRowToEpisodeEvent(row)

      assert.deepStrictEqual(event.payload, payload)
    })
  })
})
