import type { AuthorityContext } from "../../director/types"
import { fingerprintCanonicalJson, fingerprintProjectBrain } from "../../projects/fingerprint"
import {
  completeProjectNextAction,
  PROJECT_NEXT_ACTION_COMPLETE_AUTHORITY_TARGET,
  PROJECT_NEXT_ACTION_COMPLETE_SCOPE,
  type CompleteProjectNextActionStatus,
} from "../../projects/next-action-complete-writer"
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
  getCompletionPayloadFromGovernedProposal,
  validateGovernedActionApproval,
  validateGovernedActionProposal,
} from "./validation"

export interface ProjectBrainCompleteNextActionProposalOptions {
  actionId: string
  evidenceId: string
  correlationId: string
  proposedAt: string
  provenanceRefs?: readonly string[]
}

export interface ExecuteProjectBrainCompleteNextActionOptions {
  approvalIntent: GovernedActionApprovalIntent
  executedAt: string
  sessionLoader?: CanonicalSessionLoader
  authState?: CanonicalWriteAuthState
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function canonicalEvidenceRef(projectId: string, evidenceId: string): string {
  return `project-brain:${projectId}:evidence:${evidenceId}`
}

function proposalActionId(seed: unknown): string {
  return `gact-complete-${fingerprintCanonicalJson(seed).slice(0, 20)}`
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
  additionalEvidenceRefs: readonly string[] = [],
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
    evidenceRefs: uniqueSorted([...proposal.evidenceRefs, ...additionalEvidenceRefs]),
    provenanceRefs: uniqueSorted([
      ...proposal.provenanceRefs,
      `governed-action:${proposal.actionId}`,
      ...(approval ? ["canonical-owner-auth:verified"] : []),
    ]),
    limitations: [
      "PROJECT_BRAIN_COMPLETE_NEXT_ACTION changes only one existing ProjectAction status from doing to done.",
      "The completion evidence reference is canonical trace metadata; this receipt does not independently verify the underlying evidence claim.",
      "Project phase/status, decisions, Registry V2, Component Library, Film Kit execution, providers, references and external effects remain outside this operation.",
    ],
    executedAt,
    error,
  }
}

function mapWriterStatus(status: CompleteProjectNextActionStatus): GovernedActionExecutionStatus {
  if (status === "COMPLETED") return "APPLIED"
  if (status === "NO_CHANGE") return "NO_CHANGE"
  if (status === "INSUFFICIENT_AUTHORITY") return "REJECTED"
  return "BLOCKED"
}

export function createProjectBrainCompleteNextActionProposal(
  project: ProjectBrain,
  options: ProjectBrainCompleteNextActionProposalOptions,
): GovernedActionProposalProjection {
  const action = project.nextActions.find((item) => item.id === options.actionId)
  if (!action) {
    return { valid: false, errors: [`Canonical next action not found: ${options.actionId}`], proposal: null }
  }
  if (action.status !== "doing") {
    return {
      valid: false,
      errors: [`Only a doing action can receive a completion proposal; ${options.actionId} is ${action.status}.`],
      proposal: null,
    }
  }

  const evidence = project.evidence.find((item) => item.id === options.evidenceId)
  if (!evidence) {
    return { valid: false, errors: [`Canonical completion evidence not found: ${options.evidenceId}`], proposal: null }
  }
  if (evidence.status !== "available") {
    return {
      valid: false,
      errors: [`Completion evidence ${options.evidenceId} is ${evidence.status}, not available.`],
      proposal: null,
    }
  }

  const beforeFingerprint = fingerprintProjectBrain(project)
  const evidenceRef = canonicalEvidenceRef(project.id, options.evidenceId)
  const seed = {
    projectId: project.id,
    correlationId: options.correlationId,
    operation: "PROJECT_BRAIN_COMPLETE_NEXT_ACTION",
    actionId: options.actionId,
    evidenceId: options.evidenceId,
    beforeFingerprint,
  }

  const proposal: GovernedActionProposal = {
    schemaVersion: GOVERNED_ACTION_SCHEMA_VERSION,
    actionId: proposalActionId(seed),
    correlationId: options.correlationId,
    projectId: project.id,
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "PROJECT_BRAIN",
    operation: "PROJECT_BRAIN_COMPLETE_NEXT_ACTION",
    effectClass: "OWNER_STATE_MUTATION",
    requiredAuthority: "LOCAL_REVERSIBLE",
    approvalRequirement: "EXPLICIT",
    humanReviewRequired: true,
    requiredScopes: [PROJECT_NEXT_ACTION_COMPLETE_SCOPE],
    beforeFingerprint,
    payload: {
      actionId: options.actionId,
      evidenceId: options.evidenceId,
      fromStatus: "doing",
      toStatus: "done",
    },
    evidenceRefs: [evidenceRef],
    provenanceRefs: uniqueSorted([
      "creative-director",
      evidenceRef,
      ...(options.provenanceRefs ?? []),
    ]),
    proposedAt: options.proposedAt,
    status: "PROPOSED",
  }

  const report = validateGovernedActionProposal(proposal)
  return { valid: report.valid, errors: report.errors, proposal: report.valid ? proposal : null }
}

export async function executeProjectBrainCompleteNextActionProposal(
  proposal: GovernedActionProposal,
  options: ExecuteProjectBrainCompleteNextActionOptions,
): Promise<GovernedActionExecutionResult> {
  const proposalReport = validateGovernedActionProposal(proposal)
  if (!proposalReport.valid || proposal.operation !== "PROJECT_BRAIN_COMPLETE_NEXT_ACTION") {
    return {
      approval: null,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        null,
        proposalReport.errors.join("; ") || "Expected PROJECT_BRAIN_COMPLETE_NEXT_ACTION proposal.",
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
        "Explicit approval must reference the exact completion proposal fingerprint.",
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
    grantedScopes: [PROJECT_NEXT_ACTION_COMPLETE_SCOPE],
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

  const completion = getCompletionPayloadFromGovernedProposal(proposal)
  if (!completion) {
    return {
      approval,
      receipt: baseReceipt(
        proposal,
        options.executedAt,
        "REJECTED",
        approval,
        "The governed completion proposal does not contain a valid actionId/evidenceId pair.",
      ),
    }
  }

  const authorityContext: AuthorityContext = {
    authorityLevel: "local-reversible-execution",
    requestedAction: `Complete canonical next action ${completion.actionId}`,
    target: PROJECT_NEXT_ACTION_COMPLETE_AUTHORITY_TARGET,
    reversibility: "reversible",
    risk: "low",
    approvalRequirement: "explicit",
    grantedScope: [PROJECT_NEXT_ACTION_COMPLETE_SCOPE],
    grantedBy: access.principal.ownerGithubAccountId,
    grantedAt: options.executedAt,
    expiration: null,
    status: "granted",
  }

  const writeResult = await completeProjectNextAction(
    {
      projectId: proposal.projectId,
      actionId: completion.actionId,
      evidenceId: completion.evidenceId,
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
      writeResult.evidenceRef ? [writeResult.evidenceRef] : [],
    ),
  }
}
