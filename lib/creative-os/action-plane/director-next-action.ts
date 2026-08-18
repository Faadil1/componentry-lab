import type { DirectorResult } from "../../director/types"
import type { ProjectAction, ProjectBrain } from "../../projects/types"
import { createProjectBrainNextActionProposal } from "./project-brain-next-action"
import { createProjectBrainStartNextActionProposal } from "./project-brain-start-next-action"
import type { GovernedActionProposal } from "./types"
import { fingerprintGovernedActionProposal } from "./validation"

export type DirectorNextActionWriteIntentStatus =
  | "PROPOSAL_READY"
  | "ALREADY_CANONICAL"
  | "IDENTITY_CONFLICT"
  | "INVALID_PROPOSAL"

export interface DirectorNextActionWriteIntent {
  status: DirectorNextActionWriteIntentStatus
  proposal: GovernedActionProposal | null
  proposalFingerprint: string | null
  candidateAction: ProjectAction
  existingAction: ProjectAction | null
  errors: readonly string[]
  mutationRequired: boolean
}

export type DirectorNextActionStartIntentStatus =
  | "PROPOSAL_READY"
  | "ACTION_NOT_CANONICAL"
  | "ALREADY_STARTED"
  | "ALREADY_COMPLETED"
  | "ACTION_BLOCKED"
  | "IDENTITY_CONFLICT"
  | "INVALID_PROPOSAL"

export interface DirectorNextActionStartIntent {
  status: DirectorNextActionStartIntentStatus
  proposal: GovernedActionProposal | null
  proposalFingerprint: string | null
  candidateAction: ProjectAction
  existingAction: ProjectAction | null
  errors: readonly string[]
  mutationRequired: boolean
}

function candidateFromDirector(project: ProjectBrain, result: DirectorResult): ProjectAction {
  return {
    id: result.nextAction.actionId,
    label: result.nextAction.title,
    description: result.nextAction.description,
    phase: project.nextRecommendedPhase,
    status: "todo",
  }
}

function semanticallySameAction(existing: ProjectAction, candidate: ProjectAction): boolean {
  return (
    existing.id === candidate.id &&
    existing.label === candidate.label &&
    existing.description === candidate.description
  )
}

export function projectDirectorNextActionToGovernedWriteIntent(
  project: ProjectBrain,
  result: DirectorResult,
  proposedAt: string,
): DirectorNextActionWriteIntent {
  const candidateAction = candidateFromDirector(project, result)
  const existingAction = project.nextActions.find((action) => action.id === candidateAction.id) ?? null

  if (existingAction) {
    if (semanticallySameAction(existingAction, candidateAction)) {
      return {
        status: "ALREADY_CANONICAL",
        proposal: null,
        proposalFingerprint: null,
        candidateAction,
        existingAction,
        errors: [],
        mutationRequired: false,
      }
    }

    return {
      status: "IDENTITY_CONFLICT",
      proposal: null,
      proposalFingerprint: null,
      candidateAction,
      existingAction,
      errors: [`Project action id ${candidateAction.id} already exists with different canonical content.`],
      mutationRequired: false,
    }
  }

  const projection = createProjectBrainNextActionProposal(project, {
    correlationId: `director-live:${project.id}:${result.nextAction.actionId}`,
    action: candidateAction,
    proposedAt,
    evidenceRefs: result.nextAction.evidenceNeededAfterCompletion.map(
      (id) => `project-brain:${project.id}:evidence:${id}`,
    ),
    provenanceRefs: [
      "director:live-projection",
      `director:next-action:${result.nextAction.actionId}`,
    ],
  })

  if (!projection.valid || !projection.proposal) {
    return {
      status: "INVALID_PROPOSAL",
      proposal: null,
      proposalFingerprint: null,
      candidateAction,
      existingAction: null,
      errors: projection.errors,
      mutationRequired: false,
    }
  }

  return {
    status: "PROPOSAL_READY",
    proposal: projection.proposal,
    proposalFingerprint: fingerprintGovernedActionProposal(projection.proposal),
    candidateAction,
    existingAction: null,
    errors: [],
    mutationRequired: true,
  }
}

export function projectDirectorNextActionToGovernedStartIntent(
  project: ProjectBrain,
  result: DirectorResult,
  proposedAt: string,
): DirectorNextActionStartIntent {
  const candidateAction = candidateFromDirector(project, result)
  const existingAction = project.nextActions.find((action) => action.id === candidateAction.id) ?? null

  if (!existingAction) {
    return {
      status: "ACTION_NOT_CANONICAL",
      proposal: null,
      proposalFingerprint: null,
      candidateAction,
      existingAction: null,
      errors: ["The Director action must first exist in canonical Project Brain before it can be started."],
      mutationRequired: false,
    }
  }

  if (!semanticallySameAction(existingAction, candidateAction)) {
    return {
      status: "IDENTITY_CONFLICT",
      proposal: null,
      proposalFingerprint: null,
      candidateAction,
      existingAction,
      errors: [`Project action id ${candidateAction.id} exists with content that does not match the Director proposal.`],
      mutationRequired: false,
    }
  }

  if (existingAction.status === "doing") {
    return {
      status: "ALREADY_STARTED",
      proposal: null,
      proposalFingerprint: null,
      candidateAction,
      existingAction,
      errors: [],
      mutationRequired: false,
    }
  }
  if (existingAction.status === "done") {
    return {
      status: "ALREADY_COMPLETED",
      proposal: null,
      proposalFingerprint: null,
      candidateAction,
      existingAction,
      errors: [],
      mutationRequired: false,
    }
  }
  if (existingAction.status === "blocked") {
    return {
      status: "ACTION_BLOCKED",
      proposal: null,
      proposalFingerprint: null,
      candidateAction,
      existingAction,
      errors: ["A blocked canonical action cannot be started through Slice K."],
      mutationRequired: false,
    }
  }

  const projection = createProjectBrainStartNextActionProposal(project, {
    actionId: existingAction.id,
    correlationId: `director-live:start:${project.id}:${existingAction.id}`,
    proposedAt,
    evidenceRefs: result.nextAction.evidenceNeededAfterCompletion.map(
      (id) => `project-brain:${project.id}:evidence:${id}`,
    ),
    provenanceRefs: [
      "director:live-projection",
      `director:next-action:${result.nextAction.actionId}`,
      `project-brain:next-action:${existingAction.id}`,
    ],
  })

  if (!projection.valid || !projection.proposal) {
    return {
      status: "INVALID_PROPOSAL",
      proposal: null,
      proposalFingerprint: null,
      candidateAction,
      existingAction,
      errors: projection.errors,
      mutationRequired: false,
    }
  }

  return {
    status: "PROPOSAL_READY",
    proposal: projection.proposal,
    proposalFingerprint: fingerprintGovernedActionProposal(projection.proposal),
    candidateAction,
    existingAction,
    errors: [],
    mutationRequired: true,
  }
}
