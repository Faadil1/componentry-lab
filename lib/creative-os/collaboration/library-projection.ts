import { registryComponents } from "../../registry/components"
import { validateRegistry } from "../../registry/validation"
import type { RegistryEntry } from "../../registry/types"
import { buildLiveLibraryV2ReadModel } from "../library-v2/read-model"
import type { LibraryV2Entity } from "../library-v2/types"
import type { AuthorityCeiling, ResourceLifecycleState } from "../types"

export type LibraryIdentityNamespace = "CREATIVE_OS_REGISTRY_V2" | "COMPONENT_LIBRARY"

export type GovernedCollaborationAccess =
  | "INTERNAL_ADVISORY_EXECUTION"
  | "READ_DISCOVERY_ONLY"
  | "NOT_EXECUTABLE"

export interface GovernedCapabilityDescriptor {
  namespace: "CREATIVE_OS_REGISTRY_V2"
  canonicalRef: string
  entityId: string
  name: string
  entityKind: LibraryV2Entity["entityKind"]
  lifecycleState: ResourceLifecycleState
  authorityCeiling: AuthorityCeiling | "NOT_MODELED"
  provenance: string
  evidenceRefs: readonly string[]
  collaborationAccess: GovernedCollaborationAccess
  supportedModes: readonly string[]
  supportedPhases: readonly string[]
  capabilityGaps: readonly string[]
  operationEffectClass: string | null
  limitations: readonly string[]
}

export interface CompositionRelationDescriptor {
  type: string
  targetRef: string
}

export interface CompositionDescriptor {
  namespace: "COMPONENT_LIBRARY"
  canonicalRef: string
  legacyEntryId: string
  label: string
  kind: RegistryEntry["kind"]
  categoryId: RegistryEntry["categoryId"]
  maturity: RegistryEntry["maturity"]
  capabilities: readonly string[]
  runtimes: readonly string[]
  supportedViewports: readonly string[]
  deterministic: boolean
  captureReady: boolean
  ssrSafe: boolean
  sourcePaths: readonly string[]
  relations: readonly CompositionRelationDescriptor[]
  limitations: readonly string[]
  recommendedFor: readonly string[]
  avoidFor: readonly string[]
  memoryHook: string | null
  signatureInteraction: string | null
  signatureFrame: string | null
}

export type LibraryCrosswalkRelationship =
  | "SAME_UNDERLYING_CAPABILITY"
  | "GOVERNED_METHOD_INFORMS_COMPOSITION"
  | "GOVERNED_RESOURCE_SUPPORTS_COMPOSITION"
  | "GOVERNED_REFERENCE_INFORMS_COMPOSITION"

export interface LibraryCrosswalkRecord {
  legacyEntryId: string
  governedEntityId: string
  relationship: LibraryCrosswalkRelationship
  evidenceRefs: readonly string[]
  notes?: string
}

export interface DualLibraryProjection {
  valid: boolean
  errors: readonly string[]
  warnings: readonly string[]
  governedCapabilities: readonly GovernedCapabilityDescriptor[]
  compositions: readonly CompositionDescriptor[]
  crosswalks: readonly LibraryCrosswalkRecord[]
  unmappedCompositionRefs: readonly string[]
  counts: {
    governedCapabilities: number
    compositions: number
    explicitCrosswalks: number
  }
}

const EXECUTABLE_METHOD_LIFECYCLES = new Set<ResourceLifecycleState>(["VALIDATED", "APPROVED"])

function cloneStrings(values: readonly string[] | undefined): string[] {
  return values ? [...values] : []
}

function authorityCeiling(entity: LibraryV2Entity): AuthorityCeiling | "NOT_MODELED" {
  if (entity.entityKind === "REFERENCE") return "NOT_MODELED"
  return entity.authorityPolicy.maximumAuthority
}

function isInternalAdvisoryMethod(entity: LibraryV2Entity): boolean {
  return (
    entity.entityKind === "METHOD" &&
    EXECUTABLE_METHOD_LIFECYCLES.has(entity.lifecycleState) &&
    entity.methodDefinition.deterministic === true &&
    entity.operationDefinition.operator === "DETERMINISTIC" &&
    entity.operationDefinition.effectClass === "NONE" &&
    entity.operationDefinition.outputRole === "ADVISORY" &&
    (entity.methodDefinition.authorityRequired === "READ_ONLY" || entity.methodDefinition.authorityRequired === "SUGGEST")
  )
}

function collaborationAccess(entity: LibraryV2Entity): GovernedCollaborationAccess {
  if (isInternalAdvisoryMethod(entity)) return "INTERNAL_ADVISORY_EXECUTION"
  if (entity.entityKind === "REFERENCE") return "READ_DISCOVERY_ONLY"
  if (entity.entityKind === "SOURCE" || entity.entityKind === "RESOURCE" || entity.entityKind === "PROVIDER") {
    return "READ_DISCOVERY_ONLY"
  }
  return "NOT_EXECUTABLE"
}

export function projectGovernedCapability(entity: LibraryV2Entity): GovernedCapabilityDescriptor {
  const methodDefinition = entity.entityKind === "METHOD" ? entity.methodDefinition : null
  return {
    namespace: "CREATIVE_OS_REGISTRY_V2",
    canonicalRef: `creative-os-registry-v2:${entity.id}`,
    entityId: entity.id,
    name: entity.name,
    entityKind: entity.entityKind,
    lifecycleState: entity.lifecycleState,
    authorityCeiling: authorityCeiling(entity),
    provenance: entity.provenance,
    evidenceRefs: cloneStrings(entity.evidenceRefs),
    collaborationAccess: collaborationAccess(entity),
    supportedModes: methodDefinition ? cloneStrings(methodDefinition.supportedModes) : [],
    supportedPhases: methodDefinition ? cloneStrings(methodDefinition.supportedPhases) : [],
    capabilityGaps: methodDefinition ? cloneStrings(methodDefinition.capabilityGaps) : [],
    operationEffectClass: entity.entityKind === "METHOD" ? entity.operationDefinition.effectClass : null,
    limitations: entity.statusNotes ? [entity.statusNotes] : []
  }
}

export function projectCompositionEntry(entry: RegistryEntry): CompositionDescriptor {
  return {
    namespace: "COMPONENT_LIBRARY",
    canonicalRef: `component-library:${entry.id}`,
    legacyEntryId: entry.id,
    label: entry.label,
    kind: entry.kind,
    categoryId: entry.categoryId,
    maturity: entry.maturity,
    capabilities: cloneStrings(entry.capabilities),
    runtimes: cloneStrings(entry.runtimes),
    supportedViewports: cloneStrings(entry.supportedViewports),
    deterministic: entry.deterministic,
    captureReady: entry.captureReady,
    ssrSafe: entry.ssrSafe,
    sourcePaths: cloneStrings(entry.sourcePaths),
    relations: entry.relations.map((relation) => ({
      type: relation.type,
      targetRef: `component-library:${relation.targetId}`
    })),
    limitations: cloneStrings(entry.limitations),
    recommendedFor: cloneStrings(entry.recommendedFor),
    avoidFor: cloneStrings(entry.avoidFor),
    memoryHook: entry.memoryHook ?? null,
    signatureInteraction: entry.signatureInteraction ?? null,
    signatureFrame: entry.signatureFrame ?? null
  }
}

export function validateLibraryCrosswalks(
  crosswalks: readonly LibraryCrosswalkRecord[],
  governedEntities: readonly LibraryV2Entity[],
  legacyEntries: readonly RegistryEntry[] = registryComponents
): readonly string[] {
  const errors: string[] = []
  const governedIds = new Set(governedEntities.map((entity) => entity.id))
  const legacyIds = new Set(legacyEntries.map((entry) => entry.id))
  const pairs = new Set<string>()

  for (const record of crosswalks) {
    if (!legacyIds.has(record.legacyEntryId)) {
      errors.push(`crosswalk legacyEntryId not found: ${record.legacyEntryId}`)
    }
    if (!governedIds.has(record.governedEntityId)) {
      errors.push(`crosswalk governedEntityId not found: ${record.governedEntityId}`)
    }
    if (record.evidenceRefs.length === 0) {
      errors.push(`crosswalk requires evidenceRefs: ${record.legacyEntryId} -> ${record.governedEntityId}`)
    }
    const pair = `${record.legacyEntryId}->${record.governedEntityId}`
    if (pairs.has(pair)) errors.push(`duplicate crosswalk pair: ${pair}`)
    pairs.add(pair)
  }

  return errors.sort((a, b) => a.localeCompare(b))
}

export function buildDualLibraryProjection(
  crosswalks: readonly LibraryCrosswalkRecord[] = []
): DualLibraryProjection {
  const governedModel = buildLiveLibraryV2ReadModel()
  const compositionIntegrity = validateRegistry()
  const errors = [
    ...governedModel.errors,
    ...compositionIntegrity.errors
  ]

  if (!governedModel.valid || !compositionIntegrity.valid) {
    return {
      valid: false,
      errors,
      warnings: [
        ...governedModel.warnings.map((warning) => warning.message),
        ...compositionIntegrity.warnings
      ],
      governedCapabilities: [],
      compositions: [],
      crosswalks: [],
      unmappedCompositionRefs: [],
      counts: { governedCapabilities: 0, compositions: 0, explicitCrosswalks: 0 }
    }
  }

  const crosswalkErrors = validateLibraryCrosswalks(crosswalks, governedModel.entities)
  errors.push(...crosswalkErrors)

  const governedCapabilities = governedModel.entities
    .map((entity) => projectGovernedCapability(entity))
    .sort((a, b) => a.canonicalRef.localeCompare(b.canonicalRef))
  const compositions = registryComponents
    .map((entry) => projectCompositionEntry(entry))
    .sort((a, b) => a.canonicalRef.localeCompare(b.canonicalRef))
  const mappedLegacyIds = new Set(crosswalks.map((record) => record.legacyEntryId))
  const unmappedCompositionRefs = compositions
    .filter((entry) => !mappedLegacyIds.has(entry.legacyEntryId))
    .map((entry) => entry.canonicalRef)

  return {
    valid: errors.length === 0,
    errors,
    warnings: [
      ...governedModel.warnings.map((warning) => warning.message),
      ...compositionIntegrity.warnings
    ],
    governedCapabilities,
    compositions,
    crosswalks: crosswalkErrors.length === 0 ? [...crosswalks] : [],
    unmappedCompositionRefs,
    counts: {
      governedCapabilities: governedCapabilities.length,
      compositions: compositions.length,
      explicitCrosswalks: crosswalkErrors.length === 0 ? crosswalks.length : 0
    }
  }
}
