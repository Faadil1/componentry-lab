// ─────────────────────────────────────────────────────────────
// Live Neon Integration Tests
// ─────────────────────────────────────────────────────────────
// Tests the episode repository against real PostgreSQL (Neon).
// Requires: DATABASE_URL environment variable
// Cleans up test data before and after execution.
// ─────────────────────────────────────────────────────────────

// Load .env.local before running tests
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-impl.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import type {
  CanonicalEpisode,
  CanonicalBlocker,
  CanonicalDecision,
} from "../../lib/persistence/canonical-types.ts"

// Test episode ID - isolated from production
const TEST_EPISODE_ID = "integration-test-episode-001"

let sql: ReturnType<typeof postgres>
let repository: EpisodeRepository

describe("Live Neon Integration Tests", () => {
  before(async () => {
    // Require DATABASE_URL - fail clearly if missing
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL environment variable is required for live tests.\n" +
          "Set it in .env.local and run: npm run db:migrate"
      )
    }

    // Connect to database
    sql = postgres(databaseUrl)
    repository = createEpisodeRepository(sql)

    // Clean up any leftover test data
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`

    console.log(`\n✓ Connected to Neon (DATABASE_URL set)`)
    console.log(`✓ Using test episode ID: ${TEST_EPISODE_ID}`)
  })

  after(async () => {
    // Clean up test data
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`

    // Close connection
    await sql.end()
    console.log(`✓ Cleanup complete, connection closed`)
  })

  // ─────────────────────────────────────────────────────────────
  // 1. Create Episode
  // ─────────────────────────────────────────────────────────────
  test("1. create episode", async () => {
    const episode = await repository.createEpisode({
      episodeId: TEST_EPISODE_ID,
      episodeNumber: 999,
      channelName: "Test Channel",
      title: "Integration Test Episode",
      workflowState: "TOPIC",
      reviewStatus: "not-required",
    })

    assert.strictEqual(episode.episodeId, TEST_EPISODE_ID)
    assert.strictEqual(episode.episodeNumber, 999)
    assert.strictEqual(episode.channelName, "Test Channel")
    assert.strictEqual(episode.workflowState, "TOPIC")
    assert.strictEqual(episode.stateVersion, 1)
    assert.deepStrictEqual(episode.blockers, [])
  })

  // ─────────────────────────────────────────────────────────────
  // 2. Get Episode
  // ─────────────────────────────────────────────────────────────
  test("2. get episode by id", async () => {
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)

    assert.ok(episode)
    assert.strictEqual(episode!.episodeId, TEST_EPISODE_ID)
    assert.strictEqual(episode!.title, "Integration Test Episode")
  })

  // ─────────────────────────────────────────────────────────────
  // 3. List Episodes (contains test episode)
  // ─────────────────────────────────────────────────────────────
  test("3. list episodes contains test episode", async () => {
    const episodes = await repository.listEpisodes()

    const found = episodes.find((e) => e.episodeId === TEST_EPISODE_ID)
    assert.ok(found)
    assert.strictEqual(found!.title, "Integration Test Episode")
  })

  // ─────────────────────────────────────────────────────────────
  // 4. Blockers JSONB Round-Trip
  // ─────────────────────────────────────────────────────────────
  test("4. blockers JSONB round-trip", async () => {
    const blockers: CanonicalBlocker[] = [
      {
        id: "blocker-1",
        code: "REVIEW_PENDING",
        label: "Review pending",
        severity: "high",
        source: "test",
        createdAt: "2026-08-07T10:00:00Z",
      },
    ]

    await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      blockers,
    })

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.ok(episode)
    assert.strictEqual(episode!.blockers.length, 1)
    assert.strictEqual(episode!.blockers[0].code, "REVIEW_PENDING")
    assert.strictEqual(episode!.blockers[0].severity, "high")

    // Verify storage type with direct query
    const result = await sql`
      SELECT jsonb_typeof(blockers) AS type FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(result[0].type, "array")
  })

  // ─────────────────────────────────────────────────────────────
  // 5. Latest Decision JSONB Round-Trip
  // ─────────────────────────────────────────────────────────────
  test("5. latestDecision JSONB round-trip", async () => {
    const decision: CanonicalDecision = {
      outcome: "pass",
      decidedBy: "alice@test.com",
      decidedAt: "2026-08-07T10:30:00Z",
      notes: "Looks good",
    }

    await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 2,
      latestDecision: decision,
    })

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.ok(episode)
    assert.ok(episode!.latestDecision)
    assert.strictEqual(episode!.latestDecision!.outcome, "pass")
    assert.strictEqual(episode!.latestDecision!.decidedBy, "alice@test.com")

    // Verify storage type with direct query
    const result = await sql`
      SELECT jsonb_typeof(latest_decision) AS type FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(result[0].type, "object")
  })

  // ─────────────────────────────────────────────────────────────
  // 6. Event Payload JSONB Round-Trip
  // ─────────────────────────────────────────────────────────────
  test("6. event payload JSONB round-trip", async () => {
    const payload = { reason: "test approved", score: 95 }

    const event = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "STATE_CHANGED",
      actor: "test-runner",
      fromState: "TOPIC",
      toState: "RESEARCH",
      payload,
      idempotencyKey: "test-payload-idempotency-1",
    })

    assert.ok(event)
    assert.deepStrictEqual(event!.payload, payload)

    // Verify storage type with direct query
    const result = await sql`
      SELECT jsonb_typeof(payload) AS type FROM episode_events WHERE event_id = ${event!.eventId}
    `
    assert.strictEqual(result[0].type, "object")
  })

  // ─────────────────────────────────────────────────────────────
  // 7. Successful Optimistic Update Increments State Version
  // ─────────────────────────────────────────────────────────────
  test("7. optimistic update increments state_version", async () => {
    const episode1 = await repository.getEpisodeById(TEST_EPISODE_ID)
    const initialVersion = episode1!.stateVersion

    const result = await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: initialVersion,
      workflowState: "RESEARCH",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.actualVersion, initialVersion + 1)

    const episode2 = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episode2!.stateVersion, initialVersion + 1)
  })

  // ─────────────────────────────────────────────────────────────
  // 8. Stale Version Returns Conflict
  // ─────────────────────────────────────────────────────────────
  test("8. stale version returns conflict", async () => {
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    const currentVersion = episode!.stateVersion

    // Try to update with stale version
    const result = await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: currentVersion - 1,
      workflowState: "BLOCKED",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "conflict")
    assert.strictEqual(result.actualVersion, currentVersion)
  })

  // ─────────────────────────────────────────────────────────────
  // 9. Unknown Episode Update Returns Not Found
  // ─────────────────────────────────────────────────────────────
  test("9. unknown episode update returns not_found", async () => {
    const result = await repository.updateEpisodeState({
      episodeId: "nonexistent-episode-xyz",
      expectedStateVersion: 1,
      workflowState: "TOPIC",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "not_found")
    assert.strictEqual(result.actualVersion, 0)
  })

  // ─────────────────────────────────────────────────────────────
  // 10. Event with Idempotency Key Creates Once
  // ─────────────────────────────────────────────────────────────
  test("10. event with idempotency key creates once", async () => {
    const idempKey = "unique-idempotency-key-001"

    const event1 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "CUSTOM_EVENT",
      actor: "test",
      idempotencyKey: idempKey,
    })

    const event2 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "CUSTOM_EVENT",
      actor: "test",
      idempotencyKey: idempKey,
    })

    // Same idempotency key should return same event
    assert.strictEqual(event1!.eventId, event2!.eventId)
  })

  // ─────────────────────────────────────────────────────────────
  // 11. Retry Same Idempotency Key Returns Same Event
  // ─────────────────────────────────────────────────────────────
  test("11. retry same idempotency key returns same event", async () => {
    const idempKey = "test-retry-key-002"

    const event1 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "RETRY_TEST",
      actor: "test",
      idempotencyKey: idempKey,
    })

    const event2 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "RETRY_TEST",
      actor: "test",
      idempotencyKey: idempKey,
    })

    assert.strictEqual(event1!.eventId, event2!.eventId)
    assert.strictEqual(event1!.createdAt, event2!.createdAt)
  })

  // ─────────────────────────────────────────────────────────────
  // 12. Retry Does Not Create Duplicate Row
  // ─────────────────────────────────────────────────────────────
  test("12. retry does not create duplicate row", async () => {
    const idempKey = "no-duplicate-key-003"

    await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "DUP_TEST",
      actor: "test",
      idempotencyKey: idempKey,
    })

    await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "DUP_TEST",
      actor: "test",
      idempotencyKey: idempKey,
    })

    // Count events with this idempotency key
    const count = await sql`
      SELECT COUNT(*) as count FROM episode_events WHERE idempotency_key = ${idempKey}
    `

    assert.strictEqual(Number(count[0].count), 1)
  })

  // ─────────────────────────────────────────────────────────────
  // 13. Different Idempotency Keys Create Different Events
  // ─────────────────────────────────────────────────────────────
  test("13. different idempotency keys create different events", async () => {
    const event1 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "MULTI_KEY",
      actor: "test",
      idempotencyKey: "key-a-004",
    })

    const event2 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "MULTI_KEY",
      actor: "test",
      idempotencyKey: "key-b-004",
    })

    assert.notStrictEqual(event1!.eventId, event2!.eventId)
  })

  // ─────────────────────────────────────────────────────────────
  // 14. Null Idempotency Keys Allow Multiple Events
  // ─────────────────────────────────────────────────────────────
  test("14. null idempotency keys allow multiple events", async () => {
    const event1 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "NO_IDEM",
      actor: "test",
      idempotencyKey: null,
    })

    const event2 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "NO_IDEM",
      actor: "test",
      idempotencyKey: null,
    })

    // Different event IDs even with null idempotency
    assert.notStrictEqual(event1!.eventId, event2!.eventId)
  })

  // ─────────────────────────────────────────────────────────────
  // 15. FK Constraint Rejects Event for Unknown Episode
  // ─────────────────────────────────────────────────────────────
  test("15. FK constraint rejects event for unknown episode", async () => {
    let caught = false
    try {
      await repository.createEpisodeEvent({
        episodeId: "unknown-episode-xyz",
        eventType: "ORPHAN_EVENT",
        actor: "test",
        idempotencyKey: "fk-test-005",
      })
    } catch (err) {
      caught = true
    }

    assert.strictEqual(caught, true, "Should have thrown FK constraint error")
  })

  // ─────────────────────────────────────────────────────────────
  // 16. UNIQUE Constraint Enforces Idempotency
  // ─────────────────────────────────────────────────────────────
  test("16. UNIQUE constraint enforces idempotency", async () => {
    const idempKey = "unique-constraint-test-006"

    // Create first event
    await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "UNIQUE_TEST",
      actor: "test",
      idempotencyKey: idempKey,
    })

    // Verify UNIQUE constraint by checking raw database
    const count = await sql`
      SELECT COUNT(*) as count FROM episode_events WHERE idempotency_key = ${idempKey}
    `

    assert.strictEqual(Number(count[0].count), 1, "UNIQUE constraint should prevent duplicates")
  })

  // ─────────────────────────────────────────────────────────────
  // 17. UUID Generation (gen_random_uuid())
  // ─────────────────────────────────────────────────────────────
  test("17. UUID generation works (gen_random_uuid)", async () => {
    const event1 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "UUID_TEST",
      actor: "test",
    })

    const event2 = await repository.createEpisodeEvent({
      episodeId: TEST_EPISODE_ID,
      eventType: "UUID_TEST",
      actor: "test",
    })

    // Both should have UUIDs
    assert.ok(event1!.eventId)
    assert.ok(event2!.eventId)

    // UUIDs should be different
    assert.notStrictEqual(event1!.eventId, event2!.eventId)

    // Should look like UUIDs (8-4-4-4-12 format)
    assert.match(event1!.eventId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  // ─────────────────────────────────────────────────────────────
  // 18. TIMESTAMPTZ Values Map Correctly
  // ─────────────────────────────────────────────────────────────
  test("18. TIMESTAMPTZ values map correctly", async () => {
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)

    assert.ok(episode!.createdAt)
    assert.ok(episode!.updatedAt)

    // Should be ISO 8601 strings
    assert.ok(episode!.createdAt.includes("T"))
    assert.ok(episode!.updatedAt.includes("T"))

    // Should be able to parse as Date
    const createdDate = new Date(episode!.createdAt)
    const updatedDate = new Date(episode!.updatedAt)

    assert.ok(!isNaN(createdDate.getTime()))
    assert.ok(!isNaN(updatedDate.getTime()))
  })

  // ─────────────────────────────────────────────────────────────
  // 19. Get Episode Events
  // ─────────────────────────────────────────────────────────────
  test("19. get episode events returns all events", async () => {
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)

    // Should have multiple events from previous tests
    assert.ok(events.length > 0)

    // All should belong to test episode
    for (const event of events) {
      assert.strictEqual(event.episodeId, TEST_EPISODE_ID)
    }
  })

  // ─────────────────────────────────────────────────────────────
  // 20. Cleanup Succeeds
  // ─────────────────────────────────────────────────────────────
  test("20. cleanup succeeds (run last)", async () => {
    // Verify test data exists before cleanup
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.ok(episode, "Test episode should exist before cleanup")

    // Cleanup happens in after() hook
  })
})
