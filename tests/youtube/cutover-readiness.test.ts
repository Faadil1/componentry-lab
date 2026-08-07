import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import {
  getEpisodeStateFromDb,
  listEpisodeStatesFromDb,
} from "../../lib/youtube/get-episode-state-from-db-core.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"

let sql: ReturnType<typeof postgres>
let repository: EpisodeRepository

describe("Cutover Readiness Validation", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL required for cutover readiness tests")
    }

    sql = postgres(databaseUrl)
    repository = createEpisodeRepository(sql as unknown as PostgresSql)

    console.log(`\n✓ Connected to Neon for cutover validation`)
  })

  after(async () => {
    await sql.end()
    console.log(`✓ Validation complete`)
  })

  test("1. database list contains seeded episodes", async () => {
    const snapshots = await listEpisodeStatesFromDb(repository)

    const ids = new Set(snapshots.map((s) => s.episodeId))
    assert.ok(ids.has("episode-014"), "episode-014 should exist")
    assert.ok(ids.has("episode-013"), "episode-013 should exist")
    assert.ok(ids.has("episode-015"), "episode-015 should exist")
  })

  test("2. episode-014 resolves correctly", async () => {
    const snapshot = await getEpisodeStateFromDb(repository, "episode-014")

    assert.ok(snapshot)
    assert.strictEqual(snapshot!.episodeId, "episode-014")
    assert.strictEqual(snapshot!.title, "Dividend Investing Explained")
    assert.strictEqual(snapshot!.channelName, "Wealth Decoded")
  })

  test("3. episode-013 resolves correctly", async () => {
    const snapshot = await getEpisodeStateFromDb(repository, "episode-013")

    assert.ok(snapshot)
    assert.strictEqual(snapshot!.episodeId, "episode-013")
    assert.strictEqual(snapshot!.title, "$1,000 a Month in Dividends")
    assert.strictEqual(snapshot!.workflowState, "RESEARCH")
  })

  test("4. unknown episode returns null", async () => {
    const snapshot = await getEpisodeStateFromDb(
      repository,
      "nonexistent-episode-xyz"
    )

    assert.strictEqual(snapshot, null)
  })

  test("5. snapshots have valid review status", async () => {
    const snapshot = await getEpisodeStateFromDb(repository, "episode-014")

    assert.ok(snapshot)
    assert.ok(
      ["not-required", "required", "completed"].includes(snapshot!.reviewStatus)
    )
  })

  test("6. no incomplete publication", async () => {
    const snapshot = await getEpisodeStateFromDb(repository, "episode-014")

    assert.ok(snapshot)
    // Publication should only exist if both video ID and timestamp present
    if (snapshot!.publication) {
      assert.ok(snapshot!.publication.youtubeVideoId)
      assert.ok(snapshot!.publication.publishedAt)
    }
  })

  test("7. database provides real data (not fixture fallback)", async () => {
    const snapshots = await listEpisodeStatesFromDb(repository)

    // Should have actual episodes, not fixture-only variants
    const ids = snapshots.map((s) => s.episodeId)

    // Fixture variants should NOT appear in canonical DB
    assert.ok(!ids.includes("episode-014-blocked"))
    assert.ok(!ids.includes("episode-014-approved"))
    assert.ok(!ids.includes("episode-013-approved"))
    assert.ok(!ids.includes("episode-013-published"))
  })

  test("8. source version present", async () => {
    const snapshot = await getEpisodeStateFromDb(repository, "episode-014")

    assert.ok(snapshot)
    assert.ok(snapshot!.source)
    assert.ok(snapshot!.source!.version)
  })
})
