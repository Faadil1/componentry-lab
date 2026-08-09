import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { setEpisodeBrief } from "../../lib/youtube/commands/set-episode-brief.ts"
import { transitionEpisodeState } from "../../lib/youtube/commands/transition-episode-state.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"
import { runCommandInTransaction } from "../../lib/youtube/commands/transactional-command-runner-core.ts"

const TEST_EPISODE_ID = "integration-brief-episode-001"

let sql: ReturnType<typeof postgres>
let repository: EpisodeRepository

describe("Episode Brief Commands Live (Neon Integration)", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL required for live brief tests.\n" +
          "Set it in .env.local and run: npm run db:migrate"
      )
    }

    sql = postgres(databaseUrl)
    repository = createEpisodeRepository(sql as unknown as PostgresSql)

    // Clean up any existing test data
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}`
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
        'Test Channel',
        'Test Episode for Brief',
        'TOPIC',
        'not-required',
        1,
        1,
        ${now},
        ${now}
      )
    `
  })

  after(async () => {
    // Clean up test data
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql.end()
  })

  // ─────────────────────────────────────────────────────────────
  // A. CREATE
  // ─────────────────────────────────────────────────────────────

  test("A1. Create episode brief with topic", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Dividend Investing Strategies",
      angle: "Low volatility income",
      actor: "test:live",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 1)
    assert.strictEqual(result.value?.topic, "Dividend Investing Strategies")
    assert.strictEqual(result.value?.angle, "Low volatility income")

    // Verify in database
    const rows = await sql`
      SELECT * FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(rows.length, 1)
    const briefRow = rows[0] as any
    assert.strictEqual(briefRow.topic, "Dividend Investing Strategies")
    assert.strictEqual(briefRow.brief_version, 1)
  })

  test("A2. Brief creation creates audit event", async () => {
    // Clear previous state
    await sql`DELETE FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}`

    const result = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: TEST_EPISODE_ID,
        expectedBriefVersion: null,
        topic: "New Topic",
        hook: "New Hook",
        actor: "test:live",
      })
    )

    assert.strictEqual(result.success, true)

    // Verify event exists
    const events = await sql`
      SELECT * FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}
      AND event_type = 'episode_brief_set'
    `

    assert.ok(events.length > 0, "episode_brief_set event should exist")
    const event = events[events.length - 1] as any
    const payload = JSON.parse(event.payload)
    assert.strictEqual(payload.operation, "created")
    assert.ok(Array.isArray(payload.changedFields))
  })

  // ─────────────────────────────────────────────────────────────
  // B. UPDATE
  // ─────────────────────────────────────────────────────────────

  test("B1. Update brief from v1 to v2", async () => {
    // Ensure brief exists at v1
    await sql`DELETE FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}`
    const now = new Date().toISOString()
    await sql`
      INSERT INTO episode_briefs (
        episode_id, topic, brief_version, schema_version, created_at, updated_at
      ) VALUES (
        ${TEST_EPISODE_ID}, 'Original Topic', 1, 1, ${now}, ${now}
      )
    `

    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      hook: "Updated Hook",
      thesis: "Updated Thesis",
      actor: "test:live",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 2)
    assert.strictEqual(result.value?.briefVersion, 2)
    assert.strictEqual(result.value?.hook, "Updated Hook")

    // Verify in database
    const rows = await sql`
      SELECT brief_version FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual((rows[0] as any).brief_version, 2)
  })

  test("B2. Update brief creates correct audit event", async () => {
    // Make sure brief is at v2
    const briefRows = await sql`
      SELECT brief_version FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const currentVersion = (briefRows[0] as any).brief_version

    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: currentVersion,
      coreQuestion: "New Question",
      actor: "test:live",
    })

    const events = await sql`
      SELECT * FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}
      AND event_type = 'episode_brief_set'
      ORDER BY created_at DESC LIMIT 1
    `

    assert.ok(events.length > 0)
    const event = events[0] as any
    const payload = JSON.parse(event.payload)
    assert.strictEqual(payload.operation, "updated")
    assert.ok(payload.changedFields.includes("coreQuestion"))
  })

  // ─────────────────────────────────────────────────────────────
  // C. CONFLICT
  // ─────────────────────────────────────────────────────────────

  test("C1. Stale version returns conflict", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      hook: "Try to update",
      actor: "test:live",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "conflict")
    assert.ok(result.currentStateVersion! > 1, "should return current version")
  })

  test("C2. Conflict does not mutate brief", async () => {
    // Get current version
    const briefRows = await sql`
      SELECT hook, brief_version FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const hookBefore = (briefRows[0] as any).hook
    const versionBefore = (briefRows[0] as any).brief_version

    // Attempt update with wrong version
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      hook: "Different hook",
      actor: "test:live",
    })

    // Verify unchanged
    const briefRowsAfter = await sql`
      SELECT hook, brief_version FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual((briefRowsAfter[0] as any).hook, hookBefore)
    assert.strictEqual((briefRowsAfter[0] as any).brief_version, versionBefore)
  })

  // ─────────────────────────────────────────────────────────────
  // D. INDEPENDENT VERSIONING
  // ─────────────────────────────────────────────────────────────

  test("D1. Workflow state mutation doesn't affect briefVersion", async () => {
    // Get current episode state version
    const episodeRows = await sql`
      SELECT state_version FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const stateVersionBefore = (episodeRows[0] as any).state_version

    // Update brief
    const briefRowsBefore = await sql`
      SELECT brief_version FROM episode_briefs WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const briefVersionBefore = (briefRowsBefore[0] as any).brief_version

    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: briefVersionBefore,
      audience: "New Audience",
      actor: "test:live",
    })

    // Verify episode state unchanged
    const episodeRowsAfter = await sql`
      SELECT state_version FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(
      (episodeRowsAfter[0] as any).state_version,
      stateVersionBefore,
      "episode stateVersion must not change on brief update"
    )
  })

  // ─────────────────────────────────────────────────────────────
  // E. AUDIT FAILURE ROLLBACK
  // ─────────────────────────────────────────────────────────────

  test("E1. Event creation failure rolls back brief mutation", async () => {
    // Create temp episode for this test
    const tempId = "c5-live-e1-" + Date.now()
    const now = new Date().toISOString()

    await sql`
      INSERT INTO episodes (
        episode_id, channel_name, title, workflow_state, review_status,
        schema_version, state_version, created_at, updated_at
      ) VALUES (
        ${tempId}, 'Test', 'Test', 'TOPIC', 'not-required', 1, 1, ${now}, ${now}
      )
    `

    // Create initial brief
    const createResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: null,
        topic: "Rollback test",
        actor: "test:live",
      })
    )
    assert.strictEqual(createResult.success, true)

    // Get current version
    const briefRows = await sql`
      SELECT brief_version FROM episode_briefs WHERE episode_id = ${tempId}
    `
    const versionBefore = (briefRows[0] as any).brief_version

    // Force a transaction failure by throwing inside the command
    // The brief mutation should be rolled back
    let threwError = false
    try {
      await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) => {
        // Start the update
        const updateResult = await setEpisodeBrief(repo, {
          episodeId: tempId,
          expectedBriefVersion: versionBefore,
          editorialNotes: "Should rollback",
          actor: "test:live",
        })
        assert.strictEqual(updateResult.success, true)
        // Force failure after mutation
        throw new Error("Simulated transaction failure")
      })
    } catch (err) {
      threwError = true
      assert.strictEqual((err as Error).message, "Simulated transaction failure")
    }

    assert.ok(threwError, "transaction should have thrown")

    // Verify brief version is unchanged (rollback occurred)
    const briefRowsAfter = await sql`
      SELECT brief_version FROM episode_briefs WHERE episode_id = ${tempId}
    `
    assert.strictEqual((briefRowsAfter[0] as any).brief_version, versionBefore, "version should be unchanged after rollback")

    // Verify no new event was created
    const events = await sql`
      SELECT COUNT(*) as count FROM episode_events WHERE episode_id = ${tempId}
      AND event_type = 'episode_brief_set'
    `
    assert.strictEqual(Number((events[0] as any).count), 1, "only initial create event should exist")

    // Cleanup
    try {
      await sql`DELETE FROM episode_events WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episode_briefs WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${tempId}`
    } catch (err) {
      // Cleanup is best-effort
      console.error("Warning: cleanup failed for E1", err)
    }
  })

  // ─────────────────────────────────────────────────────────────
  // F. CREATE CONFLICT
  // ─────────────────────────────────────────────────────────────

  test("F1. Create with null on existing brief returns conflict", async () => {
    // Brief already exists from previous tests
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Different topic",
      actor: "test:live",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "conflict")
  })

  // ─────────────────────────────────────────────────────────────
  // G. DELETE CASCADE
  // ─────────────────────────────────────────────────────────────

  test("G1. Delete cascade removes brief when episode deleted", async () => {
    // Create temporary episode and brief
    const tempId = "temp-cascade-test-" + Date.now()
    const now = new Date().toISOString()

    await sql`
      INSERT INTO episodes (
        episode_id, channel_name, title, workflow_state, review_status,
        schema_version, state_version, created_at, updated_at
      ) VALUES (
        ${tempId}, 'Temp', 'Temp', 'TOPIC', 'not-required', 1, 1, ${now}, ${now}
      )
    `

    await sql`
      INSERT INTO episode_briefs (
        episode_id, topic, brief_version, schema_version, created_at, updated_at
      ) VALUES (
        ${tempId}, 'Temp Topic', 1, 1, ${now}, ${now}
      )
    `

    // Verify brief exists
    const beforeDelete = await sql`SELECT * FROM episode_briefs WHERE episode_id = ${tempId}`
    assert.strictEqual(beforeDelete.length, 1)

    // Delete episode
    await sql`DELETE FROM episodes WHERE episode_id = ${tempId}`

    // Verify brief cascaded delete
    const afterDelete = await sql`SELECT * FROM episode_briefs WHERE episode_id = ${tempId}`
    assert.strictEqual(afterDelete.length, 0, "brief should be deleted via cascade")
  })

  // ─────────────────────────────────────────────────────────────
  // H. SEMANTIC NO-OP
  // ─────────────────────────────────────────────────────────────

  test("H1. Semantic no-op does not increment version", async () => {
    const tempId = "c5-live-h1-" + Date.now()
    const now = new Date().toISOString()

    // Create episode
    await sql`
      INSERT INTO episodes (
        episode_id, channel_name, title, workflow_state, review_status,
        schema_version, state_version, created_at, updated_at
      ) VALUES (
        ${tempId}, 'Test', 'Test', 'TOPIC', 'not-required', 1, 1, ${now}, ${now}
      )
    `

    // Create brief with angle and hook
    const createResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: null,
        topic: "Test Topic",
        angle: "Test Angle",
        hook: "Test Hook",
        actor: "test:live",
      })
    )
    assert.strictEqual(createResult.success, true)

    // Get version and updated_at
    const briefBefore = await sql`
      SELECT brief_version, updated_at FROM episode_briefs WHERE episode_id = ${tempId}
    `
    const versionBefore = (briefBefore[0] as any).brief_version
    const updatedAtBefore = (briefBefore[0] as any).updated_at

    // Wait a moment to ensure time difference would be detectable
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Submit identical values
    const noOpResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: versionBefore,
        topic: "Test Topic",
        angle: "Test Angle",
        hook: "Test Hook",
        actor: "test:live",
      })
    )
    assert.strictEqual(noOpResult.success, true)

    // Verify version unchanged
    const briefAfter = await sql`
      SELECT brief_version, updated_at FROM episode_briefs WHERE episode_id = ${tempId}
    `
    const versionAfter = (briefAfter[0] as any).brief_version
    const updatedAtAfter = (briefAfter[0] as any).updated_at

    assert.strictEqual(versionAfter, versionBefore, "version should not increment on no-op")

    // Compare timestamps by millisecond precision (postgres.js returns Date objects)
    const beforeTime = new Date(updatedAtBefore).getTime()
    const afterTime = new Date(updatedAtAfter).getTime()
    assert.strictEqual(afterTime, beforeTime, "updated_at should not change on no-op")

    // Verify no event created
    const events = await sql`
      SELECT COUNT(*) as count FROM episode_events WHERE episode_id = ${tempId}
    `
    assert.strictEqual(Number((events[0] as any).count), 1, "only create event should exist (no update event)")

    // Cleanup
    try {
      await sql`DELETE FROM episode_events WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episode_briefs WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${tempId}`
    } catch (err) {
      // Cleanup is best-effort
      console.error("Warning: cleanup failed for H1", err)
    }
  })

  // ─────────────────────────────────────────────────────────────
  // I. CLEAR OPTIONAL TEXT
  // ─────────────────────────────────────────────────────────────

  test("I1. Clear optional text field with empty string", async () => {
    const tempId = "c5-live-i1-" + Date.now()
    const now = new Date().toISOString()

    // Create episode
    await sql`
      INSERT INTO episodes (
        episode_id, channel_name, title, workflow_state, review_status,
        schema_version, state_version, created_at, updated_at
      ) VALUES (
        ${tempId}, 'Test', 'Test', 'TOPIC', 'not-required', 1, 1, ${now}, ${now}
      )
    `

    // Create brief with angle
    const createResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: null,
        topic: "Test",
        angle: "Original Angle",
        actor: "test:live",
      })
    )
    assert.strictEqual(createResult.success, true)

    // Verify angle is set
    const briefBefore = await sql`
      SELECT angle, brief_version FROM episode_briefs WHERE episode_id = ${tempId}
    `
    assert.strictEqual((briefBefore[0] as any).angle, "Original Angle")
    const versionBefore = (briefBefore[0] as any).brief_version

    // Clear angle by sending empty string
    const clearResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: versionBefore,
        angle: "",
        actor: "test:live",
      })
    )
    assert.strictEqual(clearResult.success, true)

    // Verify angle is cleared in DB
    const briefAfter = await sql`
      SELECT angle, brief_version FROM episode_briefs WHERE episode_id = ${tempId}
    `
    assert.strictEqual((briefAfter[0] as any).angle, null, "angle should be NULL after clearing")
    assert.strictEqual((briefAfter[0] as any).brief_version, versionBefore + 1, "version should increment")

    // Verify event shows only angle changed
    const events = await sql`
      SELECT payload FROM episode_events WHERE episode_id = ${tempId}
      AND event_type = 'episode_brief_set'
      ORDER BY created_at DESC LIMIT 1
    `
    const payload = JSON.parse((events[0] as any).payload)
    assert.ok(payload.changedFields.includes("angle"), "changedFields should include angle")

    // Cleanup
    try {
      await sql`DELETE FROM episode_events WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episode_briefs WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${tempId}`
    } catch (err) {
      // Cleanup is best-effort
      console.error("Warning: cleanup failed for I1", err)
    }
  })

  // ─────────────────────────────────────────────────────────────
  // J. CLEAR RESEARCH QUESTIONS
  // ─────────────────────────────────────────────────────────────

  test("J1. Clear research questions with empty array", async () => {
    const tempId = "c5-live-j1-" + Date.now()
    const now = new Date().toISOString()

    // Create episode
    await sql`
      INSERT INTO episodes (
        episode_id, channel_name, title, workflow_state, review_status,
        schema_version, state_version, created_at, updated_at
      ) VALUES (
        ${tempId}, 'Test', 'Test', 'TOPIC', 'not-required', 1, 1, ${now}, ${now}
      )
    `

    // Create brief with research questions
    const createResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: null,
        topic: "Test",
        researchQuestions: ["Q1", "Q2"],
        actor: "test:live",
      })
    )
    assert.strictEqual(createResult.success, true)

    // Verify questions are set and stored as proper JSONB array
    const briefBefore = await sql`
      SELECT research_questions, brief_version FROM episode_briefs WHERE episode_id = ${tempId}
    `
    assert.deepStrictEqual((briefBefore[0] as any).research_questions, ["Q1", "Q2"])
    const versionBefore = (briefBefore[0] as any).brief_version

    // Verify JSONB type in database
    const typeCheckBefore = await sql`
      SELECT jsonb_typeof(research_questions) as json_type FROM episode_briefs WHERE episode_id = ${tempId}
    `
    assert.strictEqual((typeCheckBefore[0] as any).json_type, "array", "research_questions should be stored as JSONB array, not string")

    // Clear questions by sending empty array
    const clearResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: versionBefore,
        researchQuestions: [],
        actor: "test:live",
      })
    )
    assert.strictEqual(clearResult.success, true)

    // Verify questions are cleared in DB
    const briefAfter = await sql`
      SELECT research_questions, brief_version FROM episode_briefs WHERE episode_id = ${tempId}
    `
    assert.deepStrictEqual((briefAfter[0] as any).research_questions, [], "questions should be empty array")
    assert.strictEqual((briefAfter[0] as any).brief_version, versionBefore + 1)

    // Verify JSONB type after clearing
    const typeCheckAfter = await sql`
      SELECT jsonb_typeof(research_questions) as json_type FROM episode_briefs WHERE episode_id = ${tempId}
    `
    assert.strictEqual((typeCheckAfter[0] as any).json_type, "array", "research_questions should remain JSONB array after clearing")

    // Cleanup
    try {
      await sql`DELETE FROM episode_events WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episode_briefs WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${tempId}`
    } catch (err) {
      // Cleanup is best-effort
      console.error("Warning: cleanup failed for J1", err)
    }
  })

  // ─────────────────────────────────────────────────────────────
  // K. STATE VERSION INDEPENDENCE
  // ─────────────────────────────────────────────────────────────

  test("K1. Brief update does not affect episode state_version", async () => {
    const tempId = "c5-live-k1-" + Date.now()
    const now = new Date().toISOString()

    // Create episode
    await sql`
      INSERT INTO episodes (
        episode_id, channel_name, title, workflow_state, review_status,
        schema_version, state_version, created_at, updated_at
      ) VALUES (
        ${tempId}, 'Test', 'Test', 'TOPIC', 'not-required', 1, 1, ${now}, ${now}
      )
    `

    // Record initial state_version
    const episodeBefore = await sql`
      SELECT state_version FROM episodes WHERE episode_id = ${tempId}
    `
    const stateVersionBefore = (episodeBefore[0] as any).state_version

    // Create brief
    const createResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: null,
        topic: "Test",
        actor: "test:live",
      })
    )
    assert.strictEqual(createResult.success, true)

    // Verify state_version unchanged
    const episodeAfterBriefCreate = await sql`
      SELECT state_version FROM episodes WHERE episode_id = ${tempId}
    `
    assert.strictEqual((episodeAfterBriefCreate[0] as any).state_version, stateVersionBefore)

    // Update brief
    const briefBefore = await sql`
      SELECT brief_version FROM episode_briefs WHERE episode_id = ${tempId}
    `
    const briefVersion = (briefBefore[0] as any).brief_version

    const updateResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeBrief(repo, {
        episodeId: tempId,
        expectedBriefVersion: briefVersion,
        hook: "New Hook",
        actor: "test:live",
      })
    )
    assert.strictEqual(updateResult.success, true)

    // Verify state_version still unchanged
    const episodeAfterBriefUpdate = await sql`
      SELECT state_version FROM episodes WHERE episode_id = ${tempId}
    `
    assert.strictEqual((episodeAfterBriefUpdate[0] as any).state_version, stateVersionBefore)

    // Now update episode workflow state
    const workflowUpdateResult = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      transitionEpisodeState(repo, {
        episodeId: tempId,
        expectedStateVersion: stateVersionBefore,
        toState: "RESEARCH",
        actor: "test:live",
      })
    )
    assert.strictEqual(workflowUpdateResult.success, true)

    // Verify episode state_version changed but brief_version unchanged
    const episodeAfterWorkflow = await sql`
      SELECT state_version FROM episodes WHERE episode_id = ${tempId}
    `
    assert.strictEqual((episodeAfterWorkflow[0] as any).state_version, stateVersionBefore + 1)

    const briefAfterWorkflow = await sql`
      SELECT brief_version FROM episode_briefs WHERE episode_id = ${tempId}
    `
    assert.strictEqual((briefAfterWorkflow[0] as any).brief_version, briefVersion + 1)

    // Cleanup
    try {
      await sql`DELETE FROM episode_events WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episode_briefs WHERE episode_id = ${tempId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${tempId}`
    } catch (err) {
      // Cleanup is best-effort
      console.error("Warning: cleanup failed for K1", err)
    }
  })
})
