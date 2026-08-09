import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { runInTransaction } from "../../lib/persistence/transaction-runner.ts"
import { runCommandInTransaction } from "../../lib/youtube/commands/transactional-command-runner-core.ts"
import { createEpisode } from "../../lib/youtube/commands/create-episode.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"

const TEST_EPISODE_ID = "c4-integration-test-001"
const TEST_EPISODE_ID_DUPLICATE = "c4-integration-test-dup"
const TEST_EPISODE_ID_EVENT_FAIL = "c4-integration-test-event-fail"

let sql: ReturnType<typeof postgres>

describe("Create Episode Integration Tests", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL required for create-episode integration tests")
    }

    sql = postgres(databaseUrl)

    // Clean up test episodes
    await sql`DELETE FROM episode_events WHERE episode_id IN (${TEST_EPISODE_ID}, ${TEST_EPISODE_ID_DUPLICATE}, ${TEST_EPISODE_ID_EVENT_FAIL})`
    await sql`DELETE FROM episodes WHERE episode_id IN (${TEST_EPISODE_ID}, ${TEST_EPISODE_ID_DUPLICATE}, ${TEST_EPISODE_ID_EVENT_FAIL})`

    console.log("✓ Integration test setup complete")
  })

  after(async () => {
    // Clean up test episodes
    await sql`DELETE FROM episode_events WHERE episode_id IN (${TEST_EPISODE_ID}, ${TEST_EPISODE_ID_DUPLICATE}, ${TEST_EPISODE_ID_EVENT_FAIL})`
    await sql`DELETE FROM episodes WHERE episode_id IN (${TEST_EPISODE_ID}, ${TEST_EPISODE_ID_DUPLICATE}, ${TEST_EPISODE_ID_EVENT_FAIL})`
    await sql.end()
    console.log("✓ Integration test cleanup complete")
  })

  test("A. successful create with episode_created event", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    await runCommandInTransaction(sql, async (txnSql) => {
      const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)
      return await runCommandInTransaction(sql, async (repo) =>
        createEpisode(repo, {
          episodeId: TEST_EPISODE_ID,
          episodeNumber: 1,
          channelName: "Test Channel",
          title: "Integration Test Episode",
          actor: "human:web",
        })
      )
    })

    // Verify episode exists
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.ok(episode)
    assert.strictEqual(episode!.stateVersion, 1)
    assert.strictEqual(episode!.workflowState, "TOPIC")
    assert.strictEqual(episode!.reviewStatus, "not-required")

    // Verify event exists
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const createdEvent = events.find((e) => e.eventType === "episode_created")
    assert.ok(createdEvent)
    assert.strictEqual(createdEvent!.actor, "human:web")
    assert.ok(createdEvent!.payload)
    assert.strictEqual(createdEvent!.payload.episodeId, TEST_EPISODE_ID)
    assert.strictEqual(createdEvent!.payload.episodeNumber, 1)
  })

  test("B. duplicate episodeId returns conflict", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    // Create first episode
    const firstResult = await runCommandInTransaction(sql, async (repo) =>
      createEpisode(repo, {
        episodeId: TEST_EPISODE_ID_DUPLICATE,
        episodeNumber: 2,
        channelName: "Test Channel",
        title: "First Episode",
        actor: "human:web",
      })
    )
    assert.strictEqual(firstResult.success, true)

    // Attempt duplicate
    const duplicateResult = await runCommandInTransaction(sql, async (repo) =>
      createEpisode(repo, {
        episodeId: TEST_EPISODE_ID_DUPLICATE,
        episodeNumber: 3,
        channelName: "Test Channel",
        title: "Duplicate Episode",
        actor: "human:web",
      })
    )

    assert.strictEqual(duplicateResult.success, false)
    assert.strictEqual(duplicateResult.reason, "conflict")

    // Verify only one episode exists
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID_DUPLICATE)
    assert.ok(episode)
    assert.strictEqual(episode!.title, "First Episode")

    // Verify only one event (from first create)
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID_DUPLICATE)
    assert.strictEqual(events.length, 1)
  })

  test("C. failed event creation rolls back episode", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    try {
      await runInTransaction(sql, async (txnSql) => {
        const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

        // Create episode
        const createResult = await createEpisode(txnRepository, {
          episodeId: TEST_EPISODE_ID_EVENT_FAIL,
          episodeNumber: 4,
          channelName: "Test Channel",
          title: "Event Failure Test",
          actor: "human:web",
        })

        assert.strictEqual(createResult.success, true)

        // Force event creation failure with invalid timestamp
        await txnSql`
          INSERT INTO episode_events (
            episode_id,
            event_type,
            actor,
            created_at
          )
          VALUES (
            ${TEST_EPISODE_ID_EVENT_FAIL},
            'episode_created',
            'human:web',
            'this-is-not-a-valid-timestamp'
          )
        `
      })
    } catch {
      // Expected: transaction failed
    }

    // Verify episode was rolled back
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID_EVENT_FAIL)
    assert.strictEqual(episode, null)

    // Verify no event exists
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID_EVENT_FAIL)
    assert.strictEqual(events.length, 0)
  })
})
