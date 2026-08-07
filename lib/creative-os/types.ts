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

export interface ActivationRule {
  requiredPhase?: CreativeProjectPhase
  requiredEvaluator?: string
  requiredTags?: string[]
}

export interface CapabilityMetadata {
  actions: string[]
  artifactTypes: string[]
  capabilityGaps: string[]
}

export interface ResourceMetadata {
  id: string
  name: string
  type: ResourceType
  lifecycleState: ResourceLifecycleState
  authorityCeiling: AuthorityCeiling
  license: string
  provenance: string
  sourceUrl?: string
  modes: CreativeProjectMode[]
  capabilities: CapabilityMetadata
  activationRules: ActivationRule[]
  // Security levels (LEVEL_2/LEVEL_3 are strictly inaccessible at runtime)
  level2Data?: {
    operationalInstructions: string
  }
  level3Data?: {
    providerManifest: Record<string, unknown>
  }
}

export interface ResourceEvaluation {
  resourceId: string
  name: string
  type: ResourceType
  lifecycleState: ResourceLifecycleState
  authorityCeiling: AuthorityCeiling
  isRecommendable: boolean
  suitabilityScore: number
  rejectionReason?: string
  matchingCapabilities: string[]
  progressiveLoadLevel: ProgressiveLoadLevel
}

export interface RouterInputs {
  projectMode: CreativeProjectMode
  phase: CreativeProjectPhase
  artifactType?: string
  evaluator?: string
  capabilityGap?: string
  activationTags?: string[]
  lifecycleState?: ResourceLifecycleState
  authorityCeiling?: AuthorityCeiling
}
