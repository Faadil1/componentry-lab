import type { CreativeProjectMode, CreativeProjectPhase } from "@/lib/director/types"

export type ResourceType =
  | "CORE_METHOD"
  | "KNOWLEDGE_PACK"
  | "SKILL"
  | "PROVIDER"
  | "COMPONENT_SOURCE"
  | "PRODUCTION_PIPELINE"
  | "DISCOVERY_FEED"
  | "REFERENCE_ONLY"

export type ResourceLifecycleState =
  | "CAPTURED"
  | "AUDITED"
  | "TEST_CANDIDATE"
  | "TESTING"
  | "VALIDATED"
  | "APPROVED"
  | "DEPRECATED"
  | "SUPERSEDED"
  | "REJECTED"

export type AuthorityCeiling =
  | "READ_ONLY"
  | "SUGGEST"
  | "PREPARE"
  | "LOCAL_REVERSIBLE"
  | "EXPLICIT_EXTERNAL"
  | "PROHIBITED"

export type ProgressiveLoadLevel =
  | "LEVEL_0_METADATA"
  | "LEVEL_1_CAPABILITY_CARD"
  | "LEVEL_2_OPERATIONAL_INSTRUCTIONS"
  | "LEVEL_3_PROVIDER_MANIFEST"

export type RecommendationLabel =
  | "APPROVED_RECOMMENDATION"
  | "VALIDATED_FALLBACK"
  | "EXPERIMENTAL_CANDIDATE"
  | "DISCOVERY_ONLY"
  | "NO_MATCH"

export interface ActivationRule {
  requiredPhase?: CreativeProjectPhase
  requiredEvaluator?: string
  requiredTags?: string[]
}

export interface CapabilityMetadata {
  actions: string[]
  artifactTypes: string[]
  capabilityGaps: string[]
  requiredAuthority: AuthorityCeiling
}

export interface ResourceMetadata {
  id: string
  name: string
  type: ResourceType
  lifecycleState: ResourceLifecycleState
  maxExecutionAuthority: AuthorityCeiling
  license: string
  provenance: string
  sourceUrl?: string
  modes: CreativeProjectMode[]
  capabilities: CapabilityMetadata
  activationRules: ActivationRule[]
  level2Data?: {
    operationalInstructions: string
  }
  level3Data?: {
    providerManifest: Record<string, unknown>
  }
  // V2 Extension: Compatibility Governance
  supportedFrameworks?: string[]
  supportedSurfaces?: string[]
  supportedArtifacts?: string[]
  supportedCapabilities?: string[]
  compatibilityEvidenceStatus?: "VERIFIED" | "DECLARED" | "UNKNOWN" | "INCOMPATIBLE"
}

export interface ResourceEvaluation {
  resourceId: string
  name: string
  type: ResourceType
  lifecycleState: ResourceLifecycleState
  maxExecutionAuthority: AuthorityCeiling
  isRecommendable: boolean
  suitabilityScore: number
  rejectionReason?: string
  matchingCapabilities: string[]
  progressiveLoadLevel: ProgressiveLoadLevel
  recommendationLabel: RecommendationLabel
}

export interface RouterInputs {
  projectMode: CreativeProjectMode
  phase: CreativeProjectPhase
  artifactType?: string
  evaluator?: string
  frameworkOrSurface?: string
  capabilityGap?: string
  activationTags?: string[]
  lifecycleState?: ResourceLifecycleState
  currentAuthority?: AuthorityCeiling
}
