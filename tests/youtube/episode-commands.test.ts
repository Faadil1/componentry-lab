import { test, describe, beforeEach } from "node:test"
import * as assert from "node:assert"
import { createMockRepository } from "../../lib/persistence/episode-repository-core.ts"
import type { EpisodeRepository } from "../../lib/persistence/episode-repository-core.ts"
import { transitionEpisodeState } from "../../lib/youtube/commands/transition-episode-state.ts"
import { recordHumanDecision } from "../../lib/youtube/commands/record-human-decision.ts"
import { addEpisodeBlocker } from "../../lib/youtube/commands/add-episode-blocker.ts"
import { resolveEpisodeBlocker } from "../../lib/youtube/commands/resolve-episode-blocker.ts"
import { recordPublication } from "../../lib/youtube/commands/record-publication.ts"

let repository: EpisodeRepository

const TEST_EPISODE_ID = "test-episode-001"

describe("Episode Commands", () => {
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
  // transitionEpisodeState tests
  // ─────────────────────────────────────────────────────────────

  test("1. transitionEpisodeState: forward transition succeeds", async () => {
    const result = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "RESEARCH",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 2)

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(updated!.workflowState, "RESEARCH")
    assert.strictEqual(updated!.stateVersion, 2)
  })

  test("2. transitionEpisodeState: unknown episode returns not_found", async () => {
    const result = await transitionEpisodeState(repository, {
      episodeId: "nonexistent",
      expectedStateVersion: 1,
      toState: "RESEARCH",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "not_found")
  })

  test("3. transitionEpisodeState: stale version returns conflict", async () => {
    const result = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 999,
      toState: "RESEARCH",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "conflict")
    assert.strictEqual(result.currentStateVersion, 1)
  })

  test("4. transitionEpisodeState: invalid transition rejected", async () => {
    const result = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "SCRIPT",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_transition")
  })

  test("5. transitionEpisodeState: no-op transition rejected", async () => {
    const result = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "TOPIC",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_transition")
  })

  test("6. transitionEpisodeState: appends state_transition event", async () => {
    await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "RESEARCH",
      actor: "H:web",
      reason: "initial workflow",
    })

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.ok(events.length > 0)

    const stateEvent = events.find((e) => e.eventType === "state_transition")
    assert.ok(stateEvent)
    assert.strictEqual(stateEvent!.fromState, "TOPIC")
    assert.strictEqual(stateEvent!.toState, "RESEARCH")
    assert.strictEqual(stateEvent!.actor, "H:web")
    assert.deepStrictEqual(stateEvent!.payload, { reason: "initial workflow" })
  })

  // ─────────────────────────────────────────────────────────────
  // recordHumanDecision tests
  // ─────────────────────────────────────────────────────────────

  test("7. recordHumanDecision: success updates decision and status", async () => {
    const result = await recordHumanDecision(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      outcome: "pass",
      label: "QA Review: Approved",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 2)

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.ok(updated!.latestDecision)
    assert.strictEqual(updated!.latestDecision!.outcome, "pass")
    assert.strictEqual(updated!.latestDecision!.notes, "QA Review: Approved")
    assert.strictEqual(updated!.reviewStatus, "completed")
  })

  test("8. recordHumanDecision: non-pass outcome sets in-progress status", async () => {
    const result = await recordHumanDecision(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      outcome: "rework",
      label: "Needs revision",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(updated!.reviewStatus, "in-progress")
  })

  test("9. recordHumanDecision: appends human_decision event", async () => {
    await recordHumanDecision(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      outcome: "pass-with-conditions",
      label: "Approved with notes",
      actor: "H:web",
    })

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const decision = events.find((e) => e.eventType === "human_decision")

    assert.ok(decision)
    assert.deepStrictEqual(decision!.payload, {
      outcome: "pass-with-conditions",
      label: "Approved with notes",
      decidedAt: decision!.payload!.decidedAt,
    })
  })

  // ─────────────────────────────────────────────────────────────
  // addEpisodeBlocker tests
  // ─────────────────────────────────────────────────────────────

  test("10. addEpisodeBlocker: success adds blocker", async () => {
    const result = await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      blockerId: "thumbnail-feedback",
      label: "Thumbnail needs redesign",
      severity: "high",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 2)

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(updated!.blockers.length, 1)
    assert.strictEqual(updated!.blockers[0].id, "thumbnail-feedback")
    assert.strictEqual(updated!.blockers[0].label, "Thumbnail needs redesign")
    assert.strictEqual(updated!.blockers[0].severity, "high")
  })

  test("11. addEpisodeBlocker: duplicate unresolved blocker rejected", async () => {
    // Add first blocker
    await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      blockerId: "same-id",
      label: "First blocker",
      severity: "medium",
      actor: "H:web",
    })

    // Try to add duplicate
    const result = await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 2,
      blockerId: "same-id",
      label: "Different label",
      severity: "low",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("12. addEpisodeBlocker: appends blocker_added event", async () => {
    await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      blockerId: "test-blocker",
      label: "Test label",
      severity: "high",
      actor: "H:web",
    })

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const blockerEvent = events.find((e) => e.eventType === "blocker_added")

    assert.ok(blockerEvent)
    assert.deepStrictEqual(blockerEvent!.payload, {
      blockerId: "test-blocker",
      label: "Test label",
      severity: "high",
    })
  })

  // ─────────────────────────────────────────────────────────────
  // resolveEpisodeBlocker tests
  // ─────────────────────────────────────────────────────────────

  test("13. resolveEpisodeBlocker: success marks blocker resolved", async () => {
    // Add blocker first
    await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      blockerId: "test-blocker",
      label: "Test blocker",
      severity: "medium",
      actor: "H:web",
    })

    // Resolve it
    const result = await resolveEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 2,
      blockerId: "test-blocker",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 3)

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    const blocker = updated!.blockers.find((b) => b.id === "test-blocker")
    assert.ok(blocker)
    assert.ok(blocker!.resolvedAt)
  })

  test("14. resolveEpisodeBlocker: nonexistent blocker returns not_found", async () => {
    const result = await resolveEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      blockerId: "nonexistent",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "not_found")
  })

  test("15. resolveEpisodeBlocker: already resolved blocker returns error", async () => {
    // Add and resolve
    await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      blockerId: "test-blocker",
      label: "Test",
      severity: "low",
      actor: "H:web",
    })

    await resolveEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 2,
      blockerId: "test-blocker",
      actor: "H:web",
    })

    // Try to resolve again
    const result = await resolveEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 3,
      blockerId: "test-blocker",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "already_resolved")
  })

  test("16. resolveEpisodeBlocker: appends blocker_resolved event", async () => {
    await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      blockerId: "test-blocker",
      label: "Test",
      severity: "low",
      actor: "H:web",
    })

    await resolveEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 2,
      blockerId: "test-blocker",
      actor: "H:web",
    })

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const resolved = events.find((e) => e.eventType === "blocker_resolved")

    assert.ok(resolved)
    assert.strictEqual(resolved!.payload!.blockerId, "test-blocker")
  })

  // ─────────────────────────────────────────────────────────────
  // recordPublication tests
  // ─────────────────────────────────────────────────────────────

  test("17. recordPublication: success records publication", async () => {
    // First transition to FINAL_RENDER
    await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "RESEARCH",
      actor: "H:web",
    })

    // Can't easily get to FINAL_RENDER in test, so we'll modify directly for this test
    // In real scenario would transition through all stages
    // For now test with a valid state
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: episode!.stateVersion,
      workflowState: "FINAL_RENDER",
    })

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    const result = await recordPublication(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: updated!.stateVersion,
      youtubeVideoId: "dQw4w9WgXcQ",
      publishedAt: "2026-08-09T12:00:00Z",
      actor: "H:web",
    })

    assert.strictEqual(result.success, true)

    const final = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(final!.workflowState, "PUBLISH")
  })

  test("18. recordPublication: missing video ID rejected", async () => {
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: episode!.stateVersion,
      workflowState: "FINAL_RENDER",
    })

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    const result = await recordPublication(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: updated!.stateVersion,
      youtubeVideoId: "",
      publishedAt: "2026-08-09T12:00:00Z",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("19. recordPublication: invalid timestamp rejected", async () => {
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: episode!.stateVersion,
      workflowState: "FINAL_RENDER",
    })

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    const result = await recordPublication(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: updated!.stateVersion,
      youtubeVideoId: "dQw4w9WgXcQ",
      publishedAt: "invalid-date",
      actor: "H:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("20. recordPublication: appends publication event", async () => {
    const episode = await repository.getEpisodeById(TEST_EPISODE_ID)
    await repository.updateEpisodeState({
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: episode!.stateVersion,
      workflowState: "FINAL_RENDER",
    })

    const updated = await repository.getEpisodeById(TEST_EPISODE_ID)
    await recordPublication(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: updated!.stateVersion,
      youtubeVideoId: "test-video-id",
      publishedAt: "2026-08-09T12:00:00Z",
      actor: "H:web",
    })

    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const pubEvent = events.find((e) => e.eventType === "publication")

    assert.ok(pubEvent)
    assert.deepStrictEqual(pubEvent!.payload, {
      youtubeVideoId: "test-video-id",
      publishedAt: "2026-08-09T12:00:00Z",
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Integration tests
  // ─────────────────────────────────────────────────────────────

  test("21. full workflow sequence: transition + decision + blocker + resolution", async () => {
    // Transition
    const t1 = await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "RESEARCH",
      actor: "H:web",
    })
    assert.strictEqual(t1.success, true)

    // Add blocker
    const b1 = await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 2,
      blockerId: "issue-1",
      label: "Issue",
      severity: "medium",
      actor: "H:web",
    })
    assert.strictEqual(b1.success, true)

    // Record decision
    const d1 = await recordHumanDecision(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 3,
      outcome: "pass-with-conditions",
      label: "Needs blocker resolution",
      actor: "H:web",
    })
    assert.strictEqual(d1.success, true)

    // Resolve blocker
    const br1 = await resolveEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 4,
      blockerId: "issue-1",
      actor: "H:web",
    })
    assert.strictEqual(br1.success, true)

    // Verify final state
    const final = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(final!.workflowState, "RESEARCH")
    assert.strictEqual(final!.stateVersion, 5)
    assert.ok(final!.latestDecision)
    assert.ok(final!.blockers[0].resolvedAt)

    // Verify all events were recorded
    const events = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.ok(events.find((e) => e.eventType === "state_transition"))
    assert.ok(events.find((e) => e.eventType === "blocker_added"))
    assert.ok(events.find((e) => e.eventType === "human_decision"))
    assert.ok(events.find((e) => e.eventType === "blocker_resolved"))
  })

  test("22. state version increments exactly once per command", async () => {
    const initial = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(initial!.stateVersion, 1)

    await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 1,
      toState: "RESEARCH",
      actor: "H:web",
    })

    const after1 = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after1!.stateVersion, 2)

    await addEpisodeBlocker(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 2,
      blockerId: "b1",
      label: "Test",
      severity: "low",
      actor: "H:web",
    })

    const after2 = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after2!.stateVersion, 3)
  })

  test("23. no state mutation on failure", async () => {
    const initial = await repository.getEpisodeById(TEST_EPISODE_ID)
    const initialVersion = initial!.stateVersion

    // Attempt invalid transition
    await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: initialVersion,
      toState: "SCRIPT",
      actor: "H:web",
    })

    const after = await repository.getEpisodeById(TEST_EPISODE_ID)
    assert.strictEqual(after!.stateVersion, initialVersion)
    assert.strictEqual(after!.workflowState, "TOPIC")
  })

  test("24. no event written on command failure", async () => {
    const initial = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    const initialCount = initial.length

    // Attempt with stale version
    await transitionEpisodeState(repository, {
      episodeId: TEST_EPISODE_ID,
      expectedStateVersion: 999,
      toState: "RESEARCH",
      actor: "H:web",
    })

    const after = await repository.getEpisodeEvents(TEST_EPISODE_ID)
    assert.strictEqual(after.length, initialCount)
  })
})
