import crypto from "crypto"
import { RESOURCE_REGISTRY } from "../registry"
import type { ResourceRadarDiscoveryRequirement } from "../radar/types"
import type {
  ResourceDiscoveryCandidate,
  ResourceDiscoveryCandidateInput,
  ResourceDiscoveryEvidence,
  ResourceDiscoveryMatchingSignals,
  ResourceDiscoveryResult,
  ResourceDiscoveryVerificationStatus
} from "./types"

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null"
  if (typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`
  }
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`
}

function fingerprint(value: unknown): string {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex")
}

function normalizeText(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function normalizeList(values: string[] | undefined): string[] | undefined {
  if (!values) return undefined
  const normalized = values.map((value) => normalizeText(value)).filter((value): value is string => Boolean(value))
  if (normalized.length === 0) return undefined
  return Array.from(new Set(normalized)).sort((a, b) => a.localeCompare(b))
}

function normalizeEvidence(evidence: ResourceDiscoveryEvidence[] | undefined): ResourceDiscoveryEvidence[] | undefined {
  if (!evidence) return undefined
  const normalized = evidence
    .map((item) => ({
      evidenceKind: item.evidenceKind,
      locator: normalizeText(item.locator),
      observedIdentity: normalizeText(item.observedIdentity),
      details: item.details
    }))
    .sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)))
  return normalized.length > 0 ? normalized : undefined
}

function normalizeCandidate(input: ResourceDiscoveryCandidateInput): ResourceDiscoveryCandidateInput {
  return {
    name: normalizeText(input.name),
    sourceKind: input.sourceKind,
    sourceLocator: normalizeText(input.sourceLocator),
    sourceIdentity: normalizeText(input.sourceIdentity),
    provenanceClaim: normalizeText(input.provenanceClaim),
    licenseClaim: normalizeText(input.licenseClaim),
    claimedActions: normalizeList(input.claimedActions),
    claimedArtifactTypes: normalizeList(input.claimedArtifactTypes),
    claimedCapabilityGaps: normalizeList(input.claimedCapabilityGaps),
    claimedFrameworks: normalizeList(input.claimedFrameworks),
    evidence: normalizeEvidence(input.evidence)
  }
}

function normalizeRequirement(requirement: ResourceRadarDiscoveryRequirement): ResourceRadarDiscoveryRequirement {
  return {
    ...requirement,
    capabilityGap: normalizeText(requirement.capabilityGap),
    artifactType: normalizeText(requirement.artifactType),
    action: normalizeText(requirement.action),
    frameworkOrSurface: normalizeText(requirement.frameworkOrSurface)
  }
}

function candidateIdentitySignature(candidate: ResourceDiscoveryCandidateInput): string {
  return stableStringify({
    name: candidate.name,
    sourceKind: candidate.sourceKind,
    sourceLocator: candidate.sourceLocator,
    sourceIdentity: candidate.sourceIdentity,
    provenanceClaim: candidate.provenanceClaim,
    licenseClaim: candidate.licenseClaim,
    claimedActions: candidate.claimedActions,
    claimedArtifactTypes: candidate.claimedArtifactTypes,
    claimedCapabilityGaps: candidate.claimedCapabilityGaps,
    claimedFrameworks: candidate.claimedFrameworks
  })
}

function createCandidateId(candidate: ResourceDiscoveryCandidateInput): string {
  return `candidate_${fingerprint(candidateIdentitySignature(candidate))}`
}

function evidenceMatchesLocator(evidence: ResourceDiscoveryEvidence, locator?: string): boolean {
  if (!locator || !evidence.locator) return false
  return evidence.locator === locator
}

function determineVerificationStatus(candidate: ResourceDiscoveryCandidateInput): {
  status: ResourceDiscoveryVerificationStatus
  confidence: number
} {
  const evidence = candidate.evidence ?? []
  const normalizedSourceIdentity = normalizeText(candidate.sourceIdentity)
  const normalizedName = normalizeText(candidate.name)
  const sourceObservation = evidence.find((item) => item.evidenceKind === "SOURCE_OBSERVATION" && evidenceMatchesLocator(item, candidate.sourceLocator))
  const identityCorroboration = evidence.find(
    (item) =>
      item.evidenceKind === "IDENTITY_CORROBORATION" &&
      evidenceMatchesLocator(item, candidate.sourceLocator) &&
      Boolean(item.observedIdentity) &&
      (normalizedSourceIdentity
        ? item.observedIdentity === normalizedSourceIdentity
        : normalizedName
          ? item.observedIdentity === normalizedName
          : false)
  )

  if (identityCorroboration) {
    return { status: "IDENTITY_CORROBORATED", confidence: 2 }
  }

  if (sourceObservation) {
    return { status: "SOURCE_OBSERVED", confidence: 1 }
  }

  return { status: "UNVERIFIED", confidence: 0 }
}

function matchingSignals(candidate: ResourceDiscoveryCandidateInput, requirement: ResourceRadarDiscoveryRequirement): ResourceDiscoveryMatchingSignals {
  return {
    claimedCapabilityGaps: requirement.capabilityGap && candidate.claimedCapabilityGaps?.includes(requirement.capabilityGap) ? [requirement.capabilityGap] : [],
    claimedArtifactTypes: requirement.artifactType && candidate.claimedArtifactTypes?.includes(requirement.artifactType) ? [requirement.artifactType] : [],
    claimedActions: requirement.action && candidate.claimedActions?.includes(requirement.action) ? [requirement.action] : [],
    claimedFrameworks:
      requirement.frameworkOrSurface && candidate.claimedFrameworks?.includes(requirement.frameworkOrSurface)
        ? [requirement.frameworkOrSurface]
        : []
  }
}

function discoveryRelevanceScore(signals: ResourceDiscoveryMatchingSignals): number {
  return signals.claimedCapabilityGaps.length * 100 + signals.claimedArtifactTypes.length * 50 + signals.claimedActions.length * 25 + signals.claimedFrameworks.length * 10
}

function collisionFor(candidate: ResourceDiscoveryCandidateInput): { canonicalResourceMatchId: string | null; matched: boolean; resourceId?: string } {
  const locator = candidate.sourceLocator?.trim()
  if (!locator) {
    return { canonicalResourceMatchId: null, matched: false }
  }

  const match = RESOURCE_REGISTRY.find((resource) => resource.sourceUrl?.trim() === locator)
  if (!match) {
    return { canonicalResourceMatchId: null, matched: false }
  }

  return { canonicalResourceMatchId: match.id, matched: true, resourceId: match.id }
}

function compareCandidates(a: ResourceDiscoveryCandidate, b: ResourceDiscoveryCandidate): number {
  if (b.discoveryRelevanceScore !== a.discoveryRelevanceScore) {
    return b.discoveryRelevanceScore - a.discoveryRelevanceScore
  }

  if (b.verificationConfidence !== a.verificationConfidence) {
    return b.verificationConfidence - a.verificationConfidence
  }

  const nameCompare = (a.name ?? "").localeCompare(b.name ?? "")
  if (nameCompare !== 0) {
    return nameCompare
  }

  return a.candidateId.localeCompare(b.candidateId)
}

export function runResourceDiscovery(
  requirement: ResourceRadarDiscoveryRequirement,
  candidates: ResourceDiscoveryCandidateInput[]
): ResourceDiscoveryResult {
  const normalizedRequirement = normalizeRequirement(requirement)
  const normalizedCandidates = candidates.map((candidate) => normalizeCandidate(candidate))

  const evaluated = normalizedCandidates.map((candidate) => {
    const signals = matchingSignals(candidate, normalizedRequirement)
    const score = discoveryRelevanceScore(signals)
    const verification = determineVerificationStatus(candidate)
    const collision = collisionFor(candidate)

    return {
      candidateId: createCandidateId(candidate),
      candidateStatus: "UNREGISTERED_CANDIDATE" as const,
      registrationStatus: "NOT_REGISTERED" as const,
      executionStatus: "NOT_EXECUTABLE" as const,
      requiresHumanReview: true as const,
      name: candidate.name,
      sourceKind: candidate.sourceKind,
      sourceLocator: candidate.sourceLocator,
      sourceIdentity: candidate.sourceIdentity,
      provenanceClaim: candidate.provenanceClaim,
      licenseClaim: candidate.licenseClaim,
      claimedActions: candidate.claimedActions,
      claimedArtifactTypes: candidate.claimedArtifactTypes,
      claimedCapabilityGaps: candidate.claimedCapabilityGaps,
      claimedFrameworks: candidate.claimedFrameworks,
      evidence: candidate.evidence,
      discoveryRelevanceScore: score,
      matchingClaimedSignals: signals,
      verificationStatus: verification.status,
      verificationConfidence: verification.confidence,
      canonicalResourceMatchId: collision.canonicalResourceMatchId,
      canonicalCollision: {
        matched: collision.matched,
        resourceId: collision.resourceId
      }
    } satisfies ResourceDiscoveryCandidate
  })

  const relevantCandidates = evaluated.filter((candidate) => candidate.discoveryRelevanceScore > 0)
  const nonMatchingCandidates = evaluated.filter((candidate) => candidate.discoveryRelevanceScore <= 0)

  relevantCandidates.sort(compareCandidates)
  nonMatchingCandidates.sort(compareCandidates)

  const canonicalCollisionCount = evaluated.filter((candidate) => candidate.canonicalCollision.matched).length

  return {
    requirementFingerprint: fingerprint({
      requirement: normalizedRequirement,
      candidates: evaluated
        .map((candidate) => ({
          candidateId: candidate.candidateId,
          candidateStatus: candidate.candidateStatus,
          sourceKind: candidate.sourceKind,
          sourceLocator: candidate.sourceLocator,
          sourceIdentity: candidate.sourceIdentity,
          claimedActions: candidate.claimedActions,
          claimedArtifactTypes: candidate.claimedArtifactTypes,
          claimedCapabilityGaps: candidate.claimedCapabilityGaps,
          claimedFrameworks: candidate.claimedFrameworks,
          canonicalResourceMatchId: candidate.canonicalResourceMatchId
        }))
        .sort((a, b) => a.candidateId.localeCompare(b.candidateId))
    }),
    requirement: normalizedRequirement,
    candidateCount: evaluated.length,
    relevantCandidates,
    nonMatchingCandidates,
    canonicalCollisionCount,
    verificationSummary: {
      candidateCount: evaluated.length,
      unverifiedCount: evaluated.filter((candidate) => candidate.verificationStatus === "UNVERIFIED").length,
      sourceObservedCount: evaluated.filter((candidate) => candidate.verificationStatus === "SOURCE_OBSERVED").length,
      identityCorroboratedCount: evaluated.filter((candidate) => candidate.verificationStatus === "IDENTITY_CORROBORATED").length,
      canonicalCollisionCount
    },
    nextAction: evaluated.length === 0 ? "NO_CANDIDATES" : "HUMAN_REVIEW_REQUIRED"
  }
}
