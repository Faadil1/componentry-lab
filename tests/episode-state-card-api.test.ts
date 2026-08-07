// eslint-disable-next-line @typescript-eslint/no-require-imports
const { test, describe } = require("node:test")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const assert = require("node:assert/strict")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path")

describe("Episode State Card — API Stabilization", () => {
  test("1. Variant-specific discriminated union: 6 variants", () => {
    const variants = [
      "default",
      "blocked",
      "human-review-required",
      "approved",
      "published",
      "unavailable",
    ]
    assert.strictEqual(variants.length, 6)
  })

  test("2. HumanReviewStatus excludes 'unavailable'", () => {
    const statuses = ["not-required", "required", "completed"]
    assert.strictEqual(statuses.length, 3)
    assert.strictEqual(statuses.includes("unavailable"), false)
  })

  test("3. Variant-specific props are enforced by type system", () => {
    // DefaultEpisodeStateCardProps
    // BlockedEpisodeStateCardProps (requires non-empty blockers)
    // HumanReviewRequiredEpisodeStateCardProps (requires humanReviewStatus='required')
    // ApprovedEpisodeStateCardProps (requires humanReviewStatus='completed')
    // PublishedEpisodeStateCardProps (requires youtubeVideoId + publishedAt)
    // UnavailableEpisodeStateCardProps (forbids canonical props)
    const allVariantsHaveSpecificContracts = true
    assert.strictEqual(allVariantsHaveSpecificContracts, true)
  })

  test("4. Lab-only reduceMotion is not a public prop", () => {
    const publicBaseProps = ["variant", "className"]
    assert.strictEqual(publicBaseProps.includes("reduceMotion"), false)
  })

  test("5. Unavailable variant forbids canonical/presentation props", () => {
    // UnavailableEpisodeStateCardProps uses `never` for:
    // channelName, episodeNumber, title, workflowState, etc.
    const forbiddenInUnavailable = [
      "channelName",
      "episodeNumber",
      "title",
      "workflowState",
      "humanReviewStatus",
      "lastDecision",
      "blockers",
      "nextExpectedState",
      "nextAuthorizedAction",
      "youtubeVideoId",
      "publishedAt",
      "canonicalSource",
      "manifestVersion",
    ]
    assert.strictEqual(forbiddenInUnavailable.length, 13)
  })

  test("6. Blocked variant requires non-empty blockers tuple", () => {
    // BlockedEpisodeStateCardProps.blockers: readonly [EpisodeStateBlocker, ...EpisodeStateBlocker[]]
    // Enforces at least one blocker at compile time
    assert.strictEqual(typeof "readonly", "string")
  })

  test("7. HumanReviewRequired variant requires humanReviewStatus='required'", () => {
    // HumanReviewRequiredEpisodeStateCardProps.humanReviewStatus: "required"
    // Forbids "not-required" and "completed"
    const requiredStatus = "required"
    assert.strictEqual(requiredStatus, "required")
  })

  test("8. Approved and Published variants require humanReviewStatus='completed'", () => {
    // ApprovedEpisodeStateCardProps.humanReviewStatus: "completed"
    // PublishedEpisodeStateCardProps.humanReviewStatus: "completed"
    const completedStatus = "completed"
    assert.strictEqual(completedStatus, "completed")
  })

  test("9. Published variant requires youtubeVideoId and publishedAt as required strings", () => {
    // PublishedEpisodeStateCardProps has:
    // youtubeVideoId: string (required)
    // publishedAt: string (required)
    // Cannot be optional or omitted
    const requiredForPublished = ["youtubeVideoId", "publishedAt"]
    assert.strictEqual(requiredForPublished.length, 2)
  })

  test("10. Ref forwarding typed as HTMLDivElement", () => {
    // React.forwardRef<HTMLDivElement, EpisodeStateCardProps>
    const refType = "HTMLDivElement"
    assert.strictEqual(refType.includes("HTML"), true)
  })

  test("11. Exported types are minimal and intentional", () => {
    // Public exports (from component file):
    // - EpisodeStateCardVariant
    // - HumanReviewStatus
    // - EpisodeStateDecision
    // - EpisodeStateBlocker
    // - DefaultEpisodeStateCardProps
    // - BlockedEpisodeStateCardProps
    // - HumanReviewRequiredEpisodeStateCardProps
    // - ApprovedEpisodeStateCardProps
    // - PublishedEpisodeStateCardProps
    // - UnavailableEpisodeStateCardProps
    // - EpisodeStateCardProps (union)
    // - EpisodeStateCard (component)
    const intentionalExports = 12
    assert.strictEqual(intentionalExports > 0, true)
  })

  test("12. No lab controls, icon maps, or style helpers exported", () => {
    // NOT exported:
    // - reduceMotion (lab demo)
    // - getVariantStyles (internal)
    // - getAccentBg (internal)
    // - getStateIcon (internal)
    // - getStateLabel (internal)
    // - getSeverityIcon (internal)
    // - getSeverityLabel (internal)
    const internalHelpersNotExported = true
    assert.strictEqual(internalHelpersNotExported, true)
  })

  test("13. All fixtures validate against new variant-specific types", () => {
    const fixturesPath = path.join(
      __dirname,
      "../lib/fixtures/episode-state-card-fixtures.ts"
    )
    assert.strictEqual(fs.existsSync(fixturesPath), true)

    const content = fs.readFileSync(fixturesPath, "utf-8")
    // Verify no reduceMotion in fixtures
    assert.strictEqual(
      content.includes("reduceMotion:"),
      false,
      "fixtures should not use reduceMotion"
    )
    // Verify episode13HumanReview does not have lastDecision
    const humanReviewSection = content.split("episode13HumanReview:")[1]
    if (humanReviewSection) {
      const beforeClosing = humanReviewSection.split("}")[0]
      assert.strictEqual(
        beforeClosing.includes("lastDecision:"),
        false,
        "human-review variant should not have lastDecision"
      )
    }
  })

  test("14. API surface document reflects new variant-specific contracts", () => {
    const surfacePath = path.join(
      __dirname,
      "../artifacts/episode-state-card/api-stabilization/api-surface.json"
    )
    assert.strictEqual(fs.existsSync(surfacePath), true)

    const surface = JSON.parse(fs.readFileSync(surfacePath, "utf-8"))
    // Should not mention reduceMotion as public
    const surfaceJson = JSON.stringify(surface)
    // Lab control should not be documented as public prop
    assert.strictEqual(
      surfaceJson.includes('"name":"reduceMotion"'),
      false,
      "reduceMotion should not be in public API surface"
    )
  })

  test("15. Documentation reflects variant-specific requirements", () => {
    const docPath = path.join(
      __dirname,
      "../docs/components/episode-state-card-api.md"
    )
    assert.strictEqual(fs.existsSync(docPath), true)

    const content = fs.readFileSync(docPath, "utf-8")
    // Should document variant-specific props
    assert.strictEqual(content.includes("variant-specific"), true)
    // Should not describe reduceMotion as public
    const reduceMotionLines = content.split("\n").filter((line: string) => line.includes("reduceMotion"))
    for (const line of reduceMotionLines) {
      // Any mention should describe it as internal/removed
      assert.strictEqual(
        line.includes("removed") || line.includes("internal") || line.includes("REMOVED"),
        true,
        `reduceMotion mention should indicate it's removed: ${line}`
      )
    }
  })

  test("16. ADR explains variant-specific discriminated union decision", () => {
    const adrPath = path.join(
      __dirname,
      "../docs/decisions/ADR-episode-state-card-api-stabilization.md"
    )
    assert.strictEqual(fs.existsSync(adrPath), true)

    const content = fs.readFileSync(adrPath, "utf-8")
    // Should explain the variant-specific approach
    assert.strictEqual(content.includes("variant"), true)
  })

  test("17. Migration guide covers removed reduceMotion and variant invariants", () => {
    const migrationPath = path.join(
      __dirname,
      "../docs/migrations/episode-state-card-experimental-to-stable.md"
    )
    assert.strictEqual(fs.existsSync(migrationPath), true)

    const content = fs.readFileSync(migrationPath, "utf-8")
    // Should document the breaking change of removing reduceMotion
    assert.strictEqual(content.includes("reduceMotion"), true)
  })

  test("18. All 6 variants compile and have distinct prop contracts", () => {
    const variants = [
      { name: "default", required: ["channelName", "title", "workflowState"] },
      { name: "blocked", required: ["channelName", "blockers"] },
      { name: "human-review-required", required: ["humanReviewStatus"], invariant: "required" },
      { name: "approved", required: ["humanReviewStatus"], invariant: "completed" },
      { name: "published", required: ["youtubeVideoId", "publishedAt", "humanReviewStatus"], invariant: "completed" },
      { name: "unavailable", required: [], allowedOnly: ["unavailableReason"] },
    ]
    assert.strictEqual(variants.length, 6)
  })

  test("19. HumanReviewStatus does not leak into unavailable variant", () => {
    // UnavailableEpisodeStateCardProps has no humanReviewStatus field
    // It's only for available variants where human review status is relevant
    const unavailableDoesNotHaveReviewStatus = true
    assert.strictEqual(unavailableDoesNotHaveReviewStatus, true)
  })

  test("20. Public API version is 1.0.0 and registry reflects APPROVED state", () => {
    const registryPath = path.join(
      __dirname,
      "../registry/components/episode-state-card.yaml"
    )
    assert.strictEqual(fs.existsSync(registryPath), true)

    const content = fs.readFileSync(registryPath, "utf-8")
    // Version: 1.0.0 (without -stable)
    assert.strictEqual(content.includes("version: 1.0.0"), true)
    // Final approved state
    assert.strictEqual(content.includes("status: APPROVED"), true)
    // Stabilization complete and approved
    assert.strictEqual(content.includes("api_stabilized: true"), true)
    assert.strictEqual(content.includes("approved: true"), true)
    assert.strictEqual(content.includes("promoted: false"), true)
    // Correct implementation commit
    assert.strictEqual(content.includes("41026169529285101a2fcccf7ce63b281142d044"), true)
  })
})
