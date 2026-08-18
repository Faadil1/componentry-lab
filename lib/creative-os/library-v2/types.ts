import type { AuthorityCeiling, ResourceLifecycleState, ResourceMetadata } from "../types"
import type { CreativeMethodDefinition } from "../methods/types"

export type LibraryEntityKind = "SOURCE" | "RESOURCE" | "REFERENCE" | "METHOD" | "PROVIDER"

export type MethodDomain =
  | "STRATEGY"
  | "PERCEPTUAL"
  | "CREATIVE_TRANSFORMATION"
  | "CONCEPTUAL"
  | "PRODUCTION"
  | "ORCHESTRATION"

export type SourceKind =
  | "INTERNAL"
  | "REPOSITORY"
  | "WEBSITE"
  | "MARKETPLACE"
  | "CONNECTOR"
  | "API"
  | "MCP"
  | "FEED"
  | "LOCAL"
  | "UNKNOWN"

export type ResourceKind =
  | "COMPONENT"
  | "TEMPLATE"
  | "ASSET"
  | "KNOWLEDGE"
  | "DATASET"
  | "PACKAGE"
  | "TOOL"
  | "OTHER"

export type ReferenceDomain =
  | "PRODUCT_FLOW"
  | "VISUAL_DIRECTION"
  | "DESIGN_SYSTEM"
  | "MOTION_INTERACTION"
  | "CINEMATOGRAPHY"
  | "HISTORICAL_DESIGN"
  | "CREATIVE_PATTERN"
  | "TECHNICAL_PATTERN"

export type ReferenceStageAffinity =
  | "PRODUCT_FLOW_GATE"
  | "VISUAL_DIRECTION_GATE"
  | "SYSTEM_GATE"
  | "DIFFERENTIATION_GATE"
  | "TARGETED_REFERENCE_GATE"

export type ReferenceUsageMode = "HUMAN_BROWSE" | "LINK_OUT" | "INTERNAL_CURATED" | "MACHINE_QUERYABLE"

export type AutomationOperation =
  | "BROWSE"
  | "SEARCH"
  | "METADATA_READ"
  | "CATALOG_READ"
  | "RESOURCE_FETCH"
  | "SOURCE_CODE_FETCH"
  | "MEDIA_FETCH"
  | "EXECUTE"
  | "WRITE_BACK"

export type AutomationPermission =
  | "ALLOWED"
  | "PROHIBITED"
  | "UNKNOWN"
  | "REQUIRES_PERMISSION"
  | "HUMAN_ONLY"
  | "NOT_APPLICABLE"

export type EvidenceType =
  | "PROVENANCE"
  | "LICENSE"
  | "COMPATIBILITY"
  | "CAPABILITY"
  | "TERMS"
  | "PERFORMANCE"
  | "EXECUTION"
  | "QUALITY"

export type EvidenceStatus =
  | "VERIFIED"
  | "DECLARED"
  | "OBSERVED"
  | "UNKNOWN"
  | "CONTRADICTED"
  | "NOT_APPLICABLE"

export type LicenseScope =
  | "SOURCE_SOFTWARE"
  | "RESOURCE_CODE"
  | "RESOURCE_MEDIA"
  | "METHOD_TEXT"
  | "EXAMPLES"
  | "UNKNOWN"

export type OperationOperator = "DETERMINISTIC" | "GENERATIVE_MODEL" | "HUMAN" | "EXTERNAL_PROVIDER"

export type OperationEffectClass = "NONE" | "LOCAL_REVERSIBLE" | "EXTERNAL_SIDE_EFFECT"

export type OperationOutputRole = "ADVISORY" | "INTERMEDIATE" | "ARTIFACT" | "EVIDENCE"

export type ProviderKind =
  | "MODEL"
  | "RENDERER"
  | "CODE_EXECUTOR"
  | "VIDEO"
  | "IMAGE"
  | "AUDIO"
  | "HOSTING"
  | "EXTERNAL_SERVICE"
  | "UNSPECIFIED"

export type PackageType =
  | "CODE"
  | "SKILL"
  | "MCP"
  | "CLI"
  | "NPM"
  | "REPOSITORY"
  | "CONNECTOR"
  | "WEB_APP"
  | "PROMPT_PACK"
  | "DATA_SNAPSHOT"
  | "PIPELINE"

export type DecisionStatus = "PROPOSED" | "ACCEPTED" | "REJECTED" | "SUPERSEDED"

export type DecisionOverridePolicy = "LOCKED" | "EXPLICIT_OVERRIDE" | "FREE"

export type RecipePromotionStatus = "REFERENCE" | "CANDIDATE" | "VALIDATED"

export type SourceVerificationStatus = "VERIFIED" | "DECLARED" | "LEGACY_PLACEHOLDER" | "UNKNOWN"

export interface EvidenceRecord {
  evidenceType: EvidenceType
  status: EvidenceStatus
  locator: string
  notes?: string
}

export interface LicenseEvidenceRecord extends EvidenceRecord {
  evidenceType: "LICENSE"
  scope: LicenseScope
  licenseValue: string
}

export interface AutomationPolicy {
  operations: Record<AutomationOperation, AutomationPermission>
}

export interface AuthorityPolicy {
  requestedAuthority: AuthorityCeiling
  maximumAuthority: AuthorityCeiling
  humanReviewRequired: boolean
}

export interface PackageDescriptor {
  packageType: PackageType
  packageName: string
  packageLocator?: string
  packageVersion?: string
}

export interface DecisionLineageRecord {
  decisionId: string
  status: DecisionStatus
  overridePolicy: DecisionOverridePolicy
  sourceId?: string
  notes?: string
}

export interface RecipeDefinition {
  recipeId: string
  name: string
  status: RecipePromotionStatus
  methodDomain: MethodDomain
  operationIds: string[]
  decisionLineage: DecisionLineageRecord[]
}

export interface OperationDefinition {
  operationId: string
  operationName: string
  operator: OperationOperator
  effectClass: OperationEffectClass
  outputRole: OperationOutputRole
  permission: AutomationPermission
}

export interface ProjectionWarning {
  code: "LEGACY_PLACEHOLDER_SOURCE" | "MISSING_METHOD_DEFINITION" | "UNSUPPORTED_METHOD_DOMAIN"
  message: string
  resourceId: string
}

export interface LibraryEntityBase {
  id: string
  name: string
  entityKind: LibraryEntityKind
  lifecycleState: ResourceLifecycleState
  provenance: string
  evidenceRefs: string[]
  description?: string
  tags?: string[]
  supersedes?: string[]
  supersededBy?: string[]
  statusNotes?: string
}

export interface SourceEntity extends LibraryEntityBase {
  entityKind: "SOURCE"
  sourceKind: SourceKind
  locator: string
  accessChannels: string[]
  sourceVerificationStatus: SourceVerificationStatus
  authorityPolicy: AuthorityPolicy
  automationPolicy: AutomationPolicy
  sourceIdentity?: string
  sourceUrl?: string
  compatibilityEvidenceStatus?: "VERIFIED" | "DECLARED" | "UNKNOWN" | "INCOMPATIBLE"
  packageDescriptor?: PackageDescriptor
  evidenceRecords?: EvidenceRecord[]
  licenseEvidenceRecords?: LicenseEvidenceRecord[]
}

export interface ResourceEntity extends LibraryEntityBase {
  entityKind: "RESOURCE"
  resourceKind: ResourceKind
  authorityPolicy: AuthorityPolicy
  automationPolicy: AutomationPolicy
  supportedFrameworks?: string[]
  supportedSurfaces?: string[]
  supportedArtifacts?: string[]
  supportedCapabilities?: string[]
  compatibilityEvidenceStatus?: "VERIFIED" | "DECLARED" | "UNKNOWN" | "INCOMPATIBLE"
  packageDescriptor?: PackageDescriptor
  evidenceRecords?: EvidenceRecord[]
  licenseEvidenceRecords?: LicenseEvidenceRecord[]
}

export interface ReferenceEntity extends LibraryEntityBase {
  entityKind: "REFERENCE"
  referenceDomain: ReferenceDomain
  stageAffinity: ReferenceStageAffinity
  usageMode: ReferenceUsageMode
  packageDescriptor?: PackageDescriptor
  evidenceRecords?: EvidenceRecord[]
  licenseEvidenceRecords?: LicenseEvidenceRecord[]
}

export interface MethodEntity extends LibraryEntityBase {
  entityKind: "METHOD"
  methodDomain: MethodDomain
  authorityPolicy: AuthorityPolicy
  methodDefinitionId: string
  methodDefinition: CreativeMethodDefinition
  recipePromotionStatus: RecipePromotionStatus
  operationDefinition: OperationDefinition
  packageDescriptor?: PackageDescriptor
  evidenceRecords?: EvidenceRecord[]
  licenseEvidenceRecords?: LicenseEvidenceRecord[]
}

export interface ProviderEntity extends LibraryEntityBase {
  entityKind: "PROVIDER"
  providerKind: ProviderKind
  authorityPolicy: AuthorityPolicy
  automationPolicy: AutomationPolicy
  packageDescriptor?: PackageDescriptor
  evidenceRecords?: EvidenceRecord[]
  licenseEvidenceRecords?: LicenseEvidenceRecord[]
}

export type LibraryV2Entity =
  | SourceEntity
  | ResourceEntity
  | ReferenceEntity
  | MethodEntity
  | ProviderEntity

export interface LegacyV1Projection<TEntity extends LibraryV2Entity = LibraryV2Entity> {
  primary: TEntity
  legacySnapshot: ResourceMetadata
  projectionWarnings: ProjectionWarning[]
}
