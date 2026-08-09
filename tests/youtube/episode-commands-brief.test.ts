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
})
