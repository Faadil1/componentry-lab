import {
  COLLABORATION_SCHEMA_VERSION,
  type AuditEvidenceCollaborationProjection,
  projectAuditEvidenceCollaboration,
  type CollaborationRequest,
} from "../collaboration"
import type { GovernedActionReceipt } from "./types"

export interface GovernedActionAuditProjectionOptions {
  projectPhase: string
  projectMode: string
}

export function projectGovernedActionReceiptToAuditEvidence(
  receipt: GovernedActionReceipt,
  options: GovernedActionAuditProjectionOptions,
): AuditEvidenceCollaborationProjection {
  const receiptEvidenceRef = `governed-action-receipt:${receipt.receiptId}`
  const evidenceRefs = [...new Set([...receipt.evidenceRefs, receiptEvidenceRef])].sort((a, b) => a.localeCompare(b))
  const provenanceRefs = [...new Set([
    ...receipt.provenanceRefs,
    `governed-action:${receipt.actionId}`,
    receiptEvidenceRef,
  ])].sort((a, b) => a.localeCompare(b))

  const request: CollaborationRequest = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: receipt.projectId,
    correlationId: `audit:${receipt.receiptId}`,
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "AUDIT_EVIDENCE",
    intent: "RETURN_EVIDENCE",
    projectPhase: options.projectPhase,
    projectMode: options.projectMode,
    capabilityRefs: [],
    authorityContext: {
      currentAuthority: "SUGGEST",
      requestedAuthority: "READ_ONLY",
      ownerSystem: "PROJECT_BRAIN",
      humanReviewRequired: false,
    },
    structuredInputs: {
      subject: `Governed action receipt ${receipt.operation}`,
      claimedStatus: receipt.executionStatus,
      provenanceRefs,
      limitationRefs: [...receipt.limitations],
    },
    inputRefs: [receipt.proposalFingerprint, receipt.receiptId],
    evidenceRefs,
    requestedEffectClass: "NONE",
    hopTrace: [
      {
        sourceSystem: "PROJECT_BRAIN",
        targetSystem: "CREATIVE_DIRECTOR",
      },
    ],
    status: "REQUESTED",
  }

  return projectAuditEvidenceCollaboration(request)
}
