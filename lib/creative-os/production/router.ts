import type { ProductionRoute, ProductionRouteType } from "./types"
import type { ExternalCapabilityPlan } from "../film-kit/types"
import { RESOURCE_REGISTRY } from "../registry"

function getResourceType(resourceId: string): string | undefined {
  const resource = RESOURCE_REGISTRY.find((r) => r.id === resourceId)
  return resource?.type
}

function getResourceLicense(resourceId: string): string {
  const resource = RESOURCE_REGISTRY.find((r) => r.id === resourceId)
  return resource?.license || "UNKNOWN"
}

function mapResourceTypeToRouteType(resourceType: string | undefined): ProductionRouteType {
  switch (resourceType) {
    case "CORE_METHOD":
    case "SKILL":
    case "KNOWLEDGE_PACK":
      return "INTERNAL_COMPONENT"
    case "COMPONENT_SOURCE":
      return "LOCAL_PRODUCTION"
    case "PROVIDER":
      return "EXTERNAL_PROVIDER"
    case "PRODUCTION_PIPELINE":
      return "EXTERNAL_PIPELINE"
    case "DISCOVERY_FEED":
    case "REFERENCE_ONLY":
      return "NO_MATCH"
    default:
      return "NO_MATCH"
  }
}

/**
 * Maps an ExternalCapabilityPlan to a ProductionRoute contract.
 * Preferred chain: ExternalCapabilityPlan -> ProductionRoute.
 */
export function resolveProductionRoute(
  plan: ExternalCapabilityPlan,
  projectId: string,
  isNativeSupported: boolean = false
): ProductionRoute {
  // If the capability is completely unknown or not requested, it fails closed.
  if (!plan.capabilityId && !plan.requestedArtifact) {
    return createNoMatchRoute(plan, projectId, "UNKNOWN")
  }

  // 1. NATIVE route check
  if (isNativeSupported) {
    return {
      routeId: `route_native_${Date.now()}`,
      projectId,
      planFingerprint: plan.planFingerprint,
      requestedArtifactType: plan.requestedArtifact || "unknown",
      productionCapability: plan.capabilityId,
      routeType: "NATIVE",
      resourceId: null,
      providerAdapterId: null,
      authorityRequired: "READ_ONLY",
      executionMode: "LIVE",
      estimatedCost: "FREE",
      licenseState: "PROPRIETARY", // Native code is ours
      privacyClass: "LOCAL_ONLY",
      inputArtifacts: plan.requiredInputs,
      expectedOutputArtifacts: plan.expectedOutputs,
      heroDemoContribution: "SUPPORTING",
      qualityGates: [],
      evidenceRequired: ["SOURCE_PROVENANCE", "FUNCTIONAL_QA"],
      reversibility: "LOCAL_REVERSIBLE",
      status: "PLANNED"
    }
  }

  // 2. Map resource if present
  let routeType: ProductionRouteType = "NO_MATCH"
  let licenseState = "UNKNOWN"
  
  if (plan.resourceId) {
    const resType = getResourceType(plan.resourceId)
    routeType = mapResourceTypeToRouteType(resType)
    licenseState = getResourceLicense(plan.resourceId)
  }

  // Enforce discovery feeds and reference resources cannot execute
  if (routeType === "NO_MATCH") {
    return createNoMatchRoute(plan, projectId, licenseState)
  }

  // Assume PROMPT_SHARE_LINK_CREATION provides PRIMARY contribution (Hero Demo)
  // as per requirement to preserve Hero Demo priority.
  const isHeroDemo = plan.capabilityId === "PROMPT_SHARE_LINK_CREATION" || 
                     plan.requestedArtifact === "product-demo-film"

  return {
    routeId: `route_${plan.resourceId}_${Date.now()}`,
    projectId,
    planFingerprint: plan.planFingerprint,
    requestedArtifactType: plan.requestedArtifact || "unknown",
    productionCapability: plan.capabilityId,
    routeType,
    resourceId: plan.resourceId,
    providerAdapterId: plan.executionMode === "NOT_EXECUTED" ? null : "adapter_unknown", // To be filled by adapters logic
    authorityRequired: plan.requiredAuthority,
    executionMode: plan.executionMode,
    estimatedCost: plan.estimatedCost,
    licenseState,
    privacyClass: plan.privacyStatus,
    inputArtifacts: plan.requiredInputs,
    expectedOutputArtifacts: plan.expectedOutputs,
    heroDemoContribution: isHeroDemo ? "PRIMARY" : "SUPPORTING",
    qualityGates: [],
    evidenceRequired: routeType === "EXTERNAL_PROVIDER" ? ["EXECUTION_RECEIPT", "LICENSE"] : ["SOURCE_PROVENANCE"],
    reversibility: routeType === "EXTERNAL_PROVIDER" ? "IRREVERSIBLE" : "LOCAL_REVERSIBLE",
    status: plan.executionStatus === "BLOCKED" || plan.executionStatus === "AUTHORITY_BLOCKED" ? "BLOCKED" : "PLANNED"
  }
}

function createNoMatchRoute(plan: ExternalCapabilityPlan, projectId: string, licenseState: string): ProductionRoute {
  return {
    routeId: `route_no_match_${Date.now()}`,
    projectId,
    planFingerprint: plan.planFingerprint,
    requestedArtifactType: plan.requestedArtifact || "unknown",
    productionCapability: plan.capabilityId,
    routeType: "NO_MATCH",
    resourceId: plan.resourceId,
    providerAdapterId: null,
    authorityRequired: "PROHIBITED",
    executionMode: "NOT_EXECUTED",
    estimatedCost: null,
    licenseState,
    privacyClass: "UNKNOWN",
    inputArtifacts: [],
    expectedOutputArtifacts: [],
    heroDemoContribution: "NONE",
    qualityGates: [],
    evidenceRequired: [],
    reversibility: "UNKNOWN",
    status: "BLOCKED"
  }
}
