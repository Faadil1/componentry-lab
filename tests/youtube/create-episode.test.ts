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

  test("duplicate episodeId returns conflict", async () => {
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
