import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { runInTransaction } from "../../lib/persistence/transaction-runner.ts"
import { runCommandInTransaction } from "../../lib/youtube/commands/transactional-command-runner.ts"
import { transitionEpisodeState } from "../../lib/youtube/commands/transition-episode-state.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"

const TEST_EPISODE_ID = "native-txn-test-001"

let sql: ReturnType<typeof postgres>

describe("Native Postgres.js Transaction Tests", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL required for native transaction tests")
    }

    sql = postgres(databaseUrl)

    // Clean up
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create test episode
    const now = new Date().toISOString()
    await sql`
      INSERT INTO episodes (
        episode_id,
        episode_number,
        channel_name,
        title,
        workflow_state,
        review_status,
        schema_version,
        state_version,
        created_at,
        updated_at
      )
      VALUES (
        ${TEST_EPISODE_ID},
        999,
        'Native Txn Test',
        'Native Transaction Test Episode',
        'TOPIC',
        'not-required',
        1,
        1,
        ${now},
        ${now}
      )
    `

    console.log(`✓ Created test episode: ${TEST_EPISODE_ID}`)
  })

  after(async () => {
    // Clean up
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql.end()
    console.log(`✓ Cleanup complete`)
  })

  test("1. native sql.begin() executes callback", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    let callbackExecuted = false
    await runInTransaction(sql, async () => {
      callbackExecuted = true
      return true
    })

    assert.strictEqual(callbackExecuted, true)
  })

  test("2. native transaction commits successful mutations", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const before = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(before!.workflowState, "TOPIC")

    await runInTransaction(sql, async (txnSql) => {
      const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

      const result = await txnRepository.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: before!.stateVersion,
        workflowState: "RESEARCH",
      })

      assert.strictEqual(result.success, true)

      const event = await txnRepository.createEpisodeEvent({
        episodeId: TEST_EPISODE_ID,
        eventType: "state_transition",
        actor: "test",
        fromState: "TOPIC",
        toState: "RESEARCH",
      })

      assert.ok(event.eventId)
    })

    // Verify both committed
    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.workflowState, "RESEARCH")
    assert.strictEqual(after!.stateVersion, before!.stateVersion + 1)

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.ok(events.some((e) => e.eventType === "state_transition"))
  })

  test("3. native transaction rolls back on error", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const before = await repository.getEpisodeById(TEST_EPISODE_ID)
    const beforeVersion = before!.stateVersion
    const beforeState = before!.workflowState
    const eventsBefore = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const eventCountBefore = eventsBefore.length

    // Attempt transaction that fails
    try {
      await runInTransaction(sql, async (txnSql) => {
        const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

        const result = await txnRepository.updateEpisodeState({
          episodeId: TEST_EPISODE_ID,
          expectedStateVersion: beforeVersion,
          workflowState: "SCRIPT",
        })

        assert.strictEqual(result.success, true)

        // Force failure
        throw new Error("Forced error for rollback test")
      })
    } catch (err) {
      // Expected: error was thrown
      assert.ok((err as Error).message.includes("Forced error"))
    }

    // Verify rollback
    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.workflowState, beforeState)
    assert.strictEqual(after!.stateVersion, beforeVersion)

    const eventsAfter = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.strictEqual(eventsAfter.length, eventCountBefore)
  })

  test("4. forced event creation failure rolls back state", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const before = await repository.getEpisodeById(TEST_EPISODE_ID)
    const beforeVersion = before!.stateVersion

    try {
      await runInTransaction(sql, async (txnSql) => {
        const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

        // Update state
        const updateResult = await txnRepository.updateEpisodeState({
          episodeId: TEST_EPISODE_ID,
          expectedStateVersion: beforeVersion,
          workflowState: "FACT_CHECK",
        })

        assert.strictEqual(updateResult.success, true)

        // Force event creation failure with invalid timestamp
        await txnSql`
          INSERT INTO episode_events (
            episode_id,
            event_type,
            actor,
            created_at
          )
          VALUES (
            ${TEST_EPISODE_ID},
            'test_event',
            'test',
            'this-is-not-a-valid-timestamp'
          )
        `
      })
    } catch (err) {
      // Expected: transaction failed
    }

    // Verify state rolled back
    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.workflowState, before!.workflowState)
    assert.strictEqual(after!.stateVersion, beforeVersion)
  })

  test("5. runCommandInTransaction uses native transactions", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const before = await repository.getEpisodeById(TEST_EPISODE_ID)

    const result = await runCommandInTransaction(sql, async (repo) =>
      transitionEpisodeState(repo, {
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: before!.stateVersion,
        toState: "NARRATION",
        actor: "test",
      })
    )

    assert.strictEqual(result.success, true)

    // Verify state updated
    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.workflowState, "NARRATION")
    assert.strictEqual(after!.stateVersion, before!.stateVersion + 1)
  })

  test("6. infrastructure errors throw from runCommandInTransaction", async () => {
    // Create an invalid sql object to trigger an error
    let errorThrown = false

    try {
      // Use null as sql to force an error
      await runCommandInTransaction(null as any, async () => ({
        success: true,
        stateVersion: 1,
      }))
    } catch {
      errorThrown = true
    }

    assert.strictEqual(errorThrown, true)
  })

  test("7. publication fields persist in transaction", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    // First transition to publishable state
    let episode = await repository.getEpisodeById(TEST_EPISODE_ID)

    await runInTransaction(sql, async (txnSql) => {
      const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

      await txnRepository.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: episode!.stateVersion,
        workflowState: "FINAL_RENDER",
      })
    })

    // Now publish with all fields
    episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    const youtubeId = "native-txn-video-123"
    const publishedAt = new Date().toISOString()

    await runInTransaction(sql, async (txnSql) => {
      const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

      const result = await txnRepository.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: episode!.stateVersion,
        workflowState: "PUBLISH",
        youtubeVideoId: youtubeId,
        publishedAt: publishedAt,
      })

      assert.strictEqual(result.success, true)

      // Create event in same transaction
      await txnRepository.createEpisodeEvent({
        episodeId: TEST_EPISODE_ID,
        eventType: "publication",
        actor: "test",
        payload: {
          youtubeVideoId: youtubeId,
          publishedAt: publishedAt,
        },
      })
    })

    // Verify all fields persisted exactly
    const published = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(published!.workflowState, "PUBLISH")
    assert.strictEqual(published!.youtubeVideoId, youtubeId)
    assert.strictEqual(published!.publishedAt, publishedAt)
    assert.strictEqual(published!.stateVersion, episode!.stateVersion + 1)

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.ok(events.some((e) => e.eventType === "publication"))
  })

  test("8. multiple transactions are independent", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const episode1 = await repository.getEpisodeById(TEST_EPISODE_ID)

    // Transaction 1
    await runInTransaction(sql, async (txnSql1) => {
      const repo1 = createEpisodeRepository(txnSql1 as unknown as PostgresSql)

      const result1 = await repo1.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: episode1!.stateVersion,
        workflowState: "SRT_LOCK",
      })

      assert.strictEqual(result1.success, true)
    })

    const episode2 = await repository.getEpisodeById(TEST_EPISODE_ID)

    // Transaction 2
    await runInTransaction(sql, async (txnSql2) => {
      const repo2 = createEpisodeRepository(txnSql2 as unknown as PostgresSql)

      const result2 = await repo2.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: episode2!.stateVersion,
        workflowState: "VISUAL_COVERAGE_TIMELINE",
      })

      assert.strictEqual(result2.success, true)
    })

    const final = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(final!.workflowState, "VISUAL_COVERAGE_TIMELINE")
    assert.strictEqual(final!.stateVersion, episode1!.stateVersion + 2)
  })
})
