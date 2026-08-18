"use server"

import { revalidatePath } from "next/cache"

import {
  executeProjectBrainNextActionProposal,
  executeProjectBrainStartNextActionProposal,
  projectDirectorNextActionToGovernedStartIntent,
  projectDirectorNextActionToGovernedWriteIntent,
} from "@/lib/creative-os/action-plane"
import { buildLiveDirectorProjection } from "@/lib/director/live-projection"
import { getProjectById } from "@/lib/projects/repository"

export type GovernedDirectorActionState = {
  status:
    | "IDLE"
    | "APPLIED"
    | "NO_CHANGE"
    | "BLOCKED"
    | "REJECTED"
    | "STALE_PROPOSAL"
    | "ALREADY_CANONICAL"
    | "ALREADY_STARTED"
    | "ALREADY_COMPLETED"
    | "INVALID"
  receiptId: string | null
  error: string | null
}

export const INITIAL_GOVERNED_DIRECTOR_ACTION_STATE: GovernedDirectorActionState = {
  status: "IDLE",
  receiptId: null,
  error: null,
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

export async function approveDirectorNextAction(
  _previousState: GovernedDirectorActionState,
  formData: FormData,
): Promise<GovernedDirectorActionState> {
  const identifiers = readIdentifiers(formData)
  if (!identifiers) {
    return {
      status: "INVALID",
      receiptId: null,
      error: "A valid project identity and governed proposal fingerprint are required.",
    }
  }

  const project = await getProjectById(identifiers.projectId)
  if (!project) {
    return { status: "INVALID", receiptId: null, error: `Project not found: ${identifiers.projectId}` }
  }

  const projection = buildLiveDirectorProjection(project)
  if (!projection) {
    return {
      status: "INVALID",
      receiptId: null,
      error: "The current canonical project state is not Director-compatible.",
    }
  }

  const intent = projectDirectorNextActionToGovernedWriteIntent(
    project,
    projection.result,
    projection.evaluationTimestamp,
  )

  if (intent.status === "ALREADY_CANONICAL") {
    return { status: "ALREADY_CANONICAL", receiptId: null, error: null }
  }
  if (intent.status !== "PROPOSAL_READY" || !intent.proposal || !intent.proposalFingerprint) {
    return {
      status: "INVALID",
      receiptId: null,
      error: intent.errors.join("; ") || `Governed action intent is ${intent.status}.`,
    }
  }
  if (intent.proposalFingerprint !== identifiers.proposalFingerprint) {
    return {
      status: "STALE_PROPOSAL",
      receiptId: null,
      error: "The canonical Director proposal changed before approval. Refresh and review the new proposal.",
    }
  }

  const execution = await executeProjectBrainNextActionProposal(intent.proposal, {
    approvalIntent: {
      decision: "APPROVE",
      proposalFingerprint: identifiers.proposalFingerprint,
    },
    executedAt: new Date().toISOString(),
  })

  revalidateProjectSurfaces(identifiers.projectId)
  return {
    status: execution.receipt.executionStatus,
    receiptId: execution.receipt.receiptId,
    error: execution.receipt.error,
  }
}

export async function approveDirectorStartNextAction(
  _previousState: GovernedDirectorActionState,
  formData: FormData,
): Promise<GovernedDirectorActionState> {
  const identifiers = readIdentifiers(formData)
  if (!identifiers) {
    return {
      status: "INVALID",
      receiptId: null,
      error: "A valid project identity and governed start-action fingerprint are required.",
    }
  }

  const project = await getProjectById(identifiers.projectId)
  if (!project) {
    return { status: "INVALID", receiptId: null, error: `Project not found: ${identifiers.projectId}` }
  }

  const projection = buildLiveDirectorProjection(project)
  if (!projection) {
    return {
      status: "INVALID",
      receiptId: null,
      error: "The current canonical project state is not Director-compatible.",
    }
  }

  const intent = projectDirectorNextActionToGovernedStartIntent(
    project,
    projection.result,
    projection.evaluationTimestamp,
  )

  if (intent.status === "ALREADY_STARTED") {
    return { status: "ALREADY_STARTED", receiptId: null, error: null }
  }
  if (intent.status === "ALREADY_COMPLETED") {
    return { status: "ALREADY_COMPLETED", receiptId: null, error: null }
  }
  if (intent.status !== "PROPOSAL_READY" || !intent.proposal || !intent.proposalFingerprint) {
    return {
      status: intent.status === "ACTION_BLOCKED" ? "BLOCKED" : "INVALID",
      receiptId: null,
      error: intent.errors.join("; ") || `Governed start intent is ${intent.status}.`,
    }
  }
  if (intent.proposalFingerprint !== identifiers.proposalFingerprint) {
    return {
      status: "STALE_PROPOSAL",
      receiptId: null,
      error: "The canonical start-action proposal changed before approval. Refresh and review the new proposal.",
    }
  }

  const execution = await executeProjectBrainStartNextActionProposal(intent.proposal, {
    approvalIntent: {
      decision: "APPROVE",
      proposalFingerprint: identifiers.proposalFingerprint,
    },
    executedAt: new Date().toISOString(),
  })

  revalidateProjectSurfaces(identifiers.projectId)
  return {
    status: execution.receipt.executionStatus,
    receiptId: execution.receipt.receiptId,
    error: execution.receipt.error,
  }
}
