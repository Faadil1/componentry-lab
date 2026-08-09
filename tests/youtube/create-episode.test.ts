import { test, describe } from "node:test"
import * as assert from "node:assert"
import { createMockRepository } from "../../lib/persistence/episode-repository-core.ts"
import { createEpisode } from "../../lib/youtube/commands/create-episode.ts"

describe("createEpisode command", () => {
  test("valid input returns success with CanonicalEpisode", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-001",
      episodeNumber: 1,
      channelName: "Test Channel",
      title: "Test Episode",
      actor: "human:web",
    })

    assert.strictEqual(result.success, true)
    assert.ok(result.value)
    assert.strictEqual(result.value!.episodeId, "test-001")
    assert.strictEqual(result.value!.episodeNumber, 1)
    assert.strictEqual(result.value!.channelName, "Test Channel")
    assert.strictEqual(result.value!.title, "Test Episode")
  })

  test("returned episode has correct initial state", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-002",
      episodeNumber: 2,
      channelName: "Channel",
      title: "Title",
      actor: "human:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.value!.workflowState, "TOPIC")
    assert.strictEqual(result.value!.stateVersion, 1)
    assert.strictEqual(result.value!.schemaVersion, 1)
    assert.strictEqual(result.value!.reviewStatus, "not-required")
    assert.deepStrictEqual(result.value!.blockers, [])
    assert.strictEqual(result.value!.youtubeVideoId, undefined)
    assert.strictEqual(result.value!.publishedAt, undefined)
  })

  test("stateVersion in CommandResult is 1", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-003",
      episodeNumber: 3,
      channelName: "Channel",
      title: "Title",
      actor: "human:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.stateVersion, 1)
  })

  test("episode_created event is created by command", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-event-001",
      episodeNumber: 100,
      channelName: "Test Channel",
      title: "Event Test",
      actor: "human:web",
    })

    assert.strictEqual(result.success, true)

    // Verify event was created by the command
    const events = await repository.getEpisodeEvents("test-event-001")
    assert.strictEqual(events.length, 1)
    assert.strictEqual(events[0]!.eventType, "episode_created")
    assert.strictEqual(events[0]!.actor, "human:web")
    assert.ok(events[0]!.payload)
    assert.strictEqual(events[0]!.payload.episodeId, "test-event-001")
    assert.strictEqual(events[0]!.payload.episodeNumber, 100)
    assert.strictEqual(events[0]!.payload.channelName, "Test Channel")
    assert.strictEqual(events[0]!.payload.title, "Event Test")
  })

  test("empty episodeId returns invalid_input", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "",
      episodeNumber: 4,
      channelName: "Channel",
      title: "Title",
      actor: "human:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("negative episodeNumber returns invalid_input", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-005",
      episodeNumber: -1,
      channelName: "Channel",
      title: "Title",
      actor: "human:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("zero episodeNumber returns invalid_input", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-006",
      episodeNumber: 0,
      channelName: "Channel",
      title: "Title",
      actor: "human:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("empty channelName returns invalid_input", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-007",
      episodeNumber: 7,
      channelName: "",
      title: "Title",
      actor: "human:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("empty title returns invalid_input", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-008",
      episodeNumber: 8,
      channelName: "Channel",
      title: "",
      actor: "human:web",
    })

    assert.strictEqual(result.success, false)
    assert.strictEqual(result.reason, "invalid_input")
  })

  test("duplicate episodeId returns conflict, only one event created", async () => {
    const repository = createMockRepository()

    // Create first episode
    const firstResult = await createEpisode(repository, {
      episodeId: "duplicate-test",
      episodeNumber: 9,
      channelName: "Channel",
      title: "Title",
      actor: "human:web",
    })
    assert.strictEqual(firstResult.success, true)

    // Verify first create produced one event
    let events = await repository.getEpisodeEvents("duplicate-test")
    assert.strictEqual(events.length, 1)

    // Attempt to create duplicate
    const secondResult = await createEpisode(repository, {
      episodeId: "duplicate-test",
      episodeNumber: 10,
      channelName: "Channel",
      title: "Title",
      actor: "human:web",
    })

    assert.strictEqual(secondResult.success, false)
    if (!secondResult.success) {
      assert.strictEqual(secondResult.reason, "conflict")
    }

    // Verify still only one event (no duplicate event created)
    events = await repository.getEpisodeEvents("duplicate-test")
    assert.strictEqual(events.length, 1)
  })

  test("reviewStatus always not-required", async () => {
    const repository = createMockRepository()

    const result = await createEpisode(repository, {
      episodeId: "test-011",
      episodeNumber: 11,
      channelName: "Channel",
      title: "Title",
      actor: "human:web",
    })

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.value!.reviewStatus, "not-required")
  })
})
