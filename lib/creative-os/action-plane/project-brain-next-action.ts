import type { AuthorityContext } from "../../director/types"
import { fingerprintCanonicalJson, fingerprintProjectBrain } from "../../projects/fingerprint"
import {
  appendProjectNextAction,
  PROJECT_NEXT_ACTION_APPEND_SCOPE,
  PROJECT_NEXT_ACTION_AUTHORITY_TARGET,
  type AppendProjectNextActionStatus,
} from "../../projects/next-action-writer"
import type { ProjectAction, ProjectBrain } from "../../projects/types"
import {
  requireCanonicalWriteAccess,
  type CanonicalSessionLoader,
  type CanonicalWriteAuthState,
} from "../../security/canonical-write-access"
import type { CollaborationJsonValue } from "../collaboration/types"
import {
  GOVERNED_ACTION_SCHEMA_VERSION,
  type GovernedActionApproval,
  type GovernedActionApprovalIntent,
  type GovernedActionExecutionResult,
  type GovernedActionExecutionStatus,
  type GovernedActionProposal,
  type GovernedActionProposalProjection,
  type GovernedActionReceipt,
} from "./types"
import {
  fingerprintGovernedActionProposal,
  getProjectActionFromGovernedProposal,
  validateGovernedActionApproval,
  validateGovernedActionProposal,
} from "./validation"

export interface ProjectBrainNextActionProposalOptions {
  correlationId: string
  action: ProjectAction
  proposedAt: string
  evidenceRefs?: readonly string[]
  provenanceRefs?: readonly string[]
}

export interface ExecuteProjectBrainNextActionOptions {
  approvalIntent: GovernedActionApprovalIntent
  executedAt: string
  sessionLoader?: CanonicalSessionLoader
  authState?: CanonicalWriteAuthState
}

function toCollaborationJsonValue(value: unknown): CollaborationJsonValue {
  const serialized = JSON.stringify(value)
  if (serialized === undefined) throw new Error("Governed action payload must be JSON serializable")
  return JSON.parse(serialized) as CollaborationJsonValue
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function receiptId(seed: unknown): string {
  return `gact-receipt-${fingerprintCanonicalJson(seed).slice(0, 24)}`
}

function proposalActionId(seed: unknown): string {
  return `gact-${fingerprintCanonicalJson(seed).slice(0, 24)}`
}

function baseReceipt(
  proposal: GovernedActionProposal,
  executedAt: string,
  executionStatus: GovernedActionExecutionStatus,
  approval: GovernedActionApproval | null,
  error: string | null,
  beforeFingerprint: string | null = proposal.beforeFingerprint,
  afterFingerprint: string | null = null,
): GovernedActionReceipt {
  const proposalFingerprint = fingerprintGovernedActionProposal(proposal)
  const seed = {
    proposalFingerprint,
    executedAt,
    executionStatus,
    approvedBy: approval?.approvedBy ?? null,
    beforeFingerprint,
    afterFingerprint,
  }

  return {
    schemaVersion: GOVERNED_ACTION_SCHEMA_VERSION,
    receiptId: receiptId(seed),
    actionId: proposal.actionId,
    correlationId: proposal.correlationId,
    projectId: proposal.projectId,
    operation: proposal.operation,
    sourceSystem: proposal.sourceSystem,
    targetSystem: proposal.targetSystem,
    executionStatus,
    mutationApplied: executionStatus === "APPLIED",
    beforeFingerprint,
    afterFingerprint,
    proposalFingerprint,
    approval,
    evidenceRefs: uniqueSorted(proposal.evidenceRefs),
    provenanceRefs: uniqueSorted([
      ...proposal.provenanceRefs,
      `governed-action:${proposal.actionId}`,
      ...(approval ? ["canonical-owner-auth:verified"] : []),
    ]),
    limitations: [
      "Slice I permits only PROJECT_BRAIN_APPEND_NEXT_ACTION.",
      "Phase, status, decisions, evidence truth state, Registry V2, Component Library, Film Kit execution, and external effects remain non-writable through this action plane.",
    ],
    executedAt,
    error,
  }
}

function mapWriterStatus(status: AppendProjectNextActionStatus): GovernedActionExecutionStatus {
  if (status === "APPENDED") return "APPLIED"
  if (status === "NO_CHANGE") return "NO_CHANGE"
  if (status === "INSUFFICIENT_AUTHORITY") return "REJECTED"
  return "BLOCKED"
}

export function createProjectBrainNextActionProposal(
  project: ProjectBrain,
  options: ProjectBrainNextActionProposalOptions,
): GovernedActionProposalProjection {
  const beforeFingerprint = fingerprintProjectBrain(project)
  const seed = {
    projectId: project.id,
    correlationId: options.correlationId,
    operation: "PROJECT_BRAIN_APPEND_NEXT_ACTION",
    beforeFingerprint,
    action: options.action,
  }

  const proposal: GovernedActionProposal = {
    schemaVersion: GOVERNED_ACTION_SCHEMA_VERSION,
    actionId: proposalActionId(seed),
    correlationId: options.correlationId,
    projectId: project.id,
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "PROJECT_BRAIN",
    operation: "PROJECT_BRAIN_APPEND_NEXT_ACTION",
    effectClass: "OWNER_STATE_MUTATION",
    requiredAuthority: "LOCAL_REVERSIBLE",
    approvalRequirement: "EXPLICIT",
    humanReviewRequired: true,
    requiredScopes: [PROJECT_NEXT_ACTION_APPEND_SCOPE],
    beforeFingerprint,
    payload: {
      action: toCollaborationJsonValue(options.action),
    },
    evidenceRefs: uniqueSorted(options.evidenceRefs ?? []),
    provenanceRefs: uniqueSorted([
      "creative-director",
      ...(options.provenanceRefs ?? []),
    ]),
    proposedAt: options.proposedAt,
    status: "PROPOSED",
  }

  const report = validateGovernedActionProposal(proposal)
  return {
    valid: report.valid,
    errors: report.errors,
    proposal: report.valid ? proposal : null,
  }
}

export async function executeProjectBrainNextActionProposal(
  proposal: GovernedActionProposal,
  options: ExecuteProjectBrainNextActionOptions,
): Promise<GovernedActionExecutionResult> {
  const proposalReport = validateGovernedActionProposal(proposal)
  if (!proposalReport.valid) {
    return {
      approval: null,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        null,
        proposalReport.errors.join("; "),
      ),
    }
  }

  const proposalFingerprint = fingerprintGovernedActionProposal(proposal)
  if (
    options.approvalIntent.decision !== "APPROVE" ||
    options.approvalIntent.proposalFingerprint !== proposalFingerprint
  ) {
    return {
      approval: null,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        null,
        "Explicit approval must reference the exact governed action proposal fingerprint.",
      ),
    }
  }

  const access = await requireCanonicalWriteAccess(options.sessionLoader, options.authState)
  if (!access.ok) {
    return {
      approval: null,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        null,
        `Canonical owner authorization failed: ${access.principal.reason}.`,
      ),
    }
  }

  const approval: GovernedActionApproval = {
    schemaVersion: GOVERNED_ACTION_SCHEMA_VERSION,
    actionId: proposal.actionId,
    projectId: proposal.projectId,
    proposalFingerprint,
    decision: "APPROVED",
    approvedBy: access.principal.ownerGithubAccountId,
    approvedAt: options.executedAt,
    grantedAuthority: "LOCAL_REVERSIBLE",
    grantedScopes: [PROJECT_NEXT_ACTION_APPEND_SCOPE],
    status: "GRANTED",
  }

  const approvalReport = validateGovernedActionApproval(proposal, approval)
  if (!approvalReport.valid) {
    return {
      approval: null,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        null,
        approvalReport.errors.join("; "),
      ),
    }
  }

  const action = getProjectActionFromGovernedProposal(proposal)
  if (!action) {
    return {
      approval,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        approval,
        "The governed proposal does not contain a valid ProjectAction payload.",
      ),
    }
  }

  const domainAuthority: AuthorityContext = {
    authorityLevel: "local-reversible-execution",
    requestedAction: "Append approved governed next action",
    target: PROJECT_NEXT_ACTION_AUTHORITY_TARGET,
    reversibility: "reversible",
    risk: "low",
    approvalRequirement: "explicit",
    grantedScope: [PROJECT_NEXT_ACTION_APPEND_SCOPE],
    grantedBy: access.principal.ownerGithubAccountId,
    grantedAt: options.executedAt,
    expiration: null,
    status: "granted",
  }

  const writeResult = await appendProjectNextAction(
    {
      projectId: proposal.projectId,
      action,
      expectedProjectFingerprint: proposal.beforeFingerprint,
      executedAt: options.executedAt,
    },
    domainAuthority,
  )

  const executionStatus = mapWriterStatus(writeResult.status)
  return {
    approval,
    receipt: baseReceipt(
      proposal,
      options.executedAt,
      executionStatus,
      approval,
      writeResult.error ?? null,
      writeResult.beforeFingerprint ?? proposal.beforeFingerprint,
      writeResult.afterFingerprint ?? null,
    ),
  }
}
