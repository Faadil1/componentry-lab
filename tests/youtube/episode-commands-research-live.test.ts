import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { setEpisodeResearch } from "../../lib/youtube/commands/set-episode-research.ts"
import { setEpisodeBrief } from "../../lib/youtube/commands/set-episode-brief.ts"
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
  researchVersionBefore?: number | null
  researchVersionAfter?: number
  changedFields: string[]
}
type EventRow = { event_type: string; payload: EventPayload }

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

    assert.strictEqual(created.success, true)
    assert.strictEqual(created.value?.researchVersion, 1)

    // Update
    const updated = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      summary: "Updated",
      actor: "human:web",
    })

    assert.strictEqual(updated.success, true)
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

  test("C3. Update creates audit event with correct metadata", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create
    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      summary: "Initial",
      actor: "human:web",
    })

    // Update
    const updated = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      summary: "Updated",
      actor: "human:web",
    })

    assert.strictEqual(updated.success, true)

    // Verify audit event
    const events = await sql`
      SELECT event_type, payload FROM episode_events
      WHERE episode_id = ${TEST_EPISODE_ID}
      ORDER BY created_at DESC
      LIMIT 1
    `
    assert.strictEqual(events.length, 1)
    const event = events[0] as EventRow
    assert.strictEqual(event.event_type, "episode_research_set")

    const payload = event.payload as EventPayload
    assert.strictEqual(payload.operation, "updated")
    assert.strictEqual(payload.researchVersionBefore, 1)
    assert.strictEqual(payload.researchVersionAfter, 2)
    assert.deepStrictEqual(payload.changedFields, ["summary"])
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

    assert.strictEqual(created.success, true)
    const createdVersion = created.success ? created.value?.researchVersion : undefined
    const createdTimestamp = created.success ? created.value?.updatedAt : undefined

    // Send identical data
    const noop = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      summary: "Research",
      keyFindings: [finding],
      actor: "human:web",
    })

    assert.strictEqual(noop.success, true)
    assert.strictEqual(noop.success ? noop.value?.researchVersion : undefined, createdVersion)
    assert.strictEqual(noop.success ? noop.value?.updatedAt : undefined, createdTimestamp)

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

    try {
      // Pre-cleanup: delete any residual data from previous run (in FK order)
      await sql`DELETE FROM episode_events WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episode_research WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${testEpisodeId}`

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

      // Must delete events first (they have FK to episodes)
      await sql`DELETE FROM episode_events WHERE episode_id = ${testEpisodeId}`

      // Delete episode
      await sql`DELETE FROM episodes WHERE episode_id = ${testEpisodeId}`

      // Verify research deleted via CASCADE
      researchRows = await sql`
        SELECT * FROM episode_research WHERE episode_id = ${testEpisodeId}
      `
      assert.strictEqual(researchRows.length, 0)
    } finally {
      // Cleanup
      await sql`DELETE FROM episode_events WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episode_research WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${testEpisodeId}`
    }
  })

  // ─────────────────────────────────────────────────────────────
  // G. CLEAR SEMANTICS
  // ─────────────────────────────────────────────────────────────

  test("G1. Clear summary empty string", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create with summary
    const created = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      summary: "Initial summary",
      actor: "human:web",
    })
    assert.strictEqual(created.success, true)

    // Clear summary with empty string
    const cleared = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      summary: "",
      actor: "human:web",
    })
    assert.strictEqual(cleared.success, true)

    // Verify in database: empty string normalized to NULL
    const rows = await sql`
      SELECT summary FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(rows[0].summary, null)
  })

  test("G2. Clear findings array", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const finding: ResearchFinding = { id: "f1", statement: "Test", sourceIds: [] }

    // Create with findings
    const created = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      keyFindings: [finding],
      actor: "human:web",
    })
    assert.strictEqual(created.success, true)

    // Clear findings
    const cleared = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      keyFindings: [],
      actor: "human:web",
    })
    assert.strictEqual(cleared.success, true)

    // Verify in database
    const rows = await sql`
      SELECT key_findings FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.deepStrictEqual(rows[0].key_findings, [])
  })

  test("G3. Clear sources array", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const source: ResearchSource = { id: "s1", title: "Test Source" }

    const created = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      sources: [source],
      actor: "human:web",
    })
    assert.strictEqual(created.success, true)

    const cleared = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      sources: [],
      actor: "human:web",
    })
    assert.strictEqual(cleared.success, true)

    const rows = await sql`
      SELECT sources FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.deepStrictEqual(rows[0].sources, [])
  })

  test("G4. Clear contradictions array", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const contradiction: ResearchContradiction = { id: "c1", description: "Test", sourceIds: [] }

    const created = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      contradictions: [contradiction],
      actor: "human:web",
    })
    assert.strictEqual(created.success, true)

    const cleared = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      contradictions: [],
      actor: "human:web",
    })
    assert.strictEqual(cleared.success, true)

    const rows = await sql`
      SELECT contradictions FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.deepStrictEqual(rows[0].contradictions, [])
  })

  test("G5. Clear openQuestions array", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const created = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      openQuestions: ["Q1", "Q2"],
      actor: "human:web",
    })
    assert.strictEqual(created.success, true)

    const cleared = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      openQuestions: [],
      actor: "human:web",
    })
    assert.strictEqual(cleared.success, true)

    const rows = await sql`
      SELECT open_questions FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.deepStrictEqual(rows[0].open_questions, [])
  })

  test("B4. JSONB open_questions stored as array", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      openQuestions: ["Question 1", "Question 2"],
      actor: "human:web",
    })

    const rows = await sql`
      SELECT open_questions, jsonb_typeof(open_questions) as json_type
      FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `

    const row = rows[0] as ResearchRow & JsonTypeRow
    assert.strictEqual(row.json_type, "array")
    assert.strictEqual(Array.isArray(row.open_questions), true)
    assert.strictEqual(row.open_questions.length, 2)
  })

  // ─────────────────────────────────────────────────────────────
  // H. EVENT PAYLOAD STORAGE
  // ─────────────────────────────────────────────────────────────

  test("H1. Episode_events payload stored as JSONB object", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`

    const result = await runCommandInTransaction(sql as unknown as PostgresSql, async (repo) =>
      setEpisodeResearch(repo, {
        episodeId: TEST_EPISODE_ID,
        expectedResearchVersion: null,
        summary: "Test",
        actor: "human:web",
      })
    )

    assert.strictEqual(result.success, true)

    const events = await sql`
      SELECT payload, jsonb_typeof(payload) as json_type
      FROM episode_events
      WHERE episode_id = ${TEST_EPISODE_ID} AND event_type = 'episode_research_set'
    `

    assert.ok(events.length > 0)
    const event = events[0] as EventRow & JsonTypeRow
    assert.strictEqual(event.json_type, "object")
    assert.ok(event.payload.operation)
  })

  // ─────────────────────────────────────────────────────────────
  // I. VERSION INDEPENDENCE
  // ─────────────────────────────────────────────────────────────

  test("I1. researchVersion independent from episode stateVersion", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create research (researchVersion = 1)
    const result = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      summary: "Test",
      actor: "human:web",
    })
    assert.strictEqual(result.success, true)

    // Episode stateVersion should still be 1
    const episodeRows = await sql`
      SELECT state_version FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(episodeRows[0].state_version, 1)

    // Research version should be 1
    const researchRows = await sql`
      SELECT research_version FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(researchRows[0].research_version, 1)
  })

  // ─────────────────────────────────────────────────────────────
  // J. EFFECTIVE PACKET REFERENTIAL VALIDATION
  // ─────────────────────────────────────────────────────────────

  test("J1. Update finding while preserving existing sources", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const source: ResearchSource = { id: "s1", title: "Source 1" }
    const finding: ResearchFinding = { id: "f1", statement: "Finding", sourceIds: ["s1"] }

    // Create with source and finding
    const created = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      sources: [source],
      keyFindings: [finding],
      actor: "human:web",
    })
    assert.strictEqual(created.success, true)

    // Update finding only (preserves sources)
    const updated = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      keyFindings: [{ id: "f1", statement: "Updated finding", sourceIds: ["s1"] }],
      actor: "human:web",
    })
    assert.strictEqual(updated.success, true)

    // Verify sources still exist
    const rows = await sql`
      SELECT sources FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}
    `
    assert.strictEqual(rows[0].sources.length, 1)
  })

  test("J2. Reject dangling finding reference when source cleared", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const source: ResearchSource = { id: "s1", title: "Source 1" }
    const finding: ResearchFinding = { id: "f1", statement: "Finding", sourceIds: ["s1"] }

    // Create
    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      sources: [source],
      keyFindings: [finding],
      actor: "human:web",
    })

    // Try to clear sources while finding references them
    const result = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      sources: [],
      actor: "human:web",
    })

    // Should fail due to dangling reference
    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("J3. Reject dangling contradiction reference when source cleared", async () => {
    await sql`DELETE FROM episode_research WHERE episode_id = ${TEST_EPISODE_ID}`

    const source: ResearchSource = { id: "s1", title: "Source 1" }
    const contradiction: ResearchContradiction = { id: "c1", description: "Contradiction", sourceIds: ["s1"] }

    await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: null,
      sources: [source],
      contradictions: [contradiction],
      actor: "human:web",
    })

    const result = await setEpisodeResearch(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedResearchVersion: 1,
      sources: [],
      actor: "human:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  // ─────────────────────────────────────────────────────────────
  // D. AUDIT FAILURE ROLLBACK
  // ─────────────────────────────────────────────────────────────

  test("D2. Audit failure rolls back research mutation", async () => {
    const testEpisodeId = "audit-failure-test-episode"
    const now = new Date().toISOString()

    // Pre-cleanup
    await sql`DELETE FROM episode_events WHERE episode_id = ${testEpisodeId}`
    await sql`DELETE FROM episode_research WHERE episode_id = ${testEpisodeId}`
    await sql`DELETE FROM episodes WHERE episode_id = ${testEpisodeId}`

    try {
      // Create episode
      await sql`
        INSERT INTO episodes (
          episode_id, channel_name, title, workflow_state, review_status,
          schema_version, state_version, created_at, updated_at
        )
        VALUES (${testEpisodeId}, 'Test', 'Test', 'RESEARCH', 'not-required', 1, 1, ${now}, ${now})
      `

      // Try to create research - should fail during transaction
      let transactionThrew = false
      try {
        await runCommandInTransaction(sql as unknown as PostgresSql, async (transactionRepository) => {
          // Wrap transaction repository to fail on createEpisodeEvent
          const failingRepository: EpisodeRepository = {
            ...transactionRepository,
            createEpisodeEvent: async () => {
              throw new Error("Intentional audit failure")
            },
          }

          return setEpisodeResearch(failingRepository, {
            episodeId: testEpisodeId,
            expectedResearchVersion: null,
            summary: "Will fail on audit",
            actor: "human:web",
          })
        })
      } catch {
        transactionThrew = true
      }

      assert.ok(transactionThrew, "Transaction should have thrown on audit failure")

      // Verify research mutation was rolled back
      const researchRows = await sql`
        SELECT * FROM episode_research WHERE episode_id = ${testEpisodeId}
      `
      assert.strictEqual(researchRows.length, 0, "Research mutation should be rolled back")

      // Verify no audit event was created
      const eventRows = await sql`
        SELECT * FROM episode_events WHERE episode_id = ${testEpisodeId}
      `
      assert.strictEqual(eventRows.length, 0, "No audit event should be created on rollback")
    } finally {
      // Cleanup
      await sql`DELETE FROM episode_events WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episode_research WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${testEpisodeId}`
    }
  })

  // ─────────────────────────────────────────────────────────────
  // K. BRIEF VERSION INDEPENDENCE
  // ─────────────────────────────────────────────────────────────

  test("K1. researchVersion independent from briefVersion", async () => {
    const testEpisodeId = "brief-research-independence-test"
    const now = new Date().toISOString()

    // Pre-cleanup
    await sql`DELETE FROM episode_events WHERE episode_id = ${testEpisodeId}`
    await sql`DELETE FROM episode_research WHERE episode_id = ${testEpisodeId}`
    await sql`DELETE FROM episode_briefs WHERE episode_id = ${testEpisodeId}`
    await sql`DELETE FROM episodes WHERE episode_id = ${testEpisodeId}`

    try {
      // Create episode
      await sql`
        INSERT INTO episodes (
          episode_id, channel_name, title, workflow_state, review_status,
          schema_version, state_version, created_at, updated_at
        )
        VALUES (${testEpisodeId}, 'Test', 'Test', 'RESEARCH', 'not-required', 1, 1, ${now}, ${now})
      `

      // Create brief (briefVersion = 1)
      const briefCreated = await setEpisodeBrief(repository, {
        episodeId: testEpisodeId,
        expectedBriefVersion: null,
        topic: "Test Topic",
        actor: "human:web",
      })
      assert.strictEqual(briefCreated.success, true)
      assert.strictEqual(briefCreated.value?.briefVersion, 1, "Brief version should be 1")

      // Create research (researchVersion = 1)
      const researchCreated = await setEpisodeResearch(repository, {
        episodeId: testEpisodeId,
        expectedResearchVersion: null,
        summary: "Initial",
        actor: "human:web",
      })
      assert.strictEqual(researchCreated.success, true)
      assert.strictEqual(researchCreated.value?.researchVersion, 1, "Research version should be 1")

      // Verify both at v1
      let briefRow = await sql`
        SELECT brief_version FROM episode_briefs WHERE episode_id = ${testEpisodeId}
      `
      let researchRow = await sql`
        SELECT research_version FROM episode_research WHERE episode_id = ${testEpisodeId}
      `
      assert.strictEqual(briefRow[0].brief_version, 1)
      assert.strictEqual(researchRow[0].research_version, 1)

      // Update brief (briefVersion → 2, research stays 1)
      const briefUpdated = await setEpisodeBrief(repository, {
        episodeId: testEpisodeId,
        expectedBriefVersion: 1,
        topic: "Updated Topic",
        actor: "human:web",
      })
      assert.strictEqual(briefUpdated.success, true)
      assert.strictEqual(briefUpdated.value?.briefVersion, 2)

      // Verify brief changed, research unchanged
      briefRow = await sql`
        SELECT brief_version FROM episode_briefs WHERE episode_id = ${testEpisodeId}
      `
      researchRow = await sql`
        SELECT research_version FROM episode_research WHERE episode_id = ${testEpisodeId}
      `
      assert.strictEqual(briefRow[0].brief_version, 2, "Brief version should be 2")
      assert.strictEqual(researchRow[0].research_version, 1, "Research version should still be 1")

      // Update research (researchVersion → 2, brief stays 2)
      const researchUpdated = await setEpisodeResearch(repository, {
        episodeId: testEpisodeId,
        expectedResearchVersion: 1,
        summary: "Updated",
        actor: "human:web",
      })
      assert.strictEqual(researchUpdated.success, true)
      assert.strictEqual(researchUpdated.value?.researchVersion, 2)

      // Verify research changed, brief unchanged
      briefRow = await sql`
        SELECT brief_version FROM episode_briefs WHERE episode_id = ${testEpisodeId}
      `
      researchRow = await sql`
        SELECT research_version FROM episode_research WHERE episode_id = ${testEpisodeId}
      `
      assert.strictEqual(briefRow[0].brief_version, 2, "Brief version should still be 2")
      assert.strictEqual(researchRow[0].research_version, 2, "Research version should be 2")
    } finally {
      // Cleanup
      await sql`DELETE FROM episode_events WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episode_research WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episode_briefs WHERE episode_id = ${testEpisodeId}`
      await sql`DELETE FROM episodes WHERE episode_id = ${testEpisodeId}`
    }
  })
})
