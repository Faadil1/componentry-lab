import { getExecutionLedger } from "./execution-ledger"
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

// In-memory receipt store for idempotency (3D.1 requirement) and concurrency (3D.2)


function hash(obj: unknown): string {
  // simple stable stringify + hash for sandbox idempotency
  const stableStr = JSON.stringify(obj, Object.keys(obj as object).sort())
  return crypto.createHash("sha256").update(stableStr).digest("hex").slice(0, 16)
}

export const RUNTIME_CONTRACT_VERSION = "3d2_incident_audit_03"

// Canonical governed execution-boundary semantics that define the runtime identity
const RUNTIME_CONTRACT_SEMANTICS = {
  version: RUNTIME_CONTRACT_VERSION,
  sandboxContract: "ExternalExecutionSandbox_v2",
  preflightOrdering: ["authority", "approval", "lifecycle", "cost", "idempotency", "precondition"],
  idempotencySemantics: "strict-plan-fingerprint-collision-rejection",
  durableLiveIdempotency: "strict-cross-process-ledger-required",
  providerOutcomeTaxonomy: ["LOCAL_PRECONDITION_FAILURE", "DETERMINISTIC_PROVIDER_FAILURE", "PROVIDER_OUTCOME_UNKNOWN"],
  secretPreflightSemantics: "validatePreconditions-adapter-hook",
  adapterInterface: "async-Promise-ExternalCapabilityExecutionResult",
  costExceptionIdentityConstraint: "strict-canonical-registry-binding"
}

export const RUNTIME_CONTRACT_FINGERPRINT = hash(RUNTIME_CONTRACT_SEMANTICS)

export function buildExecutionIntent(
  plan: ExternalCapabilityPlan,
  projectId: string,
  projectBrainFingerprint: string,
  adapterId: string,
  approval: HumanApprovalDecision | null,
  currentAuthority: import("../types").AuthorityCeiling,
  providerInputPayload: import("./types").ExternalExecutionInput
): ExternalExecutionIntent {
  const intent: Omit<ExternalExecutionIntent, "executionIntentFingerprint"> = {
    projectId,
    projectBrainFingerprint,
    planFingerprint: plan.planFingerprint,
    resourceId: plan.resourceId,
    capabilityId: plan.capabilityId,
    adapterId,
    authority: currentAuthority,
    inputFingerprint: hash(providerInputPayload),
    expectedArtifactType: plan.requestedArtifact,
    costCeiling: approval?.costCeiling || null,
    approvalFingerprint: approval?.approvalFingerprint || null,
    runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT
  }
  return {
    ...intent,
    executionIntentFingerprint: hash(intent)
  }
}

export async function executeSandboxedPlan(
  plan: ExternalCapabilityPlan,
  projectId: string,
  projectBrainFingerprint: string,
  approval: HumanApprovalDecision | null,
  currentAuthority: import("../types").AuthorityCeiling,
  providerInputPayload: import("./types").ExternalExecutionInput
): Promise<{ status: import("./types").ExternalCapabilityExecutionStatus; receipt?: ExternalExecutionReceipt; error?: string }> {
  
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
      costCeiling: approval.costCeiling,
      approvedConstraints: approval.approvedConstraints,
      runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT
    })
    if (approval.approvalFingerprint !== expectedApprovalHash) {
      return { status: "APPROVAL_INVALID", error: "Approval fingerprint integrity check failed." }
    }
    
    if (approval.runtimeContractFingerprint !== RUNTIME_CONTRACT_FINGERPRINT) {
      return { status: "APPROVAL_INVALID", error: "Approval runtime contract fingerprint mismatch." }
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
    if (adapter.environment === "PRODUCTION") {
      // 3D.2: PRODUCTION adapters require EXPLICIT_EXTERNAL authority + GRANTED approval (defense-in-depth)
      if (!hasAuthority(currentAuthority, "EXPLICIT_EXTERNAL")) {
        return { status: "AUTHORITY_BLOCKED", error: "PRODUCTION adapter requires EXPLICIT_EXTERNAL authority." }
      }
      if (!approval || approval.approvalState !== "GRANTED") {
        return { status: "APPROVAL_REQUIRED", error: "PRODUCTION adapter requires explicit GRANTED human approval." }
      }
      // UNKNOWN incremental cost for production blocks unless explicitly cleared
      if (plan.costStatus === "UNKNOWN") {
        const isCinepromptPilotException =
          plan.resourceId === "res_cineprompt" &&
          plan.capabilityId === "PROMPT_SHARE_LINK_CREATION" &&
          adapter.id === "adapter_cineprompt_share_link_v2" &&
          approval?.approvedConstraints?.subscriptionEntitlement === "HUMAN_ATTESTED_ACTIVE" &&
          approval?.costCeiling === "0" &&
          approval?.approvedConstraints?.downstreamSpend === "PROHIBITED" &&
          approval?.approvedConstraints?.endpoint === "https://cineprompt.io/api/share"

        if (!isCinepromptPilotException) {
          return { status: "COST_BLOCKED", error: "UNKNOWN incremental cost for PRODUCTION adapter. New human approval required." }
        }
      }
      // PRODUCTION is allowed — fall through to execution
    } else {
      // SANDBOX or unrecognized environment: not executable
      return { status: "ADAPTER_NOT_EXECUTABLE", error: "Adapter environment is not executable in current governance scope." }
    }
  }

  // 5. Execution Intent and Idempotency
  const intent = buildExecutionIntent(plan, projectId, projectBrainFingerprint, adapter.id, approval, currentAuthority, providerInputPayload)
  
  const ledger = getExecutionLedger()
  if (adapter.environment === "PRODUCTION" && !ledger.isPersistent) {
    return { status: "LOCAL_PRECONDITION_FAILURE", error: "Live execution requires a persistent ledger." }
  }

  const reservation = ledger.get(intent.executionIntentFingerprint)
  if (reservation) {
    if (reservation.state === "IN_FLIGHT") return { status: "EXECUTION_IN_PROGRESS", error: "Execution is currently in progress for this intent." }
    if (reservation.state === "TERMINAL_OUTCOME_UNKNOWN") return { status: "OUTCOME_UNKNOWN_LOCKED", receipt: reservation.receipt }
    return { status: "ALREADY_EXECUTED", receipt: reservation.receipt }
  }

  // Preflight validation (e.g. secret checking) before reservation
  if (adapter.validatePreconditions) {
    const preflight = adapter.validatePreconditions(plan, intent, providerInputPayload)
    if (preflight.status === "PRECONDITION_BLOCKED") {
      return { status: "LOCAL_PRECONDITION_FAILURE", error: preflight.reason || "Local precondition failed." }
    }
  }

  // Reserve the intent
  ledger.reserve(intent.executionIntentFingerprint)

  // 6. Execute Provider
  let providerResult: unknown
  let finalStatus: import("./types").ExternalCapabilityExecutionStatus = "EXECUTED"
  let receiptError: { code: string; message: string; retryable: boolean } | undefined = undefined
  let rawOutput: unknown = {}
  let providerUsed: string = "test-ref"

  try {
    providerResult = await adapter.execute(plan, intent, providerInputPayload)
    const resultObj = providerResult as import("./types").ExternalCapabilityExecutionResult
    rawOutput = resultObj.rawOutput || {}
    providerUsed = resultObj.providerUsed || "test-ref"
    if (resultObj.status === "PARTIAL") {
      finalStatus = "EXECUTED_PARTIAL"
    } else if (resultObj.status === "PROVIDER_OUTCOME_UNKNOWN") {
      finalStatus = "PROVIDER_OUTCOME_UNKNOWN"
      receiptError = { code: "PROVIDER_OUTCOME_UNKNOWN", message: resultObj.error || "Provider outcome unknown", retryable: false }
    } else if (resultObj.status === "DETERMINISTIC_PROVIDER_FAILURE" as unknown as import("./types").ExternalCapabilityExecutionStatus) {
      finalStatus = "DETERMINISTIC_PROVIDER_FAILURE"
      receiptError = { code: "DETERMINISTIC_PROVIDER_FAILURE", message: resultObj.error || "Provider failed deterministically", retryable: false }
    } else if (resultObj.status === "LOCAL_PRECONDITION_FAILURE" as unknown as import("./types").ExternalCapabilityExecutionStatus) {
      finalStatus = "LOCAL_PRECONDITION_FAILURE"
      receiptError = { code: "LOCAL_PRECONDITION_FAILURE", message: resultObj.error || "Precondition failed", retryable: false }
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
    runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT,
    cost: { estimated: null, actual: null, currency: "TEST", status: "FREE" },
    providerReference: providerUsed,
    error: receiptError,
    provenanceReferences: []
  }

  const receipt: ExternalExecutionReceipt = {
    ...partialReceipt,
    receiptFingerprint: hash(partialReceipt)
  }

  const terminalState = finalStatus === "PROVIDER_OUTCOME_UNKNOWN" 
    ? "TERMINAL_OUTCOME_UNKNOWN" 
    : (finalStatus === "DETERMINISTIC_PROVIDER_FAILURE" || finalStatus === "PROVIDER_ERROR" || finalStatus === "LOCAL_PRECONDITION_FAILURE" ? "TERMINAL_FAILURE" : "TERMINAL_SUCCESS")

  if (terminalState === "TERMINAL_OUTCOME_UNKNOWN") { ledger.markOutcomeUnknown(intent.executionIntentFingerprint, receipt) } else { ledger.complete(intent.executionIntentFingerprint, receipt!) }

  return { status: finalStatus, receipt }
}
