import type { RouterInputs, ResourceEvaluation } from "./types"
import { RESOURCE_REGISTRY } from "./registry"
import { evaluateResource } from "./evaluation"

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
    authorityCeiling
  } = inputs

  // Evaluate all resources from the registry
  const evaluations = RESOURCE_REGISTRY.map((resource) => {
    return evaluateResource(resource, projectMode, phase, {
      artifactType,
      evaluator,
      capabilityGap,
      activationTags,
      authorityLimit: authorityCeiling,
      allowExperimental: false // Default production mode does not recommend experimental
    })
  })

  // Filter for recommendable resources
  const recommendable = evaluations.filter((ev) => ev.isRecommendable)

  // Sort deterministically
  recommendable.sort((a, b) => {
    // 1. Suitability score descending
    if (b.suitabilityScore !== a.suitabilityScore) {
      return b.suitabilityScore - a.suitabilityScore
    }

    // 2. Lifecycle state precedence: APPROVED (50) > VALIDATED (30)
    const lifecycleOrder: Record<string, number> = { APPROVED: 2, VALIDATED: 1 }
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

  return {
    recommendations: recommendable,
    topSuggestion: recommendable[0] || null
  }
}
