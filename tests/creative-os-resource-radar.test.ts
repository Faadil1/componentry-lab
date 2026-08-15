import test from "node:test"
import assert from "node:assert"

import { RESOURCE_REGISTRY, runResourceRadar } from "../lib/creative-os"

test("RR-01: no signal yields no matches and no discovery", () => {
  const before = RESOURCE_REGISTRY.length
  const result = runResourceRadar({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(result.decision, "NO_SIGNAL")
  assert.deepStrictEqual(result.signal, {})
  assert.deepStrictEqual(result.existingMatches, [])
  assert.deepStrictEqual(result.blockedMatches, [])
  assert.strictEqual(result.topMatch, null)
  assert.strictEqual(result.discoveryRequirement, null)
  assert.strictEqual(result.registrySnapshot.canonicalResourceCount, 20)
  assert.strictEqual(result.registrySnapshot.evaluatedResourceCount, 20)
  assert.strictEqual(RESOURCE_REGISTRY.length, before)
})

test("RR-01: canonical internal core method is returned for rules-governance", () => {
  const result = runResourceRadar({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "rules-governance",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(result.decision, "USE_EXISTING")
  assert.ok(result.topMatch)
  assert.strictEqual(result.topMatch?.resourceId, "res_sacred_rules_breaker")
  assert.strictEqual(result.topMatch?.sourceVerification, "INTERNAL")
  assert.strictEqual(result.topMatch?.planningOnly, false)
})

test("RR-01: production demo gap detects Video Shotcraft but marks it planning-only", () => {
  const result = runResourceRadar({
    projectMode: "HACKATHON",
    phase: "submit",
    capabilityGap: "cinematic-product-demo",
    artifactType: "product-demo-film",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(result.decision, "USE_EXISTING")
  assert.ok(result.topMatch)
  assert.strictEqual(result.topMatch?.resourceId, "res_video_shotcraft")
  assert.strictEqual(result.topMatch?.planningOnly, true)
  assert.strictEqual(result.topMatch?.sourceVerification, "EXTERNAL_UNVERIFIED")
})

test("RR-01: CinePrompt remains externally unverified and explicit-external", () => {
  const result = runResourceRadar({
    projectMode: "MARA",
    phase: "verify",
    capabilityGap: "ai-camera-movements",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(result.decision, "USE_EXISTING")
  const cineprompt = result.existingMatches.find((match) => match.resourceId === "res_cineprompt")
  assert.ok(cineprompt)
  assert.strictEqual(cineprompt?.sourceVerification, "EXTERNAL_UNVERIFIED")
  assert.strictEqual(cineprompt?.planningOnly, false)
})

test("RR-01: sourceUrl presence does not imply verified provenance", () => {
  const result = runResourceRadar({
    projectMode: "HACKATHON",
    phase: "submit",
    capabilityGap: "web-component-animation",
    currentAuthority: "SUGGEST"
  })

  const match = result.existingMatches.find((candidate) => candidate.resourceId === "res_originkit")
  assert.ok(match)
  assert.strictEqual(match?.sourceVerification, "EXTERNAL_UNVERIFIED")
})

test("RR-01: authority insufficient remains blocked rather than discovery", () => {
  const result = runResourceRadar({
    projectMode: "MARA",
    phase: "verify",
    capabilityGap: "ai-camera-movements",
    currentAuthority: "READ_ONLY"
  })

  assert.strictEqual(result.decision, "EXISTING_MATCH_AUTHORITY_BLOCKED")
  assert.ok(result.blockedMatches.length > 0)
  assert.strictEqual(result.discoveryRequirement, null)
})

test("RR-01: compatibility unknown remains compatibility blocked", () => {
  const result = runResourceRadar({
    projectMode: "HACKATHON",
    phase: "submit",
    capabilityGap: "web-component-animation",
    currentAuthority: "SUGGEST",
    frameworkOrSurface: "Svelte"
  })

  assert.strictEqual(result.decision, "EXISTING_MATCH_COMPATIBILITY_BLOCKED")
  assert.ok(result.blockedMatches.some((match) => match.resourceId === "res_originkit" || match.resourceId === "res_remocn"))
  assert.strictEqual(result.discoveryRequirement, null)
})

test("RR-01: unknown capability produces discovery requirement without registry mutation", () => {
  const before = RESOURCE_REGISTRY.length
  const result = runResourceRadar({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "volumetric-holographic-smell-design",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(result.decision, "DISCOVERY_REQUIRED")
  assert.ok(result.discoveryRequirement)
  assert.strictEqual(result.discoveryRequirement?.candidateStatus, "UNREGISTERED_DISCOVERY_REQUIREMENT")
  assert.strictEqual(RESOURCE_REGISTRY.length, before)
})

test("RR-01: identical inputs are deterministic and distinct signals fingerprint differently", () => {
  const input = {
    projectMode: "HACKATHON" as const,
    phase: "submit" as const,
    capabilityGap: "cinematic-product-demo",
    artifactType: "product-demo-film",
    currentAuthority: "SUGGEST" as const
  }

  const resultA = runResourceRadar(input)
  const resultB = runResourceRadar(input)
  const resultC = runResourceRadar({
    ...input,
    capabilityGap: "web-component-animation"
  })

  assert.deepStrictEqual(resultA, resultB)
  assert.notStrictEqual(resultA.inputFingerprint, resultC.inputFingerprint)
})

test("RR-01: registry V2 is not consulted by radar", () => {
  const result = runResourceRadar({
    projectMode: "DATA_STORY",
    phase: "publish",
    action: "route-library-composition",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(result.registrySnapshot.canonicalResourceCount, 20)
  assert.ok(result.decision === "USE_EXISTING" || result.decision === "DISCOVERY_REQUIRED" || result.decision === "EXISTING_MATCH_AUTHORITY_BLOCKED" || result.decision === "EXISTING_MATCH_COMPATIBILITY_BLOCKED")
})
