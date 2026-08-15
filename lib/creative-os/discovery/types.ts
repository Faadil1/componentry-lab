import type { ResourceRadarDiscoveryRequirement } from "../radar/types"

export type ResourceDiscoverySourceKind =
  | "GITHUB_REPOSITORY"
  | "NPM_PACKAGE"
  | "DOCUMENTATION"
  | "WEBSITE"
  | "MANUAL_REFERENCE"
  | "UNKNOWN"

export type ResourceDiscoveryVerificationStatus =
  | "UNVERIFIED"
  | "SOURCE_OBSERVED"
  | "IDENTITY_CORROBORATED"

export type ResourceDiscoveryEvidenceKind =
  | "SOURCE_OBSERVATION"
  | "IDENTITY_CORROBORATION"
  | "PACKAGE_METADATA"
  | "REPOSITORY_METADATA"
  | "DOCUMENTATION_REFERENCE"

export type ResourceDiscoveryCandidateStatus = "UNREGISTERED_CANDIDATE"
export type ResourceDiscoveryRegistrationStatus = "NOT_REGISTERED"
export type ResourceDiscoveryExecutionStatus = "NOT_EXECUTABLE"
export type ResourceDiscoveryNextAction = "NO_CANDIDATES" | "HUMAN_REVIEW_REQUIRED"

export interface ResourceDiscoveryEvidence {
  evidenceKind: ResourceDiscoveryEvidenceKind
  locator?: string
  observedIdentity?: string
  details?: Record<string, unknown>
}

export interface ResourceDiscoveryCandidateInput {
  name?: string
  sourceKind: ResourceDiscoverySourceKind
  sourceLocator?: string
  sourceIdentity?: string
  provenanceClaim?: string
  licenseClaim?: string
  claimedActions?: string[]
  claimedArtifactTypes?: string[]
  claimedCapabilityGaps?: string[]
  claimedFrameworks?: string[]
  evidence?: ResourceDiscoveryEvidence[]
}

export interface ResourceDiscoveryMatchingSignals {
  claimedActions: string[]
  claimedArtifactTypes: string[]
  claimedCapabilityGaps: string[]
  claimedFrameworks: string[]
}

export interface ResourceDiscoveryCanonicalCollision {
  matched: boolean
  resourceId?: string
}

export interface ResourceDiscoveryCandidate {
  candidateId: string
  candidateStatus: ResourceDiscoveryCandidateStatus
  registrationStatus: ResourceDiscoveryRegistrationStatus
  executionStatus: ResourceDiscoveryExecutionStatus
  requiresHumanReview: true
  name?: string
  sourceKind: ResourceDiscoverySourceKind
  sourceLocator?: string
  sourceIdentity?: string
  provenanceClaim?: string
  licenseClaim?: string
  claimedActions?: string[]
  claimedArtifactTypes?: string[]
  claimedCapabilityGaps?: string[]
  claimedFrameworks?: string[]
  evidence?: ResourceDiscoveryEvidence[]
  discoveryRelevanceScore: number
  matchingClaimedSignals: ResourceDiscoveryMatchingSignals
  verificationStatus: ResourceDiscoveryVerificationStatus
  verificationConfidence: number
  canonicalResourceMatchId: string | null
  canonicalCollision: ResourceDiscoveryCanonicalCollision
}

export interface ResourceDiscoveryVerificationSummary {
  candidateCount: number
  unverifiedCount: number
  sourceObservedCount: number
  identityCorroboratedCount: number
  canonicalCollisionCount: number
}

export interface ResourceDiscoveryResult {
  requirementFingerprint: string
  requirement: ResourceRadarDiscoveryRequirement
  candidateCount: number
  relevantCandidates: ResourceDiscoveryCandidate[]
  nonMatchingCandidates: ResourceDiscoveryCandidate[]
  canonicalCollisionCount: number
  verificationSummary: ResourceDiscoveryVerificationSummary
  nextAction: ResourceDiscoveryNextAction
}
