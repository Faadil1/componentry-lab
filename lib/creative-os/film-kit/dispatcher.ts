import type { ExternalCapabilityPlanRequest, ExternalCapabilityPlan } from "./types"
import type { ResourceEvaluation } from "../types"
import { planExternalCapability } from "./planner"

/**
 * Dispatcher entry point for production Slice 3C.
 * Replaces execution dispatch with strict plan construction (PLAN_ONLY / NOT_EXECUTED).
 * No network call, provider execution, render, or artifact generation occurs.
 */
export function dispatchExternalCapabilityPlan(
  request: ExternalCapabilityPlanRequest,
  selectedResource: ResourceEvaluation | null
): ExternalCapabilityPlan {
  return planExternalCapability(request, selectedResource)
}
