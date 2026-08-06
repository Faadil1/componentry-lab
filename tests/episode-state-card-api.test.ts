// eslint-disable-next-line @typescript-eslint/no-require-imports
const { test, describe } = require("node:test")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const assert = require("node:assert/strict")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path")

const componentPath = path.join(__dirname, "../components/workflow/episode-state-card.tsx")
const fixturesPath = path.join(__dirname, "../lib/fixtures/episode-state-card-fixtures.ts")
const pagePath = path.join(__dirname, "../app/episode-state-card/page.tsx")
const apiSurfacePath = path.join(__dirname, "../artifacts/episode-state-card/api-stabilization/api-surface.json")

const component = fs.readFileSync(componentPath, "utf-8")
const fixtures = fs.readFileSync(fixturesPath, "utf-8")
const page = fs.readFileSync(pagePath, "utf-8")

describe("Episode State Card — API Stabilization", () => {
  test("1. public union has six variant-specific members", () => {
    for (const name of [
      "DefaultEpisodeStateCardProps",
      "BlockedEpisodeStateCardProps",
      "HumanReviewRequiredEpisodeStateCardProps",
      "ApprovedEpisodeStateCardProps",
      "PublishedEpisodeStateCardProps",
      "UnavailableEpisodeStateCardProps",
    ]) assert.ok(component.includes(name))
  })

  test("2. default variant is explicit", () => assert.ok(component.includes('variant: "default"')))
  test("3. blocked variant requires a non-empty blocker tuple", () => {
    assert.ok(component.includes('variant: "blocked"'))
    assert.ok(component.includes("readonly [EpisodeStateBlocker, ...EpisodeStateBlocker[]]"))
  })
  test("4. human-review-required forces required status", () => {
    assert.ok(component.includes('variant: "human-review-required"'))
    assert.ok(component.includes('humanReviewStatus: "required"'))
  })
  test("5. approved forces completed status", () => {
    const section = component.split("export type ApprovedEpisodeStateCardProps")[1].split("export type PublishedEpisodeStateCardProps")[0]
    assert.ok(section.includes('humanReviewStatus: "completed"'))
  })
  test("6. published forces completed status", () => {
    const section = component.split("export type PublishedEpisodeStateCardProps")[1].split("export type UnavailableEpisodeStateCardProps")[0]
    assert.ok(section.includes('humanReviewStatus: "completed"'))
  })
  test("7. published requires youtubeVideoId", () => {
    const section = component.split("export type PublishedEpisodeStateCardProps")[1].split("export type UnavailableEpisodeStateCardProps")[0]
    assert.ok(section.includes("youtubeVideoId: string"))
  })
  test("8. published requires publishedAt", () => {
    const section = component.split("export type PublishedEpisodeStateCardProps")[1].split("export type UnavailableEpisodeStateCardProps")[0]
    assert.ok(section.includes("publishedAt: string"))
  })
  test("9. unavailable forbids canonical props", () => {
    const section = component.split("export type UnavailableEpisodeStateCardProps")[1].split("export type EpisodeStateCardProps")[0]
    for (const prop of ["channelName?: never", "title?: never", "workflowState?: never", "humanReviewStatus?: never"]) {
      assert.ok(section.includes(prop))
    }
  })
  test("10. unavailable forbids action and publication props", () => {
    const section = component.split("export type UnavailableEpisodeStateCardProps")[1].split("export type EpisodeStateCardProps")[0]
    for (const prop of ["nextAuthorizedAction?: never", "youtubeVideoId?: never", "publishedAt?: never"]) {
      assert.ok(section.includes(prop))
    }
  })
  test("11. reduceMotion is absent from public component contract", () => {
    assert.strictEqual(component.includes("reduceMotion"), false)
    assert.strictEqual(page.includes("reduceMotion"), false)
  })
  test("12. motion uses system reduced-motion preference", () => {
    assert.ok(component.includes("useReducedMotion"))
  })
  test("13. HumanReviewStatus has exactly three values", () => {
    assert.ok(component.includes('export type HumanReviewStatus = "not-required" | "required" | "completed"'))
    assert.strictEqual(component.includes('| "unavailable"\n\nexport interface EpisodeStateDecision'), false)
  })
  test("14. removed episodeId is absent from public contract", () => {
    assert.strictEqual(component.includes("episodeId"), false)
    assert.strictEqual(fixtures.includes("episodeId:"), false)
  })
  test("15. removed updatedAt is absent from public contract", () => {
    assert.strictEqual(component.includes("updatedAt"), false)
    assert.strictEqual(fixtures.includes("updatedAt:"), false)
  })
  test("16. human-review fixture contains no lastDecision", () => {
    const section = fixtures.split("export const episode13HumanReview")[1].split("export const episode13Approved")[0]
    assert.strictEqual(section.includes("lastDecision"), false)
  })
  test("17. published fixture supplies required publication fields", () => {
    const section = fixtures.split("export const episode13Published")[1].split("export const episodeUnavailable")[0]
    assert.ok(section.includes("youtubeVideoId:"))
    assert.ok(section.includes("publishedAt:"))
  })
  test("18. unavailable fixture stays isolated", () => {
    const section = fixtures.split("export const episodeUnavailable")[1]
    assert.strictEqual(section.includes("channelName:"), false)
    assert.strictEqual(section.includes("humanReviewStatus:"), false)
  })
  test("19. API surface describes the six-member union", () => {
    const surface = JSON.parse(fs.readFileSync(apiSurfacePath, "utf-8"))
    assert.strictEqual(surface.discriminated_union.members.length, 6)
    assert.strictEqual(surface.public_props.includes("reduceMotion"), false)
  })
  test("20. API surface reports stabilized contract", () => {
    const surface = JSON.parse(fs.readFileSync(apiSurfacePath, "utf-8"))
    assert.strictEqual(surface.status, "API_STABILIZED")
    assert.strictEqual(surface.api_tests.expected, 20)
  })
})
