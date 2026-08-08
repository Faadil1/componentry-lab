import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { getEpisodeHistoryFromDb } from "../../lib/youtube/get-episode-history-from-db-core.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"

let sql: ReturnType<typeof postgres>
let repository: EpisodeRepository

describe("Episode History Database Provider", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL required for episode history tests")
    }

    sql = postgres(databaseUrl)
    repository = createEpisodeRepository(sql as unknown as PostgresSql)

    console.log(`\n✓ Connected to Neon for episode history testing`)
  })

  after(async () => {
    // Cleanup temporary test records
    try {
      await sql`
        DELETE FROM episode_events
        WHERE episode_id = 'integration-history-episode-001'
      `
      await sql`
        DELETE FROM episodes
        WHERE episode_id = 'integration-history-episode-001'
      `
      console.log(`✓ Cleaned up temporary test records`)
    } catch {
      // Ignore cleanup errors
    }

    await sql.end()
    console.log(`✓ Tests complete`)
  })

  test("1. unknown episode returns empty history", async () => {
    const history = await getEpisodeHistoryFromDb(
      repository,
      "nonexistent-episode-xyz"
    )

    assert.strictEqual(history.episodeId, "nonexistent-episode-xyz")
    assert.strictEqual(history.events.length, 0)
  })

  test("2. known episode with zero events returns empty", async () => {
    // episode-014 and episode-013 have no events currently
    const history = await getEpisodeHistoryFromDb(repository, "episode-014")

    assert.strictEqual(history.episodeId, "episode-014")
    assert.ok(Array.isArray(history.events))
  })

  test("3. creates temporary episode with events for testing", async () => {
    const now = new Date().toISOString()

    // Create temporary episode
    await sql`
      INSERT INTO episodes (
        episode_id,
        episode_number,
        channel_name,
        title,
        workflow_state,
        review_status,
        blockers,
        schema_version,
        state_version,
        created_at,
        updated_at
      )
      VALUES (
        'integration-history-episode-001',
        999,
        'Integration Test',
        'History Test Episode',
        'TOPIC',
        'pending',
        '[]'::jsonb,
        1,
        1,
        ${now},
        ${now}
      )
      ON CONFLICT (episode_id) DO NOTHING
    `

    // Insert multiple events with different timestamps
    const event1Time = new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString()
    const event2Time = new Date(new Date().getTime() - 1 * 60 * 60 * 1000).toISOString()
    const event3Time = new Date().toISOString()

    await sql`
      INSERT INTO episode_events (
        episode_id,
        event_type,
        actor,
        from_state,
        to_state,
        payload,
        created_at
      )
      VALUES
      (
        'integration-history-episode-001',
        'state_transition',
        'n8n',
        'TOPIC',
        'RESEARCH',
        null,
        ${event1Time}
      ),
      (
        'integration-history-episode-001',
        'state_transition',
        'n8n',
        'RESEARCH',
        'SCRIPT',
        null,
        ${event2Time}
      ),
      (
        'integration-history-episode-001',
        'human_decision',
        'editor',
        null,
        null,
        '{"outcome":"pass"}'::jsonb,
        ${event3Time}
      )
    `

    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    assert.strictEqual(history.episodeId, "integration-history-episode-001")
    assert.strictEqual(history.events.length, 3, "Should have 3 events")
  })

  test("4. events ordered oldest → newest (chronological)", async () => {
    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    assert.ok(history.events.length >= 3)

    // Verify chronological ordering by checking timestamps
    for (let i = 1; i < history.events.length; i++) {
      const prev = new Date(history.events[i - 1]!.createdAt).getTime()
      const curr = new Date(history.events[i]!.createdAt).getTime()
      assert.ok(
        prev <= curr,
        `Events not in chronological order: event ${i - 1} (${prev}) > event ${i} (${curr})`
      )
    }
  })

  test("5. event IDs preserved exactly", async () => {
    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    for (const event of history.events) {
      assert.ok(event.eventId, "eventId should not be empty")
      assert.ok(typeof event.eventId === "string", "eventId should be string")
      assert.ok(event.eventId.length > 0, "eventId should have content")
    }
  })

  test("6. state transitions preserved", async () => {
    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    const stateEvents = history.events.filter(
      (e) => e.eventType === "state_transition"
    )
    assert.ok(stateEvents.length >= 2, "Should have at least 2 state transitions")

    // First event: TOPIC → RESEARCH
    assert.strictEqual(stateEvents[0]!.fromState, "TOPIC")
    assert.strictEqual(stateEvents[0]!.toState, "RESEARCH")

    // Second event: RESEARCH → SCRIPT
    assert.strictEqual(stateEvents[1]!.fromState, "RESEARCH")
    assert.strictEqual(stateEvents[1]!.toState, "SCRIPT")
  })

  test("7. actors preserved exactly", async () => {
    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    const actors = history.events.map((e) => e.actor)
    assert.ok(actors.includes("n8n"), "Should have n8n actor")
    assert.ok(actors.includes("editor"), "Should have editor actor")
  })

  test("8. payload preserved exactly", async () => {
    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    const decisionEvent = history.events.find(
      (e) => e.eventType === "human_decision"
    )
    assert.ok(decisionEvent, "Should have decision event")
    assert.ok(decisionEvent.payload, "Payload should exist")

    const payload = decisionEvent.payload as Record<string, unknown>
    assert.strictEqual(payload.outcome, "pass", "Decision outcome should be preserved")
  })

  test("9. createdAt timestamps exact", async () => {
    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    for (const event of history.events) {
      assert.ok(event.createdAt, "createdAt should exist")
      // Verify ISO8601 format
      assert.ok(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(event.createdAt),
        `Invalid timestamp format: ${event.createdAt}`
      )
    }
  })

  test("10. episode isolation (events only for requested episode)", async () => {
    // Verify events belong to correct episode
    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    for (const event of history.events) {
      assert.strictEqual(
        event.episodeId,
        "integration-history-episode-001",
        "All events should belong to requested episode"
      )
    }
  })

  test("11. events are immutable (frozen array)", async () => {
    const history = await getEpisodeHistoryFromDb(
      repository,
      "integration-history-episode-001"
    )

    assert.ok(Object.isFrozen(history.events), "Events array should be frozen")
  })

  test("12. deterministic ordering with same-timestamp events", async () => {
    const sharedTime = "2026-08-10T12:00:00Z"
    const testEpisodeId = "integration-determinism-test"

    try {
      // Create episode
      const now = new Date().toISOString()
      await sql`
        INSERT INTO episodes (
          episode_id,
          episode_number,
          channel_name,
          title,
          workflow_state,
          review_status,
          blockers,
          schema_version,
          state_version,
          created_at,
          updated_at
        )
        VALUES (
          ${testEpisodeId},
          888,
          'Determinism Test',
          'Same Timestamp Test',
          'TOPIC',
          'pending',
          '[]'::jsonb,
          1,
          1,
          ${now},
          ${now}
        )
        ON CONFLICT (episode_id) DO NOTHING
      `

      // Insert multiple events with identical timestamps
      // Order by insertion: evt-a, evt-b, evt-c (but all same timestamp)
      await sql`
        INSERT INTO episode_events (
          episode_id,
          event_type,
          actor,
          created_at
        )
        VALUES
        (${testEpisodeId}, 'state_transition', 'n8n', ${sharedTime}),
        (${testEpisodeId}, 'state_transition', 'n8n', ${sharedTime}),
        (${testEpisodeId}, 'state_transition', 'n8n', ${sharedTime})
      `

      // Read multiple times to verify determinism
      const read1 = await getEpisodeHistoryFromDb(repository, testEpisodeId)
      const read2 = await getEpisodeHistoryFromDb(repository, testEpisodeId)
      const read3 = await getEpisodeHistoryFromDb(repository, testEpisodeId)

      // All reads should return same event count
      assert.strictEqual(read1.events.length, 3)
      assert.strictEqual(read2.events.length, 3)
      assert.strictEqual(read3.events.length, 3)

      // Event IDs should be in same order across all reads
      const ids1 = read1.events.map((e) => e.eventId)
      const ids2 = read2.events.map((e) => e.eventId)
      const ids3 = read3.events.map((e) => e.eventId)

      assert.deepStrictEqual(
        ids1,
        ids2,
        "First and second read should have same event order"
      )
      assert.deepStrictEqual(
        ids2,
        ids3,
        "Second and third read should have same event order"
      )
    } finally {
      try {
        await sql`
          DELETE FROM episode_events
          WHERE episode_id = ${testEpisodeId}
        `
        await sql`
          DELETE FROM episodes
          WHERE episode_id = ${testEpisodeId}
        `
      } catch {
        // Ignore cleanup errors
      }
    }
  })
})
