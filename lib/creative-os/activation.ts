import type { ResourceMetadata } from "./types"
import type { CreativeProjectPhase } from "@/lib/director/types"

/**
 * Checks if a resource's activation rules are satisfied.
 * If a resource has multiple activation rules, at least one of them must be completely satisfied.
 * If a resource has no activation rules, it is satisfied by default.
 */
export function isActivated(
  resource: ResourceMetadata,
  phase: CreativeProjectPhase,
  evaluator?: string,
  activationTags?: string[]
): boolean {
  if (resource.activationRules.length === 0) {
    return true
  }

  return resource.activationRules.some((rule) => {
    // Check phase
    if (rule.requiredPhase && rule.requiredPhase !== phase) {
      return false
    }

    // Check evaluator
    if (rule.requiredEvaluator && rule.requiredEvaluator !== evaluator) {
      return false
    }

    // Check tags
    if (rule.requiredTags && rule.requiredTags.length > 0) {
      if (!activationTags) return false
      const hasAllTags = rule.requiredTags.every((tag) => activationTags.includes(tag))
      if (!hasAllTags) return false
    }

    return true
  })
}
