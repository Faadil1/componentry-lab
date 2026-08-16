import test from "node:test"
import assert from "node:assert"

import { RESOURCE_REGISTRY, runResourceRadar, runResourceDiscovery } from "../lib/creative-os"

const requirement = {
  capabilityGap: "resource-provenance-core",
  artifactType: "discovery-report",
  action: "analyze-resource-provenance",
  projectMode: "HACKATHON" as const,
  phase: "submit" as const,
  requiredAuthorityCeiling: "SUGGEST" as const,
  frameworkOrSurface: "React/NextJS",
  candidateStatus: "UNREGISTERED_DISCOVERY_REQUIREMENT" as const
}

const canonicalCandidate = {
  name: " Provenance Core Library ",
  sourceKind: "GITHUB_REPOSITORY" as const,
  sourceLocator: " https://github.com/example/provenance-core ",
  sourceIdentity: " provenance-core " ,
  provenanceClaim: " hand-curated discovery candidate ",
  licenseClaim: " MIT ",
  claimedActions: [" analyze-resource-provenance ", "unrelated-action"],
  claimedArtifactTypes: [" discovery-report ", "other-artifact"],
  claimedCapabilityGaps: [" resource-provenance-core ", "other-gap"],
  claimedFrameworks: [" React/NextJS ", "Svelte"]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

test("DISCOVERY_REQUIREMENT_INGEST_GATE", () => {
  const before = clone(requirement)
  const result = runResourceDiscovery(requirement, [])

  assert.deepStrictEqual(requirement, before)
  assert.strictEqual(result.candidateCount, 0)
  assert.strictEqual(result.nextAction, "NO_CANDIDATES")
  assert.strictEqual(result.requirement.candidateStatus, "UNREGISTERED_DISCOVERY_REQUIREMENT")
})

test("DETERMINISTIC_CANDIDATE_ID_GATE", () => {
  const result1 = runResourceDiscovery(requirement, [canonicalCandidate])
  const result2 = runResourceDiscovery(requirement, [clone(canonicalCandidate)])

  assert.strictEqual(result1.relevantCandidates[0].candidateId, result2.relevantCandidates[0].candidateId)
  assert.ok(result1.relevantCandidates[0].candidateId.startsWith("candidate_"))
  assert.ok(!result1.relevantCandidates[0].candidateId.startsWith("res_"))
})

test("CANDIDATE_NOT_RESOURCE_GATE", () => {
  const result = runResourceDiscovery(requirement, [canonicalCandidate])
  const candidate = result.relevantCandidates[0]

  assert.ok(candidate)
  assert.strictEqual(candidate.candidateStatus, "UNREGISTERED_CANDIDATE")
  assert.strictEqual(candidate.registrationStatus, "NOT_REGISTERED")
  assert.strictEqual(candidate.executionStatus, "NOT_EXECUTABLE")
  assert.strictEqual(candidate.requiresHumanReview, true)
  assert.strictEqual("resourceId" in candidate, false)
})

test("SOURCE_URL_NOT_VERIFICATION_GATE", () => {
  const result = runResourceDiscovery(requirement, [
    {
      ...canonicalCandidate,
      evidence: undefined
    }
  ])

  assert.strictEqual(result.relevantCandidates[0].verificationStatus, "UNVERIFIED")
  assert.strictEqual(result.relevantCandidates[0].verificationConfidence, 0)
})

test("SOURCE_OBSERVED_EVIDENCE_GATE", () => {
  const result = runResourceDiscovery(requirement, [
    {
      ...canonicalCandidate,
      evidence: [
        {
          evidenceKind: "SOURCE_OBSERVATION",
          locator: "https://github.com/example/provenance-core"
        }
      ]
    }
  ])

  assert.strictEqual(result.relevantCandidates[0].verificationStatus, "SOURCE_OBSERVED")
  assert.strictEqual(result.relevantCandidates[0].verificationConfidence, 1)
})

test("IDENTITY_CORROBORATION_GATE", () => {
  const result = runResourceDiscovery(requirement, [
    {
      ...canonicalCandidate,
      evidence: [
        {
          evidenceKind: "SOURCE_OBSERVATION",
          locator: "https://github.com/example/provenance-core"
        },
        {
          evidenceKind: "IDENTITY_CORROBORATION",
          locator: "https://github.com/example/provenance-core",
          observedIdentity: "provenance-core"
        }
      ]
    }
  ])

  assert.strictEqual(result.relevantCandidates[0].verificationStatus, "IDENTITY_CORROBORATED")
  assert.strictEqual(result.relevantCandidates[0].verificationConfidence, 2)
})

test("VERIFICATION_DOES_NOT_AUTHORIZE_EXECUTION_GATE", () => {
  const result = runResourceDiscovery(requirement, [
    {
      ...canonicalCandidate,
      evidence: [
        {
          evidenceKind: "SOURCE_OBSERVATION",
          locator: "https://github.com/example/provenance-core"
        },
        {
          evidenceKind: "IDENTITY_CORROBORATION",
          locator: "https://github.com/example/provenance-core",
          observedIdentity: "provenance-core"
        }
      ]
    }
  ])

  const candidate = result.relevantCandidates[0]
  assert.strictEqual(candidate.candidateStatus, "UNREGISTERED_CANDIDATE")
  assert.strictEqual(candidate.registrationStatus, "NOT_REGISTERED")
  assert.strictEqual(candidate.executionStatus, "NOT_EXECUTABLE")
  assert.strictEqual(candidate.requiresHumanReview, true)
  assert.strictEqual(candidate.canonicalResourceMatchId, null)
})

test("STALE_ORIGINKIT_PLACEHOLDER_NO_COLLISION_GATE", () => {
  const before = RESOURCE_REGISTRY.length
  const result = runResourceDiscovery(requirement, [
    {
      ...canonicalCandidate,
      sourceLocator: "https://github.com/example/originkit"
    }
  ])

  assert.strictEqual(result.canonicalCollisionCount, 0)
  assert.strictEqual(result.relevantCandidates[0].canonicalCollision.matched, false)
  assert.strictEqual(result.relevantCandidates[0].canonicalResourceMatchId, null)
  assert.strictEqual(RESOURCE_REGISTRY.length, before)
})

test("UNKNOWN_EXTERNAL_CANDIDATE_GATE", () => {
  const result = runResourceDiscovery(requirement, [
    {
      name: "Unknown Repository",
      sourceKind: "UNKNOWN",
      sourceLocator: "https://example.invalid/provenance-core",
      claimedCapabilityGaps: ["resource-provenance-core"]
    }
  ])

  assert.strictEqual(result.relevantCandidates.length, 1)
  assert.strictEqual(result.relevantCandidates[0].verificationStatus, "UNVERIFIED")
  assert.strictEqual(result.relevantCandidates[0].registrationStatus, "NOT_REGISTERED")
})

test("NON_MATCHING_CANDIDATE_GATE", () => {
  const result = runResourceDiscovery(requirement, [
    canonicalCandidate,
    {
      name: "Irrelevant Source",
      sourceKind: "DOCUMENTATION",
      sourceLocator: "https://example.invalid/irrelevant",
      claimedCapabilityGaps: ["other-gap"]
    }
  ])

  assert.strictEqual(result.relevantCandidates.length, 1)
  assert.strictEqual(result.nonMatchingCandidates.length, 1)
  assert.strictEqual(result.nonMatchingCandidates[0].name, "Irrelevant Source")
})

test("DETERMINISTIC_ORDER_GATE", () => {
  const a = runResourceDiscovery(requirement, [
    {
      ...canonicalCandidate,
      name: "Alpha",
      claimedFrameworks: ["React/NextJS"]
    },
    {
      ...canonicalCandidate,
      name: "Beta",
      claimedCapabilityGaps: ["resource-provenance-core"],
      claimedArtifactTypes: undefined,
      claimedActions: undefined,
      claimedFrameworks: undefined
    },
    {
      name: "Gamma",
      sourceKind: "WEBSITE",
      sourceLocator: "https://example.invalid/gamma",
      claimedCapabilityGaps: ["resource-provenance-core"],
      evidence: [{ evidenceKind: "SOURCE_OBSERVATION", locator: "https://example.invalid/gamma" }]
    }
  ])

  const b = runResourceDiscovery(requirement, [
    {
      name: "Gamma",
      sourceKind: "WEBSITE",
      sourceLocator: "https://example.invalid/gamma",
      claimedCapabilityGaps: ["resource-provenance-core"],
      evidence: [{ evidenceKind: "SOURCE_OBSERVATION", locator: "https://example.invalid/gamma" }]
    },
    {
      ...canonicalCandidate,
      name: "Beta",
      claimedCapabilityGaps: ["resource-provenance-core"],
      claimedArtifactTypes: undefined,
      claimedActions: undefined,
      claimedFrameworks: undefined
    },
    {
      ...canonicalCandidate,
      name: "Alpha",
      claimedFrameworks: ["React/NextJS"]
    }
  ])

  assert.deepStrictEqual(a, b)
})


test("SEMANTIC_CLAIM_ORDER_NORMALIZATION_GATE", () => {
  const shuffled = runResourceDiscovery(requirement, [{
    ...canonicalCandidate,
    claimedActions: ["unrelated-action", " analyze-resource-provenance "],
    claimedArtifactTypes: ["other-artifact", " discovery-report "],
    claimedCapabilityGaps: ["other-gap", " resource-provenance-core "],
    claimedFrameworks: ["Svelte", " React/NextJS "]
  }])
  const canonical = runResourceDiscovery(requirement, [canonicalCandidate])

  assert.strictEqual(shuffled.relevantCandidates[0].candidateId, canonical.relevantCandidates[0].candidateId)
})

test("EVIDENCE_ORDER_NORMALIZATION_GATE", () => {
  const ordered = runResourceDiscovery(requirement, [{
    ...canonicalCandidate,
    evidence: [
      { evidenceKind: "SOURCE_OBSERVATION", locator: "https://github.com/example/provenance-core" },
      { evidenceKind: "IDENTITY_CORROBORATION", locator: "https://github.com/example/provenance-core", observedIdentity: "provenance-core" }
    ]
  }])
  const reversed = runResourceDiscovery(requirement, [{
    ...canonicalCandidate,
    evidence: [
      { evidenceKind: "IDENTITY_CORROBORATION", locator: "https://github.com/example/provenance-core", observedIdentity: "provenance-core" },
      { evidenceKind: "SOURCE_OBSERVATION", locator: "https://github.com/example/provenance-core" }
    ]
  }])

  assert.deepStrictEqual(ordered, reversed)
})

test("STRICT_SOURCE_IDENTITY_CORROBORATION_GATE", () => {
  const nameOnly = runResourceDiscovery(requirement, [{
    ...canonicalCandidate,
    sourceIdentity: "provenance-core",
    evidence: [
      { evidenceKind: "SOURCE_OBSERVATION", locator: "https://github.com/example/provenance-core" },
      { evidenceKind: "IDENTITY_CORROBORATION", locator: "https://github.com/example/provenance-core", observedIdentity: "Provenance Core Library" }
    ]
  }])

  const sourceIdentity = runResourceDiscovery(requirement, [{
    ...canonicalCandidate,
    sourceIdentity: "provenance-core",
    evidence: [
      { evidenceKind: "SOURCE_OBSERVATION", locator: "https://github.com/example/provenance-core" },
      { evidenceKind: "IDENTITY_CORROBORATION", locator: "https://github.com/example/provenance-core", observedIdentity: "provenance-core" }
    ]
  }])

  assert.strictEqual(nameOnly.relevantCandidates[0].verificationStatus, "SOURCE_OBSERVED")
  assert.strictEqual(sourceIdentity.relevantCandidates[0].verificationStatus, "IDENTITY_CORROBORATED")
})

test("EXTERNAL_RESOURCE_SOURCE_URL_NOT_VERIFIED_GATE", () => {
  const result = runResourceDiscovery(requirement, [{
    ...canonicalCandidate,
    sourceLocator: "https://github.com/example/originkit",
    evidence: undefined
  }])

  assert.strictEqual(result.relevantCandidates[0].verificationStatus, "UNVERIFIED")
  assert.strictEqual(result.relevantCandidates[0].canonicalCollision.matched, false)
})
test("FINGERPRINT_DIFFERENTIATION_GATE", () => {
  const baseline = runResourceDiscovery(requirement, [canonicalCandidate])
  const changedRequirement = runResourceDiscovery({ ...requirement, action: "different-action" }, [canonicalCandidate])
  const changedCandidate = runResourceDiscovery(requirement, [{ ...canonicalCandidate, sourceIdentity: "other-identity" }])

  assert.notStrictEqual(baseline.requirementFingerprint, changedRequirement.requirementFingerprint)
  assert.notStrictEqual(baseline.requirementFingerprint, changedCandidate.requirementFingerprint)
})

test("REGISTRY_IMMUTABILITY_GATE", () => {
  const before = RESOURCE_REGISTRY.length
  runResourceDiscovery(requirement, [canonicalCandidate])
  assert.strictEqual(RESOURCE_REGISTRY.length, before)
  assert.strictEqual(before, 20)
})

test("NO_EXECUTION_SIDE_EFFECT_GATE", () => {
  const before = RESOURCE_REGISTRY.length
  const result = runResourceDiscovery(requirement, [canonicalCandidate])

  assert.strictEqual(result.canonicalCollisionCount, 0)
  assert.strictEqual(result.nextAction, "HUMAN_REVIEW_REQUIRED")
  assert.strictEqual(RESOURCE_REGISTRY.length, before)
  assert.strictEqual(before, 20)
})

test("RR01_NON_REGRESSION_GATE", () => {
  const radar = runResourceRadar({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "rules-governance",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(radar.decision, "USE_EXISTING")
  assert.strictEqual(radar.topMatch?.resourceId, "res_sacred_rules_breaker")
})
