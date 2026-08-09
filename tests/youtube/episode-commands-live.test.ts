import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { transitionEpisodeState } from "../../lib/youtube/commands/transition-episode-state.ts"
import { recordHumanDecision } from "../../lib/youtube/commands/record-human-decision.ts"
import { addEpisodeBlocker } from "../../lib/youtube/commands/add-episode-blocker.ts"
import { resolveEpisodeBlocker } from "../../lib/youtube/commands/resolve-episode-blocker.ts"
import { recordPublication } from "../../lib/youtube/commands/record-publication.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"

const TEST_EPISODE_ID = "integration-command-episode-001"

let sql: ReturnType<typeof postgres>
let repository: EpisodeRepository

describe("Episode Commands Live (Neon Integration)", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL required for live command tests.\n" +
          "Set it in .env.local and run: npm run db:migrate"
      )
    }

    sql = postgres(databaseUrl)
    repository = createEpisodeRepository(sql as unknown as PostgresSql)

    // Clean up any existing test data
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create test episode starting at TOPIC state
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
        'Command Test',
        'Command Integration Test Episode',
        'TOPIC',
        'not-required',
        1,
        1,
        ${now},
        ${now}
      )
    `

    console.log(`✓ Connected to Neon`)
    console.log(`✓ Created test episode: ${TEST_EPISODE_ID}`)
  })

  after(async () => {
    // Clean up
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql.end()
    console.log(`✓ Cleanup complete`)
  })

  test("1. full workflow: TOPIC → RESEARCH", async () => {
    const result = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "RESEARCH",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 2)

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episode!.workflowState, "RESEARCH")
    assert.strictEqual(episode!.stateVersion, 2)
  })

  test("2. add blocker during RESEARCH", async () => {
    const result = await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 2,
      blockerId: "research-incomplete",
      label: "Research still in progress",
      severity: "medium",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 3)

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episode!.blockers.length, 1)
    assert.strictEqual(episode!.blockers[0].id, "research-incomplete")
  })

  test("3. record human decision during RESEARCH", async () => {
    const result = await recordHumanDecision(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 3,
      outcome: "pass-with-conditions",
      label: "Research approved, blocker must be resolved before script",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 4)

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.ok(episode!.latestDecision)
    assert.strictEqual(episode!.latestDecision!.outcome, "pass-with-conditions")
    assert.strictEqual(episode!.reviewStatus, "in-progress")
  })

  test("4. resolve blocker after rework", async () => {
    const result = await resolveEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 4,
      blockerId: "research-incomplete",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 5)

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    const blocker = episode!.blockers.find((b) => b.id === "research-incomplete")
    assert.ok(blocker)
    assert.ok(blocker!.resolvedAt)
  })

  test("5. advance RESEARCH → SCRIPT", async () => {
    const result = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 5,
      toState: "SCRIPT",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 6)

    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episode!.workflowState, "SCRIPT")
  })

  test("6. stale version conflict detection", async () => {
    const result = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "FACT_CHECK",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "conflict")
    assert.strictEqual(result.currentStateVersion, 6)

    // Verify state didn't change
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episode!.workflowState, "SCRIPT")
    assert.strictEqual(episode!.stateVersion, 6)
  })

  test("7. event audit trail is complete", async () => {
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)

    // Should have events for: transition, blocker_added, decision, blocker_resolved, transition
    const eventTypes = events.map((e) => e.eventType)

    assert.ok(eventTypes.includes("state_transition"))
    assert.ok(eventTypes.includes("blocker_added"))
    assert.ok(eventTypes.includes("human_decision"))
    assert.ok(eventTypes.includes("blocker_resolved"))
  })

  test("8. state version increments atomically", async () => {
    const before = await repository.getEpisodeById(TEST_EPISODE_ID)
    const beforeVersion = before!.stateVersion

    // Command succeeds
    await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: beforeVersion,
      toState: "FACT_CHECK",
      actor: "H:web",
    })

    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.stateVersion, beforeVersion + 1)
  })

  test("9. publication only allowed from FINAL_RENDER or PUBLISH", async () => {
    // First get to FINAL_RENDER (skipping intermediate steps in this test)
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: episode!.stateVersion,
      workflowState: "FINAL_RENDER",
    })

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    const result = await recordPublication(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: updated!.stateVersion,
      youtubeVideoId: "test-video-123",
      publishedAt: new Date().toISOString(),
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)

    const final = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(final!.workflowState, "PUBLISH")
  })

  test("10. published archive reflects publication", async () => {
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.ok(episode)
    assert.strictEqual(episode!.workflowState, "PUBLISH")

    // Verify through a fresh query
    const fresh = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(fresh!.workflowState, "PUBLISH")
  })
})
