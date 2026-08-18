import test from "node:test"
import assert from "node:assert/strict"

import { METHOD_DEFINITIONS } from "../lib/creative-os/methods/registry"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import { routeCapabilities } from "../lib/creative-os/router"
import {
  adaptV1RegistryToV2,
  METHOD_DOMAIN_BY_RESOURCE_ID
} from "../lib/creative-os/library-v2"

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function captureRoutingMatrix() {
  return [
    routeCapabilities({
      projectMode: "HACKATHON",
      phase: "route",
      currentAuthority: "SUGGEST"
    }),
    routeCapabilities({
      projectMode: "HACKATHON",
      phase: "route",
      capabilityGap: "library-composition",
      currentAuthority: "SUGGEST"
    }),
    routeCapabilities({
      projectMode: "HACKATHON",
      phase: "route",
      capabilityGap: "web-component-animation",
      frameworkOrSurface: "React/NextJS",
      currentAuthority: "SUGGEST"
    }),
    routeCapabilities({
      projectMode: "HACKATHON",
      phase: "route",
      capabilityGap: "web-component-animation",
      frameworkOrSurface: "Svelte",
      currentAuthority: "SUGGEST"
    }),
    routeCapabilities({
      projectMode: "DAY_CHALLENGE",
      phase: "verify",
      capabilityGap: "rules-governance",
      currentAuthority: "SUGGEST"
    }),
    routeCapabilities({
      projectMode: "HACKATHON",
      phase: "route",
      capabilityGap: "skill-discovery",
      artifactType: "skill-feed",
      currentAuthority: "SUGGEST"
    })
  ]
}

test("V1_COUNTS_AND_PRIMARY_PROJECTION_GATE", () => {
  const projections = adaptV1RegistryToV2()

  assert.equal(RESOURCE_REGISTRY.length, 20)
  assert.equal(METHOD_DEFINITIONS.length, 6)
  assert.equal(projections.length, 20)
})

test("PRIMARY_IDENTITY_ONE_TO_ONE_GATE", () => {
  const projections = adaptV1RegistryToV2()
  const ids = projections.map((projection) => projection.primary.id)
  const uniqueIds = new Set(ids)

  assert.equal(uniqueIds.size, 20)
  assert.deepStrictEqual(ids, RESOURCE_REGISTRY.map((resource) => resource.id))
})

test("LOSSLESS_LEGACY_SNAPSHOT_PARITY_GATE", () => {
  const projections = adaptV1RegistryToV2()

  for (const [index, projection] of projections.entries()) {
    assert.deepStrictEqual(projection.legacySnapshot, RESOURCE_REGISTRY[index])
  }
})

test("V1_REGISTRY_IMMUTABILITY_GATE", () => {
  const before = jsonClone(RESOURCE_REGISTRY)
  const projections = adaptV1RegistryToV2()

  projections[0].primary.name = "mutated-primary"
  projections[0].legacySnapshot.name = "mutated-legacy"
  if (projections[0].primary.entityKind === "RESOURCE" && projections[0].primary.supportedCapabilities) {
    projections[0].primary.supportedCapabilities.push("mutated-capability")
  }
  if ("automationPolicy" in projections[0].primary) {
    projections[0].primary.automationPolicy.operations.BROWSE = "ALLOWED"
  }

  assert.deepStrictEqual(RESOURCE_REGISTRY, before)
})

test("METHOD_DEFINITION_IMMUTABILITY_GATE", () => {
  const before = jsonClone(METHOD_DEFINITIONS)
  const projections = adaptV1RegistryToV2()
  const methodProjection = projections.find((projection) => projection.primary.entityKind === "METHOD")

  assert.ok(methodProjection)
  if (methodProjection.primary.entityKind === "METHOD") {
    methodProjection.primary.methodDefinition.name = "mutated-method-name"
    methodProjection.primary.methodDefinition.capabilityGaps.push("mutated-gap")
  }

  assert.deepStrictEqual(METHOD_DEFINITIONS, before)
})

test("METHOD_DOMAIN_PARITY_GATE", () => {
  const methodProjections = adaptV1RegistryToV2().filter((projection) => projection.primary.entityKind === "METHOD")

  const domains = methodProjections.map((projection) => {
    assert.equal(projection.primary.entityKind, "METHOD")
    return projection.primary.methodDomain
  })

  assert.deepStrictEqual([...new Set(domains)].sort(), Object.values(METHOD_DOMAIN_BY_RESOURCE_ID).sort())
})

test("ORIGINKIT_CONSERVATIVE_TRUTH_GATE", () => {
  const originKit = adaptV1RegistryToV2().find((projection) => projection.primary.id === "res_originkit")

  assert.ok(originKit)
  assert.equal(originKit!.primary.entityKind, "SOURCE")
  if (originKit!.primary.entityKind === "SOURCE") {
    assert.equal(originKit!.primary.sourceKind, "CONNECTOR")
    assert.equal(originKit!.primary.lifecycleState, "TEST_CANDIDATE")
    assert.equal(originKit!.primary.provenance, "connector:vellum-ai/originkit@9aa260c2561ad9e765832dc342e9bbb5138858a4")
    assert.equal(originKit!.primary.licenseEvidenceRecords?.[0].status, "UNKNOWN")
    assert.equal(originKit!.primary.licenseEvidenceRecords?.[0].licenseValue, "UNCLAIMED")
    assert.equal(originKit!.primary.compatibilityEvidenceStatus, "UNKNOWN")
    assert.equal(originKit!.primary.automationPolicy.operations.SOURCE_CODE_FETCH, "UNKNOWN")
  }
})

test("LEGACY_PLACEHOLDER_DETECTION_GATE", () => {
  const projections = adaptV1RegistryToV2()
  const placeholderIds = RESOURCE_REGISTRY
    .filter((resource) => resource.sourceUrl?.includes("github.com/example/"))
    .map((resource) => resource.id)

  assert.ok(placeholderIds.length > 0)
  for (const id of placeholderIds) {
    const projection = projections.find((entry) => entry.primary.id === id)
    assert.ok(projection, `missing projection for ${id}`)
    assert.ok(projection!.projectionWarnings.some((warning) => warning.code === "LEGACY_PLACEHOLDER_SOURCE"))
    if (projection!.primary.entityKind === "SOURCE") {
      assert.equal(projection!.primary.sourceVerificationStatus, "LEGACY_PLACEHOLDER")
    }
  }
})

test("ADAPTER_DETERMINISM_GATE", () => {
  const first = adaptV1RegistryToV2()
  const second = adaptV1RegistryToV2()

  assert.deepStrictEqual(first, second)
})

test("ROUTING_BEHAVIOR_PARITY_GATE", () => {
  const before = captureRoutingMatrix()
  adaptV1RegistryToV2()
  const after = captureRoutingMatrix()

  assert.deepStrictEqual(after, before)
})
