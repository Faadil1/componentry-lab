import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { setEpisodeResearch } from "../../lib/youtube/commands/set-episode-research.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"
import type { ResearchFinding, ResearchSource, ResearchContradiction } from "../../lib/persistence/canonical-types.ts"
import { runCommandInTransaction } from "../../lib/youtube/commands/transactional-command-runner-core.ts"

const TEST_EPISODE_ID = "integration-research-episode-001"

// Type definitions for database rows
type ResearchVersionRow = { research_version: number }
type ResearchRow = {
  research_version: number
  summary: string | null
  key_findings: ResearchFinding[]
  sources: ResearchSource[]
  open_questions: string[]
  contradictions: ResearchContradiction[]
  updated_at: Date | string
}
type CountRow = { count: string | number }
type JsonTypeRow = { json_type: string | null }
type EventPayload = {
  operation?: "created" | "updated"
  changedFields: string[]
}
type EventRow = { payload: EventPayload }

let sql: ReturnType<typeof postgres>
let repository: EpisodeRepository

describe("Episode Research Commands Live (Neon Integration)", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL required for live research tests.\n" +
          "Set it in .env.local and run: npm run db:migrate"
      )
    }

    sql = postgres(databaseUrl)
    repository = createEpisodeRepository(sql as unknown as PostgresSql)

    // Clean up any existing test data
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`
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
        'Test Episode for Research',
        'RESEARCH',
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
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql.end()
  })

  // ─────────────────────────────────────────────────────────────
  // A. CREATE
  // ─────────────────────────────────────────────────────────────

  test("A1. Create episode research minimal", async () => {
    const result = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      actor: "human:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 1)
    assert.deepStrictEqual(result.value?.keyFindings, [])

    // Verify in database
    const rows = await sql`
      SELECT * FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(rows.length, 1)
    const researchRow = rows[0] as ResearchRow
    assert.strictEqual(researchRow.research_version, 1)
  })

  test("A2. Research creation creates audit event", async () => {
    // Clear previous state
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`

    const result = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeResearch(repo, {
        episodeId: TEST_EPISODE_ID,
        expectedResearchVersion: null,
        summary: "Test summary",
        actor: "human:web",
      })
    )

    assert.strictEqual(result.success, true)

    // Verify event exists
    const events = await sql`
      SELECT * FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}
      AND event_type = 'episode_research_set'
    `

    assert.ok(events.length > 0, "episode_research_set event should exist")
    const event = events[events.length - 1] as EventRow
    const payload = event.payload
    assert.strictEqual(payload.operation, "created")
  })

  // ─────────────────────────────────────────────────────────────
  // B. JSONB STORAGE
  // ─────────────────────────────────────────────────────────────

  test("B1. JSONB key_findings stored as array, not string", async () => {
    // Clear previous state
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const finding: ResearchFinding = {
      id: "finding-1",
      statement: "Test finding",
      sourceIds: [],
    }

    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      keyFindings: [finding],
      actor: "human:web",
    })

    // Verify JSONB is stored as array
    const rows = await sql`
      SELECT key_findings, jsonb_typeof(key_findings) as json_type
      FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `

    assert.strictEqual(rows.length, 1)
    const row = rows[0] as ResearchRow & JsonTypeRow
    assert.strictEqual(row.json_type, "array")
    assert.strictEqual(Array.isArray(row.key_findings), true)
    assert.strictEqual(row.key_findings[0].id, "finding-1")
  })

  test("B2. JSONB sources stored as array", async () => {
    // Clear previous state
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const source: ResearchSource = {
      id: "source-1",
      title: "Research Paper",
      url: "https://example.com",
    }

    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      sources: [source],
      actor: "human:web",
    })

    const rows = await sql`
      SELECT sources, jsonb_typeof(sources) as json_type
      FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `

    assert.strictEqual(rows.length, 1)
    const row = rows[0] as ResearchRow & JsonTypeRow
    assert.strictEqual(row.json_type, "array")
    assert.strictEqual(Array.isArray(row.sources), true)
    assert.strictEqual(row.sources[0].title, "Research Paper")
  })

  test("B3. JSONB contradictions stored as array", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const contradiction: ResearchContradiction = {
      id: "c1",
      description: "Test contradiction",
      sourceIds: [],
    }

    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      contradictions: [contradiction],
      actor: "human:web",
    })

    const rows = await sql`
      SELECT contradictions, jsonb_typeof(contradictions) as json_type
      FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `

    assert.strictEqual(rows.length, 1)
    const row = rows[0] as ResearchRow & JsonTypeRow
    assert.strictEqual(row.json_type, "array")
    assert.strictEqual(Array.isArray(row.contradictions), true)
  })

  // ─────────────────────────────────────────────────────────────
  // C. UPDATE with VERSION CONTROL
  // ─────────────────────────────────────────────────────────────

  test("C1. Update increments research version", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create
    const created = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      summary: "Initial",
      actor: "human:web",
    })

    assert.strictEqual(created.value?.researchVersion, 1)

    // Update
    const updated = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      summary: "Updated",
      actor: "human:web",
    })

    assert.strictEqual(updated.value?.researchVersion, 2)

    // Verify in database
    const rows = await sql`
      SELECT research_version FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const versionRow = rows[0] as ResearchVersionRow
    assert.strictEqual(versionRow.research_version, 2)
  })

  test("C2. Stale version rejected before mutation", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create v1
    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      summary: "V1",
      actor: "human:web",
    })

    // Try to update with wrong version
    const result = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 999,
      summary: "Wrong version",
      actor: "human:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "conflict")

    // Verify database unchanged
    const rows = await sql`
      SELECT research_version, summary FROM episode_research
      WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const row = rows[0] as ResearchRow
    assert.strictEqual(row.research_version, 1)
    assert.strictEqual(row.summary, "V1")
  })

  // ─────────────────────────────────────────────────────────────
  // D. TRANSACTIONAL INTEGRITY
  // ─────────────────────────────────────────────────────────────

  test("D1. Research mutation + audit event in single transaction", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`

    const result = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeResearch(repo, {
        episodeId: TEST_EPISODE_ID,
        expectedResearchVersion: null,
        summary: "Transactional test",
        actor: "human:web",
      })
    )

    assert.strictEqual(result.success, true)

    // Verify both exist
    const researchRows = await sql`
      SELECT * FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const eventRows = await sql`
      SELECT * FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}
    `

    assert.strictEqual(researchRows.length, 1)
    assert.ok(eventRows.length > 0)
  })

  // ─────────────────────────────────────────────────────────────
  // E. SEMANTIC NO-OP
  // ─────────────────────────────────────────────────────────────

  test("E1. Semantic no-op does not increment version", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const finding: ResearchFinding = {
      id: "f1",
      statement: "Finding A",
      sourceIds: [],
    }

    // Create
    const created = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      summary: "Research",
      keyFindings: [finding],
      actor: "human:web",
    })

    const createdVersion = created.value?.researchVersion
    const createdTimestamp = created.value?.updatedAt

    // Send identical data
    const noop = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      summary: "Research",
      keyFindings: [finding],
      actor: "human:web",
    })

    assert.strictEqual(noop.value?.researchVersion, createdVersion)
    assert.strictEqual(noop.value?.updatedAt, createdTimestamp)

    // Verify database
    const rows = await sql`
      SELECT research_version FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const versionRow = rows[0] as ResearchVersionRow
    assert.strictEqual(versionRow.research_version, 1)
  })

  test("E2. Semantic no-op does not create audit event", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create
    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      summary: "Summary",
      actor: "human:web",
    })

    const eventsBefore = await sql`
      SELECT COUNT(*) as count FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const countBefore = Number((eventsBefore[0] as CountRow).count)

    // No-op
    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      summary: "Summary",
      actor: "human:web",
    })

    const eventsAfter = await sql`
      SELECT COUNT(*) as count FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}
    `
    const countAfter = Number((eventsAfter[0] as CountRow).count)

    assert.strictEqual(countAfter, countBefore)
  })

  // ─────────────────────────────────────────────────────────────
  // F. CASCADE DELETE
  // ─────────────────────────────────────────────────────────────

  test("F1. ON DELETE CASCADE removes research", async () => {
    const testEpisodeId = "cascade-test-episode"
    const now = new Date().toISOString()

    // Create episode
    await sql`
      INSERT INTO episodes (
        episode_id, channel_name, title, workflow_state, review_status,
        schema_version, state_version, created_at, updated_at
      )
      VALUES (${testEpisodeId}, 'Test', 'Test', 'RESEARCH', 'not-required', 1, 1, ${now}, ${now})
    `

    // Create research
    await setEpisodeResearch(repository, {
      episodeId: testEpisodeId,
      expectedResearchVersion: null,
      summary: "Will cascade delete",
      actor: "human:web",
    })

    // Verify research exists
    let researchRows = await sql`
      SELECT * FROM episode_research WHERE episode_id = ${testEpisodeId}
    `
    assert.strictEqual(researchRows.length, 1)

    // Delete episode
    await sql`DELETE FROM episodes WHERE episode_id = ${testEpisodeId}`

    // Verify research deleted
    researchRows = await sql`
      SELECT * FROM episode_research WHERE episode_id = ${testEpisodeId}
    `
    assert.strictEqual(researchRows.length, 0)
  })
})
