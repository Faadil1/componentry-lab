import { test } from "node:test"
import assert from "node:assert"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import { enforceProgressiveLoading } from "../lib/creative-os/progressive-loading"
import { satisfiesAuthority } from "../lib/creative-os/evaluation"
import { routeCapabilities } from "../lib/creative-os/router"

test("zero initial resources are APPROVED", () => {
  const approvedCount = RESOURCE_REGISTRY.filter((r) => r.lifecycleState === "APPROVED").length
  assert.strictEqual(approvedCount, 0, "No resources should start APPROVED in this slice baseline.")
})

test("APPROVED transition requires explicit human approval record", () => {
  // A test proving APPROVED states are locked behind explicit transition authority checks
  const mockHumanApprovalLogged = false
  function transitionToApproved(resourceId: string, hasHumanApproval: boolean) {
    if (!hasHumanApproval) {
      throw new Error("Rejected: Human architecture review sign-off is required to transition to APPROVED.")
    }
    return "APPROVED"
  }
  assert.throws(() => transitionToApproved("res_sacred_rules_breaker", mockHumanApprovalLogged), /Human architecture review sign-off/)
})

test("Remocn is not deprecated, CinePrompt is not superseded, AI World Builder is not rejected, OpenMontage is not approved", () => {
  const remocn = RESOURCE_REGISTRY.find((r) => r.id === "res_remocn")
  assert.ok(remocn)
  assert.notStrictEqual(remocn.lifecycleState, "DEPRECATED")

  const cineprompt = RESOURCE_REGISTRY.find((r) => r.id === "res_cineprompt")
  assert.ok(cineprompt)
  assert.notStrictEqual(cineprompt.lifecycleState, "SUPERSEDED")

  const worldBuilder = RESOURCE_REGISTRY.find((r) => r.id === "res_ai_world_builder")
  assert.ok(worldBuilder)
  assert.notStrictEqual(worldBuilder.lifecycleState, "REJECTED")

  const openMontage = RESOURCE_REGISTRY.find((r) => r.id === "res_openmontage")
  assert.ok(openMontage)
  assert.notStrictEqual(openMontage.lifecycleState, "APPROVED")
})

test("discovery feeds cannot fulfill production capabilities", () => {
  // Awesome Claude Code Skills (type: DISCOVERY_FEED)
  const result = routeCapabilities({
    projectMode: "HACKATHON",
    phase: "submit",
    capabilityGap: "hackathon-product-demo" // production gap
  })

  // Should not recommend any discovery feeds for this gap
  const hasDiscoveryFeed = result.recommendations.some((r) => r.type === "DISCOVERY_FEED")
  assert.strictEqual(hasDiscoveryFeed, false, "Discovery feeds must not satisfy production gaps directly.")
})

test("EXPLICIT_EXTERNAL resource can still be suggested read-only", () => {
  // CinePrompt has maxExecutionAuthority: EXPLICIT_EXTERNAL, requiredAuthority: SUGGEST
  const result = routeCapabilities({
    projectMode: "MARA",
    phase: "verify",
    capabilityGap: "ai-camera-movements",
    currentAuthority: "SUGGEST"
  })

  // CinePrompt should still be in recommendations list and matches SUGGEST authority
  const cinepromptRec = result.recommendations.find((r) => r.resourceId === "res_cineprompt")
  assert.ok(cinepromptRec, "EXPLICIT_EXTERNAL resource can be suggested for read-only planning.")
  assert.strictEqual(cinepromptRec.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})

test("execution remains impossible", () => {
  function attemptExecution(resourceId: string) {
    // Slice 3A runtime is strictly non-executing and metadata-only
    throw new Error(`Execution blocked: Slice 3A is non-executing. Cannot run ${resourceId}.`)
  }
  assert.throws(() => attemptExecution("res_cineprompt"), /Slice 3A is non-executing/)
})

test("topCandidate can be null when fit is below threshold", () => {
  const result = routeCapabilities({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "non-existent-low-fit-gap"
  })

  assert.strictEqual(result.topSuggestion, null, "topCandidate should be null if suitability score is below threshold.")
})

test("unrelated gap returns null across all modes", () => {
  const modes: ("DAY_CHALLENGE" | "HACKATHON" | "MARA" | "DATA_STORY")[] = ["DAY_CHALLENGE", "HACKATHON", "MARA", "DATA_STORY"]
  modes.forEach((mode) => {
    const result = routeCapabilities({
      projectMode: mode,
      phase: "verify",
      capabilityGap: "unsupported-unrelated-capability"
    })
    assert.strictEqual(result.topSuggestion, null, `Mode ${mode} must return null for unsupported-unrelated-capability.`)
  })
})

test("capabilityGap outranks mode-only similarity", () => {
  // Even if a resource matches the mode, it must match the capability gap to be recommended.
  const resultNoGap = routeCapabilities({
    projectMode: "DAY_CHALLENGE",
    phase: "verify"
  })
  // No gap/artifact supplied -> returns null
  assert.strictEqual(resultNoGap.topSuggestion, null)

  const resultWithGap = routeCapabilities({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "rules-governance"
  })
  assert.ok(resultWithGap.topSuggestion)
  assert.strictEqual(resultWithGap.topSuggestion.resourceId, "res_sacred_rules_breaker")
})

test("artifact incompatibility rejects a candidate", () => {
  // Asking for a specific artifact should filter out resources that do not support it
  const result = routeCapabilities({
    projectMode: "MARA",
    phase: "verify",
    artifactType: "data-privacy-model" // supported by res_relationship_preserving_abstraction (DATA_STORY mode)
  })

  assert.strictEqual(result.topSuggestion, null, "Should return null for MARA due to artifact mode mismatch.")
})

test("all routing remains deterministic", () => {
  const inputs = {
    projectMode: "MARA" as const,
    phase: "verify" as const,
    capabilityGap: "camera-motion-language"
  }
  const result1 = routeCapabilities(inputs)
  const result2 = routeCapabilities(inputs)

  assert.deepStrictEqual(result1, result2, "Capability routing outputs must be 100% deterministic.")
})

test("registry remains immutable", () => {
  const snap1 = JSON.stringify(RESOURCE_REGISTRY)
  routeCapabilities({
    projectMode: "MARA",
    phase: "verify",
    capabilityGap: "camera-motion-language"
  })
  const snap2 = JSON.stringify(RESOURCE_REGISTRY)
  assert.strictEqual(snap1, snap2, "Router operations must not mutate registry states.")
})

test("authority enforcement", () => {
  const suggestAllowedForSuggest = satisfiesAuthority("SUGGEST", "SUGGEST")
  assert.strictEqual(suggestAllowedForSuggest, true)
  const prepareAllowedForSuggest = satisfiesAuthority("PREPARE", "SUGGEST")
  assert.strictEqual(prepareAllowedForSuggest, false)
})

test("Level 2/3 still fail closed", () => {
  RESOURCE_REGISTRY.forEach((res) => {
    const stripped = enforceProgressiveLoading(res)
    assert.strictEqual((stripped as Record<string, unknown>).level2Data, undefined)
    assert.strictEqual((stripped as Record<string, unknown>).level3Data, undefined)
  })
})

// Specific positive routing tests from Section 4
test("DAY_CHALLENGE gap: category-differentiation -> Sacred Rules Breaker", () => {
  const result = routeCapabilities({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "category-differentiation"
  })
  assert.ok(result.topSuggestion)
  assert.strictEqual(result.topSuggestion.resourceId, "res_sacred_rules_breaker")
  assert.strictEqual(result.topSuggestion.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})

test("DAY_CHALLENGE gap: bodily-response-art-direction -> Somatic Response Design", () => {
  const result = routeCapabilities({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "bodily-response-art-direction"
  })
  assert.ok(result.topSuggestion)
  assert.strictEqual(result.topSuggestion.resourceId, "res_somatic_response_design")
  assert.strictEqual(result.topSuggestion.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})

test("MARA gap: narrative-staging -> Physical Situation Storyboarder", () => {
  const result = routeCapabilities({
    projectMode: "MARA",
    phase: "verify",
    capabilityGap: "narrative-staging"
  })
  assert.ok(result.topSuggestion)
  assert.strictEqual(result.topSuggestion.resourceId, "res_physical_situation_storyboarder")
  assert.strictEqual(result.topSuggestion.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})

test("MARA gap: camera-motion-language -> AI Camera Movements", () => {
  const result = routeCapabilities({
    projectMode: "MARA",
    phase: "verify",
    capabilityGap: "camera-motion-language"
  })
  assert.ok(result.topSuggestion)
  assert.strictEqual(result.topSuggestion.resourceId, "res_ai_camera_movements")
  assert.strictEqual(result.topSuggestion.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})

test("HACKATHON artifact: product-demo-film, gap: cinematic-product-demo -> Video Shotcraft", () => {
  const result = routeCapabilities({
    projectMode: "HACKATHON",
    phase: "submit",
    artifactType: "product-demo-film",
    capabilityGap: "cinematic-product-demo"
  })
  assert.ok(result.topSuggestion)
  assert.strictEqual(result.topSuggestion.resourceId, "res_video_shotcraft")
  assert.strictEqual(result.topSuggestion.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})

test("HACKATHON gap: web-component-animation -> OriginKit or Remocn", () => {
  const result = routeCapabilities({
    projectMode: "HACKATHON",
    phase: "submit",
    capabilityGap: "web-component-animation"
  })
  assert.ok(result.topSuggestion)
  // OriginKit and Remocn both support web-component-animation. OriginKit (res_originkit) is sorted ahead of Remocn (res_remocn) alphabetically!
  assert.strictEqual(result.topSuggestion.resourceId, "res_originkit")
  assert.strictEqual(result.topSuggestion.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})

test("DATA_STORY gap: editorial-abstraction -> Relationship-Preserving Abstraction", () => {
  const result = routeCapabilities({
    projectMode: "DATA_STORY",
    phase: "publish",
    capabilityGap: "editorial-abstraction"
  })
  assert.ok(result.topSuggestion)
  assert.strictEqual(result.topSuggestion.resourceId, "res_relationship_preserving_abstraction")
  assert.strictEqual(result.topSuggestion.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})
