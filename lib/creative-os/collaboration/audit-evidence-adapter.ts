import type {
  CollaborationJsonValue,
  CollaborationRequest,
  CollaborationResult,
  CollaborationSystemId,
  CollaborationValidationReport,
} from "./types"
import { COLLABORATION_SCHEMA_VERSION } from "./types"
import { validateCollaborationRequest, validateCollaborationResult } from "./validation"

export interface AuditEvidenceCollaborationProjection {
  valid: boolean
  errors: readonly string[]
  result: CollaborationResult | null
}

const ALLOWED_EVIDENCE_SOURCES: readonly CollaborationSystemId[] = [
  "CREATIVE_DIRECTOR",
  "CREATIVE_METHOD_RUNTIME",
  "FILM_KIT",
  "PLAYBOOKS",
  "CREATIVE_OS_REGISTRY_V2",
  "COMPONENT_LIBRARY",
]

function jsonValue(value: unknown): CollaborationJsonValue {
  const serialized = JSON.stringify(value)
  if (serialized === undefined) throw new Error("Audit/Evidence collaboration payload is not JSON serializable")
  return JSON.parse(serialized) as CollaborationJsonValue
}

function nonEmptyString(value: CollaborationJsonValue | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function stringArray(value: CollaborationJsonValue | undefined): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
}

function validateAuditEvidenceRequest(request: CollaborationRequest): CollaborationValidationReport {
  const base = validateCollaborationRequest(request)
  const errors = [...base.errors]

  if (!ALLOWED_EVIDENCE_SOURCES.includes(request.sourceSystem)) {
    errors.push("Audit/Evidence request source is not an approved evidence-producing collaborator")
  }
  if (request.targetSystem !== "AUDIT_EVIDENCE") {
    errors.push("Audit/Evidence request must target AUDIT_EVIDENCE")
  }
  if (request.intent !== "RETURN_EVIDENCE" && request.intent !== "EVALUATE_RESULT") {
    errors.push("Audit/Evidence request intent must be RETURN_EVIDENCE or EVALUATE_RESULT")
  }
  if (request.requestedEffectClass !== "NONE") {
    errors.push("Audit/Evidence collaboration is projection-only and requires effect class NONE")
  }
  if (request.authorityContext.requestedAuthority !== "READ_ONLY" && request.authorityContext.requestedAuthority !== "SUGGEST") {
    errors.push("Audit/Evidence projection requires READ_ONLY or SUGGEST requested authority")
  }
  if (request.evidenceRefs.length === 0) {
    errors.push("Audit/Evidence projection requires at least one evidenceRef")
  }

  const subject = nonEmptyString(request.structuredInputs.subject)
  if (!subject) errors.push("Audit/Evidence projection requires structuredInputs.subject")

  return { valid: errors.length === 0, errors }
}

export function projectAuditEvidenceCollaboration(
  request: CollaborationRequest,
): AuditEvidenceCollaborationProjection {
  const requestValidation = validateAuditEvidenceRequest(request)
  if (!requestValidation.valid) {
    return { valid: false, errors: requestValidation.errors, result: null }
  }

  const subject = nonEmptyString(request.structuredInputs.subject)!
  const claimedStatus = nonEmptyString(request.structuredInputs.claimedStatus)
  const qualityGateRefs = stringArray(request.structuredInputs.qualityGateRefs)
  const limitationRefs = stringArray(request.structuredInputs.limitationRefs)
  const inputProvenanceRefs = stringArray(request.structuredInputs.provenanceRefs)

  const normalizedTrace = {
    traceRef: `audit-evidence:${request.projectId}:${request.correlationId}`,
    subject,
    producerSystem: request.sourceSystem,
    projectId: request.projectId,
    correlationId: request.correlationId,
    intent: request.intent,
    claimedStatus,
    evidenceRefs: [...new Set(request.evidenceRefs)].sort((a, b) => a.localeCompare(b)),
    qualityGateRefs: [...new Set(qualityGateRefs)].sort((a, b) => a.localeCompare(b)),
    limitationRefs: [...new Set(limitationRefs)].sort((a, b) => a.localeCompare(b)),
    provenanceRefs: [...new Set(inputProvenanceRefs)].sort((a, b) => a.localeCompare(b)),
    authoritySnapshot: {
      currentAuthority: request.authorityContext.currentAuthority,
      requestedAuthority: request.authorityContext.requestedAuthority,
      ownerSystem: request.authorityContext.ownerSystem,
      humanReviewRequired: request.authorityContext.humanReviewRequired,
    },
    mutationApplied: false,
    persistenceApplied: false,
  }

  const result: CollaborationResult = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: request.projectId,
    correlationId: request.correlationId,
    sourceSystem: "AUDIT_EVIDENCE",
    targetSystem: request.sourceSystem,
    capabilityUsed: null,
    resultStatus: "COMPLETE",
    structuredOutput: {
      auditTrace: jsonValue(normalizedTrace),
      acceptedEvidenceCount: normalizedTrace.evidenceRefs.length,
      persistenceApplied: false,
      mutationApplied: false,
    },
    qualityResults: [],
    evidenceRefs: normalizedTrace.evidenceRefs,
    provenanceRefs: [
      ...new Set([
        `audit-evidence:${request.projectId}`,
        `collaboration:${request.correlationId}`,
        ...normalizedTrace.provenanceRefs,
      ]),
    ].sort((a, b) => a.localeCompare(b)),
    limitations: [
      "Audit/Evidence collaboration creates an immutable projection only; it does not persist or mutate canonical project state.",
      "Accepted evidence references are trace metadata, not a claim that the underlying evidence is independently verified.",
    ],
    recommendedNextStep: "Surface this audit projection to the owning project context or evaluator without automatic mutation.",
    sideEffectRequest: null,
  }

  const resultValidation = validateCollaborationResult(result)
  if (!resultValidation.valid) {
    return { valid: false, errors: resultValidation.errors, result: null }
  }

  return { valid: true, errors: [], result }
}
