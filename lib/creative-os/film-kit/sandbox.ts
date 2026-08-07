import type { ExternalCapabilityPlan, ExternalExecutionIntent, ExternalExecutionReceipt, HumanApprovalDecision } from "./types"
import { getProviderAdapterForPlan } from "./adapters"
import crypto from "crypto"

const AUTHORITY_RANK: Record<import("../types").AuthorityCeiling, number> = {
  "PROHIBITED": -1,
  "READ_ONLY": 0,
  "SUGGEST": 1,
  "PREPARE": 2,
  "LOCAL_REVERSIBLE": 3,
  "EXPLICIT_EXTERNAL": 4
}

function hasAuthority(current: import("../types").AuthorityCeiling, required: import("../types").AuthorityCeiling): boolean {
  if (current === "PROHIBITED" || required === "PROHIBITED") return false
  return AUTHORITY_RANK[current] >= AUTHORITY_RANK[required]
}

// In-memory receipt store for idempotency (3D.1 requirement)
const receiptStore = new Map<string, ExternalExecutionReceipt>()

function hash(obj: unknown): string {
  // simple stable stringify + hash for sandbox idempotency
  const stableStr = JSON.stringify(obj, Object.keys(obj as object).sort())
  return crypto.createHash("sha256").update(stableStr).digest("hex").slice(0, 16)
}

export function buildExecutionIntent(
  plan: ExternalCapabilityPlan,
  projectId: string,
  projectBrainFingerprint: string,
  adapterId: string,
  approval: HumanApprovalDecision | null,
  currentAuthority: import("../types").AuthorityCeiling
): ExternalExecutionIntent {
  const intent: Omit<ExternalExecutionIntent, "executionIntentFingerprint"> = {
    projectId,
    projectBrainFingerprint,
    planFingerprint: plan.planFingerprint,
    resourceId: plan.resourceId,
    capabilityId: plan.capabilityId,
    adapterId,
    authority: currentAuthority,
    inputFingerprint: hash(plan.requiredInputs),
    expectedArtifactType: plan.requestedArtifact,
    costCeiling: approval?.costCeiling || null,
    approvalFingerprint: approval?.approvalFingerprint || null
  }
  return {
    ...intent,
    executionIntentFingerprint: hash(intent)
  }
}

export function executeSandboxedPlan(
  plan: ExternalCapabilityPlan,
  projectId: string,
  projectBrainFingerprint: string,
  approval: HumanApprovalDecision | null,
  currentAuthority: import("../types").AuthorityCeiling
): { status: import("./types").ExternalCapabilityExecutionStatus; receipt?: ExternalExecutionReceipt; error?: string } {
  
  // 1. Plan freshness validation
  if (plan.projectId && plan.projectId !== projectId) {
    return { status: "PLAN_INCOMPATIBLE", error: "Plan belongs to a different project." }
  }
  if (plan.projectBrainFingerprint && plan.projectBrainFingerprint !== projectBrainFingerprint) {
    return { status: "PLAN_STALE", error: "Plan Project Brain fingerprint does not match." }
  }

  // 2. Authority Check (Defense in Depth)
  if (!hasAuthority(currentAuthority, plan.requiredAuthority)) {
    return { status: "AUTHORITY_BLOCKED", error: "Insufficient current authority to execute plan." }
  }

  // 3. Approval validation (Security contract)
  if (plan.humanApprovalState === "REQUIRED" || plan.humanApprovalState === "DENIED") {
    if (!approval) {
      return { status: "APPROVAL_REQUIRED", error: "Valid human approval is required." }
    }
    if (approval.approvalState === "DENIED") {
      return { status: "APPROVAL_DENIED", error: "Human approval was explicitly denied." }
    }
    if (approval.approvalState !== "GRANTED") {
      return { status: "APPROVAL_REQUIRED", error: "Human approval is not granted." }
    }
    
    // Approval Authority Check
    if (!hasAuthority(approval.approvedAuthority, plan.requiredAuthority)) {
      return { status: "AUTHORITY_BLOCKED", error: "Approved authority is insufficient." }
    }

    // Cost Governance Check
    if (plan.estimatedCost !== null && approval.costCeiling !== null) {
      const pCost = parseFloat(plan.estimatedCost)
      const aCeiling = parseFloat(approval.costCeiling)
      if (!isNaN(pCost) && !isNaN(aCeiling) && pCost > aCeiling) {
        return { status: "COST_BLOCKED", error: "Estimated cost exceeds approved ceiling." }
      }
    }
    
    // Approval Integrity / Fingerprint check
    const expectedApprovalHash = hash({
      approvalState: approval.approvalState,
      projectId: approval.projectId,
      projectBrainFingerprint: approval.projectBrainFingerprint,
      planFingerprint: approval.planFingerprint,
      resourceId: approval.resourceId,
      capabilityId: approval.capabilityId,
      providerAdapterId: approval.providerAdapterId,
      approvedAuthority: approval.approvedAuthority,
      costCeiling: approval.costCeiling
    })
    if (approval.approvalFingerprint !== expectedApprovalHash) {
      return { status: "APPROVAL_INVALID", error: "Approval fingerprint integrity check failed." }
    }

    // Bindings check
    if (
      approval.projectId !== projectId ||
      approval.projectBrainFingerprint !== projectBrainFingerprint ||
      approval.planFingerprint !== plan.planFingerprint ||
      approval.resourceId !== plan.resourceId ||
      approval.capabilityId !== plan.capabilityId
    ) {
      return { status: "APPROVAL_INVALID", error: "Approval bindings do not match execution intent." }
    }
  }

  // 4. Adapter validation
  const adapter = getProviderAdapterForPlan(plan)
  if (!adapter) {
    return { status: "ADAPTER_MISSING", error: "No executable provider adapter found." }
  }
  if (approval && approval.approvalState === "GRANTED" && approval.providerAdapterId !== adapter.id) {
    return { status: "APPROVAL_INVALID", error: "Approval provider adapter does not match resolved adapter." }
  }
  if (adapter.environment !== "TEST_ONLY") {
    if (plan.costStatus === "UNKNOWN") {
      return { status: "COST_BLOCKED", error: "UNKNOWN cost for non-test adapter blocks execution." }
    }
    // 3D.1 policy: only TEST_ONLY allowed
    return { status: "ADAPTER_NOT_EXECUTABLE", error: "Only TEST_ONLY adapters are executable in 3D.1." }
  }

  // 5. Execution Intent and Idempotency
  const intent = buildExecutionIntent(plan, projectId, projectBrainFingerprint, adapter.id, approval, currentAuthority)
  
  if (receiptStore.has(intent.executionIntentFingerprint)) {
    return { status: "ALREADY_EXECUTED", receipt: receiptStore.get(intent.executionIntentFingerprint) }
  }

  // 6. Execute Provider
  let providerResult: unknown
  let finalStatus: import("./types").ExternalCapabilityExecutionStatus = "EXECUTED"
  let receiptError: { code: string; message: string; retryable: boolean } | undefined = undefined
  let rawOutput: unknown = {}
  let providerUsed: string = "test-ref"

  try {
    providerResult = adapter.execute(plan, intent)
    if (providerResult instanceof Promise) {
      throw new Error("Async execution not supported.")
    }
    const resultObj = providerResult as import("./types").ExternalCapabilityExecutionResult
    rawOutput = resultObj.rawOutput || {}
    providerUsed = resultObj.providerUsed || "test-ref"
    if (resultObj.status === "PARTIAL") {
      finalStatus = "EXECUTED_PARTIAL"
    } else if (resultObj.status === "FAILED" || resultObj.status === "BLOCKED") {
      finalStatus = "PROVIDER_ERROR"
      receiptError = { code: "ERR", message: resultObj.error || "Provider error", retryable: false }
    }
  } catch (err: unknown) {
    finalStatus = "PROVIDER_ERROR"
    receiptError = { code: "ERR_THROWN", message: err instanceof Error ? err.message : "Unknown error", retryable: false }
  }

  // 7. Generate Receipt
  const partialReceipt: Omit<ExternalExecutionReceipt, "receiptFingerprint"> = {
    executionIntentFingerprint: intent.executionIntentFingerprint,
    approvalFingerprint: intent.approvalFingerprint,
    projectId,
    projectBrainFingerprint,
    planFingerprint: plan.planFingerprint,
    resourceId: plan.resourceId,
    capabilityId: plan.capabilityId,
    providerAdapterId: adapter.id,
    authorityUsed: currentAuthority,
    executionStatus: finalStatus,
    inputFingerprint: intent.inputFingerprint,
    providerOutputFingerprint: finalStatus === "PROVIDER_ERROR" ? null : hash(rawOutput),
    artifactReferences: [],
    cost: { estimated: null, actual: null, currency: "TEST", status: "FREE" },
    providerReference: providerUsed,
    error: receiptError,
    provenanceReferences: []
  }

  const receipt: ExternalExecutionReceipt = {
    ...partialReceipt,
    receiptFingerprint: hash(partialReceipt)
  }

  // Store receipt for idempotency
  receiptStore.set(intent.executionIntentFingerprint, receipt)

  return { status: finalStatus, receipt }
}
