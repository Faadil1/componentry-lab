import type { AuthorityCeiling } from "../types"
import type { CollaborationEffectClass, CollaborationJsonValue, CollaborationSystemId } from "../collaboration/types"

export const GOVERNED_ACTION_SCHEMA_VERSION = "1.0.0" as const

export type GovernedActionOperation =
  | "PROJECT_BRAIN_APPEND_NEXT_ACTION"
  | "PROJECT_BRAIN_START_NEXT_ACTION"
  | "PROJECT_BRAIN_COMPLETE_NEXT_ACTION"
export type GovernedActionProposalStatus = "PROPOSED"
export type GovernedActionApprovalDecision = "APPROVED"
export type GovernedActionApprovalStatus = "GRANTED"
export type GovernedActionExecutionStatus = "APPLIED" | "NO_CHANGE" | "BLOCKED" | "REJECTED"

export interface GovernedActionProposal {
  schemaVersion: typeof GOVERNED_ACTION_SCHEMA_VERSION
  actionId: string
  correlationId: string
  projectId: string
  sourceSystem: CollaborationSystemId
  targetSystem: CollaborationSystemId
  operation: GovernedActionOperation
  effectClass: CollaborationEffectClass
  requiredAuthority: AuthorityCeiling
  approvalRequirement: "EXPLICIT"
  humanReviewRequired: true
  requiredScopes: readonly string[]
  beforeFingerprint: string
  payload: Readonly<Record<string, CollaborationJsonValue>>
  evidenceRefs: readonly string[]
  provenanceRefs: readonly string[]
  proposedAt: string
  status: GovernedActionProposalStatus
}

export interface GovernedActionApprovalIntent {
  decision: "APPROVE"
  proposalFingerprint: string
}

export interface GovernedActionApproval {
  schemaVersion: typeof GOVERNED_ACTION_SCHEMA_VERSION
  actionId: string
  projectId: string
  proposalFingerprint: string
  decision: GovernedActionApprovalDecision
  approvedBy: string
  approvedAt: string
  grantedAuthority: "LOCAL_REVERSIBLE"
  grantedScopes: readonly string[]
  status: GovernedActionApprovalStatus
}

export interface GovernedActionReceipt {
  schemaVersion: typeof GOVERNED_ACTION_SCHEMA_VERSION
  receiptId: string
  actionId: string
  correlationId: string
  projectId: string
  operation: GovernedActionOperation
  sourceSystem: CollaborationSystemId
  targetSystem: CollaborationSystemId
  executionStatus: GovernedActionExecutionStatus
  mutationApplied: boolean
  beforeFingerprint: string | null
  afterFingerprint: string | null
  proposalFingerprint: string
  approval: GovernedActionApproval | null
  evidenceRefs: readonly string[]
  provenanceRefs: readonly string[]
  limitations: readonly string[]
  executedAt: string
  error: string | null
}

export interface GovernedActionValidationReport {
  valid: boolean
  errors: readonly string[]
}

export interface GovernedActionProposalProjection {
  valid: boolean
  errors: readonly string[]
  proposal: GovernedActionProposal | null
}

export interface GovernedActionExecutionResult {
  approval: GovernedActionApproval | null
  receipt: GovernedActionReceipt
}
