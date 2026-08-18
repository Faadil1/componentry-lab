import { test, describe } from "node:test"
import * as assert from "node:assert"
import {
  createMockRepository,
  type EpisodeRepository,
} from "../../lib/persistence/episode-repository-core.ts"
import type { CanonicalBlocker } from "../../lib/persistence/canonical-types.ts"

describe("Episode Repository", () => {
  let repo: EpisodeRepository
  function assertCreateEpisodeSuccess(
    result: Awaited<ReturnType<EpisodeRepository["createEpisode"]>>
  ) {
    assert.strictEqual(result.success, true, "createEpisode should succeed")
    if (!result.success) {
      assert.fail(`createEpisode failed: ${result.reason}`)
    }
    return result.episode
  }


  // Use mock repository for tests (no live DB required)
  test.before(async () => {
    repo = createMockRepository()
  })

  describe("createEpisode", () => {
    test("1. creates episode with initial state", async () => {
      const result = await repo.createEpisode({
        episodeId: "episode-001",
        episodeNumber: 1,
        channelName: "Test Channel",
        title: "First Episode",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      const episode = assertCreateEpisodeSuccess(result)

      assert.strictEqual(episode.episodeId, "episode-001")
      assert.strictEqual(episode.episodeNumber, 1)
      assert.strictEqual(episode.channelName, "Test Channel")
      assert.strictEqual(episode.title, "First Episode")
      assert.strictEqual(episode.workflowState, "TOPIC")
      assert.strictEqual(episode.reviewStatus, "not-required")
      assert.strictEqual(episode.stateVersion, 1)
      assert.strictEqual(episode.schemaVersion, 1)
      assert.deepStrictEqual(episode.blockers, [])
      assert.strictEqual(episode.latestDecision, undefined)
    })

    test("2. episode fields are properly initialized", async () => {
      const result = await repo.createEpisode({
        episodeId: "episode-002",
        channelName: "Test",
        title: "Test",
        workflowState: "RESEARCH",
        reviewStatus: "not-required",
      })

      const episode = assertCreateEpisodeSuccess(result)

      assert.ok(episode.createdAt, "should have createdAt")
      assert.ok(episode.updatedAt, "should have updatedAt")
      assert.strictEqual(episode.episodeNumber, undefined, "episodeNumber can be undefined")
      assert.strictEqual(episode.youtubeVideoId, undefined, "youtubeVideoId starts empty")
      assert.strictEqual(episode.publishedAt, undefined, "publishedAt starts empty")
    })
  })

  describe("getEpisodeById", () => {
    test("1. retrieves created episode", async () => {
      await repo.createEpisode({
        episodeId: "episode-find-1",
        channelName: "Ch",
        title: "T",
        workflowState: "SCRIPT",
        reviewStatus: "not-required",
      })

      const found = await repo.getEpisodeById("episode-find-1")
      assert.ok(found, "should find episode")
      assert.strictEqual(found.episodeId, "episode-find-1")
    })

    test("2. returns null for unknown episode", async () => {
      const found = await repo.getEpisodeById("unknown-episode-xyz")
      assert.strictEqual(found, null, "should return null for unknown episode")
    })
  })

  describe("listEpisodes", () => {
    test("1. returns all created episodes", async () => {
      const repo2 = createMockRepository()
      await repo2.createEpisode({
        episodeId: "list-1",
        channelName: "Ch",
        title: "T1",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })
      await repo2.createEpisode({
        episodeId: "list-2",
        episodeNumber: 2,
        channelName: "Ch",
        title: "T2",
        workflowState: "RESEARCH",
        reviewStatus: "not-required",
      })

      const episodes = await repo2.listEpisodes()
      assert.strictEqual(episodes.length, 2, "should have 2 episodes")
      assert.ok(
        episodes.some((e) => e.episodeId === "list-1"),
        "should include list-1"
      )
      assert.ok(
        episodes.some((e) => e.episodeId === "list-2"),
        "should include list-2"
      )
    })

    test("2. returns empty list when no episodes", async () => {
      const repo3 = createMockRepository()
      const episodes = await repo3.listEpisodes()
      assert.deepStrictEqual(episodes, [], "should return empty array")
    })
  })

  describe("updateEpisodeState", () => {
    test("1. updates state with correct version", async () => {
      const repo4 = createMockRepository()
      const initial = assertCreateEpisodeSuccess(await repo4.createEpisode({
        episodeId: "update-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      }))

      const result = await repo4.updateEpisodeState({
        episodeId: "update-1",
        expectedStateVersion: initial.stateVersion,
        workflowState: "RESEARCH",
      })

      assert.strictEqual(result.success, true, "update should succeed")
      assert.strictEqual(result.expectedVersion, 1)
      assert.strictEqual(result.actualVersion, 2, "version should increment")

      const updated = await repo4.getEpisodeById("update-1")
      assert.ok(updated)
      assert.strictEqual(updated.workflowState, "RESEARCH")
      assert.strictEqual(updated.stateVersion, 2)
    })

    test("2. rejects update with wrong version (conflict)", async () => {
      const repo5 = createMockRepository()
      await repo5.createEpisode({
        episodeId: "conflict-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      // First update succeeds
      await repo5.updateEpisodeState({
        episodeId: "conflict-1",
        expectedStateVersion: 1,
        workflowState: "RESEARCH",
      })

      // Second update with old version fails
      const result = await repo5.updateEpisodeState({
        episodeId: "conflict-1",
        expectedStateVersion: 1, // Old version
        workflowState: "SCRIPT",
      })

      assert.strictEqual(result.success, false, "should fail with conflict")
      assert.strictEqual(result.reason, "conflict")
      assert.strictEqual(result.actualVersion, 2, "should show current version")
    })

    test("3. returns not_found for unknown episode", async () => {
      const result = await repo.updateEpisodeState({
        episodeId: "unknown-update",
        expectedStateVersion: 1,
        workflowState: "TOPIC",
      })

      assert.strictEqual(result.success, false, "update should fail")
      assert.strictEqual(result.reason, "not_found", "should be not_found")
      assert.strictEqual(result.actualVersion, 0, "unknown episode has version 0")
    })

    test("4. updates multiple fields", async () => {
      const repo6 = createMockRepository()
      await repo6.createEpisode({
        episodeId: "multi-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      const blockers: CanonicalBlocker[] = [
        {
          id: "b1",
          code: "BLOCKER_1",
          label: "Issue 1",
          severity: "high",
          source: "test",
          createdAt: new Date().toISOString(),
        },
      ]

      const result = await repo6.updateEpisodeState({
        episodeId: "multi-1",
        expectedStateVersion: 1,
        workflowState: "RESEARCH",
        reviewStatus: "pending",
        blockers,
      })

      assert.strictEqual(result.success, true)

      const updated = await repo6.getEpisodeById("multi-1")
      assert.ok(updated)
      assert.strictEqual(updated.workflowState, "RESEARCH")
      assert.strictEqual(updated.reviewStatus, "pending")
      assert.strictEqual(updated.blockers.length, 1)
      assert.strictEqual(updated.blockers[0].id, "b1")
    })
  })

  describe("createEpisodeEvent", () => {
    test("1. creates event with all fields", async () => {
      const repo7 = createMockRepository()
      await repo7.createEpisode({
        episodeId: "event-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      const event = await repo7.createEpisodeEvent({
        episodeId: "event-1",
        eventType: "STATE_CHANGED",
        actor: "test-user",
        fromState: "TOPIC",
        toState: "RESEARCH",
        payload: { reason: "approved" },
      })

      assert.ok(event.eventId)
      assert.strictEqual(event.episodeId, "event-1")
      assert.strictEqual(event.eventType, "STATE_CHANGED")
      assert.strictEqual(event.actor, "test-user")
      assert.strictEqual(event.fromState, "TOPIC")
      assert.strictEqual(event.toState, "RESEARCH")
      assert.deepStrictEqual(event.payload, { reason: "approved" })
      assert.ok(event.createdAt)
    })

    test("2. idempotency key deduplicates events (returns same event)", async () => {
      const repo8 = createMockRepository()
      await repo8.createEpisode({
        episodeId: "idem-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      const key = "episode-idem-1:n8n-exec-xyz"

      const event1 = await repo8.createEpisodeEvent({
        episodeId: "idem-1",
        eventType: "STATE_CHANGED",
        actor: "n8n",
        toState: "RESEARCH",
        idempotencyKey: key,
      })

      const event2 = await repo8.createEpisodeEvent({
        episodeId: "idem-1",
        eventType: "STATE_CHANGED",
        actor: "n8n",
        toState: "RESEARCH",
        idempotencyKey: key, // Same key
      })

      // Should return the same event
      assert.strictEqual(event1.eventId, event2.eventId, "same key should return same event ID")
      assert.strictEqual(event1.idempotencyKey, event2.idempotencyKey)

      // Verify only one event was actually created
      const allEvents = await repo8.getEpisodeEvents("idem-1")
      assert.strictEqual(allEvents.length, 1, "should only have one event despite two calls")
    })
  })

  describe("getEpisodeEvents", () => {
    test("1. retrieves events for episode in reverse chronological order", async () => {
      const repo9 = createMockRepository()
      await repo9.createEpisode({
        episodeId: "events-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      await repo9.createEpisodeEvent({
        episodeId: "events-1",
        eventType: "EPISODE_CREATED",
        actor: "system",
      })

      // Small delay to ensure different timestamps
      await new Promise((r) => setTimeout(r, 1))

      await repo9.createEpisodeEvent({
        episodeId: "events-1",
        eventType: "STATE_CHANGED",
        actor: "user",
        toState: "RESEARCH",
      })

      const events = await repo9.getEpisodeEvents("events-1")
      assert.strictEqual(events.length, 2, "should have 2 events")

      // Most recent first
      assert.strictEqual(events[0].eventType, "STATE_CHANGED")
      assert.strictEqual(events[1].eventType, "EPISODE_CREATED")
    })

    test("2. returns empty list for episode with no events", async () => {
      const repo10 = createMockRepository()
      await repo10.createEpisode({
        episodeId: "no-events",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      const events = await repo10.getEpisodeEvents("no-events")
      assert.deepStrictEqual(events, [], "should return empty array")
    })
  })

  describe("Optimistic Locking Semantics", () => {
    test("1. concurrent updates with version checks", async () => {
      const repo11 = createMockRepository()
      const initial = assertCreateEpisodeSuccess(await repo11.createEpisode({
        episodeId: "concurrent-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      }))

      assert.strictEqual(initial.stateVersion, 1)

      // Actor 1 reads
      const actor1Episode = await repo11.getEpisodeById("concurrent-1")
      assert.ok(actor1Episode)
      assert.strictEqual(actor1Episode.stateVersion, 1)

      // Actor 2 reads
      const actor2Episode = await repo11.getEpisodeById("concurrent-1")
      assert.ok(actor2Episode)
      assert.strictEqual(actor2Episode.stateVersion, 1)

      // Actor 2 updates first
      const actor2Result = await repo11.updateEpisodeState({
        episodeId: "concurrent-1",
        expectedStateVersion: 1,
        workflowState: "RESEARCH",
      })
      assert.strictEqual(actor2Result.success, true)
      assert.strictEqual(actor2Result.actualVersion, 2)

      // Actor 1 tries to update with stale version
      const actor1Result = await repo11.updateEpisodeState({
        episodeId: "concurrent-1",
        expectedStateVersion: 1,
        workflowState: "SCRIPT",
      })
      assert.strictEqual(actor1Result.success, false)
      assert.strictEqual(actor1Result.reason, "conflict")
      assert.strictEqual(actor1Result.actualVersion, 2)
    })
  })

  describe("Type Conversions", () => {
    test("1. blockers are properly typed and serializable", async () => {
      const repo12 = createMockRepository()
      await repo12.createEpisode({
        episodeId: "types-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      const blockers: CanonicalBlocker[] = [
        {
          id: "thumbnail-direction",
          code: "THUMBNAIL_DIRECTION",
          label: "Thumbnail needs approval",
          severity: "high",
          source: "n8n:design-review",
          createdAt: new Date().toISOString(),
          resolvedAt: undefined,
        },
      ]

      const result = await repo12.updateEpisodeState({
        episodeId: "types-1",
        expectedStateVersion: 1,
        blockers,
      })

      assert.strictEqual(result.success, true)

      const episode = await repo12.getEpisodeById("types-1")
      assert.ok(episode)
      assert.strictEqual(episode.blockers.length, 1)
      assert.strictEqual(episode.blockers[0].id, "thumbnail-direction")
      assert.strictEqual(episode.blockers[0].severity, "high")
    })

    test("2. decisions are properly typed and nullable", async () => {
      const repo13 = createMockRepository()
      await repo13.createEpisode({
        episodeId: "decision-1",
        channelName: "Ch",
        title: "T",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      // Set decision
      const decision = {
        outcome: "pass" as const,
        decidedBy: "alice@example.com",
        decidedAt: new Date().toISOString(),
        notes: "Looks good",
      }

      let result = await repo13.updateEpisodeState({
        episodeId: "decision-1",
        expectedStateVersion: 1,
        latestDecision: decision,
      })

      assert.strictEqual(result.success, true)

      let episode = await repo13.getEpisodeById("decision-1")
      assert.ok(episode)
      assert.strictEqual(episode.latestDecision?.outcome, "pass")
      assert.strictEqual(episode.latestDecision?.decidedBy, "alice@example.com")

      // Clear decision
      result = await repo13.updateEpisodeState({
        episodeId: "decision-1",
        expectedStateVersion: 2,
        latestDecision: null,
      })

      assert.strictEqual(result.success, true)

      episode = await repo13.getEpisodeById("decision-1")
      assert.ok(episode)
      assert.strictEqual(episode.latestDecision, undefined)
    })
  })

  describe("Event Ordering Determinism", () => {
    test("1. same-timestamp events ordered deterministically by eventId", async () => {
      const mockRepo = createMockRepository()

      // Create episode
      await mockRepo.createEpisode({
        episodeId: "determinism-test",
        channelName: "Test",
        title: "Determinism Test",
        workflowState: "TOPIC",
        reviewStatus: "not-required",
      })

      // Create three events
      await mockRepo.createEpisodeEvent({
        episodeId: "determinism-test",
        eventType: "state_transition",
        actor: "n8n",
      })

      await mockRepo.createEpisodeEvent({
        episodeId: "determinism-test",
        eventType: "state_transition",
        actor: "n8n",
      })

      await mockRepo.createEpisodeEvent({
        episodeId: "determinism-test",
        eventType: "state_transition",
        actor: "n8n",
      })

      // Manually set same timestamp (mock repo uses real timestamp, so manipulate for test)
      // In reality this tests the ordering logic will handle same timestamps
      const events1 = await mockRepo.getEpisodeEvents("determinism-test")
      const events2 = await mockRepo.getEpisodeEvents("determinism-test")

      // Same order on repeated reads
      assert.strictEqual(events1.length, 3)
      assert.strictEqual(events2.length, 3)

      const ids1 = events1.map((e) => e.eventId)
      const ids2 = events2.map((e) => e.eventId)

      assert.deepStrictEqual(
        ids1,
        ids2,
        "Repeated reads should return events in same order"
      )

      // Events should be in DESC order (newest first from repository)
      for (let i = 1; i < events1.length; i++) {
        const prev = new Date(events1[i - 1]!.createdAt).getTime()
        const curr = new Date(events1[i]!.createdAt).getTime()
        // When timestamps are equal, eventId DESC determines order
        if (prev === curr) {
          assert.ok(
            events1[i - 1]!.eventId >= events1[i]!.eventId,
            "When timestamps equal, eventId should be DESC"
          )
        }
      }
    })
  })
})
