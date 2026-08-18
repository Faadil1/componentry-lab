"use server"

import { revalidatePath } from "next/cache"

import {
  executeProjectBrainNextActionProposal,
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
    | "INVALID"
  receiptId: string | null
  error: string | null
}

export const INITIAL_GOVERNED_DIRECTOR_ACTION_STATE: GovernedDirectorActionState = {
  status: "IDLE",
  receiptId: null,
  error: null,
}

export async function approveDirectorNextAction(
  _previousState: GovernedDirectorActionState,
  formData: FormData,
): Promise<GovernedDirectorActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim()
  const expectedProposalFingerprint = String(formData.get("proposalFingerprint") ?? "").trim()

  if (!projectId || !/^[a-f0-9]{64}$/.test(expectedProposalFingerprint)) {
    return {
      status: "INVALID",
      receiptId: null,
      error: "A valid project identity and governed proposal fingerprint are required.",
    }
  }

  const project = await getProjectById(projectId)
  if (!project) {
    return {
      status: "INVALID",
      receiptId: null,
      error: `Project not found: ${projectId}`,
    }
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
    return {
      status: "ALREADY_CANONICAL",
      receiptId: null,
      error: null,
    }
  }

  if (intent.status !== "PROPOSAL_READY" || !intent.proposal || !intent.proposalFingerprint) {
    return {
      status: "INVALID",
      receiptId: null,
      error: intent.errors.join("; ") || `Governed action intent is ${intent.status}.`,
    }
  }

  if (intent.proposalFingerprint !== expectedProposalFingerprint) {
    return {
      status: "STALE_PROPOSAL",
      receiptId: null,
      error: "The canonical Director proposal changed before approval. Refresh and review the new proposal.",
    }
  }

  const execution = await executeProjectBrainNextActionProposal(intent.proposal, {
    approvalIntent: {
      decision: "APPROVE",
      proposalFingerprint: expectedProposalFingerprint,
    },
    executedAt: new Date().toISOString(),
  })

  revalidatePath("/director/live")
  revalidatePath("/projects")
  revalidatePath(`/projects/${encodeURIComponent(projectId)}`)

  return {
    status: execution.receipt.executionStatus,
    receiptId: execution.receipt.receiptId,
    error: execution.receipt.error,
  }
}
