import { test } from "node:test"
import assert from "node:assert"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import { enforceProgressiveLoading } from "../lib/creative-os/progressive-loading"
import { satisfiesAuthority } from "../lib/creative-os/evaluation"
import { routeCapabilities } from "../lib/creative-os/router"

test("unique IDs for 20 resources", () => {
  assert.strictEqual(RESOURCE_REGISTRY.length, 20)
  const ids = RESOURCE_REGISTRY.map((r) => r.id)
  const uniqueIds = new Set(ids)
  assert.strictEqual(uniqueIds.size, 20)
})

test("provenance for all resources", () => {
  RESOURCE_REGISTRY.forEach((res) => {
    assert.ok(res.provenance, `Resource ${res.id} must have provenance defined.`)
    assert.ok(res.provenance.startsWith("internal:") || res.provenance.startsWith("external:"), `Resource ${res.id} has invalid provenance prefix: ${res.provenance}`)
  })
})

test("source URLs for external resources", () => {
  RESOURCE_REGISTRY.forEach((res) => {
    if (res.provenance.startsWith("external:")) {
      assert.ok(res.sourceUrl, `External resource ${res.id} must define sourceUrl.`)
      assert.ok(res.sourceUrl.startsWith("http"), `External resource ${res.id} sourceUrl must be a valid URL.`)
    }
  })
})

test("valid lifecycle states and authority ceilings", () => {
  const validLifecycles = new Set([
    "CAPTURED",
    "AUDITED",
    "TEST_CANDIDATE",
    "TESTING",
    "VALIDATED",
    "APPROVED",
    "DEPRECATED",
    "SUPERSEDED",
    "REJECTED",
  ])

  const validCeilings = new Set([
    "READ_ONLY",
    "SUGGEST",
    "PREPARE",
    "LOCAL_REVERSIBLE",
    "EXPLICIT_EXTERNAL",
    "PROHIBITED",
  ])

  RESOURCE_REGISTRY.forEach((res) => {
    assert.ok(validLifecycles.has(res.lifecycleState), `Invalid lifecycleState for ${res.id}: ${res.lifecycleState}`)
    assert.ok(validCeilings.has(res.authorityCeiling), `Invalid authorityCeiling for ${res.id}: ${res.authorityCeiling}`)
  })
})

test("level 2/3 data are inaccessible at runtime", () => {
  RESOURCE_REGISTRY.forEach((res) => {
    const stripped = enforceProgressiveLoading(res)
    assert.strictEqual((stripped as Record<string, unknown>).level2Data, undefined)
    assert.strictEqual((stripped as Record<string, unknown>).level3Data, undefined)
  })
})

test("rejected/deprecated/superseded resources are never recommended", () => {
  const result = routeCapabilities({
    projectMode: "MARA",
    phase: "verify",
    capabilityGap: "ai-camera-movements"
  })

  // res_remocn (DEPRECATED), res_cineprompt (SUPERSEDED), res_ai_world_builder (REJECTED) must not be in recommendations
  const recommendedIds = result.recommendations.map((r) => r.resourceId)
  assert.ok(!recommendedIds.includes("res_remocn"))
  assert.ok(!recommendedIds.includes("res_cineprompt"))
  assert.ok(!recommendedIds.includes("res_ai_world_builder"))
})

test("unapproved never outranks approved", () => {
  // Somatic Response Design (VALIDATED) vs Sacred Rules Breaker (APPROVED) under DAY_CHALLENGE
  const result = routeCapabilities({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "rules-governance"
  })

  const indexApproved = result.recommendations.findIndex((r) => r.resourceId === "res_sacred_rules_breaker")
  const indexValidated = result.recommendations.findIndex((r) => r.resourceId === "res_somatic_response_design")

  if (indexApproved !== -1 && indexValidated !== -1) {
    assert.ok(indexApproved < indexValidated, "Approved resource must outrank validated resource when queried.")
  }
})

test("internal method preference", () => {
  // If an internal method and external provider both match, internal method gets priority
  // Yummy Design Sprint (APPROVED internal method) vs Awesome Claude Code Skills (APPROVED external skill)
  const result = routeCapabilities({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    authorityCeiling: "LOCAL_REVERSIBLE"
  })

  if (result.topSuggestion) {
    assert.strictEqual(result.topSuggestion.type, "CORE_METHOD")
  }
})

test("authority enforcement", () => {
  // Under SUGGEST limit, PREPARE ceiling resources must be filtered out
  const prepareAllowed = satisfiesAuthority("PREPARE", "SUGGEST")
  assert.strictEqual(prepareAllowed, false, "PREPARE resource must not be allowed under SUGGEST authority limit.")

  const suggestAllowed = satisfiesAuthority("SUGGEST", "SUGGEST")
  assert.strictEqual(suggestAllowed, true, "SUGGEST resource must be allowed under SUGGEST authority limit.")
})

test("deterministic ordering", () => {
  const result = routeCapabilities({
    projectMode: "MARA",
    phase: "verify"
  })

  const ids1 = result.recommendations.map((r) => r.resourceId)

  const result2 = routeCapabilities({
    projectMode: "MARA",
    phase: "verify"
  })
  const ids2 = result2.recommendations.map((r) => r.resourceId)

  assert.deepStrictEqual(ids1, ids2, "Capability routing output must be completely deterministic.")
})

test("mode-specific matching & unsupported artifact exclusion", () => {
  // Query HACKATHON mode
  const result = routeCapabilities({
    projectMode: "HACKATHON",
    phase: "submit",
    artifactType: "composition-tree"
  })

  // Must find res_library_first_composition_router
  assert.ok(result.recommendations.some((r) => r.resourceId === "res_library_first_composition_router"))

  // Should exclude MARA-only or DAY_CHALLENGE-only resources
  result.recommendations.forEach((r) => {
    const original = RESOURCE_REGISTRY.find((orig) => orig.id === r.resourceId)
    assert.ok(original?.modes.includes("HACKATHON"), `Resource ${r.resourceId} was recommended for HACKATHON but does not support it.`)
  })
})

test("exactly one top capability surfaced", () => {
  const result = routeCapabilities({
    projectMode: "DATA_STORY",
    phase: "publish",
    evaluator: "client",
    capabilityGap: "data-privacy"
  })

  assert.ok(result.topSuggestion, "A top capability must be recommended when match exists.")
  assert.strictEqual(result.topSuggestion.resourceId, "res_relationship_preserving_abstraction")
})

test("immutability verification", () => {
  const registrySnapshotBefore = JSON.stringify(RESOURCE_REGISTRY)

  routeCapabilities({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    authorityCeiling: "SUGGEST"
  })

  const registrySnapshotAfter = JSON.stringify(RESOURCE_REGISTRY)
  assert.strictEqual(registrySnapshotBefore, registrySnapshotAfter, "Capability routing process must not mutate the registry database.")
})
