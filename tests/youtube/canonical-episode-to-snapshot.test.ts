import { test, describe } from "node:test"
import * as assert from "node:assert"
import { mapCanonicalEpisodeToSnapshot } from "../../lib/youtube/canonical-episode-to-snapshot.ts"
import type { CanonicalEpisode } from "../../lib/persistence/canonical-types.ts"

describe("Canonical Episode to Snapshot Mapper", () => {
  test("1. maps basic episode fields", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-001",
      episodeNumber: 5,
      channelName: "Test Channel",
      title: "Test Episode",
      workflowState: "RESEARCH",
      reviewStatus: "not-required",
      blockers: [],
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)

    assert.strictEqual(snapshot.episodeId, "ep-001")
    assert.strictEqual(snapshot.episodeNumber, 5)
    assert.strictEqual(snapshot.channelName, "Test Channel")
    assert.strictEqual(snapshot.title, "Test Episode")
    assert.strictEqual(snapshot.workflowState, "RESEARCH")
    assert.strictEqual(snapshot.reviewStatus, "not-required")
  })

  test("2. maps blockers correctly", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-002",
      episodeNumber: 1,
      channelName: "Ch",
      title: "T",
      workflowState: "TOPIC",
      reviewStatus: "not-required",
      blockers: [
        {
          id: "b1",
          code: "ISSUE_1",
          label: "Issue found",
          severity: "high",
          source: "test",
          createdAt: "2026-08-07T10:00:00Z",
        },
      ],
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)

    assert.strictEqual(snapshot.blockers.length, 1)
    assert.strictEqual(snapshot.blockers[0].id, "b1")
    assert.strictEqual(snapshot.blockers[0].label, "Issue found")
    assert.strictEqual(snapshot.blockers[0].severity, "critical")
  })

  test("3. maps decision correctly", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-003",
      episodeNumber: 2,
      channelName: "Ch",
      title: "T",
      workflowState: "REVIEW",
      reviewStatus: "completed",
      blockers: [],
      latestDecision: {
        outcome: "pass",
        decidedBy: "alice@test.com",
        decidedAt: "2026-08-07T11:00:00Z",
        notes: "Approved",
      },
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)

    assert.ok(snapshot.lastDecision)
    assert.strictEqual(snapshot.lastDecision!.outcome, "pass")
    assert.strictEqual(snapshot.lastDecision!.decidedBy, "alice@test.com")
  })

  test("4. maps published episode with video ID", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-004",
      episodeNumber: 10,
      channelName: "Ch",
      title: "T",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "dQw4w9WgXcQ",
      publishedAt: "2026-08-07T12:00:00Z",
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)

    assert.ok(snapshot.publication)
    assert.strictEqual(snapshot.publication!.youtubeVideoId, "dQw4w9WgXcQ")
    assert.strictEqual(snapshot.publication!.publishedAt, "2026-08-07T12:00:00Z")
  })

  test("5. omits publication when no video ID", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-005",
      episodeNumber: 3,
      channelName: "Ch",
      title: "T",
      workflowState: "DRAFT",
      reviewStatus: "not-required",
      blockers: [],
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)

    assert.strictEqual(snapshot.publication, undefined)
  })

  test("6. maps severity levels correctly", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-006",
      episodeNumber: 6,
      channelName: "Ch",
      title: "T",
      workflowState: "TOPIC",
      reviewStatus: "not-required",
      blockers: [
        {
          id: "b1",
          code: "HIGH",
          label: "Critical issue",
          severity: "high",
          source: "test",
          createdAt: "2026-08-07T10:00:00Z",
        },
        {
          id: "b2",
          code: "LOW",
          label: "Minor issue",
          severity: "low",
          source: "test",
          createdAt: "2026-08-07T10:00:00Z",
        },
      ],
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)

    assert.strictEqual(snapshot.blockers[0].severity, "critical")
    assert.strictEqual(snapshot.blockers[1].severity, "warning")
  })

  test("7. maps review status: not-required", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-007",
      episodeNumber: 7,
      channelName: "Ch",
      title: "T",
      workflowState: "TOPIC",
      reviewStatus: "not-required",
      blockers: [],
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)
    assert.strictEqual(snapshot.reviewStatus, "not-required")
  })

  test("8. maps review status: pending -> required", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-008",
      episodeNumber: 8,
      channelName: "Ch",
      title: "T",
      workflowState: "TOPIC",
      reviewStatus: "pending",
      blockers: [],
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)
    assert.strictEqual(snapshot.reviewStatus, "required")
  })

  test("9. maps review status: in-progress -> required", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-009",
      episodeNumber: 9,
      channelName: "Ch",
      title: "T",
      workflowState: "TOPIC",
      reviewStatus: "in-progress",
      blockers: [],
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)
    assert.strictEqual(snapshot.reviewStatus, "required")
  })

  test("10. maps review status: completed", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-010",
      episodeNumber: 10,
      channelName: "Ch",
      title: "T",
      workflowState: "TOPIC",
      reviewStatus: "completed",
      blockers: [],
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)
    assert.strictEqual(snapshot.reviewStatus, "completed")
  })

  test("11. publication: video ID + timestamp", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-011",
      episodeNumber: 11,
      channelName: "Ch",
      title: "T",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "abc123",
      publishedAt: "2026-08-07T12:00:00Z",
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)
    assert.ok(snapshot.publication)
    assert.strictEqual(snapshot.publication!.youtubeVideoId, "abc123")
    assert.strictEqual(snapshot.publication!.publishedAt, "2026-08-07T12:00:00Z")
  })

  test("12. publication: video ID only (no timestamp)", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-012",
      episodeNumber: 12,
      channelName: "Ch",
      title: "T",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      youtubeVideoId: "abc123",
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)
    assert.strictEqual(snapshot.publication, undefined)
  })

  test("13. publication: timestamp only (no video ID)", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-013",
      episodeNumber: 13,
      channelName: "Ch",
      title: "T",
      workflowState: "PUBLISHED",
      reviewStatus: "completed",
      blockers: [],
      publishedAt: "2026-08-07T12:00:00Z",
      stateVersion: 1,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)
    assert.strictEqual(snapshot.publication, undefined)
  })

  test("14. includes source version from stateVersion", () => {
    const canonical: CanonicalEpisode = {
      episodeId: "ep-014",
      episodeNumber: 14,
      channelName: "Ch",
      title: "T",
      workflowState: "TOPIC",
      reviewStatus: "not-required",
      blockers: [],
      stateVersion: 5,
      schemaVersion: 1,
      createdAt: "2026-08-07T10:00:00Z",
      updatedAt: "2026-08-07T10:00:00Z",
    }

    const snapshot = mapCanonicalEpisodeToSnapshot(canonical)
    assert.ok(snapshot.source)
    assert.strictEqual(snapshot.source!.version, "5")
  })
})
