import type { ProjectBrain, ProjectIntegrityReport } from "../../projects"
import { validateProjectBrain } from "../../projects"
import type {
  CollaborationIntent,
  CollaborationJsonValue,
  CollaborationRequest,
  CollaborationResult,
  CollaborationSideEffectRequest,
  CollaborationSystemId,
  CollaborationValidationReport
} from "./types"
import { COLLABORATION_SCHEMA_VERSION } from "./types"
import { validateCollaborationExchange, validateCollaborationRequest } from "./validation"

export type ProjectBrainReadOnlyIntent =
  | "REQUEST_CONTEXT"
  | "DISCOVER_CAPABILITY"
  | "REQUEST_ADVISORY_WORK"
  | "REQUEST_COMPOSITION"
  | "EVALUATE_RESULT"

export interface ProjectBrainCollaborationRequestOptions {
  correlationId: string
  targetSystem: Exclude<CollaborationSystemId, "PROJECT_BRAIN">
  intent?: ProjectBrainReadOnlyIntent
  capabilityRefs?: readonly string[]
  inputRefs?: readonly string[]
  evidenceRefs?: readonly string[]
}

export interface ProjectBrainCollaborationRequestProjection {
  valid: boolean
  errors: readonly string[]
  warnings: readonly string[]
  integrity: ProjectIntegrityReport
  request: CollaborationRequest | null
}

export interface ProjectBrainCollaborationProposal {
  projectId: string
  correlationId: string
  sourceSystem: CollaborationSystemId
  capabilityUsed: string | null
  resultStatus: CollaborationResult["resultStatus"]
  structuredOutput: CollaborationResult["structuredOutput"]
  qualityResults: CollaborationResult["qualityResults"]
  evidenceRefs: readonly string[]
  provenanceRefs: readonly string[]
  limitations: readonly string[]
  recommendedNextStep: string | null
  sideEffectRequest: CollaborationSideEffectRequest | null
  requiresOwnerReview: boolean
  mutationApplied: false
}

export interface ProjectBrainProposalProjection {
  valid: boolean
  errors: readonly string[]
  proposal: ProjectBrainCollaborationProposal | null
}

function toCollaborationJsonValue(value: unknown): CollaborationJsonValue {
  const serialized = JSON.stringify(value)
  if (serialized === undefined) {
    throw new Error("Project Brain collaboration context is not JSON serializable")
  }
  return JSON.parse(serialized) as CollaborationJsonValue
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function projectEvidenceRefs(project: ProjectBrain): string[] {
  return project.evidence
    .filter((item) => item.status === "available")
    .map((item) => `project-brain:${project.id}:evidence:${item.id}`)
    .sort((a, b) => a.localeCompare(b))
}

function projectInputRefs(project: ProjectBrain): string[] {
  return [
    `project-brain:${project.id}`,
    ...project.sourceLinks.map((source) => `project-brain:${project.id}:source:${source.id}`)
  ].sort((a, b) => a.localeCompare(b))
}

function projectIntegritySummary(report: ProjectIntegrityReport): CollaborationJsonValue {
  return toCollaborationJsonValue({
    valid: report.valid,
    warnings: report.warnings,
    readinessScore: report.readinessScore,
    unresolvedAssumptions: report.unresolvedAssumptions,
    unresolvedRisks: report.unresolvedRisks,
    blockedOutputs: report.blockedOutputs
  })
}

export function projectProjectBrainContext(project: ProjectBrain): CollaborationJsonValue {
  return toCollaborationJsonValue(project)
}

export function createProjectBrainCollaborationRequest(
  project: ProjectBrain,
  options: ProjectBrainCollaborationRequestOptions
): ProjectBrainCollaborationRequestProjection {
  const integrity = validateProjectBrain(project)
  const errors = integrity.errors.map((error) => `Project Brain integrity: ${error}`)

  if (!integrity.valid) {
    return {
      valid: false,
      errors,
      warnings: integrity.warnings,
      integrity,
      request: null
    }
  }

  let projectContext: CollaborationJsonValue
  try {
    projectContext = projectProjectBrainContext(project)
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Project Brain context serialization failed"],
      warnings: integrity.warnings,
      integrity,
      request: null
    }
  }

  const request: CollaborationRequest = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: project.id,
    correlationId: options.correlationId,
    sourceSystem: "PROJECT_BRAIN",
    targetSystem: options.targetSystem,
    intent: (options.intent ?? "REQUEST_CONTEXT") as CollaborationIntent,
    projectPhase: project.currentPhase,
    projectMode: project.kind,
    capabilityRefs: uniqueSorted(options.capabilityRefs ?? []),
    authorityContext: {
      currentAuthority: "READ_ONLY",
      requestedAuthority: "READ_ONLY",
      ownerSystem: null,
      humanReviewRequired: false
    },
    structuredInputs: {
      contextRef: `project-brain:${project.id}`,
      projectBrain: projectContext,
      projectIntegrity: projectIntegritySummary(integrity)
    },
    inputRefs: uniqueSorted([
      ...projectInputRefs(project),
      ...(options.inputRefs ?? [])
    ]),
    evidenceRefs: uniqueSorted([
      ...projectEvidenceRefs(project),
      ...(options.evidenceRefs ?? [])
    ]),
    requestedEffectClass: "NONE",
    hopTrace: [],
    status: "REQUESTED"
  }

  const validation = validateCollaborationRequest(request)
  return {
    valid: validation.valid,
    errors: validation.errors,
    warnings: integrity.warnings,
    integrity,
    request: validation.valid ? request : null
  }
}

export function projectCollaborationResultToProjectBrainProposal(
  project: ProjectBrain,
  request: CollaborationRequest,
  result: CollaborationResult
): ProjectBrainProposalProjection {
  const preconditions: string[] = []
  if (request.sourceSystem !== "PROJECT_BRAIN") {
    preconditions.push("request sourceSystem must be PROJECT_BRAIN")
  }
  if (request.projectId !== project.id) {
    preconditions.push("request projectId must match the Project Brain owner")
  }
  if (result.targetSystem !== "PROJECT_BRAIN") {
    preconditions.push("result targetSystem must be PROJECT_BRAIN")
  }

  const exchange: CollaborationValidationReport = validateCollaborationExchange(request, result)
  const errors = [...preconditions, ...exchange.errors]
  if (errors.length > 0) {
    return { valid: false, errors, proposal: null }
  }

  return {
    valid: true,
    errors: [],
    proposal: {
      projectId: project.id,
      correlationId: result.correlationId,
      sourceSystem: result.sourceSystem,
      capabilityUsed: result.capabilityUsed,
      resultStatus: result.resultStatus,
      structuredOutput: result.structuredOutput,
      qualityResults: result.qualityResults,
      evidenceRefs: [...result.evidenceRefs],
      provenanceRefs: [...result.provenanceRefs],
      limitations: [...result.limitations],
      recommendedNextStep: result.recommendedNextStep,
      sideEffectRequest: result.sideEffectRequest,
      requiresOwnerReview: result.sideEffectRequest?.ownerSystem === "PROJECT_BRAIN",
      mutationApplied: false
    }
  }
}
