import type { ResourceMetadata, ResourceEvaluation, AuthorityCeiling, ResourceLifecycleState, RecommendationLabel } from "./types"
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
 * Checks if the required authority ceiling is within the requested limit.
 */
export function satisfiesAuthority(requiredAuthority: AuthorityCeiling, requestedLimit?: AuthorityCeiling): boolean {
  if (!requestedLimit) return true
  const requiredVal = AUTHORITY_HIERARCHY[requiredAuthority]
  const limitVal = AUTHORITY_HIERARCHY[requestedLimit]
  return requiredVal <= limitVal && requiredAuthority !== "PROHIBITED"
}

/**
 * Checks if a lifecycle state is rejected under all routing rules.
 */
export function isRejectedLifecycle(state: ResourceLifecycleState): boolean {
  // Slice 3A V2: human approval remains required to transition to APPROVED/VALIDATED,
  // but for Slice 3A V2 baseline, we do not mark resources APPROVED.
  // There are no rejected lifecycle states at startup unless explicitly set.
  return state === "REJECTED" || state === "DEPRECATED" || state === "SUPERSEDED"
}

// Gaps that cannot be satisfied by discovery feeds directly
const PRODUCTION_GAPS = new Set([
  "video-editing",
  "cinematic-product-demo",
  "web-component-animation",
  "bootstrap-kit",
  "ppt-generation",
  "data-privacy",
  "editorial-abstraction",
  "b-roll-generation",
  "montage-generation",
  "rules-governance",
  "somatic-design",
  "physical-space-mapping",
  "narrative-staging",
  "camera-motion-language",
  "ai-camera-movements",
  "hackathon-product-demo",
  "rapid-prototyping"
])

const PRODUCTION_ARTIFACTS = new Set([
  "rough-cut-video",
  "product-demo-film",
  "composition-tree",
  "web-component-animation",
  "originkit-asset",
  "shotlist",
  "3d-scene-model",
  "ppt-template",
  "crt-interface-layout",
  "collage-broll-video",
  "montage-video",
  "workflow-rules",
  "somatic-profile",
  "data-privacy-model",
  "metaphor-illustration",
  "cinematic-storyboard",
  "camera-path-data",
  "rapid-sprint-backlog"
])

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
    currentAuthority?: AuthorityCeiling
    allowExperimental?: boolean
  }
): ResourceEvaluation {
  const resourceId = resource.id
  const name = resource.name
  const type = resource.type
  const lifecycleState = resource.lifecycleState
  const maxExecutionAuthority = resource.maxExecutionAuthority
  const progressiveLoadLevel = getLoadLevelForResource(resource)

  // 1. Rejected Lifecycle check
  if (isRejectedLifecycle(lifecycleState)) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      maxExecutionAuthority,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: `Forbidden lifecycle state: ${lifecycleState}`,
      matchingCapabilities: [],
      progressiveLoadLevel,
      recommendationLabel: "NO_MATCH"
    }
  }

  // 2. Mode inclusion check
  if (!resource.modes.includes(mode)) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      maxExecutionAuthority,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: `Unsupported mode for resource: ${mode}`,
      matchingCapabilities: [],
      progressiveLoadLevel,
      recommendationLabel: "NO_MATCH"
    }
  }

  // 3. Authority checks (check query.currentAuthority meets the capability's requiredAuthority)
  if (!satisfiesAuthority(resource.capabilities.requiredAuthority, query.currentAuthority)) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      maxExecutionAuthority,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: `Capability requiredAuthority (${resource.capabilities.requiredAuthority}) exceeds currentAuthority (${query.currentAuthority})`,
      matchingCapabilities: [],
      progressiveLoadLevel,
      recommendationLabel: "NO_MATCH"
    }
  }

  // 4. Discovery Feed direct production gap exclusion
  if (type === "DISCOVERY_FEED") {
    const requestedGap = query.capabilityGap
    const requestedArtifact = query.artifactType
    const matchesProductionGap = requestedGap && PRODUCTION_GAPS.has(requestedGap)
    const matchesProductionArtifact = requestedArtifact && PRODUCTION_ARTIFACTS.has(requestedArtifact)

    if (matchesProductionGap || matchesProductionArtifact) {
      return {
        resourceId,
        name,
        type,
        lifecycleState,
        maxExecutionAuthority,
        isRecommendable: false,
        suitabilityScore: 0,
        rejectionReason: "DISCOVERY_FEED resources cannot directly fulfill production capabilities or gaps",
        matchingCapabilities: [],
        progressiveLoadLevel,
        recommendationLabel: "NO_MATCH"
      }
    }
  }

  // 5. Activation rules check
  if (!isActivated(resource, phase, query.evaluator, query.activationTags)) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      maxExecutionAuthority,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: `Activation rules not satisfied for phase: ${phase}`,
      matchingCapabilities: [],
      progressiveLoadLevel,
      recommendationLabel: "NO_MATCH"
    }
  }

  // 6. Capability matching
  const capMatch = matchesCapability(resource, query.action, query.artifactType, query.capabilityGap)
  if (!capMatch.matches) {
    return {
      resourceId,
      name,
      type,
      lifecycleState,
      maxExecutionAuthority,
      isRecommendable: false,
      suitabilityScore: 0,
      rejectionReason: "No matching capability actions, artifacts or gaps.",
      matchingCapabilities: [],
      progressiveLoadLevel,
      recommendationLabel: "NO_MATCH"
    }
  }

  // 7. Scoring logic
  let score = 0

  // Matching capability score additions
  // Give highest priority to capabilityGap matches, then artifactType matches
  if (query.capabilityGap && resource.capabilities.capabilityGaps.includes(query.capabilityGap)) {
    score += 500
  }
  if (query.artifactType && resource.capabilities.artifactTypes.includes(query.artifactType)) {
    score += 300
  }
  if (query.action && resource.capabilities.actions.includes(query.action)) {
    score += 100
  }

  // Lifecycle priorities
  if (lifecycleState === "APPROVED") {
    score += 50
  } else if (lifecycleState === "VALIDATED") {
    score += 30
  } else if (lifecycleState === "AUDITED") {
    score += 15
  } else if (lifecycleState === "TEST_CANDIDATE" || lifecycleState === "TESTING") {
    score += 10
  } else if (lifecycleState === "CAPTURED") {
    score += 5
  }

  // Preference for internal methods (CORE_METHOD) over external ones
  if (type === "CORE_METHOD") {
    score += 15
  }

  // Determine recommendation label
  let recommendationLabel: RecommendationLabel = "NO_MATCH"
  let isRecommendable = false

  if (lifecycleState === "APPROVED") {
    recommendationLabel = "APPROVED_RECOMMENDATION"
    isRecommendable = true
  } else if (lifecycleState === "VALIDATED") {
    recommendationLabel = "VALIDATED_FALLBACK"
    isRecommendable = true
  } else if (type === "DISCOVERY_FEED") {
    recommendationLabel = "DISCOVERY_ONLY"
    isRecommendable = true
  } else if (["TEST_CANDIDATE", "TESTING", "AUDITED", "CAPTURED"].includes(lifecycleState)) {
    recommendationLabel = "EXPERIMENTAL_CANDIDATE"
    isRecommendable = true
  }

  return {
    resourceId,
    name,
    type,
    lifecycleState,
    maxExecutionAuthority,
    isRecommendable,
    suitabilityScore: score,
    matchingCapabilities: capMatch.matchedCapabilities,
    progressiveLoadLevel,
    recommendationLabel
  }
}
