import { test, describe } from "node:test"
import * as assert from "node:assert"
import {
  getEpisodeState,
  listEpisodes,
  episodeExistsInCatalog,
} from "../../lib/youtube/episode-state-provider-core.ts"

describe("Episode State Provider — Core Logic", () => {
  describe("getEpisodeState", () => {
    test("1. known episode returns snapshot", async () => {
      const snapshot = await getEpisodeState("episode-014")
      assert.ok(snapshot, "should return snapshot for known episode")
      assert.strictEqual(
        snapshot.episodeId,
        "episode-014",
        "snapshot should have correct episodeId"
      )
    })

    test("2. unknown episode returns null", async () => {
      const snapshot = await getEpisodeState("unknown-episode-999")
      assert.strictEqual(
        snapshot,
        null,
        "unknown episode should return null (not found)"
      )
    })

    test("3. known unavailable episode remains known", async () => {
      const snapshot = await getEpisodeState("episode-015")
      assert.ok(
        snapshot,
        "known unavailable episode should still return snapshot"
      )
      assert.strictEqual(
        snapshot.episodeId,
        "episode-015",
        "unavailable episode snapshot should have correct ID"
      )
    })

    test("4. known unavailable episode has unavailableReason", async () => {
      const snapshot = await getEpisodeState("episode-015")
      assert.ok(snapshot, "should return snapshot for episode-015")
      assert.ok(
        snapshot.unavailableReason,
        "should have unavailableReason field"
      )
      assert.ok(
        snapshot.unavailableReason.includes("STATE_SOURCE_UNAVAILABLE"),
        "unavailableReason should indicate source issue"
      )
    })

    test("5. returned state is cloned (fixture not mutated)", async () => {
      const snapshot1 = await getEpisodeState("episode-014")
      const snapshot2 = await getEpisodeState("episode-014")

      assert.notStrictEqual(
        snapshot1,
        snapshot2,
        "should return different object references"
      )

      if (snapshot1 && snapshot2 && "blockers" in snapshot1) {
        assert.notStrictEqual(
          snapshot1.blockers,
          snapshot2.blockers,
          "blockers arrays should be different references"
        )
      }
    })

    test("6. all catalog episodes resolve to snapshot", async () => {
      const episodes = await listEpisodes()
      for (const episode of episodes) {
        const snapshot = await getEpisodeState(episode.id)
        assert.ok(
          snapshot,
          `catalog episode ${episode.id} should resolve to snapshot (available or unavailable)`
        )
      }
    })
  })

  describe("listEpisodes", () => {
    test("1. returns array of catalog entries", async () => {
      const episodes = await listEpisodes()
      assert.ok(Array.isArray(episodes), "should return array")
      assert.ok(episodes.length > 0, "should return non-empty array")
    })

    test("2. each entry has required fields", async () => {
      const episodes = await listEpisodes()
      for (const episode of episodes) {
        assert.strictEqual(
          typeof episode.id,
          "string",
          "id should be string"
        )
        assert.strictEqual(
          typeof episode.title,
          "string",
          "title should be string"
        )
        assert.ok(episode.id.length > 0, "id should not be empty")
        assert.ok(episode.title.length > 0, "title should not be empty")
      }
    })

    test("3. catalog includes unavailable episode", async () => {
      const episodes = await listEpisodes()
      const ids = episodes.map((e) => e.id)
      assert.ok(
        ids.includes("episode-015"),
        "catalog should include episode-015 (unavailable test case)"
      )
    })

    test("4. listed entries are cloned", async () => {
      const list1 = await listEpisodes()
      const list2 = await listEpisodes()

      assert.notStrictEqual(
        list1,
        list2,
        "should return different array references"
      )
      assert.notStrictEqual(
        list1[0],
        list2[0],
        "should return different entry references"
      )
    })

    test("5. returned list includes all fixture variants", async () => {
      const episodes = await listEpisodes()
      const ids = episodes.map((e) => e.id)

      // Verify fixture variants are included
      assert.ok(ids.includes("episode-014"), "should include episode-014")
      assert.ok(
        ids.includes("episode-014-blocked"),
        "should include episode-014-blocked"
      )
      assert.ok(ids.includes("episode-013"), "should include episode-013")
      assert.ok(
        ids.includes("episode-013-approved"),
        "should include episode-013-approved"
      )
      assert.ok(
        ids.includes("episode-013-published"),
        "should include episode-013-published"
      )
    })
  })

  describe("episodeExistsInCatalog", () => {
    test("1. known episodes return true", () => {
      assert.strictEqual(
        episodeExistsInCatalog("episode-014"),
        true,
        "episode-014 should exist"
      )
      assert.strictEqual(
        episodeExistsInCatalog("episode-015"),
        true,
        "episode-015 should exist"
      )
    })

    test("2. unknown episodes return false", () => {
      assert.strictEqual(
        episodeExistsInCatalog("unknown-episode-999"),
        false,
        "unknown episode should not exist"
      )
    })
  })

  describe("Semantic Boundaries", () => {
    test("1. unknown episode (not in catalog) returns null", async () => {
      const snapshot = await getEpisodeState("episode-999")
      assert.strictEqual(
        snapshot,
        null,
        "unknown episode not in catalog should return null"
      )
    })

    test("2. known unavailable episode returns snapshot with unavailableReason", async () => {
      const snapshot = await getEpisodeState("episode-015")
      assert.ok(
        snapshot,
        "known but unavailable episode should return snapshot"
      )
      assert.ok(
        snapshot.unavailableReason,
        "unavailableReason should be present"
      )
    })

    test("3. known available episode returns snapshot without unavailableReason", async () => {
      const snapshot = await getEpisodeState("episode-014")
      assert.ok(snapshot, "should return snapshot")
      assert.strictEqual(
        snapshot.unavailableReason,
        undefined,
        "should not have unavailableReason"
      )
    })

    test("4. catalog/state separation: unavailable episode remains in catalog", async () => {
      const episodes = await listEpisodes()
      const hasEpisode015 = episodes.some((e) => e.id === "episode-015")
      assert.ok(
        hasEpisode015,
        "episode-015 should be in catalog despite unavailable state"
      )

      const snapshot = await getEpisodeState("episode-015")
      assert.ok(
        snapshot,
        "episode-015 should still resolve to snapshot"
      )
    })
  })

  describe("Provider Stability", () => {
    test("1. consistent snapshots for same episode", async () => {
      const snapshot1 = await getEpisodeState("episode-014")
      const snapshot2 = await getEpisodeState("episode-014")

      if (snapshot1 && snapshot2) {
        assert.strictEqual(
          snapshot1.episodeId,
          snapshot2.episodeId,
          "episodeId should be consistent"
        )
        assert.deepStrictEqual(
          snapshot1.workflowState,
          snapshot2.workflowState,
          "workflowState should be consistent"
        )
      }
    })

    test("2. catalog consistency", async () => {
      const list1 = await listEpisodes()
      const list2 = await listEpisodes()

      assert.strictEqual(
        list1.length,
        list2.length,
        "catalog size should be consistent"
      )

      const ids1 = list1.map((e) => e.id).sort()
      const ids2 = list2.map((e) => e.id).sort()

      assert.deepStrictEqual(
        ids1,
        ids2,
        "catalog entries should be consistent"
      )
    })
  })
})
