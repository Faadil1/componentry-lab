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

  test("7. includes source metadata", () => {
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

    assert.ok(snapshot.source)
    assert.strictEqual(snapshot.source!.version, "database")
    assert.ok(snapshot.source!.fetchedAt)
  })
})
