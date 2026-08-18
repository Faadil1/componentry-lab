import type { AuthorityCeiling, ResourceEvaluation } from "../types"
import type { CreativeProjectMode, CreativeProjectPhase } from "@/lib/director/types"

export type ResourceRadarDecision =
  | "NO_SIGNAL"
  | "USE_EXISTING"
  | "EXISTING_MATCH_AUTHORITY_BLOCKED"
  | "EXISTING_MATCH_COMPATIBILITY_BLOCKED"
  | "DISCOVERY_REQUIRED"

export type ResourceSourceVerification = "INTERNAL" | "EXTERNAL_UNVERIFIED"

export interface ResourceRadarSignal {
  capabilityGap?: string
  artifactType?: string
  action?: string
}

export interface ResourceRadarInput extends ResourceRadarSignal {
  projectMode: CreativeProjectMode
  phase: CreativeProjectPhase
  currentAuthority: AuthorityCeiling
  frameworkOrSurface?: string
  evaluator?: string
  activationTags?: string[]
}

export interface ResourceRadarMatch extends ResourceEvaluation {
  authorityUsable: boolean
  compatibilityUsable: boolean
  sourceVerification: ResourceSourceVerification
  planningOnly: boolean
}

export interface ResourceRadarDiscoveryRequirement {
  capabilityGap?: string
  artifactType?: string
  action?: string
  projectMode: CreativeProjectMode
  phase: CreativeProjectPhase
  requiredAuthorityCeiling: AuthorityCeiling
  frameworkOrSurface?: string
  candidateStatus: "UNREGISTERED_DISCOVERY_REQUIREMENT"
}

export interface ResourceRadarRegistrySnapshot {
  canonicalResourceCount: number
  evaluatedResourceCount: number
  matchingResourceCount: number
  blockedResourceCount: number
  internalResourceCount: number
  externalUnverifiedResourceCount: number
}

export interface ResourceRadarSourceVerificationSummary {
  internalCount: number
  externalUnverifiedCount: number
}

export interface ResourceRadarResult {
  decision: ResourceRadarDecision
  inputFingerprint: string
  signal: ResourceRadarSignal
  existingMatches: ResourceRadarMatch[]
  topMatch: ResourceRadarMatch | null
  blockedMatches: ResourceRadarMatch[]
  discoveryRequirement: ResourceRadarDiscoveryRequirement | null
  registrySnapshot: ResourceRadarRegistrySnapshot
  sourceVerificationSummary: ResourceRadarSourceVerificationSummary
}
