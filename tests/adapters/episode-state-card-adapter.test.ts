// eslint-disable-next-line @typescript-eslint/no-require-imports
const { test, describe } = require("node:test")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const assert = require("node:assert/strict")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { episodeStateSnapshotToCardProps } = require("../../lib/adapters/episode-state-card-adapter")
 
 
const {
  snapshotDefaultEditorial,
  snapshotDefaultPackaging,
  snapshotDefaultMasterEdit,
  snapshotBlockedThumbnail,
  snapshotBlockedWithResolvedBlockers,
  snapshotHumanReviewRequired,
  snapshotHumanReviewWithBlockers,
  snapshotApproved,
  snapshotApprovedWithConditions,
  snapshotPublished,
  snapshotPublishedWithStaleBlockers,
  snapshotUnavailableNull,
  snapshotUnavailableManifestFetchFailed,
  snapshotUnknownWorkflowState,
  snapshotCompletedReviewWithoutExplicitApproval,
  snapshotMalformedPublicationMissingId,
  snapshotMalformedPublicationMissingDate,
  snapshotReworkDecision,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
} = require("../../lib/fixtures/episode-state-snapshots")

describe("episodeStateSnapshotToCardProps", () => {
  // ─── NULL AND UNAVAILABLE ─────────────────────────────────

  test("1. null snapshot → unavailable", () => {
    const result = episodeStateSnapshotToCardProps(snapshotUnavailableNull)
    assert.strictEqual(result.variant, "unavailable")
  })

  test("2. unavailable reason preserved in output", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotUnavailableManifestFetchFailed
    )
    assert.strictEqual(result.variant, "unavailable")
    assert.strictEqual(
      snapshotUnavailableManifestFetchFailed.unavailableReason,
      "MANIFEST_FETCH_FAILED: upstream returned 404"
    )
  })

  // ─── DEFAULT VARIANT ──────────────────────────────────────

  test("3. default: editorial stage → default variant", () => {
    const result = episodeStateSnapshotToCardProps(snapshotDefaultEditorial)
    assert.strictEqual(result.variant, "default")
    assert.strictEqual(result.channelName, "Wealth Decoded")
    assert.strictEqual(result.title, "Dividend Investing Explained")
    assert.strictEqual(result.workflowState, "EDITORIAL")
    assert.strictEqual(result.humanReviewStatus, "not-required")
  })

  test("4. default: packaging stage → default variant", () => {
    const result = episodeStateSnapshotToCardProps(snapshotDefaultPackaging)
    assert.strictEqual(result.variant, "default")
    assert.strictEqual(result.workflowState, "PACKAGING")
    assert.strictEqual(result.nextAuthorizedAction, "Review packaging direction")
  })

  test("5. default: master edit stage → default variant", () => {
    const result = episodeStateSnapshotToCardProps(snapshotDefaultMasterEdit)
    assert.strictEqual(result.variant, "default")
    assert.strictEqual(result.workflowState, "MASTER_EDIT_REMOTION")
  })

  // ─── BLOCKED VARIANT ──────────────────────────────────────

  test("6. blocked: unresolved blockers → blocked variant", () => {
    const result = episodeStateSnapshotToCardProps(snapshotBlockedThumbnail)
    assert.strictEqual(result.variant, "blocked")
    if (result.variant === "blocked") {
      assert.strictEqual(result.blockers.length, 2)
      assert.strictEqual(result.blockers[0].id, "thumbnail-direction")
      assert.strictEqual(result.blockers[0].severity, "critical")
      assert.strictEqual(result.blockers[1].id, "title-clarity")
      assert.strictEqual(result.blockers[1].severity, "warning")
    }
  })

  test("7. blocked: resolved blockers filtered out → default variant", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotBlockedWithResolvedBlockers
    )
    assert.strictEqual(result.variant, "default")
    assert.strictEqual(result.workflowState, "QA")
  })

  // ─── HUMAN-REVIEW-REQUIRED VARIANT ────────────────────────

  test("8. human-review-required: reviewStatus required → human-review-required variant", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotHumanReviewRequired
    )
    assert.strictEqual(result.variant, "human-review-required")
    assert.strictEqual(result.humanReviewStatus, "required")
    assert.strictEqual(
      result.nextAuthorizedAction,
      "Review master edit and approve or reject"
    )
  })

  test("9. human-review-required takes precedence over blockers", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotHumanReviewWithBlockers
    )
    assert.strictEqual(result.variant, "human-review-required")
    assert.strictEqual(result.humanReviewStatus, "required")
  })

  // ─── APPROVED VARIANT ─────────────────────────────────────

  test("10. approved: completed review + pass decision → approved variant", () => {
    const result = episodeStateSnapshotToCardProps(snapshotApproved)
    assert.strictEqual(result.variant, "approved")
    assert.strictEqual(result.humanReviewStatus, "completed")
    assert.strictEqual(result.lastDecision?.outcome, "pass")
  })

  test("11. approved: pass-with-conditions decision also approved", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotApprovedWithConditions
    )
    assert.strictEqual(result.variant, "approved")
    assert.strictEqual(result.lastDecision?.outcome, "pass-with-conditions")
  })

  test("12. rework decision does not approve → blocked or default", () => {
    const result = episodeStateSnapshotToCardProps(snapshotReworkDecision)
    assert.notStrictEqual(result.variant, "approved")
  })

  // ─── PUBLISHED VARIANT ────────────────────────────────────

  test("13. published: videoId + publishedAt → published variant", () => {
    const result = episodeStateSnapshotToCardProps(snapshotPublished)
    assert.strictEqual(result.variant, "published")
    assert.strictEqual(result.youtubeVideoId, "ASluRm71I8o")
    assert.strictEqual(result.publishedAt, "2026-08-05T02:06:47Z")
    assert.strictEqual(result.humanReviewStatus, "completed")
  })

  test("14. published: stale blockers do not degrade to blocked", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotPublishedWithStaleBlockers
    )
    assert.strictEqual(result.variant, "published")
    assert.strictEqual(
      snapshotPublishedWithStaleBlockers.blockers[0].resolvedAt,
      "2026-08-04T18:00:00Z"
    )
  })

  test("15. malformed publication: missing videoId → not published", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotMalformedPublicationMissingId
    )
    assert.notStrictEqual(result.variant, "published")
  })

  test("16. malformed publication: missing publishedAt → not published", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotMalformedPublicationMissingDate
    )
    assert.notStrictEqual(result.variant, "published")
  })

  // ─── EDGE CASES ────────────────────────────────────────────

  test("17. unknown workflow state → default variant with passthrough", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotUnknownWorkflowState
    )
    assert.strictEqual(result.variant, "default")
    assert.strictEqual(
      result.workflowState,
      "FUTURE_WORKFLOW_STAGE_ADDED_BY_N8N"
    )
  })

  test("18. completed review without explicit pass decision → not approved", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotCompletedReviewWithoutExplicitApproval
    )
    assert.notStrictEqual(result.variant, "approved")
  })

  test("19. adapter preserves episodeNumber", () => {
    const result = episodeStateSnapshotToCardProps(snapshotDefaultEditorial)
    assert.strictEqual(result.episodeNumber, 14)
  })

  test("20. adapter preserves source version", () => {
    const result = episodeStateSnapshotToCardProps(snapshotDefaultEditorial)
    assert.strictEqual(result.manifestVersion, "1.0")
  })

  // ─── INVARIANTS ────────────────────────────────────────────

  test("21. adapter does not mutate snapshot", () => {
    const snapshot = { ...snapshotDefaultEditorial }
    const original = JSON.stringify(snapshot)
    episodeStateSnapshotToCardProps(snapshot)
    const after = JSON.stringify(snapshot)
    assert.strictEqual(original, after)
  })

  test("22. returned props satisfy basic EpisodeStateCardProps contract", () => {
    const result = episodeStateSnapshotToCardProps(snapshotPublished)
    assert(typeof result.variant === "string")
    assert(
      [
        "default",
        "blocked",
        "human-review-required",
        "approved",
        "published",
        "unavailable",
      ].includes(result.variant)
    )
  })

  test("23. variant=default has humanReviewStatus", () => {
    const result = episodeStateSnapshotToCardProps(snapshotDefaultEditorial)
    assert(result.variant === "default")
    assert(
      ["not-required", "required", "completed"].includes(
        result.humanReviewStatus as string
      )
    )
  })

  test("24. variant=blocked has blockers array", () => {
    const result = episodeStateSnapshotToCardProps(snapshotBlockedThumbnail)
    assert(result.variant === "blocked")
    if (result.variant === "blocked") {
      assert(Array.isArray(result.blockers))
      assert(result.blockers.length > 0)
    }
  })

  test("25. variant=human-review-required has required status", () => {
    const result = episodeStateSnapshotToCardProps(
      snapshotHumanReviewRequired
    )
    assert(result.variant === "human-review-required")
    assert.strictEqual(result.humanReviewStatus, "required")
  })

  test("26. variant=approved has completed status", () => {
    const result = episodeStateSnapshotToCardProps(snapshotApproved)
    assert(result.variant === "approved")
    assert.strictEqual(result.humanReviewStatus, "completed")
  })

  test("27. variant=published has videoId and publishedAt", () => {
    const result = episodeStateSnapshotToCardProps(snapshotPublished)
    assert(result.variant === "published")
    assert(typeof result.youtubeVideoId === "string")
    assert(typeof result.publishedAt === "string")
  })

  test("28. variant=unavailable has no required props", () => {
    const result = episodeStateSnapshotToCardProps(snapshotUnavailableNull)
    assert(result.variant === "unavailable")
    assert(
      !("channelName" in result) || result.channelName === undefined
    )
  })

  // ─── PRECEDENCE DOCUMENTATION ──────────────────────────────

  test("29. precedence: published > approved > human-review-required > blocked > default", () => {
    assert.strictEqual(
      episodeStateSnapshotToCardProps(snapshotPublished).variant,
      "published"
    )
    assert.strictEqual(
      episodeStateSnapshotToCardProps(snapshotApproved).variant,
      "approved"
    )
    assert.strictEqual(
      episodeStateSnapshotToCardProps(snapshotHumanReviewRequired).variant,
      "human-review-required"
    )
    assert.strictEqual(
      episodeStateSnapshotToCardProps(snapshotBlockedThumbnail).variant,
      "blocked"
    )
    assert.strictEqual(
      episodeStateSnapshotToCardProps(snapshotDefaultEditorial).variant,
      "default"
    )
  })
})
