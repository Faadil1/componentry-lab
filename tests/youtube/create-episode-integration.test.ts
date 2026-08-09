import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { runCommandInTransaction } from "../../lib/youtube/commands/transactional-command-runner-core.ts"
import { createEpisode } from "../../lib/youtube/commands/create-episode.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"

const TEST_EPISODE_ID_A = "c4-int-test-a"
const TEST_EPISODE_ID_B = "c4-int-test-b"
const TEST_EPISODE_ID_C = "c4-int-test-c"
const TEST_EPISODE_ID_D = "c4-int-test-d"

let sql: ReturnType<typeof postgres>

describe("Create Episode Integration Tests (Neon)", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL required for create-episode integration tests")
    }

    sql = postgres(databaseUrl)

    // Clean up test episodes
    const ids = [
      TEST_EPISODE_ID_A,
      TEST_EPISODE_ID_B,
      TEST_EPISODE_ID_C,
      TEST_EPISODE_ID_D,
    ]
    await sql`DELETE FROM episode_events WHERE episode_id = ANY(${ids})`
    await sql`DELETE FROM episodes WHERE episode_id = ANY(${ids})`

    console.log("✓ Integration test setup complete")
  })

  after(async () => {
    // Clean up test episodes
    const ids = [
      TEST_EPISODE_ID_A,
      TEST_EPISODE_ID_B,
      TEST_EPISODE_ID_C,
      TEST_EPISODE_ID_D,
    ]
    await sql`DELETE FROM episode_events WHERE episode_id = ANY(${ids})`
    await sql`DELETE FROM episodes WHERE episode_id = ANY(${ids})`
    await sql.end()
    console.log("✓ Integration test cleanup complete")
  })

  test("A. successful create with episode_created event", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    // Command handles event creation (no duplication)
    const result = await runCommandInTransaction(sql, async (repo) =>
      createEpisode(repo, {
        episodeId: TEST_EPISODE_ID_A,
        episodeNumber: 1,
        channelName: "Test Channel A",
        title: "Integration Test A",
        actor: "human:web",
      })
    )

    assert.strictEqual(result.success, true)

    // Verify episode exists
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID_A)
    assert.ok(episode)
    assert.strictEqual(episode!.stateVersion, 1)
    assert.strictEqual(episode!.workflowState, "TOPIC")
    assert.strictEqual(episode!.reviewStatus, "not-required")

    // Verify event was created by command
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID_A)
    assert.strictEqual(events.length, 1)
    assert.strictEqual(events[0]!.eventType, "episode_created")
    assert.strictEqual(events[0]!.actor, "human:web")
    assert.ok(events[0]!.payload)
    assert.strictEqual(events[0]!.payload.episodeId, TEST_EPISODE_ID_A)
    assert.strictEqual(events[0]!.payload.episodeNumber, 1)
    assert.strictEqual(events[0]!.payload.channelName, "Test Channel A")
    assert.strictEqual(events[0]!.payload.title, "Integration Test A")
  })

  test("B. duplicate episodeId returns conflict, only one event total", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    // First create
    const firstResult = await runCommandInTransaction(sql, async (repo) =>
      createEpisode(repo, {
        episodeId: TEST_EPISODE_ID_B,
        episodeNumber: 2,
        channelName: "Test Channel B",
        title: "First Episode",
        actor: "human:web",
      })
    )

    assert.strictEqual(firstResult.success, true)

    // Verify one episode and one event
    let episode = await repository.getEpisodeById(TEST_EPISODE_ID_B)
    assert.ok(episode)
    let events = await repository.getEpisodeEvents(TEST_EPISODE_ID_B)
    assert.strictEqual(events.length, 1)

    // Second create (duplicate)
    const duplicateResult = await runCommandInTransaction(sql, async (repo) =>
      createEpisode(repo, {
        episodeId: TEST_EPISODE_ID_B,
        episodeNumber: 3,
        channelName: "Test Channel B",
        title: "Duplicate Episode",
        actor: "human:web",
      })
    )

    assert.strictEqual(duplicateResult.success, false)
    if (!duplicateResult.success) {
      assert.strictEqual(duplicateResult.reason, "conflict")
    }

    // Verify still one episode and one event (no duplicates)
    episode = await repository.getEpisodeById(TEST_EPISODE_ID_B)
    assert.ok(episode)
    assert.strictEqual(episode!.title, "First Episode")

    events = await repository.getEpisodeEvents(TEST_EPISODE_ID_B)
    assert.strictEqual(events.length, 1)
    assert.strictEqual(events[0]!.eventType, "episode_created")
  })

  test("C. event failure rolls back episode", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    try {
      await runCommandInTransaction(sql, async (repo) => {
        // Temporarily replace createEpisodeEvent to force failure
        const originalCreateEvent = repo.createEpisodeEvent.bind(repo)
        repo.createEpisodeEvent = async () => {
          // Restore first to avoid breaking subsequent tests
          repo.createEpisodeEvent = originalCreateEvent
          throw new Error("Forced event creation failure")
        }

        return await createEpisode(repo, {
          episodeId: TEST_EPISODE_ID_C,
          episodeNumber: 4,
          channelName: "Test Channel C",
          title: "Rollback Test",
          actor: "human:web",
        })
      })
    } catch (err) {
      // Expected: transaction failed due to event creation error
      assert.ok((err as Error).message.includes("Forced event creation failure"))
    }

    // Verify episode was rolled back
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID_C)
    assert.strictEqual(episode, null)

    // Verify no event exists
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID_C)
    assert.strictEqual(events.length, 0)
  })

  test("D. infrastructure error propagates to caller", async () => {
    // Pass invalid input that will cause a database error
    let infrastructureErrorThrown = false

    try {
      // Use null sql to force an error (invalid client)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidRepository = createEpisodeRepository(null as any)
      await invalidRepository.createEpisode({
        episodeId: TEST_EPISODE_ID_D,
        episodeNumber: 5,
        channelName: "Test",
        title: "Test",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })
    } catch {
      infrastructureErrorThrown = true
    }

    assert.strictEqual(infrastructureErrorThrown, true)
  })
})
