import { RESOURCE_REGISTRY } from "../registry"
import { METHOD_DEFINITIONS } from "../methods/registry"
import type { ResourceMetadata } from "../types"
import type { CreativeMethodDefinition, CreativeMethodAuthority } from "../methods/types"
import type {
  AutomationPermission,
  AutomationOperation,
  AutomationPolicy,
  AuthorityPolicy,
  EvidenceRecord,
  LicenseEvidenceRecord,
  LegacyV1Projection,
  LibraryV2Entity,
  MethodDomain,
  MethodEntity,
  ProjectionWarning,
  ProviderEntity,
  ReferenceEntity,
  ResourceEntity,
  ResourceKind,
  SourceEntity,
  SourceKind,
} from "./types"

export const V1_RESOURCE_TYPE_TO_ENTITY_KIND = {
  CORE_METHOD: "METHOD",
  KNOWLEDGE_PACK: "RESOURCE",
  SKILL: "RESOURCE",
  PROVIDER: "PROVIDER",
  COMPONENT_SOURCE: "SOURCE",
  PRODUCTION_PIPELINE: "RESOURCE",
  DISCOVERY_FEED: "SOURCE",
  REFERENCE_ONLY: "REFERENCE"
} as const

export const V1_RESOURCE_TYPE_TO_RESOURCE_KIND = {
  CORE_METHOD: "OTHER",
  KNOWLEDGE_PACK: "KNOWLEDGE",
  SKILL: "PACKAGE",
  PROVIDER: "TOOL",
  COMPONENT_SOURCE: "COMPONENT",
  PRODUCTION_PIPELINE: "PACKAGE",
  DISCOVERY_FEED: "KNOWLEDGE",
  REFERENCE_ONLY: "OTHER"
} as const satisfies Record<ResourceMetadata["type"], ResourceKind>

export const METHOD_DOMAIN_BY_RESOURCE_ID: Record<string, MethodDomain> = {
  res_sacred_rules_breaker: "STRATEGY",
  res_somatic_response_design: "PERCEPTUAL",
  res_relationship_preserving_abstraction: "CREATIVE_TRANSFORMATION",
  res_cognitive_metaphor_illustrator: "CONCEPTUAL",
  res_physical_situation_storyboarder: "PRODUCTION",
  res_library_first_composition_router: "ORCHESTRATION"
} as const

const AUTOMATION_OPERATIONS: AutomationOperation[] = [
  "BROWSE",
  "SEARCH",
  "METADATA_READ",
  "CATALOG_READ",
  "RESOURCE_FETCH",
  "SOURCE_CODE_FETCH",
  "MEDIA_FETCH",
  "EXECUTE",
  "WRITE_BACK"
]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function cloneDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneDeep(item)) as T
  }
  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      output[key] = cloneDeep(entry)
    }
    return output as T
  }
  return value
}

function createAutomationPolicy(permission: AutomationPermission = "UNKNOWN"): AutomationPolicy {
  return {
    operations: AUTOMATION_OPERATIONS.reduce((acc, operation) => {
      acc[operation] = permission
      return acc
    }, {} as Record<AutomationOperation, AutomationPermission>)
  }
}

function createAuthorityPolicy(required: ResourceMetadata["capabilities"]["requiredAuthority"], maximum: ResourceMetadata["maxExecutionAuthority"]): AuthorityPolicy {
  return {
    requestedAuthority: required,
    maximumAuthority: maximum,
    humanReviewRequired: true
  }
}

function createEvidenceRecords(resource: ResourceMetadata): EvidenceRecord[] {
  return [
    {
      evidenceType: "PROVENANCE",
      status: "DECLARED",
      locator: resource.provenance,
      notes: resource.sourceUrl ? "Legacy sourceUrl retained in lossless snapshot parity." : "Declared only from registry provenance."
    }
  ]
}

function createLicenseEvidenceRecords(resource: ResourceMetadata): LicenseEvidenceRecord[] {
  const status = resource.license === "UNCLAIMED" ? "UNKNOWN" : "DECLARED"
  return [
    {
      evidenceType: "LICENSE",
      status,
      scope: "UNKNOWN",
      licenseValue: resource.license,
      locator: resource.provenance,
      notes: status === "UNKNOWN"
        ? "Unclaimed license remains unverified and conservatively unknown."
        : "Legacy registry license is declared but not verified."
    }
  ]
}

function createBaseProjection(resource: ResourceMetadata) {
  return {
    id: resource.id,
    name: resource.name,
    lifecycleState: resource.lifecycleState,
    provenance: resource.provenance,
    evidenceRefs: [] as string[],
    evidenceRecords: createEvidenceRecords(resource),
    licenseEvidenceRecords: createLicenseEvidenceRecords(resource)
  }
}

function buildSourceKind(resource: ResourceMetadata): SourceKind {
  if (resource.provenance.startsWith("internal:")) return "INTERNAL"
  if (resource.provenance.startsWith("connector:")) return "CONNECTOR"
  if (resource.sourceUrl?.startsWith("https://github.com/")) return "REPOSITORY"
  return "UNKNOWN"
}

function isLegacyPlaceholderSource(resource: ResourceMetadata): boolean {
  return Boolean(resource.sourceUrl?.includes("github.com/example/"))
}

function placeholderWarning(resource: ResourceMetadata): ProjectionWarning[] {
  if (!isLegacyPlaceholderSource(resource)) {
    return []
  }
  return [{
    code: "LEGACY_PLACEHOLDER_SOURCE",
    message: "Legacy github.com/example/ sourceUrl is a placeholder and cannot be treated as verified truth.",
    resourceId: resource.id
  }]
}

function buildSourceProjection(resource: ResourceMetadata): LegacyV1Projection<SourceEntity> {
  const warnings: ProjectionWarning[] = placeholderWarning(resource)

  const primary: SourceEntity = {
    ...createBaseProjection(resource),
    entityKind: "SOURCE",
    sourceKind: buildSourceKind(resource),
    locator: resource.sourceUrl ?? resource.provenance,
    accessChannels: [],
    sourceVerificationStatus: isLegacyPlaceholderSource(resource)
      ? "LEGACY_PLACEHOLDER"
      : resource.sourceUrl
        ? "DECLARED"
        : resource.provenance.startsWith("connector:")
          ? "DECLARED"
          : "UNKNOWN",
    compatibilityEvidenceStatus: resource.compatibilityEvidenceStatus,
    authorityPolicy: createAuthorityPolicy(resource.capabilities.requiredAuthority, resource.maxExecutionAuthority),
    automationPolicy: createAutomationPolicy(),
    sourceUrl: resource.sourceUrl,
    packageDescriptor: resource.type === "DISCOVERY_FEED"
      ? {
          packageType: "DATA_SNAPSHOT",
          packageName: resource.name,
          packageLocator: resource.sourceUrl ?? resource.provenance
        }
      : undefined
  }

  return {
    primary,
    legacySnapshot: cloneDeep(resource),
    projectionWarnings: warnings
  }
}

function buildResourceProjection(resource: ResourceMetadata): LegacyV1Projection<ResourceEntity> {
  const warnings: ProjectionWarning[] = placeholderWarning(resource)
  const primary: ResourceEntity = {
    ...createBaseProjection(resource),
    entityKind: "RESOURCE",
    resourceKind: V1_RESOURCE_TYPE_TO_RESOURCE_KIND[resource.type],
    authorityPolicy: createAuthorityPolicy(resource.capabilities.requiredAuthority, resource.maxExecutionAuthority),
    automationPolicy: createAutomationPolicy(),
    supportedFrameworks: cloneDeep(resource.supportedFrameworks),
    supportedSurfaces: cloneDeep(resource.supportedSurfaces),
    supportedArtifacts: cloneDeep(resource.supportedArtifacts),
    supportedCapabilities: cloneDeep(resource.supportedCapabilities),
    compatibilityEvidenceStatus: resource.compatibilityEvidenceStatus,
    packageDescriptor:
      resource.type === "SKILL"
        ? {
            packageType: "SKILL",
            packageName: resource.name,
            packageLocator: resource.sourceUrl ?? resource.provenance
          }
        : resource.type === "PRODUCTION_PIPELINE"
          ? {
              packageType: "PIPELINE",
              packageName: resource.name,
              packageLocator: resource.sourceUrl ?? resource.provenance
            }
          : undefined
  }

  return {
    primary,
    legacySnapshot: cloneDeep(resource),
    projectionWarnings: warnings
  }
}

function buildReferenceProjection(resource: ResourceMetadata): LegacyV1Projection<ReferenceEntity> {
  const warnings: ProjectionWarning[] = placeholderWarning(resource)
  const primary: ReferenceEntity = {
    ...createBaseProjection(resource),
    entityKind: "REFERENCE",
    referenceDomain: "TECHNICAL_PATTERN",
    stageAffinity: "TARGETED_REFERENCE_GATE",
    usageMode: "LINK_OUT",
    packageDescriptor: undefined
  }

  return {
    primary,
    legacySnapshot: cloneDeep(resource),
    projectionWarnings: warnings
  }
}

function buildMethodProjection(
  resource: ResourceMetadata,
  methodDefinitions: CreativeMethodDefinition[]
): LegacyV1Projection<MethodEntity> {
  const methodDefinition = methodDefinitions.find((definition) => definition.resourceId === resource.id)
  const warnings: ProjectionWarning[] = placeholderWarning(resource)

  if (!methodDefinition) {
    warnings.push({
      code: "MISSING_METHOD_DEFINITION",
      message: `No current CreativeMethodDefinition matched resourceId ${resource.id}.`,
      resourceId: resource.id
    })
  } else if (!(resource.id in METHOD_DOMAIN_BY_RESOURCE_ID)) {
    warnings.push({
      code: "UNSUPPORTED_METHOD_DOMAIN",
      message: `No explicit method-domain mapping exists for ${resource.id}.`,
      resourceId: resource.id
    })
  }

  const resolvedMethodDefinition: CreativeMethodDefinition = methodDefinition ? cloneDeep(methodDefinition) : {
    id: resource.id,
    resourceId: resource.id,
    name: resource.name,
    version: "0.0.0",
    supportedModes: [],
    supportedPhases: [],
    capabilityGaps: [],
    requiredInputs: [],
    optionalInputs: [],
    outputSchemaId: "",
    qualityGateIds: [],
    authorityRequired: "READ_ONLY" as CreativeMethodAuthority,
    deterministic: true as const
  }

  const primary: MethodEntity = {
    ...createBaseProjection(resource),
    entityKind: "METHOD",
    methodDomain: METHOD_DOMAIN_BY_RESOURCE_ID[resource.id] ?? "ORCHESTRATION",
    authorityPolicy: createAuthorityPolicy(resource.capabilities.requiredAuthority, resource.maxExecutionAuthority),
    methodDefinitionId: resolvedMethodDefinition.id,
    methodDefinition: resolvedMethodDefinition,
    recipePromotionStatus: resource.lifecycleState === "VALIDATED" ? "VALIDATED" : "REFERENCE",
    operationDefinition: {
      operationId: resource.id,
      operationName: resource.name,
      operator: "DETERMINISTIC",
      effectClass: "NONE",
      outputRole: "ADVISORY",
      permission: "UNKNOWN"
    }
  }

  return {
    primary,
    legacySnapshot: cloneDeep(resource),
    projectionWarnings: warnings
  }
}

function buildProviderProjection(resource: ResourceMetadata): LegacyV1Projection<ProviderEntity> {
  const warnings: ProjectionWarning[] = placeholderWarning(resource)
  const primary: ProviderEntity = {
    ...createBaseProjection(resource),
    entityKind: "PROVIDER",
    providerKind: "UNSPECIFIED",
    authorityPolicy: createAuthorityPolicy(resource.capabilities.requiredAuthority, resource.maxExecutionAuthority),
    automationPolicy: createAutomationPolicy(),
    packageDescriptor: undefined
  }

  return {
    primary,
    legacySnapshot: cloneDeep(resource),
    projectionWarnings: warnings
  }
}

export function adaptV1ResourceToV2(
  resource: ResourceMetadata,
  methodDefinitions: CreativeMethodDefinition[] = METHOD_DEFINITIONS
): LegacyV1Projection {
  const kind = V1_RESOURCE_TYPE_TO_ENTITY_KIND[resource.type]
  if (kind === "SOURCE") return buildSourceProjection(resource)
  if (kind === "RESOURCE") return buildResourceProjection(resource)
  if (kind === "REFERENCE") return buildReferenceProjection(resource)
  if (kind === "METHOD") return buildMethodProjection(resource, methodDefinitions)
  return buildProviderProjection(resource)
}

export function adaptV1RegistryToV2(
  resources: readonly ResourceMetadata[] = RESOURCE_REGISTRY,
  methodDefinitions: CreativeMethodDefinition[] = METHOD_DEFINITIONS
): LegacyV1Projection[] {
  return resources.map((resource) => adaptV1ResourceToV2(resource, methodDefinitions))
}

export function cloneLibraryV2Projection<TEntity extends LibraryV2Entity>(projection: LegacyV1Projection<TEntity>): LegacyV1Projection<TEntity> {
  return {
    primary: cloneDeep(projection.primary),
    legacySnapshot: cloneDeep(projection.legacySnapshot),
    projectionWarnings: cloneDeep(projection.projectionWarnings)
  }
}

export function getV2PrimaryProjections(
  resources: readonly ResourceMetadata[] = RESOURCE_REGISTRY,
  methodDefinitions: CreativeMethodDefinition[] = METHOD_DEFINITIONS
): LibraryV2Entity[] {
  return adaptV1RegistryToV2(resources, methodDefinitions).map((projection) => projection.primary)
}
