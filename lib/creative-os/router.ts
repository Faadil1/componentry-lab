import type { RouterInputs, ResourceEvaluation } from "./types"
import { RESOURCE_REGISTRY } from "./registry"
import { evaluateResource, MINIMUM_SUITABILITY_THRESHOLD } from "./evaluation"

export interface RouterResult {
  recommendations: ResourceEvaluation[]
  topSuggestion: ResourceEvaluation | null
}



/**
 * Route capabilities deterministically based on metadata inputs.
 */
export function routeCapabilities(inputs: RouterInputs): RouterResult {
  const {
    projectMode,
    phase,
    artifactType,
    evaluator,
    capabilityGap,
    activationTags,
    currentAuthority
  } = inputs

  // Mode alone must never be enough. If no gap and no artifact type are specified,
  // we do not route any resources.
  if (!capabilityGap && !artifactType) {
    return {
      recommendations: [],
      topSuggestion: null
    }
  }

  // Evaluate all resources from the registry
  const evaluations = RESOURCE_REGISTRY.map((resource) => {
    return evaluateResource(resource, projectMode, phase, {
      artifactType,
      evaluator,
      capabilityGap,
      activationTags,
      currentAuthority,
      allowExperimental: true // V2 allows experimental/captured/audited resources
    })
  })

  // Filter for recommendable resources
  const recommendable = evaluations.filter((ev) => ev.isRecommendable)

  // Sort deterministically
  recommendable.sort((a, b) => {
    // 1. Suitability score descending (handles gap matching and artifact matching priority)
    if (b.suitabilityScore !== a.suitabilityScore) {
      return b.suitabilityScore - a.suitabilityScore
    }

    // 2. Lifecycle state precedence
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

    // 3. Prefer Internal (CORE_METHOD) over external
    const typeOrder = (type: string) => (type === "CORE_METHOD" ? 1 : 0)
    const aType = typeOrder(a.type)
    const bType = typeOrder(b.type)
    if (bType !== aType) {
      return bType - aType
    }

    // 4. Deterministic fallback by resource ID string comparison
    return a.resourceId.localeCompare(b.resourceId)
  })

  const topCandidate = recommendable[0] || null
  const topSuggestion = (topCandidate && topCandidate.suitabilityScore >= MINIMUM_SUITABILITY_THRESHOLD) ? topCandidate : null

  return {
    recommendations: recommendable,
    topSuggestion
  }
}
