import type { ResourceMetadata, ResourceEvaluation, AuthorityCeiling, ResourceLifecycleState } from "./types"
import { matchesCapability } from "./capabilities"
import { isActivated } from "./activation"
import { getLoadLevelForResource } from "./progressive-loading"
import type { CreativeProjectMode, CreativeProjectPhase } from "@/lib/director/types"

const AUTHORITY_HIERARCHY: Record<AuthorityCeiling, number> = {
  READ_ONLY: 1,
  SUGGEST: 2,
  PREPARE: 3,
  LOCAL_REVERSIBLE: 4,
  EXPLICIT_EXTERNAL: 5,
  PROHIBITED: 0
}

/**
 * Checks if the resource's authority ceiling is within the requested authority limit.
 */
export function satisfiesAuthority(resourceCeiling: AuthorityCeiling, requestedLimit?: AuthorityCeiling): boolean {
  if (!requestedLimit) return true
  const ceilingVal = AUTHORITY_HIERARCHY[resourceCeiling]
  const limitVal = AUTHORITY_HIERARCHY[requestedLimit]
  return ceilingVal <= limitVal && resourceCeiling !== "PROHIBITED"
}

/**
 * Checks if a lifecycle state is rejected under all routing rules.
 */
export function isRejectedLifecycle(state: ResourceLifecycleState): boolean {
  return state === "REJECTED" || state === "DEPRECATED" || state === "SUPERSEDED"
}

/**
 * Main evaluation function for a single resource.
 */
export function evaluateResource(
  resource: ResourceMetadata,
  mode: CreativeProjectMode,
  phase: CreativeProjectPhase,
  query: {
    artifactType?: string
    evaluator?: string
    capabilityGap?: string
    action?: string
    activationTags?: string[]
    authorityLimit?: AuthorityCeiling
    allowExperimental?: boolean
  }
): ResourceEvaluation {
  const resourceId = resource.id
  const name = resource.name
  const type = resource.type
  const lifecycleState = resource.lifecycleState
  const authorityCeiling = resource.authorityCeiling
  const progressiveLoadLevel = getLoadLevelForResource(resource)

  // 1. Rejected Lifecycle check
  if (isRejectedLifecycle(lifecycleState)) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      authorityCeiling,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: `Forbidden lifecycle state: ${lifecycleState}`,
      matchingCapabilities: [],
      progressiveLoadLevel
    }
  }

  // 2. Mode inclusion check
  if (!resource.modes.includes(mode)) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      authorityCeiling,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: `Unsupported mode for resource: ${mode}`,
      matchingCapabilities: [],
      progressiveLoadLevel
    }
  }

  // 3. Authority ceiling constraint check
  if (!satisfiesAuthority(authorityCeiling, query.authorityLimit)) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      authorityCeiling,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: `Exceeds requested authority level limit: ${query.authorityLimit}`,
      matchingCapabilities: [],
      progressiveLoadLevel
    }
  }

  // 4. Activation rules check
  if (!isActivated(resource, phase, query.evaluator, query.activationTags)) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      authorityCeiling,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: `Activation rules not satisfied for phase: ${phase}`,
      matchingCapabilities: [],
      progressiveLoadLevel
    }
  }

  // 5. Capability matching
  const capMatch = matchesCapability(resource, query.action, query.artifactType, query.capabilityGap)
  if (!capMatch.matches) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      authorityCeiling,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: "No matching capability actions, artifacts or gaps.",
      matchingCapabilities: [],
      progressiveLoadLevel
    }
  }

  // 6. Scoring logic
  let score = 0

  // Matching capability score additions
  score += capMatch.matchedCapabilities.length * 100

  // Lifecycle priorities
  if (lifecycleState === "APPROVED") {
    score += 50
  } else if (lifecycleState === "VALIDATED") {
    score += 30
  } else if (lifecycleState === "TESTING" || lifecycleState === "TEST_CANDIDATE") {
    score += 10
  }

  // Preference for internal methods (CORE_METHOD) over external ones
  if (type === "CORE_METHOD") {
    score += 15
  }

  // Recommendability status determination
  let isRecommendable = false
  if (lifecycleState === "APPROVED" || lifecycleState === "VALIDATED") {
    isRecommendable = true
  } else if (query.allowExperimental && (lifecycleState === "TESTING" || lifecycleState === "TEST_CANDIDATE")) {
    isRecommendable = true
  }

  return {
    resourceId,
    name,
    type,
    lifecycleState,
    authorityCeiling,
    isRecommendable,
    suitabilityScore: score,
    matchingCapabilities: capMatch.matchedCapabilities,
    progressiveLoadLevel
  }
}
