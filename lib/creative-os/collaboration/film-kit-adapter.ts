import {
  getFilmProductionIntent,
  getFilmProductionTruth,
  validateFilmProject,
  type FilmProject
} from "../../film-kit"
import type {
  CollaborationJsonValue,
  CollaborationRequest,
  CollaborationResult,
  CollaborationValidationReport
} from "./types"
import { COLLABORATION_SCHEMA_VERSION } from "./types"
import { validateCollaborationRequest, validateCollaborationResult } from "./validation"

export interface FilmKitCollaborationProjection {
  valid: boolean
  errors: readonly string[]
  warnings: readonly string[]
  result: CollaborationResult | null
}

function jsonValue(value: unknown): CollaborationJsonValue {
  const serialized = JSON.stringify(value)
  if (serialized === undefined) throw new Error("Film Kit collaboration payload is not JSON serializable")
  return JSON.parse(serialized) as CollaborationJsonValue
}

function validateFilmKitRequest(
  request: CollaborationRequest,
  film: FilmProject
): CollaborationValidationReport {
  const base = validateCollaborationRequest(request)
  const errors = [...base.errors]

  if (request.sourceSystem !== "CREATIVE_DIRECTOR") {
    errors.push("Film Kit planning request must originate from CREATIVE_DIRECTOR")
  }
  if (request.targetSystem !== "FILM_KIT") {
    errors.push("Film Kit planning request must target FILM_KIT")
  }
  if (request.intent !== "REQUEST_PRODUCTION") {
    errors.push("Film Kit planning request intent must be REQUEST_PRODUCTION")
  }
  if (request.requestedEffectClass !== "NONE") {
    errors.push("Film Kit collaboration in this phase is planning-only and requires effect class NONE")
  }
  if (request.authorityContext.requestedAuthority !== "READ_ONLY" && request.authorityContext.requestedAuthority !== "SUGGEST") {
    errors.push("Film Kit planning requires READ_ONLY or SUGGEST requested authority")
  }
  if (request.projectId !== film.id || film.brief.projectId !== film.id) {
    errors.push("Film Kit project identity must match collaboration projectId")
  }

  return { valid: errors.length === 0, errors }
}

export function projectFilmKitPlanningCollaboration(
  request: CollaborationRequest,
  film: FilmProject
): FilmKitCollaborationProjection {
  const integrity = validateFilmProject(film)
  const requestValidation = validateFilmKitRequest(request, film)
  const errors = [
    ...requestValidation.errors,
    ...integrity.errors.map((error) => `Film Kit integrity: ${error}`)
  ]

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings: integrity.warnings,
      result: null
    }
  }

  const intent = getFilmProductionIntent(film)
  const productionTruth = getFilmProductionTruth(film.id)
  const pendingApprovalGates = film.approvalGates.filter((gate) => gate.status !== "approved")
  const blockedCaptures = film.captureQueue.filter((item) => item.status === "blocked")
  const limitations = [
    ...film.brief.limitations,
    ...integrity.warnings,
    "Film Kit collaboration is planning/intention only in this phase; no provider call or production execution is authorized."
  ]

  if (productionTruth.availability === "NO_CANONICAL_PRODUCTION_SPINE") {
    limitations.push("NO_CANONICAL_PRODUCTION_SPINE: routes, artifacts, and manifest are intentionally not fabricated.")
  }

  const result: CollaborationResult = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: request.projectId,
    correlationId: request.correlationId,
    sourceSystem: "FILM_KIT",
    targetSystem: "CREATIVE_DIRECTOR",
    capabilityUsed: null,
    resultStatus: productionTruth.availability === "AVAILABLE" ? "COMPLETE" : "PARTIAL",
    structuredOutput: {
      filmIntent: jsonValue(intent),
      productionTruth: jsonValue(productionTruth),
      qaReport: jsonValue(film.qaReport),
      approvalGates: jsonValue(film.approvalGates),
      generationBudget: jsonValue(film.generationBudget),
      pendingApprovalGateCount: pendingApprovalGates.length,
      blockedCaptureCount: blockedCaptures.length
    },
    qualityResults: film.qaReport.checks.map((check) => jsonValue(check)),
    evidenceRefs: [
      ...request.evidenceRefs,
      ...film.shots.flatMap((shot) => shot.evidenceIds.map((id) => `film-kit:${film.id}:evidence:${id}`))
    ],
    provenanceRefs: [
      `film-kit:${film.id}`,
      `project-brain:${film.id}`,
      "film-kit:production-adapter"
    ],
    limitations: [...new Set(limitations)].sort((a, b) => a.localeCompare(b)),
    recommendedNextStep:
      productionTruth.availability === "NO_CANONICAL_PRODUCTION_SPINE"
        ? "Review Film Kit intent/QA and establish a separately governed canonical production spine before any execution."
        : "Review Film Kit intent and approval gates before separately authorized production execution.",
    sideEffectRequest: null
  }

  const resultValidation = validateCollaborationResult(result)
  if (!resultValidation.valid) {
    return {
      valid: false,
      errors: resultValidation.errors,
      warnings: integrity.warnings,
      result: null
    }
  }

  return {
    valid: true,
    errors: [],
    warnings: integrity.warnings,
    result
  }
}
