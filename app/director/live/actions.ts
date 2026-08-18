"use server"

import { revalidatePath } from "next/cache"

import type { GovernedDirectorActionState } from "@/app/director/live/action-state"
export type { GovernedDirectorActionState } from "@/app/director/live/action-state"

import {
  executeProjectBrainCompleteNextActionProposal,
  executeProjectBrainNextActionProposal,
  executeProjectBrainStartNextActionProposal,
  projectDirectorNextActionToGovernedCompleteIntent,
  projectDirectorNextActionToGovernedStartIntent,
  projectDirectorNextActionToGovernedWriteIntent,
  projectGovernedActionReceiptToAuditEvidence,
} from "@/lib/creative-os/action-plane"
import { buildLiveDirectorProjection } from "@/lib/director/live-projection"
import { getProjectById } from "@/lib/projects/repository"

function actionState(
  status: GovernedDirectorActionState["status"],
  error: string | null = null,
  receiptId: string | null = null,
  auditTraceRef: string | null = null,
): GovernedDirectorActionState {
  return { status, receiptId, auditTraceRef, error }
}

function readIdentifiers(formData: FormData): { projectId: string; proposalFingerprint: string } | null {
  const projectId = String(formData.get("projectId") ?? "").trim()
  const proposalFingerprint = String(formData.get("proposalFingerprint") ?? "").trim()
  if (!projectId || !/^[a-f0-9]{64}$/.test(proposalFingerprint)) return null
  return { projectId, proposalFingerprint }
}

function revalidateProjectSurfaces(projectId: string): void {
  revalidatePath("/director/live")
  revalidatePath("/projects")
  revalidatePath(`/projects/${encodeURIComponent(projectId)}`)
}

function extractAuditTraceRef(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null
  const traceRef = (value as { traceRef?: unknown }).traceRef
  return typeof traceRef === "string" && traceRef.trim() ? traceRef.trim() : null
}

export async function approveDirectorNextAction(
  _previousState: GovernedDirectorActionState,
  formData: FormData,
): Promise<GovernedDirectorActionState> {
  const identifiers = readIdentifiers(formData)
  if (!identifiers) return actionState("INVALID", "A valid project identity and governed proposal fingerprint are required.")

  const project = await getProjectById(identifiers.projectId)
  if (!project) return actionState("INVALID", `Project not found: ${identifiers.projectId}`)

  const projection = buildLiveDirectorProjection(project)
  if (!projection) return actionState("INVALID", "The current canonical project state is not Director-compatible.")

  const intent = projectDirectorNextActionToGovernedWriteIntent(project, projection.result, projection.evaluationTimestamp)
  if (intent.status === "ALREADY_CANONICAL") return actionState("ALREADY_CANONICAL")
  if (intent.status !== "PROPOSAL_READY" || !intent.proposal || !intent.proposalFingerprint) {
    return actionState("INVALID", intent.errors.join("; ") || `Governed action intent is ${intent.status}.`)
  }
  if (intent.proposalFingerprint !== identifiers.proposalFingerprint) {
    return actionState("STALE_PROPOSAL", "The canonical Director proposal changed before approval. Refresh and review the new proposal.")
  }

  const execution = await executeProjectBrainNextActionProposal(intent.proposal, {
    approvalIntent: { decision: "APPROVE", proposalFingerprint: identifiers.proposalFingerprint },
    executedAt: new Date().toISOString(),
  })

  revalidateProjectSurfaces(identifiers.projectId)
  return actionState(execution.receipt.executionStatus, execution.receipt.error, execution.receipt.receiptId)
}

export async function approveDirectorStartNextAction(
  _previousState: GovernedDirectorActionState,
  formData: FormData,
): Promise<GovernedDirectorActionState> {
  const identifiers = readIdentifiers(formData)
  if (!identifiers) return actionState("INVALID", "A valid project identity and governed start-action fingerprint are required.")

  const project = await getProjectById(identifiers.projectId)
  if (!project) return actionState("INVALID", `Project not found: ${identifiers.projectId}`)

  const projection = buildLiveDirectorProjection(project)
  if (!projection) return actionState("INVALID", "The current canonical project state is not Director-compatible.")

  const intent = projectDirectorNextActionToGovernedStartIntent(project, projection.result, projection.evaluationTimestamp)
  if (intent.status === "ALREADY_STARTED") return actionState("ALREADY_STARTED")
  if (intent.status === "ALREADY_COMPLETED") return actionState("ALREADY_COMPLETED")
  if (intent.status !== "PROPOSAL_READY" || !intent.proposal || !intent.proposalFingerprint) {
    return actionState(
      intent.status === "ACTION_BLOCKED" ? "BLOCKED" : "INVALID",
      intent.errors.join("; ") || `Governed start intent is ${intent.status}.`,
    )
  }
  if (intent.proposalFingerprint !== identifiers.proposalFingerprint) {
    return actionState("STALE_PROPOSAL", "The canonical start-action proposal changed before approval. Refresh and review the new proposal.")
  }

  const execution = await executeProjectBrainStartNextActionProposal(intent.proposal, {
    approvalIntent: { decision: "APPROVE", proposalFingerprint: identifiers.proposalFingerprint },
    executedAt: new Date().toISOString(),
  })

  revalidateProjectSurfaces(identifiers.projectId)
  return actionState(execution.receipt.executionStatus, execution.receipt.error, execution.receipt.receiptId)
}

export async function approveDirectorCompleteNextAction(
  _previousState: GovernedDirectorActionState,
  formData: FormData,
): Promise<GovernedDirectorActionState> {
  const identifiers = readIdentifiers(formData)
  if (!identifiers) return actionState("INVALID", "A valid project identity and governed completion fingerprint are required.")

  const project = await getProjectById(identifiers.projectId)
  if (!project) return actionState("INVALID", `Project not found: ${identifiers.projectId}`)

  const projection = buildLiveDirectorProjection(project)
  if (!projection) return actionState("INVALID", "The current canonical project state is not Director-compatible.")

  const intent = projectDirectorNextActionToGovernedCompleteIntent(project, projection.result, projection.evaluationTimestamp)
  if (intent.status === "ALREADY_COMPLETED") return actionState("ALREADY_COMPLETED")
  if (intent.status !== "PROPOSAL_READY" || !intent.proposal || !intent.proposalFingerprint) {
    return actionState(
      intent.status === "ACTION_BLOCKED" ? "BLOCKED" : "INVALID",
      intent.errors.join("; ") || `Governed completion intent is ${intent.status}.`,
    )
  }
  if (intent.proposalFingerprint !== identifiers.proposalFingerprint) {
    return actionState("STALE_PROPOSAL", "The canonical completion proposal changed before approval. Refresh and review the new proposal.")
  }

  const execution = await executeProjectBrainCompleteNextActionProposal(intent.proposal, {
    approvalIntent: { decision: "APPROVE", proposalFingerprint: identifiers.proposalFingerprint },
    executedAt: new Date().toISOString(),
  })

  const audit = projectGovernedActionReceiptToAuditEvidence(execution.receipt, {
    projectPhase: projection.result.resolvedPhase,
    projectMode: projection.mode,
  })
  const auditTraceRef = audit.result ? extractAuditTraceRef(audit.result.structuredOutput.auditTrace) : null

  revalidateProjectSurfaces(identifiers.projectId)
  return actionState(
    execution.receipt.executionStatus,
    execution.receipt.error ?? (audit.valid ? null : audit.errors.join("; ")),
    execution.receipt.receiptId,
    auditTraceRef,
  )
}
