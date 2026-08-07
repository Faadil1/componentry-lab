import type { AuthorityCeiling } from "../types"
import type { CreativeProjectMode, CreativeProjectPhase } from "../../director/types"

export type FilmKitCapabilityType =
  | "SHOT_PLANNING"
  | "CAMERA_LANGUAGE"
  | "UI_CAPTURE"
  | "PRODUCT_FILM"
  | "MOTION_COMPOSITION"
  | "B_ROLL"
  | "CINEMATIC_PROMPTING"
  | "SOUND_DESIGN"
  | "ASSEMBLY"

export type ExternalCapabilityExecutionMode = "NOT_EXECUTED" | "SIMULATED"

export type ExternalCapabilityExecutionStatus =
  // Slice 3C statuses (retained for backward compatibility or refactored)
  | "USE_NATIVE"
  | "USE_EXISTING_INTERNAL"
  | "EXTERNAL_PLAN_READY"
  | "EXTERNAL_EXPERIMENTAL_CANDIDATE"
  | "DISCOVERY_REQUIRED"
  | "HUMAN_APPROVAL_REQUIRED"
  | "NO_MATCH"
  | "BLOCKED"
  // Slice 3D.1 Execution Status Taxonomy
  | "NOT_EXECUTED"
  | "APPROVAL_REQUIRED"
  | "APPROVAL_DENIED"
  | "APPROVAL_INVALID"
  | "AUTHORITY_BLOCKED"
  | "COST_BLOCKED"
  | "PLAN_STALE"
  | "PLAN_INCOMPATIBLE"
  | "ADAPTER_MISSING"
  | "ADAPTER_NOT_EXECUTABLE"
  | "EXECUTION_READY"
  | "EXECUTED"
  | "EXECUTED_PARTIAL"
  | "ALREADY_EXECUTED"
  | "PROVIDER_ERROR"

export type HumanApprovalState = "NOT_REQUIRED" | "REQUIRED" | "GRANTED" | "DENIED" | "INVALID"

export type CostStatus = "FREE" | "PAID" | "SUBSCRIPTION" | "UNKNOWN"

export type PrivacyStatus =
  | "LOCAL_ONLY"
  | "ZERO_RETENTION"
  | "TRAINING_OPT_OUT"
  | "THIRD_PARTY_PROCESSED"
  | "UNKNOWN"

export interface ExternalCapabilityPlanRequest {
  capabilityGap?: string
  artifactType?: string
  projectMode: CreativeProjectMode
  phase: CreativeProjectPhase
  currentAuthority: AuthorityCeiling
  frameworkOrSurface?: string
  metadata?: Record<string, unknown>
}

export interface ExternalCapabilityPlan {
  projectId?: string
  projectBrainFingerprint?: string
  resourceId: string | null
  capabilityId: string
  decomposedCapabilities: FilmKitCapabilityType[]

  requestedArtifact: string | null

  compatibilityStatus: "VERIFIED" | "DECLARED" | "UNKNOWN" | "INCOMPATIBLE"
  compatibilityEvidence: string | null

  lifecycleState: string | null

  currentAuthority: AuthorityCeiling
  requiredAuthority: AuthorityCeiling
  requiredHumanApproval: boolean
  humanApprovalState: HumanApprovalState

  costStatus: CostStatus
  estimatedCost: string | null

  privacyStatus: PrivacyStatus
  licenseStatus: string | null

  requiredInputs: string[]
  expectedOutputs: string[]

  executionMode: ExternalCapabilityExecutionMode
  executionStatus: ExternalCapabilityExecutionStatus

  blockers: string[]
  missingEvidence: string[]

  planFingerprint: string
  executionResult?: ExternalCapabilityExecutionResult
}

export interface HumanApprovalDecision {
  approvalState: "GRANTED" | "DENIED"
  projectId: string
  projectBrainFingerprint: string
  planFingerprint: string
  resourceId: string | null
  capabilityId: string
  providerAdapterId: string
  approvedAuthority: AuthorityCeiling
  costCeiling: string | null
  approvedArtifactType?: string
  approvedInputFingerprint?: string
  approvedConstraints?: Record<string, unknown>
  approvalFingerprint: string
}

export interface ExternalExecutionIntent {
  projectId: string
  projectBrainFingerprint: string
  planFingerprint: string
  resourceId: string | null
  capabilityId: string
  adapterId: string
  authority: AuthorityCeiling
  inputFingerprint: string
  expectedArtifactType: string | null
  costCeiling: string | null
  approvalFingerprint: string | null
  executionIntentFingerprint: string
}

export interface ExternalExecutionReceipt {
  receiptFingerprint: string
  executionIntentFingerprint: string
  approvalFingerprint: string | null
  projectId: string
  projectBrainFingerprint: string
  planFingerprint: string
  resourceId: string | null
  capabilityId: string
  providerAdapterId: string
  authorityUsed: AuthorityCeiling
  executionStatus: ExternalCapabilityExecutionStatus
  inputFingerprint: string
  providerOutputFingerprint: string | null
  artifactReferences: string[]
  cost: {
    estimated: string | null
    actual: string | null
    currency: string
    status: CostStatus
  }
  providerReference: string | null
  error?: {
    code: string
    message: string
    retryable: boolean
  }
  provenanceReferences: string[]
}

// Deprecated in favor of ExternalExecutionReceipt for Sandbox
export interface ExternalCapabilityExecutionResult {
  executionId: string
  planFingerprint: string
  providerUsed: string
  status: "COMPLETE" | "PARTIAL" | "BLOCKED" | "FAILED"
  rawOutput: Record<string, unknown>
  executionTimeMs: number
  error?: string
  receipt?: ExternalExecutionReceipt
}
