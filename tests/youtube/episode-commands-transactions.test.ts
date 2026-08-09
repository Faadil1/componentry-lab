import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { runInTransaction } from "../../lib/persistence/transaction-runner.ts"
import { transitionEpisodeState } from "../../lib/youtube/commands/transition-episode-state.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"

const TEST_EPISODE_ID = "txn-test-episode-001"

let sql: ReturnType<typeof postgres>

describe("Transaction Atomicity Tests", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL required for transaction tests")
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
        'Txn Test',
        'Transaction Test Episode',
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

  test("1. state update succeeds within transaction", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    await runInTransaction(sql, async (txnSql) => {
      const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

      const result = await txnRepository.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: 1,
        workflowState: "RESEARCH",
      })

      assert.strictEqual(result.success, true)
    })

    // Verify state persisted
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episode!.workflowState, "RESEARCH")
    assert.strictEqual(episode!.stateVersion, 2)
  })

  test("2. rollback restores state when event creation fails", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    // Get current state
    const before = await repository.getEpisodeById(TEST_EPISODE_ID)
    const beforeVersion = before!.stateVersion
    const beforeState = before!.workflowState

    // Attempt transaction with forced failure
    try {
      await runInTransaction(sql, async (txnSql) => {
        const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

        // Update state
        const updateResult = await txnRepository.updateEpisodeState({
          episodeId: TEST_EPISODE_ID,
          expectedStateVersion: beforeVersion,
          workflowState: "SCRIPT",
        })

        assert.strictEqual(updateResult.success, true)

        // Force event creation failure by providing invalid data
        try {
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
              'invalid-date'
            )
          `
        } catch (err) {
          // Expected: this will cause rollback
          throw err
        }
      })
    } catch {
      // Expected: transaction failed
    }

    // Verify state rolled back
    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.workflowState, beforeState)
    assert.strictEqual(after!.stateVersion, beforeVersion)
  })

  test("3. state update and event creation are atomic", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const before = await repository.getEpisodeById(TEST_EPISODE_ID)
    const beforeVersion = before!.stateVersion

    // Transition within transaction
    await runInTransaction(sql, async (txnSql) => {
      const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

      const updateResult = await txnRepository.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: beforeVersion,
        workflowState: "FACT_CHECK",
      })

      assert.strictEqual(updateResult.success, true)

      // Create event in same transaction
      const event = await txnRepository.createEpisodeEvent({
        episodeId: TEST_EPISODE_ID,
        eventType: "state_transition",
        actor: "test",
        fromState: before!.workflowState,
        toState: "FACT_CHECK",
      })

      assert.ok(event.eventId)
    })

    // Verify both state and event persisted
    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.workflowState, "FACT_CHECK")
    assert.strictEqual(after!.stateVersion, beforeVersion + 1)

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.ok(events.some((e) => e.eventType === "state_transition"))
  })

  test("4. no event written if state mutation fails", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const before = await repository.getEpisodeById(TEST_EPISODE_ID)
    const beforeVersion = before!.stateVersion
    const eventsBefore = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const eventCountBefore = eventsBefore.length

    // Attempt invalid transition
    const result = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: beforeVersion,
      toState: "PUBLISH", // Invalid: can't jump from FACT_CHECK to PUBLISH
      actor: "test",
    })

    assert.strictEqual(result.success, false)

    // Verify no event was written
    const eventsAfter = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.strictEqual(eventsAfter.length, eventCountBefore)

    // Verify state unchanged
    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.stateVersion, beforeVersion)
  })

  test("5. stale version conflict rolls back", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    const eventsBeforeCount = (await repository.getEpisodeEvents(TEST_EPISODE_ID)).length

    try {
      await runInTransaction(sql, async (txnSql) => {
        const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

        // Try update with stale version
        const result = await txnRepository.updateEpisodeState({
          episodeId: TEST_EPISODE_ID,
          expectedStateVersion: 1, // Stale
          workflowState: "NARRATION",
        })

        // Conflict detected
        assert.strictEqual(result.success, false)

        // Try to create event anyway
        if (result.success) {
          await txnRepository.createEpisodeEvent({
            episodeId: TEST_EPISODE_ID,
            eventType: "test",
            actor: "test",
          })
        }
      })
    } catch {
      // Transaction rolled back
    }

    // Verify state and events unchanged
    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.stateVersion, episode!.stateVersion)

    const eventsAfter = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.strictEqual(eventsAfter.length, eventsBeforeCount)
  })

  test("6. publication fields persisted atomically", async () => {
    const repository = createEpisodeRepository(sql as unknown as PostgresSql)

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)

    // Update to publishable state first
    await runInTransaction(sql, async (txnSql) => {
      const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

      const updateResult = await txnRepository.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: episode!.stateVersion,
        workflowState: "FINAL_RENDER",
      })

      assert.strictEqual(updateResult.success, true)
    })

    // Now publish with all fields
    const publishableEpisode = await repository.getEpisodeById(TEST_EPISODE_ID)
    const youtubeId = "test-video-123"
    const publishedAt = new Date().toISOString()

    await runInTransaction(sql, async (txnSql) => {
      const txnRepository = createEpisodeRepository(txnSql as unknown as PostgresSql)

      const updateResult = await txnRepository.updateEpisodeState({
        episodeId: TEST_EPISODE_ID,
        expectedStateVersion: publishableEpisode!.stateVersion,
        workflowState: "PUBLISH",
        youtubeVideoId: youtubeId,
        publishedAt: publishedAt,
      })

      assert.strictEqual(updateResult.success, true)

      // Create publication event
      const event = await txnRepository.createEpisodeEvent({
        episodeId: TEST_EPISODE_ID,
        eventType: "publication",
        actor: "test",
        payload: {
          youtubeVideoId: youtubeId,
          publishedAt: publishedAt,
        },
      })

      assert.ok(event.eventId)
    })

    // Verify all fields persisted together
    const published = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(published!.workflowState, "PUBLISH")
    assert.strictEqual(published!.youtubeVideoId, youtubeId)
    assert.strictEqual(published!.publishedAt, publishedAt)

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.ok(events.some((e) => e.eventType === "publication"))
  })
})
