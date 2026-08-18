import type { AuthorityCeiling, ResourceLifecycleState } from "../../../lib/creative-os/types"
import type { CreativeMethodDefinition } from "../../../lib/creative-os/methods/types"
import {
  LIBRARY_V2_ENTITY_KINDS,
  type AutomationPolicy,
  type AuthorityPolicy,
  type EvidenceRecord,
  type EvidenceStatus,
  type LicenseEvidenceRecord,
  type LibraryEntityKind,
  type LibraryV2Entity,
  type LibraryV2ReadModel,
  type MethodDomain,
  type OperationDefinition,
  type PackageDescriptor,
  type ProjectionWarning,
  type ProviderKind,
  type ReferenceDomain,
  type ReferenceStageAffinity,
  type ReferenceUsageMode,
  type ResourceKind,
  type RecipePromotionStatus,
  type SourceKind,
  type SourceVerificationStatus,
} from "../../../lib/creative-os/library-v2"

export type RegistryV2AuthoritySignal =
  | {
      readonly kind: "MODELED"
      readonly maximumAuthority: AuthorityCeiling
    }
  | {
      readonly kind: "NOT_MODELED"
    }

export type RegistryV2EvidenceSignal = {
  readonly evidenceStatuses: readonly EvidenceStatus[]
  readonly licenseStatuses: readonly EvidenceStatus[]
  readonly sourceVerificationStatus: SourceVerificationStatus | null
  readonly compatibilityEvidenceStatus:
    | "VERIFIED"
    | "DECLARED"
    | "UNKNOWN"
    | "INCOMPATIBLE"
    | null
}

export type RegistryV2WarningSummary = {
  readonly total: number
  readonly byEntityId: Readonly<Record<string, number>>
}

type RegistryV2CommonDetail = {
  readonly entityKind: LibraryEntityKind
  readonly provenance: string
  readonly evidenceRecords: readonly EvidenceRecord[]
  readonly licenseEvidenceRecords: readonly LicenseEvidenceRecord[]
  readonly packageDescriptor?: PackageDescriptor
  readonly warnings: readonly ProjectionWarning[]
}

export type RegistryV2SourceDetail = RegistryV2CommonDetail & {
  readonly entityKind: "SOURCE"
  readonly sourceKind: SourceKind
  readonly locator: string
  readonly sourceUrl?: string
  readonly sourceVerificationStatus: SourceVerificationStatus
  readonly compatibilityEvidenceStatus:
    | "VERIFIED"
    | "DECLARED"
    | "UNKNOWN"
    | "INCOMPATIBLE"
    | null
  readonly authorityPolicy: AuthorityPolicy
  readonly automationPolicy: AutomationPolicy
}

export type RegistryV2ResourceDetail = RegistryV2CommonDetail & {
  readonly entityKind: "RESOURCE"
  readonly resourceKind: ResourceKind
  readonly authorityPolicy: AuthorityPolicy
  readonly automationPolicy: AutomationPolicy
  readonly compatibilityEvidenceStatus:
    | "VERIFIED"
    | "DECLARED"
    | "UNKNOWN"
    | "INCOMPATIBLE"
    | null
  readonly supportedFrameworks?: readonly string[]
  readonly supportedSurfaces?: readonly string[]
  readonly supportedArtifacts?: readonly string[]
  readonly supportedCapabilities?: readonly string[]
}

export type RegistryV2ReferenceDetail = RegistryV2CommonDetail & {
  readonly entityKind: "REFERENCE"
  readonly referenceDomain: ReferenceDomain
  readonly stageAffinity: ReferenceStageAffinity
  readonly usageMode: ReferenceUsageMode
}

export type RegistryV2MethodDetail = RegistryV2CommonDetail & {
  readonly entityKind: "METHOD"
  readonly methodDomain: MethodDomain
  readonly authorityPolicy: AuthorityPolicy
  readonly methodDefinition: CreativeMethodDefinition
  readonly recipePromotionStatus: RecipePromotionStatus
  readonly operationDefinition: OperationDefinition
}

export type RegistryV2ProviderDetail = RegistryV2CommonDetail & {
  readonly entityKind: "PROVIDER"
  readonly providerKind: ProviderKind
  readonly authorityPolicy: AuthorityPolicy
  readonly automationPolicy: AutomationPolicy
}

export type RegistryV2Detail =
  | RegistryV2SourceDetail
  | RegistryV2ResourceDetail
  | RegistryV2ReferenceDetail
  | RegistryV2MethodDetail
  | RegistryV2ProviderDetail

export type RegistryV2Row = {
  readonly id: string
  readonly name: string
  readonly entityKind: LibraryEntityKind
  readonly subtypeLabel: string
  readonly lifecycleState: ResourceLifecycleState
  readonly authority: RegistryV2AuthoritySignal
  readonly provenance: string
  readonly evidence: RegistryV2EvidenceSignal
  readonly warningCount: number
  readonly detail: RegistryV2Detail | null
}

export type RegistryV2Section = {
  readonly entityKind: LibraryEntityKind
  readonly label: string
  readonly count: number
  readonly rows: readonly RegistryV2Row[]
}

export type RegistryV2Summary = {
  readonly total: number
  readonly countsByKind: Readonly<Record<LibraryEntityKind, number>>
  readonly methodCountsByDomain: Readonly<Record<MethodDomain, number>>
  readonly warningCount: number
}

export type RegistryV2ViewModel = {
  readonly valid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly ProjectionWarning[]
  readonly summary: RegistryV2Summary
  readonly sections: readonly RegistryV2Section[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item)
    }
    return Object.freeze(value)
  }

  if (isRecord(value)) {
    for (const item of Object.values(value)) {
      deepFreeze(item)
    }
    return Object.freeze(value)
  }

  return value
}

function clonePlainData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => clonePlainData(item)) as T
  }

  if (isRecord(value)) {
    const clone: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      clone[key] = clonePlainData(item)
    }
    return clone as T
  }

  return value
}

function createZeroCountsByKind(): Readonly<Record<LibraryEntityKind, number>> {
  return deepFreeze({
    SOURCE: 0,
    RESOURCE: 0,
    REFERENCE: 0,
    METHOD: 0,
    PROVIDER: 0
  })
}

function createZeroMethodCountsByDomain(): Readonly<Record<MethodDomain, number>> {
  return deepFreeze({
    STRATEGY: 0,
    PERCEPTUAL: 0,
    CREATIVE_TRANSFORMATION: 0,
    CONCEPTUAL: 0,
    PRODUCTION: 0,
    ORCHESTRATION: 0
  })
}

function uniqueStable<T>(items: readonly T[]): T[] {
  const seen = new Set<T>()
  const result: T[] = []
  for (const item of items) {
    if (seen.has(item)) continue
    seen.add(item)
    result.push(item)
  }
  return result
}

function buildAuthoritySignal(entity: LibraryV2Entity): RegistryV2AuthoritySignal {
  if ("authorityPolicy" in entity) {
    return {
      kind: "MODELED",
      maximumAuthority: entity.authorityPolicy.maximumAuthority
    }
  }
  return { kind: "NOT_MODELED" }
}

function buildEvidenceSignal(entity: LibraryV2Entity): RegistryV2EvidenceSignal {
  const evidenceStatuses = uniqueStable((entity.evidenceRecords ?? []).map((record) => record.status))
  const licenseStatuses = uniqueStable((entity.licenseEvidenceRecords ?? []).map((record) => record.status))
  const sourceVerificationStatus = entity.entityKind === "SOURCE" ? entity.sourceVerificationStatus : null
  const compatibilityEvidenceStatus =
    entity.entityKind === "SOURCE" || entity.entityKind === "RESOURCE"
      ? entity.compatibilityEvidenceStatus ?? null
      : null

  return deepFreeze({
    evidenceStatuses,
    licenseStatuses,
    sourceVerificationStatus,
    compatibilityEvidenceStatus
  })
}

function buildWarningsForEntity(warnings: readonly ProjectionWarning[], entityId: string): readonly ProjectionWarning[] {
  return warnings.filter((warning) => warning.resourceId === entityId).map((warning) => clonePlainData(warning))
}

function buildSubtypeLabel(entity: LibraryV2Entity): string {
  switch (entity.entityKind) {
    case "SOURCE":
      return entity.sourceKind
    case "RESOURCE":
      return entity.resourceKind
    case "REFERENCE":
      return entity.referenceDomain
    case "METHOD":
      return entity.methodDomain
    case "PROVIDER":
      return entity.providerKind
  }
}

function buildDetail(entity: LibraryV2Entity, warnings: readonly ProjectionWarning[]): RegistryV2Detail {
  const base = {
    entityKind: entity.entityKind,
    provenance: entity.provenance,
    evidenceRecords: clonePlainData(entity.evidenceRecords ?? []),
    licenseEvidenceRecords: clonePlainData(entity.licenseEvidenceRecords ?? []),
    warnings: clonePlainData(warnings)
  } as const

  switch (entity.entityKind) {
    case "SOURCE":
      return deepFreeze({
        ...base,
        entityKind: "SOURCE",
        sourceKind: entity.sourceKind,
        locator: entity.locator,
        ...(entity.packageDescriptor ? { packageDescriptor: clonePlainData(entity.packageDescriptor) } : {}),
        ...(entity.sourceUrl ? { sourceUrl: entity.sourceUrl } : {}),
        sourceVerificationStatus: entity.sourceVerificationStatus,
        compatibilityEvidenceStatus: entity.compatibilityEvidenceStatus ?? null,
        authorityPolicy: clonePlainData(entity.authorityPolicy),
        automationPolicy: clonePlainData(entity.automationPolicy)
      })
    case "RESOURCE":
      return deepFreeze({
        ...base,
        entityKind: "RESOURCE",
        resourceKind: entity.resourceKind,
        authorityPolicy: clonePlainData(entity.authorityPolicy),
        automationPolicy: clonePlainData(entity.automationPolicy),
        compatibilityEvidenceStatus: entity.compatibilityEvidenceStatus ?? null,
        ...(entity.packageDescriptor ? { packageDescriptor: clonePlainData(entity.packageDescriptor) } : {}),
        ...(entity.supportedFrameworks ? { supportedFrameworks: clonePlainData(entity.supportedFrameworks) } : {}),
        ...(entity.supportedSurfaces ? { supportedSurfaces: clonePlainData(entity.supportedSurfaces) } : {}),
        ...(entity.supportedArtifacts ? { supportedArtifacts: clonePlainData(entity.supportedArtifacts) } : {}),
        ...(entity.supportedCapabilities ? { supportedCapabilities: clonePlainData(entity.supportedCapabilities) } : {})
      })
    case "REFERENCE":
      return deepFreeze({
        ...base,
        entityKind: "REFERENCE",
        referenceDomain: entity.referenceDomain,
        stageAffinity: entity.stageAffinity,
        usageMode: entity.usageMode,
        ...(entity.packageDescriptor ? { packageDescriptor: clonePlainData(entity.packageDescriptor) } : {})
      })
    case "METHOD":
      return deepFreeze({
        ...base,
        entityKind: "METHOD",
        methodDomain: entity.methodDomain,
        authorityPolicy: clonePlainData(entity.authorityPolicy),
        methodDefinition: clonePlainData(entity.methodDefinition),
        recipePromotionStatus: entity.recipePromotionStatus,
        operationDefinition: clonePlainData(entity.operationDefinition),
        ...(entity.packageDescriptor ? { packageDescriptor: clonePlainData(entity.packageDescriptor) } : {})
      })
    case "PROVIDER":
      return deepFreeze({
        ...base,
        entityKind: "PROVIDER",
        providerKind: entity.providerKind,
        authorityPolicy: clonePlainData(entity.authorityPolicy),
        automationPolicy: clonePlainData(entity.automationPolicy),
        ...(entity.packageDescriptor ? { packageDescriptor: clonePlainData(entity.packageDescriptor) } : {})
      })
  }
}

function buildRow(entity: LibraryV2Entity, allWarnings: readonly ProjectionWarning[]): RegistryV2Row {
  const rowWarnings = buildWarningsForEntity(allWarnings, entity.id)
  return deepFreeze({
    id: entity.id,
    name: entity.name,
    entityKind: entity.entityKind,
    subtypeLabel: buildSubtypeLabel(entity),
    lifecycleState: entity.lifecycleState,
    authority: buildAuthoritySignal(entity),
    provenance: entity.provenance,
    evidence: buildEvidenceSignal(entity),
    warningCount: rowWarnings.length,
    detail: buildDetail(entity, rowWarnings)
  })
}

function buildSection(
  entityKind: LibraryEntityKind,
  entities: readonly LibraryV2Entity[],
  warnings: readonly ProjectionWarning[]
): RegistryV2Section {
  const rows = entities
    .filter((entity) => entity.entityKind === entityKind)
    .map((entity) => buildRow(entity, warnings))

  const labels: Record<LibraryEntityKind, string> = {
    SOURCE: "Sources",
    RESOURCE: "Resources",
    REFERENCE: "References",
    METHOD: "Methods",
    PROVIDER: "Providers"
  }

  return deepFreeze({
    entityKind,
    label: labels[entityKind],
    count: rows.length,
    rows
  })
}

export function buildRegistryV2ViewModel(model: LibraryV2ReadModel): RegistryV2ViewModel {
  const sectionsOrder = LIBRARY_V2_ENTITY_KINDS

  if (!model.valid) {
    return deepFreeze({
      valid: false,
      errors: deepFreeze(clonePlainData(model.errors)),
      warnings: deepFreeze(clonePlainData(model.warnings)),
      summary: deepFreeze({
        total: 0,
        countsByKind: createZeroCountsByKind(),
        methodCountsByDomain: createZeroMethodCountsByDomain(),
        warningCount: model.warnings.length
      }),
      sections: deepFreeze(
        sectionsOrder.map((entityKind) =>
          deepFreeze({
            entityKind,
            label:
              entityKind === "SOURCE"
                ? "Sources"
                : entityKind === "RESOURCE"
                  ? "Resources"
                  : entityKind === "REFERENCE"
                    ? "References"
                    : entityKind === "METHOD"
                      ? "Methods"
                      : "Providers",
            count: 0,
            rows: deepFreeze([])
          })
        )
      )
    })
  }

  const sections = sectionsOrder.map((entityKind) => buildSection(entityKind, model.entities, model.warnings))

  return deepFreeze({
    valid: true,
    errors: deepFreeze(clonePlainData(model.errors)),
    warnings: deepFreeze(clonePlainData(model.warnings)),
    summary: deepFreeze({
      total: model.entities.length,
      countsByKind: deepFreeze(clonePlainData(model.countsByKind)),
      methodCountsByDomain: deepFreeze(clonePlainData(model.methodCountsByDomain)),
      warningCount: model.warnings.length
    }),
    sections: deepFreeze(sections)
  })
}

export type { AuthorityCeiling, ResourceLifecycleState, MethodDomain, ProjectionWarning }