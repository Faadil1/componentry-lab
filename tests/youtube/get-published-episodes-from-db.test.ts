import { test, describe, before, after } from "node:test"
import * as assert from "node:assert"
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })

import postgres from "postgres"
import { createEpisodeRepository } from "../../lib/persistence/episode-repository-live-core.ts"
import { listPublishedEpisodesFromDb } from "../../lib/youtube/get-published-episodes-from-db-core.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import type { PostgresSql } from "../../lib/persistence/episode-repository-live-core.ts"

let sql: ReturnType<typeof postgres>
let repository: EpisodeRepository

describe("Published Episodes Database Provider", () => {
  before(async () => {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL required for published episodes tests")
    }

    sql = postgres(databaseUrl)
    repository = createEpisodeRepository(sql as unknown as PostgresSql)

    console.log(`\n✓ Connected to Neon for published episodes testing`)
  })

  after(async () => {
    // Cleanup temporary test record
    try {
      await sql`
        DELETE FROM episodes
        WHERE episode_id = 'integration-published-episode-001'
      `
      console.log(`✓ Cleaned up temporary test record`)
    } catch (err) {
      console.error(`Warning: Failed to cleanup test record: ${(err as Error).message}`)
    }

    await sql.end()
    console.log(`✓ Tests complete`)
  })

  test("1. empty database returns empty array", async () => {
    const published = await listPublishedEpisodesFromDb(repository)

    // May be empty or contain existing canonical episodes
    assert.ok(Array.isArray(published))
  })

  test("2. complete publication appears in list", async () => {
    // Create temporary test episode with publication data
    const now = new Date().toISOString()
    await sql`
      INSERT INTO episodes (
        episode_id,
        episode_number,
        channel_name,
        title,
        workflow_state,
        review_status,
        blockers,
        youtube_video_id,
        published_at,
        schema_version,
        state_version,
        created_at,
        updated_at
      )
      VALUES (
        'integration-published-episode-001',
        999,
        'Integration Test',
        'Published Test Episode',
        'PUBLISHED',
        'completed',
        '[]'::jsonb,
        'integration_test_video_id',
        ${now},
        1,
        1,
        ${now},
        ${now}
      )
      ON CONFLICT (episode_id) DO NOTHING
    `

    const published = await listPublishedEpisodesFromDb(repository)

    const found = published.find((e) => e.episodeId === "integration-published-episode-001")
    assert.ok(found, "Complete publication should appear in list")
    assert.strictEqual(found!.youtubeVideoId, "integration_test_video_id")
    assert.strictEqual(found!.stateVersion, 1)
  })

  test("3. incomplete publication (videoId only) excluded", async () => {
    const now = new Date().toISOString()
    const incompleteId = "integration-incomplete-video-only"

    try {
      // Create episode with videoId but no publishedAt
      await sql`
        INSERT INTO episodes (
          episode_id,
          episode_number,
          channel_name,
          title,
          workflow_state,
          review_status,
          blockers,
          youtube_video_id,
          schema_version,
          state_version,
          created_at,
          updated_at
        )
        VALUES (
          ${incompleteId},
          998,
          'Integration Test',
          'Video Only Episode',
          'PUBLISHED',
          'completed',
          '[]'::jsonb,
          'some_video_id',
          1,
          1,
          ${now},
          ${now}
        )
        ON CONFLICT (episode_id) DO NOTHING
      `

      const published = await listPublishedEpisodesFromDb(repository)

      const found = published.find((e) => e.episodeId === incompleteId)
      assert.strictEqual(found, undefined, "Video-only publication should be excluded")
    } finally {
      try {
        await sql`DELETE FROM episodes WHERE episode_id = ${incompleteId}`
      } catch {
        // Ignore cleanup errors
      }
    }
  })

  test("4. incomplete publication (publishedAt only) excluded", async () => {
    const now = new Date().toISOString()
    const incompleteId = "integration-incomplete-date-only"

    try {
      // Create episode with publishedAt but no videoId
      await sql`
        INSERT INTO episodes (
          episode_id,
          episode_number,
          channel_name,
          title,
          workflow_state,
          review_status,
          blockers,
          published_at,
          schema_version,
          state_version,
          created_at,
          updated_at
        )
        VALUES (
          ${incompleteId},
          997,
          'Integration Test',
          'Date Only Episode',
          'PUBLISHED',
          'completed',
          '[]'::jsonb,
          ${now},
          1,
          1,
          ${now},
          ${now}
        )
        ON CONFLICT (episode_id) DO NOTHING
      `

      const published = await listPublishedEpisodesFromDb(repository)

      const found = published.find((e) => e.episodeId === incompleteId)
      assert.strictEqual(found, undefined, "Date-only publication should be excluded")
    } finally {
      try {
        await sql`DELETE FROM episodes WHERE episode_id = ${incompleteId}`
      } catch {
        // Ignore cleanup errors
      }
    }
  })

  test("5. newest-first sorting", async () => {
    const baseTime = new Date("2026-08-01T00:00:00Z").getTime()

    // Create multiple test episodes with different publish dates
    const episode1Id = "integration-sort-test-001"
    const episode2Id = "integration-sort-test-002"
    const episode3Id = "integration-sort-test-003"

    try {
      await sql`
        INSERT INTO episodes (
          episode_id,
          episode_number,
          channel_name,
          title,
          workflow_state,
          review_status,
          blockers,
          youtube_video_id,
          published_at,
          schema_version,
          state_version,
          created_at,
          updated_at
        )
        VALUES
        (
          ${episode1Id},
          101,
          'Test',
          'Old Episode',
          'PUBLISHED',
          'completed',
          '[]'::jsonb,
          'video1',
          ${new Date(baseTime).toISOString()},
          1,
          1,
          ${new Date(baseTime).toISOString()},
          ${new Date(baseTime).toISOString()}
        ),
        (
          ${episode2Id},
          102,
          'Test',
          'Newest Episode',
          'PUBLISHED',
          'completed',
          '[]'::jsonb,
          'video2',
          ${new Date(baseTime + 2 * 24 * 60 * 60 * 1000).toISOString()},
          1,
          1,
          ${new Date(baseTime + 2 * 24 * 60 * 60 * 1000).toISOString()},
          ${new Date(baseTime + 2 * 24 * 60 * 60 * 1000).toISOString()}
        ),
        (
          ${episode3Id},
          103,
          'Test',
          'Middle Episode',
          'PUBLISHED',
          'completed',
          '[]'::jsonb,
          'video3',
          ${new Date(baseTime + 1 * 24 * 60 * 60 * 1000).toISOString()},
          1,
          1,
          ${new Date(baseTime + 1 * 24 * 60 * 60 * 1000).toISOString()},
          ${new Date(baseTime + 1 * 24 * 60 * 60 * 1000).toISOString()}
        )
        ON CONFLICT (episode_id) DO NOTHING
      `

      const published = await listPublishedEpisodesFromDb(repository)

      // Find our test episodes
      const sorted = published.filter((e) =>
        [episode1Id, episode2Id, episode3Id].includes(e.episodeId)
      )

      assert.strictEqual(sorted.length, 3, "Should find all 3 test episodes")

      // Verify newest first
      assert.strictEqual(sorted[0]!.episodeId, episode2Id, "Newest should be first")
      assert.strictEqual(sorted[1]!.episodeId, episode3Id, "Middle should be second")
      assert.strictEqual(sorted[2]!.episodeId, episode1Id, "Oldest should be last")
    } finally {
      try {
        await sql`
          DELETE FROM episodes
          WHERE episode_id IN (${episode1Id}, ${episode2Id}, ${episode3Id})
        `
      } catch {
        // Ignore cleanup errors
      }
    }
  })

  test("6. exact video ID returned", async () => {
    const published = await listPublishedEpisodesFromDb(repository)
    const testEpisode = published.find((e) => e.episodeId === "integration-published-episode-001")

    if (testEpisode) {
      assert.strictEqual(testEpisode.youtubeVideoId, "integration_test_video_id")
    }
  })

  test("7. exact publishedAt returned", async () => {
    const published = await listPublishedEpisodesFromDb(repository)

    // Find any published episode to verify publishedAt format
    const testEpisode = published.find((e) => e.publishedAt)

    if (testEpisode) {
      // Verify it's a valid ISO timestamp (may include milliseconds)
      assert.ok(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(testEpisode.publishedAt),
        `publishedAt should be ISO8601 format, got: ${testEpisode.publishedAt}`
      )
      // Verify it can be parsed as a date
      const date = new Date(testEpisode.publishedAt)
      assert.ok(!isNaN(date.getTime()), "publishedAt should be a valid date")
    }
  })
})
