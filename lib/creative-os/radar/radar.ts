import crypto from "crypto"
import { RESOURCE_REGISTRY } from "../registry"
import { evaluateResource, satisfiesAuthority, isRejectedLifecycle } from "../evaluation"
import { isActivated } from "../activation"
import { matchesCapability } from "../capabilities"
import { isResourcePlanningOnly } from "../execution-evidence"
import type { ResourceEvaluation, ResourceMetadata, AuthorityCeiling } from "../types"
import type { ResourceRadarDiscoveryRequirement, ResourceRadarInput, ResourceRadarMatch, ResourceRadarResult, ResourceRadarSignal, ResourceSourceVerification } from "./types"


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

function normalizedSignal(input: ResourceRadarInput): ResourceRadarSignal {
  const signal: ResourceRadarSignal = {}
  if (input.capabilityGap?.trim()) signal.capabilityGap = input.capabilityGap.trim()
  if (input.artifactType?.trim()) signal.artifactType = input.artifactType.trim()
  if (input.action?.trim()) signal.action = input.action.trim()
  return signal
}
function hasNormalizedSignal(signal: ResourceRadarSignal): boolean {
  return Boolean(signal.capabilityGap || signal.artifactType || signal.action)
}

function sourceVerification(resource: ResourceMetadata): ResourceSourceVerification {
  return resource.provenance.startsWith("internal:") ? "INTERNAL" : "EXTERNAL_UNVERIFIED"
}

function authorityUsable(resource: ResourceMetadata, currentAuthority: AuthorityCeiling): boolean {
  return satisfiesAuthority(resource.capabilities.requiredAuthority, currentAuthority)
}

function compatibilityUsable(resource: ResourceMetadata, frameworkOrSurface?: string): boolean {
  if (!frameworkOrSurface) return true
  if (resource.compatibilityEvidenceStatus === "UNKNOWN") return false
  if (resource.compatibilityEvidenceStatus === "INCOMPATIBLE") return false
  if (!resource.supportedFrameworks) return false
  return resource.supportedFrameworks.includes(frameworkOrSurface)
}
function createDiscoveryRequirement(input: ResourceRadarInput): ResourceRadarDiscoveryRequirement {
  return {
    capabilityGap: input.capabilityGap,
    artifactType: input.artifactType,
    action: input.action,
    projectMode: input.projectMode,
    phase: input.phase,
    requiredAuthorityCeiling: input.currentAuthority,
    frameworkOrSurface: input.frameworkOrSurface,
    candidateStatus: "UNREGISTERED_DISCOVERY_REQUIREMENT"
  }
}

function toRadarMatch(resource: ResourceMetadata, evaluation: ResourceEvaluation, input: ResourceRadarInput): ResourceRadarMatch {
  return {
    ...evaluation,
    authorityUsable: authorityUsable(resource, input.currentAuthority),
    compatibilityUsable: compatibilityUsable(resource, input.frameworkOrSurface),
    sourceVerification: sourceVerification(resource),
    planningOnly: isResourcePlanningOnly(resource.id)
  }
}


function isRelevant(resource: ResourceMetadata, input: ResourceRadarInput): boolean {
  if (isRejectedLifecycle(resource.lifecycleState)) return false
  if (!resource.modes.includes(input.projectMode)) return false
  if (!isActivated(resource, input.phase, input.evaluator, input.activationTags)) return false
  const capMatch = matchesCapability(resource, input.action, input.artifactType, input.capabilityGap)
  return capMatch.matches
}


function compareRadarMatches(a: ResourceRadarMatch, b: ResourceRadarMatch): number {
  if (b.suitabilityScore !== a.suitabilityScore) {
    return b.suitabilityScore - a.suitabilityScore
  }

  const lifecycleOrder: Record<string, number> = {
    APPROVED: 4,
    VALIDATED: 3,
    AUDITED: 2,
    TEST_CANDIDATE: 1,
    TESTING: 1,
    CAPTURED: 0
  }

  const aLife = lifecycleOrder[a.lifecycleState] || 0
  const bLife = lifecycleOrder[b.lifecycleState] || 0
  if (bLife !== aLife) {
    return bLife - aLife
  }

  const aType = a.type === "CORE_METHOD" ? 1 : 0
  const bType = b.type === "CORE_METHOD" ? 1 : 0
  if (bType !== aType) {
    return bType - aType
  }

  return a.resourceId.localeCompare(b.resourceId)
}

export function runResourceRadar(input: ResourceRadarInput): ResourceRadarResult {
  const signal = normalizedSignal(input)
  const normalizedInput: ResourceRadarInput = {
    ...input,
    capabilityGap: signal.capabilityGap,
    artifactType: signal.artifactType,
    action: signal.action
  }
  const snapshot = {
    canonicalResourceCount: RESOURCE_REGISTRY.length,
    evaluatedResourceCount: RESOURCE_REGISTRY.length,
    matchingResourceCount: 0,
    blockedResourceCount: 0,
    internalResourceCount: RESOURCE_REGISTRY.filter((resource) => resource.provenance.startsWith("internal:")).length,
    externalUnverifiedResourceCount: RESOURCE_REGISTRY.filter((resource) => !resource.provenance.startsWith("internal:")).length
  }

  if (!hasNormalizedSignal(signal)) {
    return {
      decision: "NO_SIGNAL",
      inputFingerprint: fingerprint({ signal, projectMode: input.projectMode, phase: input.phase, currentAuthority: input.currentAuthority, frameworkOrSurface: input.frameworkOrSurface }),
      signal,
      existingMatches: [],
      topMatch: null,
      blockedMatches: [],
      discoveryRequirement: null,
      registrySnapshot: snapshot,
      sourceVerificationSummary: {
        internalCount: snapshot.internalResourceCount,
        externalUnverifiedCount: snapshot.externalUnverifiedResourceCount
      }
    }
  }

  const existingMatches: ResourceRadarMatch[] = []
  const blockedMatches: ResourceRadarMatch[] = []

  for (const resource of RESOURCE_REGISTRY) {
    const evaluation = evaluateResource(resource, normalizedInput.projectMode, normalizedInput.phase, {
      action: normalizedInput.action,
      artifactType: normalizedInput.artifactType,
      capabilityGap: normalizedInput.capabilityGap,
      evaluator: normalizedInput.evaluator,
      activationTags: normalizedInput.activationTags,
      currentAuthority: normalizedInput.currentAuthority,
      frameworkOrSurface: normalizedInput.frameworkOrSurface,
      allowExperimental: true
    })

    if (!isRelevant(resource, normalizedInput)) {
      continue
    }

    const match = toRadarMatch(resource, evaluation, input)
    snapshot.matchingResourceCount += 1

    if (match.authorityUsable && match.compatibilityUsable && evaluation.isRecommendable) {
      existingMatches.push(match)
    } else {
      blockedMatches.push(match)
      snapshot.blockedResourceCount += 1
    }
  }

  existingMatches.sort(compareRadarMatches)
  blockedMatches.sort(compareRadarMatches)

  const topMatch = existingMatches[0] ?? null
  let decision: ResourceRadarResult["decision"] = "DISCOVERY_REQUIRED"
  let discoveryRequirement: ResourceRadarDiscoveryRequirement | null = null

  if (existingMatches.length > 0) {
    decision = "USE_EXISTING"
  } else if (blockedMatches.some((match) => !match.compatibilityUsable)) {
    decision = "EXISTING_MATCH_COMPATIBILITY_BLOCKED"
  } else if (blockedMatches.some((match) => !match.authorityUsable)) {
    decision = "EXISTING_MATCH_AUTHORITY_BLOCKED"
  } else {
    discoveryRequirement = createDiscoveryRequirement(input)
  }

  if (decision !== "DISCOVERY_REQUIRED") {
    discoveryRequirement = null
  }

  return {
    decision,
    inputFingerprint: fingerprint({ signal, projectMode: normalizedInput.projectMode, phase: normalizedInput.phase, currentAuthority: normalizedInput.currentAuthority, frameworkOrSurface: normalizedInput.frameworkOrSurface, evaluator: normalizedInput.evaluator, activationTags: normalizedInput.activationTags }),
    signal,
    existingMatches,
    topMatch,
    blockedMatches,
    discoveryRequirement,
    registrySnapshot: snapshot,
    sourceVerificationSummary: {
      internalCount: snapshot.internalResourceCount,
      externalUnverifiedCount: snapshot.externalUnverifiedResourceCount
    }
  }
}
