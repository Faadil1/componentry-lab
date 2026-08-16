import test from "node:test"
import assert from "node:assert"

import { RESOURCE_REGISTRY, getResourceExecutionEvidence, runResourceDiscovery } from "../lib/creative-os"
import {
  ORIGINKIT_PINNED_CATALOG_FINGERPRINT,
  ORIGINKIT_PINNED_CATALOG_SOURCE_BLOB_SHA,
  ORIGINKIT_PINNED_CATALOG_SOURCE_BYTE_SIZE,
  ORIGINKIT_PINNED_CATALOG_SOURCE_DECLARED_COUNT,
  ORIGINKIT_PINNED_CATALOG_SOURCE_PATH,
  getOriginkitPinnedCatalogSnapshot,
  getOriginkitPinnedCatalogSnapshotInput,
  validateOriginkitCatalogSnapshot,
  mapOriginkitCatalogEntryToDiscoveryCandidateInput
} from "../lib/creative-os/integrations/originkit"

const FINGERPRINT_PATTERN = /^[a-f0-9]{64}$/



function makeDiscoveryRequirement() {
  return {
    capabilityGap: "resource-provenance-core",
    artifactType: "discovery-report",
    action: "analyze-resource-provenance",
    projectMode: "HACKATHON" as const,
    phase: "submit" as const,
    requiredAuthorityCeiling: "SUGGEST" as const,
    frameworkOrSurface: "React/NextJS",
    candidateStatus: "UNREGISTERED_DISCOVERY_REQUIREMENT" as const
  }
}


test("PINNED_SOURCE_IDENTITY_GATE", () => {
  assert.strictEqual(ORIGINKIT_PINNED_CATALOG_SOURCE_PATH, "src/component-index.json")
  assert.strictEqual(ORIGINKIT_PINNED_CATALOG_SOURCE_BLOB_SHA, "fa9d141691edb17fbb31af4bb017709053f5cd13")
  assert.strictEqual(ORIGINKIT_PINNED_CATALOG_SOURCE_BYTE_SIZE, 25528)
  assert.strictEqual(ORIGINKIT_PINNED_CATALOG_SOURCE_DECLARED_COUNT, 50)
})

test("PINNED_SOURCE_SHAPE_GATE", () => {
  const snapshot = getOriginkitPinnedCatalogSnapshotInput()
  for (const entry of snapshot.catalogEntries) {
    assert.deepStrictEqual(Object.keys(entry).sort(), ["category", "dependencies", "description", "displayName", "name", "tags", "variants"])
  }
})

test("REAL_CATALOG_COUNT_GATE", () => {
  const snapshot = getOriginkitPinnedCatalogSnapshotInput()
  assert.strictEqual(snapshot.catalogEntries.length, 50)
  assert.strictEqual(new Set(snapshot.catalogEntries.map((entry) => entry.name)).size, 50)
  for (const entry of snapshot.catalogEntries) {
    assert.ok(entry.name.trim())
    assert.ok(entry.displayName.trim())
    assert.ok(entry.category.trim())
    assert.ok(entry.description.trim())
    assert.ok(Array.isArray(entry.tags))
    assert.ok(Array.isArray(entry.variants))
    assert.ok(Array.isArray(entry.dependencies))
  }
})

test("REAL_CATALOG_CONTRACT_GATE", () => {
  const validation = validateOriginkitCatalogSnapshot(getOriginkitPinnedCatalogSnapshotInput())
  assert.deepStrictEqual(validation, { valid: true, errors: [] })
})

test("REAL_CATALOG_FINGERPRINT_GATE", () => {
  const snapshot = getOriginkitPinnedCatalogSnapshot()
  assert.strictEqual(snapshot.catalogFingerprint, ORIGINKIT_PINNED_CATALOG_FINGERPRINT)
  assert.ok(FINGERPRINT_PATTERN.test(snapshot.catalogFingerprint))
  assert.ok(FINGERPRINT_PATTERN.test(ORIGINKIT_PINNED_CATALOG_FINGERPRINT))
})

test("REAL_METADATA_ONLY_GATE", () => {
  const snapshot = getOriginkitPinnedCatalogSnapshotInput()
  for (const entry of snapshot.catalogEntries) {
    assert.deepStrictEqual(Object.keys(entry).sort(), ["category", "dependencies", "description", "displayName", "name", "tags", "variants"])
    const values = [entry.name, entry.displayName, entry.category, entry.description, ...entry.tags, ...entry.variants, ...entry.dependencies]
    for (const value of values) {
      assert.strictEqual(/cmp_live_[a-z0-9]+/i.test(value), false)
      assert.strictEqual(value.includes("source code"), false)
      assert.strictEqual(value.includes("MCP"), false)
      assert.strictEqual(value.includes("apiKey"), false)
    }
  }
})

test("COMPONENT_LICENSE_ISOLATION_GATE", () => {
  const snapshot = getOriginkitPinnedCatalogSnapshot()
  const entries = [snapshot.catalogEntries[0], snapshot.catalogEntries[24], snapshot.catalogEntries[49]]
  for (const entry of entries) {
    const candidate = mapOriginkitCatalogEntryToDiscoveryCandidateInput(snapshot, entry)
    assert.strictEqual(candidate.licenseClaim, undefined)
    assert.strictEqual(candidate.claimedActions, undefined)
    assert.strictEqual(candidate.claimedArtifactTypes, undefined)
    assert.strictEqual(candidate.claimedCapabilityGaps, undefined)
    assert.strictEqual(candidate.claimedFrameworks, undefined)
  }
})

test("SNAPSHOT_IMMUTABILITY_GATE", () => {
  const first = getOriginkitPinnedCatalogSnapshotInput()
  first.catalogEntries[0].name = "mutated"
  first.catalogEntries[1].tags.push("mutated-tag")
  first.catalogEntries.push({
    name: "extra",
    displayName: "Extra",
    category: "component",
    description: "Extra",
    tags: [],
    variants: [],
    dependencies: []
  })
  const second = getOriginkitPinnedCatalogSnapshotInput()
  assert.notStrictEqual(second.catalogEntries[0].name, "mutated")
  assert.strictEqual(second.catalogEntries.length, 50)
  assert.strictEqual(second.catalogEntries[1].tags.includes("mutated-tag"), false)
})

test("OFFLINE_SNAPSHOT_GATE", () => {
  const globalWithFetch = globalThis as typeof globalThis & { fetch?: typeof fetch }
  const originalFetch = globalWithFetch.fetch
  let invoked = false
  globalWithFetch.fetch = (async () => {
    invoked = true
    throw new Error("fetch disabled")
  }) as typeof fetch
  try {
    const snapshot = getOriginkitPinnedCatalogSnapshot()
    assert.strictEqual(snapshot.catalogEntries.length, 50)
    const validation = validateOriginkitCatalogSnapshot(getOriginkitPinnedCatalogSnapshotInput())
    assert.deepStrictEqual(validation, { valid: true, errors: [] })
    assert.strictEqual(invoked, false)
  } finally {
    globalWithFetch.fetch = originalFetch
  }
})

test("REAL_DISCOVERY_MAPPING_GATE", () => {
  const snapshot = getOriginkitPinnedCatalogSnapshot()
  const discoveryRequirement = makeDiscoveryRequirement()
  const candidates = snapshot.catalogEntries.map((entry) => mapOriginkitCatalogEntryToDiscoveryCandidateInput(snapshot, entry))
  const discovery = runResourceDiscovery(discoveryRequirement, candidates)
  assert.strictEqual(discovery.candidateCount, 50)
  for (const candidate of [...discovery.relevantCandidates, ...discovery.nonMatchingCandidates]) {
    assert.strictEqual(candidate.candidateStatus, "UNREGISTERED_CANDIDATE")
    assert.strictEqual(candidate.registrationStatus, "NOT_REGISTERED")
    assert.strictEqual(candidate.executionStatus, "NOT_EXECUTABLE")
    assert.strictEqual(candidate.requiresHumanReview, true)
    assert.strictEqual(candidate.licenseClaim, undefined)
    assert.strictEqual(candidate.claimedActions, undefined)
    assert.strictEqual(candidate.claimedArtifactTypes, undefined)
    assert.strictEqual(candidate.claimedCapabilityGaps, undefined)
    assert.strictEqual(candidate.claimedFrameworks, undefined)
  }
})


test("REGISTRY_IMMUTABILITY_GATE", () => {
  const before = RESOURCE_REGISTRY.length
  const snapshot = getOriginkitPinnedCatalogSnapshot()
  const after = RESOURCE_REGISTRY.length
  const originkitCount = RESOURCE_REGISTRY.filter((resource) => resource.id === "res_originkit").length
  const originkit = RESOURCE_REGISTRY.find((resource) => resource.id === "res_originkit")

  assert.strictEqual(before, after)
  assert.strictEqual(originkitCount, 1)
  assert.ok(originkit)
  assert.strictEqual(originkit?.id, "res_originkit")
  assert.strictEqual(originkit?.type, "COMPONENT_SOURCE")
  assert.strictEqual(originkit?.lifecycleState, "TEST_CANDIDATE")
  assert.strictEqual(originkit?.maxExecutionAuthority, "READ_ONLY")
  assert.strictEqual(originkit?.license, "UNCLAIMED")
  assert.strictEqual(originkit?.provenance, "connector:vellum-ai/originkit@9aa260c2561ad9e765832dc342e9bbb5138858a4")
  assert.strictEqual(originkit?.sourceUrl, undefined)
  assert.deepStrictEqual(originkit?.capabilities.actions, [])
  assert.deepStrictEqual(originkit?.capabilities.artifactTypes, [])
  assert.deepStrictEqual(originkit?.capabilities.capabilityGaps, [])
  assert.strictEqual(originkit?.capabilities.requiredAuthority, "SUGGEST")
  assert.strictEqual(originkit?.supportedFrameworks, undefined)
  assert.strictEqual(originkit?.supportedCapabilities, undefined)
  assert.strictEqual(originkit?.compatibilityEvidenceStatus, "UNKNOWN")
  assert.strictEqual(snapshot.catalogEntries.length, 50)
})

test("EXECUTION_EVIDENCE_NON_ELEVATION_GATE", () => {
  const evidence = getResourceExecutionEvidence("res_originkit")
  assert.deepStrictEqual(evidence, {
    resourceId: "res_originkit",
    implementationStatus: "PARTIAL_IMPLEMENTATION",
    executionBoundary: "PLANNING_ONLY",
    adapterEvidenceStatus: "NOT_APPLICABLE",
    executionReadiness: "PLANNING_ONLY",
    evidenceReferences: [
      "lib/creative-os/router.ts",
      "tests/creative-os-resource-radar.test.ts",
      "tests/creative-os-methods.test.ts"
    ],
    notes: ["Planning-only path remains governed by routing and compatibility evidence."]
  })
})
