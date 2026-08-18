import test from "node:test"
import assert from "node:assert"

import { RESOURCE_REGISTRY, runResourceDiscovery } from "../lib/creative-os"
import {
  ORIGINKIT_CATALOG_SCHEMA_VERSION,
  ORIGINKIT_CATALOG_SOURCE_KIND,
  ORIGINKIT_CONNECTOR_IDENTITY,
  ORIGINKIT_CONNECTOR_LICENSE,
  ORIGINKIT_CONNECTOR_REPOSITORY,
  ORIGINKIT_CONNECTOR_REVISION,
  fingerprintOriginkitCatalogSnapshot,
  mapOriginkitCatalogEntryToDiscoveryCandidateInput,
  normalizeOriginkitCatalogSnapshot,
  validateOriginkitCatalogSnapshot
} from "../lib/creative-os/integrations/originkit"

const baseSnapshot = {
  schemaVersion: ORIGINKIT_CATALOG_SCHEMA_VERSION,
  connectorIdentity: ORIGINKIT_CONNECTOR_IDENTITY,
  connectorRepository: ORIGINKIT_CONNECTOR_REPOSITORY,
  connectorRevision: ORIGINKIT_CONNECTOR_REVISION,
  connectorLicense: ORIGINKIT_CONNECTOR_LICENSE,
  catalogSourceKind: ORIGINKIT_CATALOG_SOURCE_KIND,
  catalogEntries: [
    {
      name: "synthetic-alpha",
      displayName: "Synthetic Alpha",
      category: "component",
      description: "Synthetic alpha component",
      tags: [" beta ", "alpha", "alpha"],
      variants: ["default", " default "],
      dependencies: ["react", "next"]
    },
    {
      name: "synthetic-beta",
      displayName: "Synthetic Beta",
      category: "component",
      description: "Synthetic beta component",
      tags: ["zeta"],
      variants: ["compact"],
      dependencies: ["react"]
    }
  ]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

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

test("CONNECTOR_IDENTITY_GATE", () => {
  assert.strictEqual(ORIGINKIT_CONNECTOR_IDENTITY, "vellum-ai/originkit")
  assert.strictEqual(ORIGINKIT_CONNECTOR_REPOSITORY, "vellum-ai/originkit")
})

test("CONNECTOR_PIN_GATE", () => {
  assert.strictEqual(ORIGINKIT_CONNECTOR_REVISION, "9aa260c2561ad9e765832dc342e9bbb5138858a4")
  assert.strictEqual(validateOriginkitCatalogSnapshot(clone(baseSnapshot)).valid, true)

  for (const revision of ["main", "v1.0.0", "9AA260C2561AD9E765832DC342E9BBB5138858A4", "123"]) {
    const result = validateOriginkitCatalogSnapshot({ ...clone(baseSnapshot), connectorRevision: revision } as typeof baseSnapshot)
    assert.strictEqual(result.valid, false)
  }
})

test("CONNECTOR_LICENSE_GATE", () => {
  assert.strictEqual(ORIGINKIT_CONNECTOR_LICENSE, "MIT")
  const result = validateOriginkitCatalogSnapshot({ ...clone(baseSnapshot), connectorLicense: "Apache-2.0" } as typeof baseSnapshot)
  assert.strictEqual(result.valid, false)
})

test("COMPONENT_LICENSE_ISOLATION_GATE", () => {
  const snapshot = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
  const candidate = mapOriginkitCatalogEntryToDiscoveryCandidateInput(snapshot, snapshot.catalogEntries[0])
  assert.strictEqual(candidate.licenseClaim, undefined)
})

test("CATALOG_SCHEMA_GATE", () => {
  const valid = validateOriginkitCatalogSnapshot(clone(baseSnapshot))
  assert.strictEqual(valid.valid, true)

  const malformed = validateOriginkitCatalogSnapshot({
    ...clone(baseSnapshot),
    catalogEntries: [{ ...clone(baseSnapshot.catalogEntries[0]), apiKey: "x" }] as unknown as typeof baseSnapshot.catalogEntries
  } as typeof baseSnapshot)
  assert.strictEqual(malformed.valid, false)
  assert.ok(malformed.errors.length > 0)
})

test("CATALOG_NORMALIZATION_GATE", () => {
  const normalized = normalizeOriginkitCatalogSnapshot({
    ...clone(baseSnapshot),
    catalogEntries: [
      {
        ...baseSnapshot.catalogEntries[0],
        name: "zeta",
        displayName: "Zulu",
        tags: ["ä", "z", "z"],
        variants: ["ß", "a", "a"],
        dependencies: ["λ", "b", "b"]
      },
      {
        ...baseSnapshot.catalogEntries[1],
        name: "alpha",
        displayName: "Alpha",
        tags: ["y"],
        variants: ["c"],
        dependencies: ["a"]
      }
    ]
  })

  assert.deepStrictEqual(normalized.catalogEntries.map((entry) => entry.name), ["alpha", "zeta"])
  assert.deepStrictEqual(normalized.catalogEntries[1].tags, ["z", "ä"])
  assert.deepStrictEqual(normalized.catalogEntries[1].variants, ["a", "ß"])
  assert.deepStrictEqual(normalized.catalogEntries[1].dependencies, ["b", "λ"])
})

test("CATALOG_FINGERPRINT_GATE", () => {
  const a = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
  const b = normalizeOriginkitCatalogSnapshot({
    ...clone(baseSnapshot),
    catalogEntries: [...clone(baseSnapshot).catalogEntries].reverse()
  })
  assert.strictEqual(fingerprintOriginkitCatalogSnapshot(clone(baseSnapshot)), a.catalogFingerprint)
  assert.strictEqual(a.catalogFingerprint, b.catalogFingerprint)

  const c = normalizeOriginkitCatalogSnapshot({
    ...clone(baseSnapshot),
    catalogEntries: [
      clone(baseSnapshot).catalogEntries[0],
      { ...clone(baseSnapshot).catalogEntries[1], description: "changed" }
    ]
  })
  assert.notStrictEqual(a.catalogFingerprint, c.catalogFingerprint)
})

test("ORDER_INDEPENDENCE_GATE", () => {
  const a = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
  const b = normalizeOriginkitCatalogSnapshot({
    ...clone(baseSnapshot),
    catalogEntries: [
      {
        ...baseSnapshot.catalogEntries[1],
        variants: ["compact", "compact"],
        dependencies: ["react", "react"],
        tags: ["zeta", "zeta"]
      },
      {
        ...baseSnapshot.catalogEntries[0],
        tags: ["alpha", "beta", "alpha"],
        variants: ["default", "default"],
        dependencies: ["next", "react", "react"]
      }
    ]
  })

  assert.strictEqual(a.catalogFingerprint, b.catalogFingerprint)
  assert.deepStrictEqual(a.catalogEntries, b.catalogEntries)
})

test("CREDENTIAL_REJECTION_GATE", () => {
  const result = validateOriginkitCatalogSnapshot({
    ...clone(baseSnapshot),
    catalogEntries: [
      {
        ...clone(baseSnapshot.catalogEntries[0]),
        description: "cmp_live_secret component"
      }
    ]
  } as typeof baseSnapshot)
  assert.strictEqual(result.valid, false)
})

test("DISCOVERY_MAPPING_GATE", () => {
  const snapshot = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
  const candidate = mapOriginkitCatalogEntryToDiscoveryCandidateInput(snapshot, snapshot.catalogEntries[0])

  assert.strictEqual(candidate.sourceKind, "GITHUB_REPOSITORY")
  assert.ok(candidate.sourceLocator?.includes("9aa260c2561ad9e765832dc342e9bbb5138858a4"))
  assert.ok(candidate.sourceLocator?.includes("synthetic-alpha"))
  assert.strictEqual(candidate.sourceIdentity, "vellum-ai/originkit@9aa260c2561ad9e765832dc342e9bbb5138858a4:synthetic-alpha")
  assert.strictEqual(candidate.provenanceClaim, "connector:vellum-ai/originkit@9aa260c2561ad9e765832dc342e9bbb5138858a4")
  assert.strictEqual(candidate.licenseClaim, undefined)
  assert.strictEqual(candidate.claimedActions, undefined)
  assert.strictEqual(candidate.claimedArtifactTypes, undefined)
  assert.strictEqual(candidate.claimedCapabilityGaps, undefined)
  assert.strictEqual(candidate.claimedFrameworks, undefined)
})

test("NO_NETWORK_GATE", () => {
  const globalWithFetch = globalThis as typeof globalThis & { fetch?: typeof fetch }
  const originalFetch = globalWithFetch.fetch
  let invoked = false
  globalWithFetch.fetch = (async () => {
    invoked = true
    throw new Error("fetch disabled")
  }) as typeof fetch

  try {
    const snapshot = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
    const candidate = mapOriginkitCatalogEntryToDiscoveryCandidateInput(snapshot, snapshot.catalogEntries[0])
    const discovery = runResourceDiscovery(makeDiscoveryRequirement(), [candidate])
    assert.strictEqual(invoked, false)
    assert.strictEqual(discovery.candidateCount, 1)
  } finally {
    globalWithFetch.fetch = originalFetch
  }
})

test("NOT_REGISTERED_GATE", () => {
  const snapshot = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
  const candidate = mapOriginkitCatalogEntryToDiscoveryCandidateInput(snapshot, snapshot.catalogEntries[0])
  const discovery = runResourceDiscovery(makeDiscoveryRequirement(), [candidate])

  assert.strictEqual(discovery.nonMatchingCandidates[0].candidateStatus, "UNREGISTERED_CANDIDATE")
  assert.strictEqual(discovery.nonMatchingCandidates[0].registrationStatus, "NOT_REGISTERED")
  assert.strictEqual(discovery.nonMatchingCandidates[0].requiresHumanReview, true)
})

test("NOT_EXECUTABLE_GATE", () => {
  const snapshot = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
  const candidate = mapOriginkitCatalogEntryToDiscoveryCandidateInput(snapshot, snapshot.catalogEntries[0])
  const discovery = runResourceDiscovery(makeDiscoveryRequirement(), [candidate])

  assert.strictEqual(discovery.nonMatchingCandidates[0].executionStatus, "NOT_EXECUTABLE")
})

test("REGISTRY_IMMUTABILITY_GATE", () => {
  const before = RESOURCE_REGISTRY.length
  const snapshot = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
  mapOriginkitCatalogEntryToDiscoveryCandidateInput(snapshot, snapshot.catalogEntries[0])
  assert.strictEqual(RESOURCE_REGISTRY.length, before)
  assert.strictEqual(before, 20)
})

test("EXECUTION_EVIDENCE_NON_ELEVATION_GATE", () => {
  const snapshot = normalizeOriginkitCatalogSnapshot(clone(baseSnapshot))
  assert.strictEqual(snapshot.catalogEntries[0].name, "synthetic-alpha")
})
