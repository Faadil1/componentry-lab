import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { getEpisodeStateFromDb, listEpisodeStatesFromDb } from "../../lib/youtube/get-episode-state-from-db-core.ts"

const TEST_EPISODE_ID = "db-provider-test-episode-001"

let sql: ReturnType<typeof postgres>

describe("Database Provider (Neon)", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL required for database provider tests.\n" +
          "Set it in .env.local and run: npm run db:migrate"
      )
    }

    sql = postgres(databaseUrl)

    // Clean up test data
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`

    // Create test episode
    const now = new Date().toISOString()
    const blockers = [
      {
        id: "b1",
        code: "TEST",
        label: "Test blocker",
        severity: "high",
        source: "test",
        createdAt: now,
      },
    ]

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
        ${TEST_EPISODE_ID},
        99,
        'DB Provider Test',
        'Test Episode',
        'RESEARCH',
        'not-required',
        ${blockers},
        1,
        1,
        ${now},
        ${now}
      )
    `

    console.log(`✓ Connected to Neon (DATABASE_URL set)`)
    console.log(`✓ Using test episode ID: ${TEST_EPISODE_ID}`)
  })

  after(async () => {
    // Clean up
    await sql`DELETE FROM episode_events WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql`DELETE FROM episodes WHERE episode_id = ${TEST_EPISODE_ID}`
    await sql.end()
    console.log(`✓ Cleanup complete`)
  })

  test("1. get real Neon episode", async () => {
    const snapshot = await getEpisodeStateFromDb(TEST_EPISODE_ID)

    assert.ok(snapshot)
    assert.strictEqual(snapshot!.episodeId, TEST_EPISODE_ID)
    assert.strictEqual(snapshot!.title, "Test Episode")
    assert.strictEqual(snapshot!.workflowState, "RESEARCH")
  })

  test("2. unknown episode returns null", async () => {
    const snapshot = await getEpisodeStateFromDb("nonexistent-episode-xyz")

    assert.strictEqual(snapshot, null)
  })

  test("3. blockers included in snapshot", async () => {
    const snapshot = await getEpisodeStateFromDb(TEST_EPISODE_ID)

    assert.ok(snapshot)
    assert.ok(snapshot!.blockers.length > 0)
    assert.strictEqual(snapshot!.blockers[0].label, "Test blocker")
  })

  test("4. source indicates database", async () => {
    const snapshot = await getEpisodeStateFromDb(TEST_EPISODE_ID)

    assert.ok(snapshot)
    assert.ok(snapshot!.source)
    assert.strictEqual(snapshot!.source!.version, "database")
  })

  test("5. list episodes from database", async () => {
    const snapshots = await listEpisodeStatesFromDb()

    assert.ok(snapshots.length > 0)
    const found = snapshots.find((s) => s.episodeId === TEST_EPISODE_ID)
    assert.ok(found)
    assert.strictEqual(found!.title, "Test Episode")
  })
})
