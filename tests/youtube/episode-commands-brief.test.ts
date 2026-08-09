import { test, describe, beforeEach } from "node:test"
import * as assert from "node:assert"
import { createMockRepository } from "../../lib/persistence/episode-repository-core.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import { setEpisodeBrief } from "../../lib/youtube/commands/set-episode-brief.ts"

let repository: EpisodeRepository

const TEST_EPISODE_ID = "test-brief-episode-001"

describe("Episode Brief Commands", () => {
  beforeEach(async () => {
    repository = createMockRepository()

    // Create test episode
    await repository.createEpisode({
      episodeId: TEST_EPISODE_ID,
      channelName: "Test Channel",
      title: "Test Episode",
      workflowState: "TOPIC",
      reviewStatus: "not-required",
    })
  })

  // ─────────────────────────────────────────────────────────────
  // setEpisodeBrief CREATE tests
  // ─────────────────────────────────────────────────────────────

  test("1. setEpisodeBrief: create with topic only", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Dividend Investing",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 1)
    assert.strictEqual(result.value?.topic, "Dividend Investing")
    assert.strictEqual(result.value?.angle, undefined)
    assert.deepStrictEqual(result.value?.researchQuestions, [])
  })

  test("2. setEpisodeBrief: create with multiple fields", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Dividend Investing",
      angle: "Low volatility income",
      audience: "Investors 50+",
      hook: "Discover 3 strategies...",
      researchQuestions: ["Q1", "Q2"],
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.value?.topic, "Dividend Investing")
    assert.strictEqual(result.value?.angle, "Low volatility income")
    assert.strictEqual(result.value?.audience, "Investors 50+")
    assert.strictEqual(result.value?.hook, "Discover 3 strategies...")
    assert.deepStrictEqual(result.value?.researchQuestions, ["Q1", "Q2"])
  })

  test("3. setEpisodeBrief: create conflict (brief already exists)", async () => {
    // Create first brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "First Topic",
      actor: "H:web",
    })

    // Attempt to create second brief with null
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Second Topic",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "conflict")
  })

  test("4. setEpisodeBrief: create requires non-empty topic", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("5. setEpisodeBrief: create on non-existent episode → not_found", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: "nonexistent-episode",
      expectedBriefVersion: null,
      topic: "Topic",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "not_found")
  })

  // ─────────────────────────────────────────────────────────────
  // setEpisodeBrief UPDATE tests
  // ─────────────────────────────────────────────────────────────

  test("6. setEpisodeBrief: update from version 1 → 2", async () => {
    // Create initial brief
    const createResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Original Topic",
      actor: "H:web",
    })
    assert.strictEqual(createResult.success, true)

    // Update brief
    const updateResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      angle: "New Angle",
      hook: "New Hook",
      actor: "H:web",
    })

    assert.strictEqual(updateResult.success, true)
    assert.strictEqual(updateResult.stateVersion, 2)
    assert.strictEqual(updateResult.value?.briefVersion, 2)
    assert.strictEqual(updateResult.value?.topic, "Original Topic") // unchanged
    assert.strictEqual(updateResult.value?.angle, "New Angle")
    assert.strictEqual(updateResult.value?.hook, "New Hook")
  })

  test("7. setEpisodeBrief: update stale version → conflict", async () => {
    // Create brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      actor: "H:web",
    })

    // Attempt update with stale version
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 999,
      angle: "New Angle",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "conflict")
    assert.strictEqual(result.currentStateVersion, 1)
  })

  test("8. setEpisodeBrief: update missing brief → not_found", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      angle: "New Angle",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "not_found")
  })

  // ─────────────────────────────────────────────────────────────
  // Research questions handling
  // ─────────────────────────────────────────────────────────────

  test("9. setEpisodeBrief: research questions round-trip as array", async () => {
    const questions = ["What is X?", "How does Y work?", "Why Z?"]

    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      researchQuestions: questions,
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.deepStrictEqual(result.value?.researchQuestions, questions)
  })

  test("10. setEpisodeBrief: invalid research questions → invalid_input", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      researchQuestions: "not-an-array" as any,
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  // ─────────────────────────────────────────────────────────────
  // Audit events
  // ─────────────────────────────────────────────────────────────

  test("11. setEpisodeBrief: create audit event", async () => {
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      angle: "Angle",
      actor: "H:web",
    })

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const briefEvent = events.find((e) => e.eventType === "episode_brief_set")

    assert.ok(briefEvent, "episode_brief_set event should exist")
    assert.strictEqual(briefEvent!.actor, "H:web")
    const payload = briefEvent!.payload as any
    assert.strictEqual(payload.operation, "created")
    assert.strictEqual(payload.briefVersionBefore, null)
    assert.strictEqual(payload.briefVersionAfter, 1)
    assert.ok(Array.isArray(payload.changedFields))
    assert.ok(payload.changedFields.includes("topic"))
    assert.ok(payload.changedFields.includes("angle"))
  })

  test("12. setEpisodeBrief: update audit event", async () => {
    // Create brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      actor: "H:web",
    })

    // Update brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      hook: "New Hook",
      thesis: "New Thesis",
      actor: "H:web",
    })

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const updateEvent = events.find(
      (e) => e.eventType === "episode_brief_set" && (e.payload as any).operation === "updated"
    )

    assert.ok(updateEvent, "episode_brief_set update event should exist")
    const payload = updateEvent!.payload as any
    assert.strictEqual(payload.operation, "updated")
    assert.strictEqual(payload.briefVersionBefore, 1)
    assert.strictEqual(payload.briefVersionAfter, 2)
    assert.ok(payload.changedFields.includes("hook"))
    assert.ok(payload.changedFields.includes("thesis"))
  })

  // ─────────────────────────────────────────────────────────────
  // Independence from state version
  // ─────────────────────────────────────────────────────────────

  test("13. stateVersion and briefVersion are independent", async () => {
    // Record initial state version
    const episodeBefore = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episodeBefore!.stateVersion, 1)

    // Create brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      actor: "H:web",
    })

    // Verify episode state version unchanged
    const episodeAfter = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episodeAfter!.stateVersion, 1, "stateVersion should not change")

    // Get brief and verify briefVersion
    const brief = await repository.getEpisodeBrief(TEST_EPISODE_ID)
    assert.strictEqual(brief!.briefVersion, 1)
  })

  test("14. setEpisodeBrief: update brief does not affect episode state", async () => {
    // Create brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      actor: "H:web",
    })

    const episodeBefore = await repository.getEpisodeById(TEST_EPISODE_ID)
    const stateVersionBefore = episodeBefore!.stateVersion

    // Update brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      hook: "New Hook",
      actor: "H:web",
    })

    const episodeAfter = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(episodeAfter!.stateVersion, stateVersionBefore, "stateVersion must not change on brief update")
  })

  // ─────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────

  test("15. setEpisodeBrief: invalid episode ID → invalid_input", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: "",
      expectedBriefVersion: null,
      topic: "Topic",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("16. setEpisodeBrief: invalid expected version type → invalid_input", async () => {
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: "not-a-number" as any,
      topic: "Topic",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  // ─────────────────────────────────────────────────────────────
  // No-op updates and semantic comparison
  // ─────────────────────────────────────────────────────────────

  test("17. setEpisodeBrief: identical update (no-op) → no mutation, no version increment", async () => {
    // Create initial brief
    const createResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Original Topic",
      angle: "Original Angle",
      hook: "Original Hook",
      actor: "H:web",
    })
    assert.strictEqual(createResult.success, true)
    const briefVersion = createResult.value!.briefVersion
    assert.strictEqual(briefVersion, 1)

    // Update with identical values
    const updateResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      topic: "Original Topic",
      angle: "Original Angle",
      hook: "Original Hook",
      actor: "H:web",
    })

    assert.strictEqual(updateResult.success, true)
    assert.strictEqual(updateResult.value?.briefVersion, 1, "briefVersion should not increment on no-op")
    assert.strictEqual(updateResult.stateVersion, 1)

    // Verify no audit event was created for the no-op update
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const updateEvents = events.filter((e) => e.eventType === "episode_brief_set" && (e.payload as any).operation === "updated")
    assert.strictEqual(updateEvents.length, 0, "no audit event should be created on no-op update")
  })

  test("18. setEpisodeBrief: topic empty on update → invalid_input", async () => {
    // Create initial brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Original Topic",
      actor: "H:web",
    })

    // Attempt to update with empty topic
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      topic: "",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
    assert.match(result.message || "", /Topic cannot be empty/)
  })

  test("19. setEpisodeBrief: topic whitespace-only on update → invalid_input", async () => {
    // Create initial brief
    await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Original Topic",
      actor: "H:web",
    })

    // Attempt to update with whitespace-only topic
    const result = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      topic: "   ",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("20. setEpisodeBrief: semantic equality for optional fields (empty strings normalize)", async () => {
    // Create initial brief with empty strings treated as undefined
    const createResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      angle: "Angle",
      audience: "",  // Empty string
      actor: "H:web",
    })
    assert.strictEqual(createResult.success, true)

    // Update with same values but audience as undefined (should not create a field change)
    const updateResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      angle: "Angle",
      // audience omitted - should be treated as no change from ""
      actor: "H:web",
    })

    // Since only angle was resubmitted with same value, and audience was omitted,
    // the only potential change is angle (same value = no change)
    // Result should be no-op
    assert.strictEqual(updateResult.success, true)
    assert.strictEqual(updateResult.value?.briefVersion, 1)
  })

  test("21. setEpisodeBrief: research questions no-op (same array) → no mutation", async () => {
    const questions = ["What is X?", "How does Y work?"]

    // Create brief with research questions
    const createResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      researchQuestions: questions,
      actor: "H:web",
    })
    assert.strictEqual(createResult.success, true)

    // Update with identical research questions
    const updateResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      researchQuestions: questions,
      actor: "H:web",
    })

    assert.strictEqual(updateResult.success, true)
    assert.strictEqual(updateResult.value?.briefVersion, 1, "briefVersion should not increment when research questions unchanged")

    // Verify no audit event
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const updateEvents = events.filter((e) => e.eventType === "episode_brief_set" && (e.payload as any).operation === "updated")
    assert.strictEqual(updateEvents.length, 0, "no audit event should be created on research questions no-op")
  })

  // ─────────────────────────────────────────────────────────────
  // Clearing optional fields
  // ─────────────────────────────────────────────────────────────

  test("22. setEpisodeBrief: clear optional field (empty string signals clear)", async () => {
    // Create brief with angle
    const createResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      angle: "Original Angle",
      hook: "Original Hook",
      actor: "H:web",
    })
    assert.strictEqual(createResult.success, true)
    assert.strictEqual(createResult.value?.angle, "Original Angle")

    // Update with empty angle (clear it)
    const updateResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      angle: "",  // Empty string signals clear
      actor: "H:web",
    })

    assert.strictEqual(updateResult.success, true)
    assert.strictEqual(updateResult.value?.briefVersion, 2, "briefVersion should increment when clearing field")
    assert.strictEqual(updateResult.value?.angle, undefined, "angle should be cleared (undefined)")
    assert.strictEqual(updateResult.value?.hook, "Original Hook", "hook should be preserved")

    // Verify audit event recorded the change
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const updateEvent = events.find((e) => e.eventType === "episode_brief_set" && (e.payload as any).operation === "updated")
    assert.ok(updateEvent, "update event should exist")
    const payload = updateEvent!.payload as any
    assert.ok(payload.changedFields.includes("angle"), "changedFields should include angle")
  })

  test("23. setEpisodeBrief: clear all research questions (empty array signals clear)", async () => {
    // Create brief with research questions
    const createResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      researchQuestions: ["Q1", "Q2", "Q3"],
      actor: "H:web",
    })
    assert.strictEqual(createResult.success, true)
    assert.deepStrictEqual(createResult.value?.researchQuestions, ["Q1", "Q2", "Q3"])

    // Update with empty array (clear all questions)
    const updateResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      researchQuestions: [],  // Empty array signals clear
      actor: "H:web",
    })

    assert.strictEqual(updateResult.success, true)
    assert.strictEqual(updateResult.value?.briefVersion, 2, "briefVersion should increment when clearing questions")
    assert.deepStrictEqual(updateResult.value?.researchQuestions, [], "researchQuestions should be empty")

    // Verify audit event
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const updateEvent = events.find((e) => e.eventType === "episode_brief_set" && (e.payload as any).operation === "updated")
    assert.ok(updateEvent, "update event should exist")
    const payload = updateEvent!.payload as any
    assert.ok(payload.changedFields.includes("researchQuestions"), "changedFields should include researchQuestions")
  })

  test("24. setEpisodeBrief: already-empty field (empty string on undefined) → no-op", async () => {
    // Create brief without angle (undefined)
    const createResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      hook: "Hook",
      actor: "H:web",
    })
    assert.strictEqual(createResult.success, true)
    assert.strictEqual(createResult.value?.angle, undefined)

    // Update with empty angle (no-op since already undefined)
    const updateResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      angle: "",  // Empty string, but field already undefined
      actor: "H:web",
    })

    assert.strictEqual(updateResult.success, true)
    assert.strictEqual(updateResult.value?.briefVersion, 1, "briefVersion should not increment (no-op)")
    assert.strictEqual(updateResult.value?.angle, undefined)

    // Verify no audit event
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const updateEvents = events.filter((e) => e.eventType === "episode_brief_set" && (e.payload as any).operation === "updated")
    assert.strictEqual(updateEvents.length, 0, "no audit event should be created on no-op clear")
  })

  test("25. setEpisodeBrief: multiple fields cleared in single update", async () => {
    // Create brief with multiple fields
    const createResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: null,
      topic: "Topic",
      angle: "A",
      audience: "Aud",
      hook: "H",
      thesis: "T",
      actor: "H:web",
    })
    assert.strictEqual(createResult.success, true)

    // Update clearing angle and audience, keeping hook and thesis
    const updateResult = await setEpisodeBrief(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedBriefVersion: 1,
      angle: "",  // Clear
      audience: "",  // Clear
      hook: "H",  // Keep
      thesis: "T",  // Keep
      actor: "H:web",
    })

    assert.strictEqual(updateResult.success, true)
    assert.strictEqual(updateResult.value?.briefVersion, 2)
    assert.strictEqual(updateResult.value?.angle, undefined)
    assert.strictEqual(updateResult.value?.audience, undefined)
    assert.strictEqual(updateResult.value?.hook, "H")
    assert.strictEqual(updateResult.value?.thesis, "T")

    // Verify audit event
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const updateEvent = events.find((e) => e.eventType === "episode_brief_set" && (e.payload as any).operation === "updated")
    const payload = updateEvent!.payload as any
    assert.strictEqual(payload.changedFields.length, 2, "exactly 2 fields changed")
    assert.ok(payload.changedFields.includes("angle"))
    assert.ok(payload.changedFields.includes("audience"))
  })
})
