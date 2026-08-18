import type { AuthorityContext } from "../../director/types"
import { fingerprintCanonicalJson, fingerprintProjectBrain } from "../../projects/fingerprint"
import {
  PROJECT_NEXT_ACTION_START_AUTHORITY_TARGET,
  PROJECT_NEXT_ACTION_START_SCOPE,
  startProjectNextAction,
  type StartProjectNextActionStatus,
} from "../../projects/next-action-status-writer"
import type { ProjectBrain } from "../../projects/types"
import {
  requireCanonicalWriteAccess,
  type CanonicalSessionLoader,
  type CanonicalWriteAuthState,
} from "../../security/canonical-write-access"
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
  getStartActionIdFromGovernedProposal,
  validateGovernedActionApproval,
  validateGovernedActionProposal,
} from "./validation"

export interface ProjectBrainStartNextActionProposalOptions {
  actionId: string
  correlationId: string
  proposedAt: string
  evidenceRefs?: readonly string[]
  provenanceRefs?: readonly string[]
}

export interface ExecuteProjectBrainStartNextActionOptions {
  approvalIntent: GovernedActionApprovalIntent
  executedAt: string
  sessionLoader?: CanonicalSessionLoader
  authState?: CanonicalWriteAuthState
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function proposalActionId(seed: unknown): string {
  return `gact-start-${fingerprintCanonicalJson(seed).slice(0, 20)}`
}

function receiptId(seed: unknown): string {
  return `gact-receipt-${fingerprintCanonicalJson(seed).slice(0, 24)}`
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
  return {
    schemaVersion: GOVERNED_ACTION_SCHEMA_VERSION,
    receiptId: receiptId({
      proposalFingerprint,
      executedAt,
      executionStatus,
      approvedBy: approval?.approvedBy ?? null,
      beforeFingerprint,
      afterFingerprint,
    }),
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
      "PROJECT_BRAIN_START_NEXT_ACTION changes only one existing ProjectAction status from todo to doing.",
      "Project phase/status, decisions, evidence truth state, Registry V2, Component Library, Film Kit execution, and external effects remain outside this operation.",
    ],
    executedAt,
    error,
  }
}

function mapWriterStatus(status: StartProjectNextActionStatus): GovernedActionExecutionStatus {
  if (status === "STARTED") return "APPLIED"
  if (status === "NO_CHANGE") return "NO_CHANGE"
  if (status === "INSUFFICIENT_AUTHORITY") return "REJECTED"
  return "BLOCKED"
}

export function createProjectBrainStartNextActionProposal(
  project: ProjectBrain,
  options: ProjectBrainStartNextActionProposalOptions,
): GovernedActionProposalProjection {
  const existing = project.nextActions.find((action) => action.id === options.actionId)
  if (!existing) {
    return { valid: false, errors: [`Canonical next action not found: ${options.actionId}`], proposal: null }
  }
  if (existing.status !== "todo") {
    return {
      valid: false,
      errors: [`Only a todo action can receive a start proposal; ${options.actionId} is ${existing.status}.`],
      proposal: null,
    }
  }

  const beforeFingerprint = fingerprintProjectBrain(project)
  const seed = {
    projectId: project.id,
    correlationId: options.correlationId,
    operation: "PROJECT_BRAIN_START_NEXT_ACTION",
    actionId: options.actionId,
    beforeFingerprint,
  }

  const proposal: GovernedActionProposal = {
    schemaVersion: GOVERNED_ACTION_SCHEMA_VERSION,
    actionId: proposalActionId(seed),
    correlationId: options.correlationId,
    projectId: project.id,
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "PROJECT_BRAIN",
    operation: "PROJECT_BRAIN_START_NEXT_ACTION",
    effectClass: "OWNER_STATE_MUTATION",
    requiredAuthority: "LOCAL_REVERSIBLE",
    approvalRequirement: "EXPLICIT",
    humanReviewRequired: true,
    requiredScopes: [PROJECT_NEXT_ACTION_START_SCOPE],
    beforeFingerprint,
    payload: {
      actionId: options.actionId,
      fromStatus: "todo",
      toStatus: "doing",
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

export async function executeProjectBrainStartNextActionProposal(
  proposal: GovernedActionProposal,
  options: ExecuteProjectBrainStartNextActionOptions,
): Promise<GovernedActionExecutionResult> {
  const proposalReport = validateGovernedActionProposal(proposal)
  if (!proposalReport.valid || proposal.operation !== "PROJECT_BRAIN_START_NEXT_ACTION") {
    return {
      approval: null,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        null,
        proposalReport.errors.join("; ") || "Expected PROJECT_BRAIN_START_NEXT_ACTION proposal.",
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
        "Explicit approval must reference the exact start-action proposal fingerprint.",
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
    grantedScopes: [PROJECT_NEXT_ACTION_START_SCOPE],
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

  const actionId = getStartActionIdFromGovernedProposal(proposal)
  if (!actionId) {
    return {
      approval,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        approval,
        "The governed start proposal does not contain a valid actionId.",
      ),
    }
  }

  const authorityContext: AuthorityContext = {
    authorityLevel: "local-reversible-execution",
    requestedAction: `Start canonical next action ${actionId}`,
    target: PROJECT_NEXT_ACTION_START_AUTHORITY_TARGET,
    reversibility: "reversible",
    risk: "low",
    approvalRequirement: "explicit",
    grantedScope: [PROJECT_NEXT_ACTION_START_SCOPE],
    grantedBy: access.principal.ownerGithubAccountId,
    grantedAt: options.executedAt,
    expiration: null,
    status: "granted",
  }

  const writeResult = await startProjectNextAction(
    {
      projectId: proposal.projectId,
      actionId,
      expectedProjectFingerprint: proposal.beforeFingerprint,
      executedAt: options.executedAt,
    },
    authorityContext,
  )

  return {
    approval,
    receipt: baseReceipt(
      proposal,
      options.executedAt,
      mapWriterStatus(writeResult.status),
      approval,
      writeResult.error ?? null,
      writeResult.beforeFingerprint ?? proposal.beforeFingerprint,
      writeResult.afterFingerprint ?? null,
    ),
  }
}
