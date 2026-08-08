import { test, describe } from "node:test"
import * as assert from "node:assert"
import { mapCanonicalEpisodeToPublished } from "../../lib/youtube/canonical-episode-to-published.ts"
import type { CanonicalEpisode } from "../../lib/persistence/canonical-types.ts"

describe("mapCanonicalEpisodeToPublished", () => {
  test("1. both videoId and publishedAt → published episode", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "episode-001",
      episodeNumber: 1,
      channelName: "Wealth Decoded",
      title: "Episode 1",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "dZxHY_rvpms",
      publishedAt: "2026-08-05T02:06:47Z",
      schemaVersion: 1,
      stateVersion: 2,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-05T02:06:47Z",
    }

    const result = mapCanonicalEpisodeToPublished(canonical)

    assert.ok(result, "Should return published episode")
    assert.strictEqual(result!.episodeId, "episode-001")
    assert.strictEqual(result!.episodeNumber, 1)
    assert.strictEqual(result!.youtubeVideoId, "dZxHY_rvpms")
    assert.strictEqual(result!.publishedAt, "2026-08-05T02:06:47Z")
    assert.strictEqual(result!.stateVersion, 2)
  })

  test("2. videoId only (no publishedAt) → null", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "episode-002",
      episodeNumber: 2,
      channelName: "Wealth Decoded",
      title: "Episode 2",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "dZxHY_rvpms",
      schemaVersion: 1,
      stateVersion: 1,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-02T00:00:00Z",
    }

    const result = mapCanonicalEpisodeToPublished(canonical)

    assert.strictEqual(result, null, "Should return null when publishedAt missing")
  })

  test("3. publishedAt only (no videoId) → null", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "episode-003",
      episodeNumber: 3,
      channelName: "Wealth Decoded",
      title: "Episode 3",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      publishedAt: "2026-08-05T02:06:47Z",
      schemaVersion: 1,
      stateVersion: 1,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-02T00:00:00Z",
    }

    const result = mapCanonicalEpisodeToPublished(canonical)

    assert.strictEqual(result, null, "Should return null when youtubeVideoId missing")
  })

  test("4. neither videoId nor publishedAt → null", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "episode-004",
      episodeNumber: 4,
      channelName: "Wealth Decoded",
      title: "Episode 4",
      workflowState: "TOPIC",
      reviewStatus: "pending",
      blockers: [],
      schemaVersion: 1,
      stateVersion: 1,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-02T00:00:00Z",
    }

    const result = mapCanonicalEpisodeToPublished(canonical)

    assert.strictEqual(result, null, "Should return null when both missing")
  })

  test("5. preserves all required fields", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "episode-test-05",
      episodeNumber: 5,
      channelName: "Test Channel",
      title: "Test Episode",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "test_video_id",
      publishedAt: "2026-08-01T12:00:00Z",
      schemaVersion: 1,
      stateVersion: 5,
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-08-01T12:00:00Z",
    }

    const result = mapCanonicalEpisodeToPublished(canonical)

    assert.ok(result)
    assert.strictEqual(result!.episodeId, "episode-test-05")
    assert.strictEqual(result!.episodeNumber, 5)
    assert.strictEqual(result!.channelName, "Test Channel")
    assert.strictEqual(result!.title, "Test Episode")
    assert.strictEqual(result!.youtubeVideoId, "test_video_id")
    assert.strictEqual(result!.publishedAt, "2026-08-01T12:00:00Z")
    assert.strictEqual(result!.stateVersion, 5)
  })

  test("6. handles missing episodeNumber gracefully", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "episode-no-number",
      channelName: "Wealth Decoded",
      title: "No Number Episode",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "video123",
      publishedAt: "2026-08-05T00:00:00Z",
      schemaVersion: 1,
      stateVersion: 1,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-05T00:00:00Z",
    }

    const result = mapCanonicalEpisodeToPublished(canonical)

    assert.ok(result)
    assert.strictEqual(result!.episodeNumber, undefined)
  })

  test("7. empty string videoId → null", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "episode-empty-vid",
      episodeNumber: 7,
      channelName: "Wealth Decoded",
      title: "Empty Video ID",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "",
      publishedAt: "2026-08-05T00:00:00Z",
      schemaVersion: 1,
      stateVersion: 1,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-05T00:00:00Z",
    }

    const result = mapCanonicalEpisodeToPublished(canonical)

    assert.strictEqual(result, null, "Empty videoId should be treated as missing")
  })

  test("8. empty string publishedAt → null", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "episode-empty-date",
      episodeNumber: 8,
      channelName: "Wealth Decoded",
      title: "Empty Published Date",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "video123",
      publishedAt: "",
      schemaVersion: 1,
      stateVersion: 1,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-05T00:00:00Z",
    }

    const result = mapCanonicalEpisodeToPublished(canonical)

    assert.strictEqual(result, null, "Empty publishedAt should be treated as missing")
  })
})
