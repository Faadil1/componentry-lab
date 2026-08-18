import crypto from "crypto"
import type { ResourceEvaluation } from "../types"
import type {
  ExternalCapabilityPlan,
  ExternalCapabilityPlanRequest,
  ExternalCapabilityExecutionStatus,
  HumanApprovalState,
  CostStatus,
  PrivacyStatus
} from "./types"
import { decomposeFilmKitCapabilities } from "./capabilities"
import { RESOURCE_REGISTRY } from "../registry"

const AUTHORITY_SCORES: Record<string, number> = {
  PROHIBITED: 0,
  READ_ONLY: 1,
  SUGGEST: 2,
  PREPARE: 3,
  LOCAL_REVERSIBLE: 4,
  EXPLICIT_EXTERNAL: 5
}

function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj)
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]"
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort()
  const entries = keys.map((k) => `${JSON.stringify(k)}:${stableStringify((obj as Record<string, unknown>)[k])}`)
  return "{" + entries.join(",") + "}"
}

function computeFingerprint(obj: unknown): string {
  const hash = crypto.createHash("sha256")
  hash.update(stableStringify(obj))
  return hash.digest("hex")
}

export function planExternalCapability(
  request: ExternalCapabilityPlanRequest,
  selectedResource: ResourceEvaluation | null
): ExternalCapabilityPlan {
  const decomposed = decomposeFilmKitCapabilities({
    capabilityGap: request.capabilityGap,
    artifactType: request.artifactType,
    projectMode: request.projectMode,
    metadata: request.metadata
  })

  const capabilityId = request.capabilityGap || decomposed[0] || "general-film-capability"

  // Base plan template
  let resourceId: string | null = null
  let compatibilityStatus: "VERIFIED" | "DECLARED" | "UNKNOWN" | "INCOMPATIBLE" = "UNKNOWN"
  const compatibilityEvidence: string | null = null
  let lifecycleState: string | null = null
  let requiredAuthority = selectedResource?.maxExecutionAuthority || "SUGGEST"
  let requiredHumanApproval = false
  let humanApprovalState: HumanApprovalState = "NOT_REQUIRED"
  let costStatus: CostStatus = "UNKNOWN"
  let estimatedCost: string | null = null
  let privacyStatus: PrivacyStatus = "UNKNOWN"
  let licenseStatus: string | null = "UNKNOWN"
  const requiredInputs: string[] = ["subjectDescription", "subjectContext"]
  const expectedOutputs: string[] = ["externalPlanReceipt", "advisoryEvidence"]

  const blockers: string[] = []
  const missingEvidence: string[] = []
  let executionStatus: ExternalCapabilityExecutionStatus = "NO_MATCH"

  if (!selectedResource) {
    executionStatus = "NO_MATCH"
    blockers.push("No candidate resource matched the requested capability gap or artifact type.")
  } else {
    resourceId = selectedResource.resourceId
    lifecycleState = selectedResource.lifecycleState
    requiredAuthority = selectedResource.maxExecutionAuthority

    // Fetch original registry metadata for deep truth checks
    const meta = RESOURCE_REGISTRY.find((r) => r.id === selectedResource.resourceId)

    // License Truth: Do not invent. If present, use it; otherwise "UNKNOWN".
    if (meta?.license && meta.license.trim().length > 0) {
      licenseStatus = meta.license
    } else {
      licenseStatus = "UNKNOWN"
      missingEvidence.push("License metadata missing or empty")
    }

    // Cost & Privacy Truth: Do not invent.
    costStatus = "UNKNOWN"
    estimatedCost = null
    missingEvidence.push("Cost evaluation evidence missing")

    privacyStatus = "UNKNOWN"
    missingEvidence.push("Privacy retention policy missing")

    // Compatibility evidence status truth
    compatibilityStatus = meta?.compatibilityEvidenceStatus || "UNKNOWN"
    if (compatibilityStatus === "UNKNOWN") {
      missingEvidence.push("Provider compatibility evidence status is UNKNOWN")
    }

    // Check 1: DISCOVERY_FEED cannot become production provider
    if (selectedResource.type === "DISCOVERY_FEED") {
      executionStatus = "DISCOVERY_REQUIRED"
      missingEvidence.push("Discovery feeds cannot fulfill production capabilities")
    }
    // Check 2: Incompatible resource
    else if (compatibilityStatus === "INCOMPATIBLE") {
      executionStatus = "NO_MATCH"
      blockers.push("Resource is marked INCOMPATIBLE for target framework/surface")
    }
    // Check 3: Authority boundary check
    else {
      const currentScore = AUTHORITY_SCORES[request.currentAuthority] ?? 0
      const requiredScore = AUTHORITY_SCORES[requiredAuthority] ?? 0

      if (requiredScore > currentScore) {
        executionStatus = "BLOCKED"
        blockers.push(`Insufficient authority ceiling: current (${request.currentAuthority}) < required (${requiredAuthority})`)
      } else {
        // Authority is sufficient to plan. Now check human approval boundary.
        if (requiredAuthority === "EXPLICIT_EXTERNAL") {
          requiredHumanApproval = true
          humanApprovalState = "REQUIRED"
          executionStatus = "HUMAN_APPROVAL_REQUIRED"
        } else if (compatibilityStatus === "UNKNOWN") {
          executionStatus = "DISCOVERY_REQUIRED"
        } else if (lifecycleState === "TEST_CANDIDATE" || lifecycleState === "TESTING" || lifecycleState === "CAPTURED") {
          executionStatus = "EXTERNAL_EXPERIMENTAL_CANDIDATE"
        } else {
          executionStatus = "EXTERNAL_PLAN_READY"
        }
      }
    }
  }

  // Production Slice 3C enforces NOT_EXECUTED executionMode
  const planWithoutFingerprint = {
    resourceId,
    capabilityId,
    decomposedCapabilities: decomposed,
    requestedArtifact: request.artifactType || null,
    compatibilityStatus,
    compatibilityEvidence,
    lifecycleState,
    currentAuthority: request.currentAuthority,
    requiredAuthority,
    requiredHumanApproval,
    humanApprovalState,
    costStatus,
    estimatedCost,
    privacyStatus,
    licenseStatus,
    requiredInputs,
    expectedOutputs,
    executionMode: "NOT_EXECUTED" as const,
    executionStatus,
    blockers,
    missingEvidence
  }

  const planFingerprint = computeFingerprint(planWithoutFingerprint)

  return {
    ...planWithoutFingerprint,
    planFingerprint
  }
}
