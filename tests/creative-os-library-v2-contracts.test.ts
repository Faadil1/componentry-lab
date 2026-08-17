import test from "node:test"
import assert from "node:assert/strict"

import { METHOD_DEFINITIONS } from "../lib/creative-os/methods/registry"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import type {
  AuthorityCeiling,
  ResourceLifecycleState,
  ResourceMetadata
} from "../lib/creative-os/types"
import type {
  CreativeMethodDefinition
} from "../lib/creative-os/methods/types"
import {
  adaptV1RegistryToV2,
  validateLibraryV2Projection,
} from "../lib/creative-os/library-v2"
import type {
  DecisionLineageRecord,
  LibraryEntityKind,
  OperationDefinition,
  RecipeDefinition,
  ReferenceEntity,
  ResourceEntity,
  SourceEntity,
} from "../lib/creative-os/library-v2"

type NoAny<T> = 0 extends (1 & T) ? never : T

function projectionById(id: string) {
  const projection = adaptV1RegistryToV2().find((entry) => entry.primary.id === id)
  assert.ok(projection, `Missing projection for ${id}`)
  return projection!
}

test("SEMANTIC_ENTITY_KIND_GATE", () => {
  const source: SourceEntity = {
    id: "source-demo",
    name: "Source Demo",
    entityKind: "SOURCE",
    lifecycleState: "TEST_CANDIDATE",
    provenance: "connector:demo",
    evidenceRefs: [],
    sourceKind: "CONNECTOR",
    locator: "connector:demo",
    accessChannels: [],
    sourceVerificationStatus: "DECLARED",
    authorityPolicy: {
      requestedAuthority: "READ_ONLY",
      maximumAuthority: "READ_ONLY",
      humanReviewRequired: true
    },
    automationPolicy: {
      operations: {
        BROWSE: "UNKNOWN",
        SEARCH: "UNKNOWN",
        METADATA_READ: "UNKNOWN",
        CATALOG_READ: "UNKNOWN",
        RESOURCE_FETCH: "UNKNOWN",
        SOURCE_CODE_FETCH: "UNKNOWN",
        MEDIA_FETCH: "UNKNOWN",
        EXECUTE: "UNKNOWN",
        WRITE_BACK: "UNKNOWN"
      }
    }
  }
  const resource: ResourceEntity = {
    id: "resource-demo",
    name: "Resource Demo",
    entityKind: "RESOURCE",
    lifecycleState: "VALIDATED",
    provenance: "internal:demo",
    evidenceRefs: [],
    resourceKind: "KNOWLEDGE",
    authorityPolicy: {
      requestedAuthority: "SUGGEST",
      maximumAuthority: "SUGGEST",
      humanReviewRequired: true
    },
    automationPolicy: {
      operations: {
        BROWSE: "UNKNOWN",
        SEARCH: "UNKNOWN",
        METADATA_READ: "UNKNOWN",
        CATALOG_READ: "UNKNOWN",
        RESOURCE_FETCH: "UNKNOWN",
        SOURCE_CODE_FETCH: "UNKNOWN",
        MEDIA_FETCH: "UNKNOWN",
        EXECUTE: "UNKNOWN",
        WRITE_BACK: "UNKNOWN"
      }
    }
  }
  const reference: ReferenceEntity = {
    id: "reference-demo",
    name: "Reference Demo",
    entityKind: "REFERENCE",
    lifecycleState: "AUDITED",
    provenance: "internal:reference",
    evidenceRefs: [],
    referenceDomain: "TECHNICAL_PATTERN",
    stageAffinity: "TARGETED_REFERENCE_GATE",
    usageMode: "INTERNAL_CURATED"
  }
  const method = projectionById("res_sacred_rules_breaker").primary
  const provider = projectionById("res_cineprompt").primary

  const kinds = new Set<LibraryEntityKind>([
    source.entityKind,
    resource.entityKind,
    reference.entityKind,
    method.entityKind,
    provider.entityKind
  ])

  assert.deepStrictEqual([...kinds].sort(), ["METHOD", "PROVIDER", "REFERENCE", "RESOURCE", "SOURCE"])
})

test("METHOD_DOMAIN_GATE", () => {
  const domains = adaptV1RegistryToV2()
    .filter((projection) => projection.primary.entityKind === "METHOD")
    .map((projection) => {
      assert.equal(projection.primary.entityKind, "METHOD")
      return projection.primary.methodDomain
    })

  assert.deepStrictEqual([...new Set(domains)].sort(), [
    "CONCEPTUAL",
    "CREATIVE_TRANSFORMATION",
    "ORCHESTRATION",
    "PERCEPTUAL",
    "PRODUCTION",
    "STRATEGY"
  ])
  assert.equal(domains.length, 6)
})

test("PACKAGING_SEPARATION_GATE", () => {
  const skill = projectionById("res_tait_crt_interface_skill").primary
  const pipeline = projectionById("res_video_shotcraft").primary

  assert.equal(skill.entityKind, "RESOURCE")
  assert.equal(skill.packageDescriptor?.packageType, "SKILL")
  assert.equal(pipeline.entityKind, "RESOURCE")
  assert.equal(pipeline.packageDescriptor?.packageType, "PIPELINE")
})

test("AUTOMATION_PERMISSION_GATE", () => {
  const source = projectionById("res_originkit").primary as SourceEntity
  const operations = Object.entries(source.automationPolicy.operations)
  assert.equal(operations.length, 9)
  for (const [, permission] of operations) {
    assert.equal(permission, "UNKNOWN")
  }
})

test("LICENSE_EVIDENCE_SEPARATION_GATE", () => {
  const originKit = projectionById("res_originkit").primary as SourceEntity
  const openMontage = projectionById("res_openmontage").primary

  assert.equal(originKit.entityKind, "SOURCE")
  assert.equal(originKit.licenseEvidenceRecords?.[0].licenseValue, "UNCLAIMED")
  assert.equal(originKit.licenseEvidenceRecords?.[0].status, "UNKNOWN")
  assert.equal(openMontage.licenseEvidenceRecords?.[0].licenseValue, "MIT")
  assert.equal(openMontage.licenseEvidenceRecords?.[0].status, "DECLARED")
})

test("METHOD_METADATA_GATE", () => {
  const projection = projectionById("res_library_first_composition_router").primary
  const definition = METHOD_DEFINITIONS.find((method) => method.resourceId === "res_library_first_composition_router")

  assert.ok(definition)
  assert.equal(projection.entityKind, "METHOD")
  assert.equal(projection.methodDefinitionId, definition!.id)
  assert.deepStrictEqual(projection.methodDefinition, definition)
  assert.equal(projection.methodDomain, "ORCHESTRATION")
  assert.equal(projection.methodDefinition.deterministic, true)
})

test("RECIPE_OPERATION_DISTINCTION_GATE", () => {
  const decision: DecisionLineageRecord = {
    decisionId: "decision-demo",
    status: "PROPOSED",
    overridePolicy: "LOCKED",
    sourceId: "source-demo",
    notes: "Additive contract example."
  }
  const recipe: RecipeDefinition = {
    recipeId: "recipe-demo",
    name: "Recipe Demo",
    status: "CANDIDATE",
    methodDomain: "CONCEPTUAL",
    operationIds: ["operation-demo"],
    decisionLineage: [decision]
  }
  const operation: OperationDefinition = {
    operationId: "operation-demo",
    operationName: "Operation Demo",
    operator: "DETERMINISTIC",
    effectClass: "NONE",
    outputRole: "ADVISORY",
    permission: "UNKNOWN"
  }
  const method = projectionById("res_cognitive_metaphor_illustrator").primary

  assert.equal(method.entityKind, "METHOD")
  assert.equal("recipeId" in method, false)
  assert.equal("operationId" in method, false)
  assert.equal(recipe.decisionLineage[0].status, "PROPOSED")
  assert.equal(operation.permission, "UNKNOWN")
  assert.notDeepStrictEqual(recipe, operation)
})

test("PROVIDER_SOURCE_DISTINCTION_GATE", () => {
  const provider = projectionById("res_cineprompt").primary
  const source = projectionById("res_originkit").primary as SourceEntity

  assert.equal(provider.entityKind, "PROVIDER")
  assert.equal(source.entityKind, "SOURCE")
  assert.equal("sourceKind" in provider, false)
  assert.equal((source as SourceEntity).sourceKind, "CONNECTOR")
  assert.equal(provider.providerKind, "UNSPECIFIED")
  assert.equal(source.sourceKind, "CONNECTOR")
})

test("NO_ANY_ESCAPE_HATCH_GATE", () => {
  const noAnyResource: NoAny<ResourceMetadata> = RESOURCE_REGISTRY[0]
  const noAnyMethod: NoAny<CreativeMethodDefinition> = METHOD_DEFINITIONS[0]

  assert.ok(noAnyResource.id.length > 0)
  assert.ok(noAnyMethod.id.length > 0)
})

test("LIFECYCLE_AUTHORITY_REUSE_GATE", () => {
  const originKit = projectionById("res_originkit").primary as SourceEntity
  const lifecycle: ResourceLifecycleState = originKit.lifecycleState
  const authority: AuthorityCeiling = originKit.authorityPolicy.maximumAuthority

  assert.equal(lifecycle, "TEST_CANDIDATE")
  assert.equal(authority, "READ_ONLY")
  assert.equal(originKit.authorityPolicy.humanReviewRequired, true)
})

test("VALIDATION_GATE", () => {
  const validation = validateLibraryV2Projection()

  assert.equal(validation.valid, true)
  assert.deepStrictEqual(validation.errors, [])
  assert.equal(validation.primaryProjectionCount, 20)
  assert.equal(validation.uniquePrimaryIdCount, 20)
  assert.equal(validation.expectedMethodCount, 6)
})

test("LOSSLESS_LEGACY_SNAPSHOT_GATE", () => {
  const projections = adaptV1RegistryToV2()
  for (const [index, projection] of projections.entries()) {
    assert.deepStrictEqual(projection.legacySnapshot, RESOURCE_REGISTRY[index])
  }
})
