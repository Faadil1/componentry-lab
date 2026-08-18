import { METHOD_DEFINITIONS } from "../methods/registry"
import { RESOURCE_REGISTRY } from "../registry"
import type { ResourceMetadata } from "../types"
import {
  adaptV1RegistryToV2,
  METHOD_DOMAIN_BY_RESOURCE_ID,
  V1_RESOURCE_TYPE_TO_ENTITY_KIND
} from "./adapter"
import type {
  LegacyV1Projection,
  LibraryV2Entity,
  MethodEntity,
  ProjectionWarning,
  SourceEntity,
} from "./types"

export interface LibraryV2ValidationResult {
  valid: boolean
  errors: string[]
  warnings: ProjectionWarning[]
  projections: LegacyV1Projection[]
  primaryProjectionCount: number
  uniquePrimaryIdCount: number
  expectedResourceCount: number
  expectedMethodCount: number
}

const EXPECTED_RESOURCE_COUNT = 20
const EXPECTED_METHOD_COUNT = 6

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_, entry) => {
    if (Array.isArray(entry)) return entry
    if (entry && typeof entry === "object") {
      const sorted: Record<string, unknown> = {}
      for (const key of Object.keys(entry as Record<string, unknown>).sort()) {
        sorted[key] = (entry as Record<string, unknown>)[key]
      }
      return sorted
    }
    return entry
  })
}

function isDeepEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b)
}

function isLegacyPlaceholder(resource: ResourceMetadata): boolean {
  return Boolean(resource.sourceUrl?.includes("github.com/example/"))
}

function assertMethodEntity(entity: LibraryV2Entity): asserts entity is MethodEntity {
  if (entity.entityKind !== "METHOD") {
    throw new Error(`expected METHOD entity, received ${entity.entityKind}`)
  }
}

function assertSourceEntity(entity: LibraryV2Entity): asserts entity is SourceEntity {
  if (entity.entityKind !== "SOURCE") {
    throw new Error(`expected SOURCE entity, received ${entity.entityKind}`)
  }
}

function validateProjectionWarnings(
  projections: LegacyV1Projection[],
  errors: string[]
): ProjectionWarning[] {
  const warnings: ProjectionWarning[] = []
  for (const projection of projections) {
    warnings.push(...projection.projectionWarnings)
    if (!isDeepEqual(projection.legacySnapshot, RESOURCE_REGISTRY.find((resource) => resource.id === projection.primary.id))) {
      errors.push(`legacySnapshot parity failed for ${projection.primary.id}`)
    }
  }
  return warnings
}

function validatePrimaryCoverage(projections: LegacyV1Projection[], errors: string[]): void {
  const ids = projections.map((projection) => projection.primary.id)
  const uniqueIds = new Set(ids)

  if (projections.length !== RESOURCE_REGISTRY.length) {
    errors.push(`primary projection count ${projections.length} did not match V1 registry count ${RESOURCE_REGISTRY.length}`)
  }
  if (uniqueIds.size !== ids.length) {
    errors.push("duplicate primary projection ids detected")
  }

  for (const resource of RESOURCE_REGISTRY) {
    if (!ids.includes(resource.id)) {
      errors.push(`missing primary projection for ${resource.id}`)
    }
  }
}

function validateSemanticMapping(projections: LegacyV1Projection[], errors: string[]): void {
  for (const projection of projections) {
    const resource = RESOURCE_REGISTRY.find((entry) => entry.id === projection.primary.id)
    if (!resource) {
      errors.push(`projection ${projection.primary.id} has no matching resource`)
      continue
    }

    const expectedKind = V1_RESOURCE_TYPE_TO_ENTITY_KIND[resource.type]
    if (projection.primary.entityKind !== expectedKind) {
      errors.push(`entityKind mismatch for ${resource.id}: expected ${expectedKind}, got ${projection.primary.entityKind}`)
    }
  }
}

function validateMethods(projections: LegacyV1Projection[], errors: string[]): void {
  for (const projection of projections) {
    const resource = RESOURCE_REGISTRY.find((entry) => entry.id === projection.primary.id)
    if (!resource || resource.type !== "CORE_METHOD") continue

    assertMethodEntity(projection.primary)
    const methodDefinition = METHOD_DEFINITIONS.find((definition) => definition.resourceId === resource.id)

    if (!methodDefinition) {
      errors.push(`missing method definition for ${resource.id}`)
      continue
    }

    if (projection.primary.methodDefinitionId !== methodDefinition.id) {
      errors.push(`methodDefinitionId mismatch for ${resource.id}`)
    }

    if (!METHOD_DOMAIN_BY_RESOURCE_ID[resource.id]) {
      errors.push(`unsupported method domain for ${resource.id}`)
    }

    if (projection.primary.methodDomain !== METHOD_DOMAIN_BY_RESOURCE_ID[resource.id]) {
      errors.push(`method domain mismatch for ${resource.id}`)
    }

    if (!isDeepEqual(projection.primary.methodDefinition, methodDefinition)) {
      errors.push(`methodDefinition parity failed for ${resource.id}`)
    }
  }
}

function validateOriginKitTruth(projections: LegacyV1Projection[], errors: string[]): void {
  const originKit = projections.find((projection) => projection.primary.id === "res_originkit")
  if (!originKit) {
    errors.push("missing res_originkit projection")
    return
  }

  assertSourceEntity(originKit.primary)
  if (originKit.primary.sourceKind !== "CONNECTOR") {
    errors.push("res_originkit sourceKind must remain CONNECTOR")
  }
  if (originKit.primary.locator !== originKit.primary.provenance) {
    errors.push("res_originkit locator must fall back to provenance")
  }
  if (originKit.primary.lifecycleState !== "TEST_CANDIDATE") {
    errors.push("res_originkit lifecycleState changed")
  }
  if (originKit.primary.licenseEvidenceRecords?.some((record) => record.status === "VERIFIED")) {
    errors.push("res_originkit license evidence was escalated to VERIFIED")
  }
  if (originKit.primary.compatibilityEvidenceStatus !== "UNKNOWN") {
    errors.push("res_originkit compatibilityEvidenceStatus changed")
  }
}

function validatePlaceholderDetection(projections: LegacyV1Projection[], errors: string[]): ProjectionWarning[] {
  const warnings: ProjectionWarning[] = []
  for (const resource of RESOURCE_REGISTRY) {
    if (!isLegacyPlaceholder(resource)) continue
    const projection = projections.find((entry) => entry.primary.id === resource.id)
    if (!projection) {
      errors.push(`missing projection for legacy placeholder ${resource.id}`)
      continue
    }
    warnings.push(...projection.projectionWarnings.filter((warning) => warning.code === "LEGACY_PLACEHOLDER_SOURCE"))
    if (!projection.projectionWarnings.some((warning) => warning.code === "LEGACY_PLACEHOLDER_SOURCE")) {
      errors.push(`placeholder source was not flagged for ${resource.id}`)
    }
    if (projection.primary.entityKind === "SOURCE") {
      assertSourceEntity(projection.primary)
      if (projection.primary.sourceVerificationStatus !== "LEGACY_PLACEHOLDER") {
        errors.push(`placeholder source ${resource.id} must remain LEGACY_PLACEHOLDER`)
      }
    }
  }
  return warnings
}

function validateNoEvidenceEscalation(projections: LegacyV1Projection[], errors: string[]): void {
  for (const projection of projections) {
    if (projection.primary.licenseEvidenceRecords?.some((record) => record.status === "VERIFIED")) {
      errors.push(`license evidence escalated to VERIFIED for ${projection.primary.id}`)
    }
    if (projection.primary.entityKind === "SOURCE") {
      assertSourceEntity(projection.primary)
      if (projection.primary.sourceVerificationStatus === "VERIFIED") {
        errors.push(`source verification escalated to VERIFIED for ${projection.primary.id}`)
      }
    }
  }
}

export function validateLibraryV2Projection(
  resources: readonly ResourceMetadata[] = RESOURCE_REGISTRY
): LibraryV2ValidationResult {
  const projections = adaptV1RegistryToV2(resources, METHOD_DEFINITIONS)
  const errors: string[] = []
  const warnings: ProjectionWarning[] = []

  validatePrimaryCoverage(projections, errors)
  warnings.push(...validateProjectionWarnings(projections, errors))
  validateSemanticMapping(projections, errors)
  validateMethods(projections, errors)
  validateOriginKitTruth(projections, errors)
  warnings.push(...validatePlaceholderDetection(projections, errors))
  validateNoEvidenceEscalation(projections, errors)

  const secondPass = adaptV1RegistryToV2(resources, METHOD_DEFINITIONS)
  if (!isDeepEqual(projections, secondPass)) {
    errors.push("adapter is not deterministic across calls")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    projections,
    primaryProjectionCount: projections.length,
    uniquePrimaryIdCount: new Set(projections.map((projection) => projection.primary.id)).size,
    expectedResourceCount: EXPECTED_RESOURCE_COUNT,
    expectedMethodCount: EXPECTED_METHOD_COUNT
  }
}

export function validateLibraryV2Contracts(): LibraryV2ValidationResult {
  return validateLibraryV2Projection()
}
