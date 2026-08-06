import type { LearningProposal, LearningLifecycle } from "./types"

export function canPromoteLearning(proposal: LearningProposal): boolean {
  return proposal.status === "EARNED" && proposal.humanApprovalState === "approved"
}

export function normalizeLearningStatus(status: LearningLifecycle): LearningLifecycle {
  return status
}
