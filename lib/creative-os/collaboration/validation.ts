import type {
  CollaborationEffectClass,
  CollaborationJsonValue,
  CollaborationRequest,
  CollaborationResult,
  CollaborationSystemId,
  CollaborationValidationReport
} from "./types"
import { COLLABORATION_SCHEMA_VERSION } from "./types"

export const MAX_COLLABORATION_HOPS = 8

export const COLLABORATION_SYSTEM_IDS: readonly CollaborationSystemId[] = [
  "PROJECT_BRAIN",
  "CREATIVE_DIRECTOR",
  "CREATIVE_OS_REGISTRY_V2",
  "COMPONENT_LIBRARY",
  "CREATIVE_METHOD_RUNTIME",
  "FILM_KIT",
  "PLAYBOOKS",
  "AUDIT_EVIDENCE"
]

const EFFECT_CLASSES: readonly CollaborationEffectClass[] = [
  "NONE",
  "LOCAL_REVERSIBLE",
  "OWNER_STATE_MUTATION",
  "EXTERNAL_SIDE_EFFECT"
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isKnownSystem(value: unknown): value is CollaborationSystemId {
  return typeof value === "string" && COLLABORATION_SYSTEM_IDS.includes(value as CollaborationSystemId)
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isJsonValue(value: unknown): value is CollaborationJsonValue {
  if (value === null) return true
  if (["string", "number", "boolean"].includes(typeof value)) {
    return typeof value !== "number" || Number.isFinite(value)
  }
  if (Array.isArray(value)) return value.every((item) => isJsonValue(item))
  if (!isRecord(value)) return false
  return Object.values(value).every((item) => isJsonValue(item))
}

function validateJsonRecord(value: unknown, field: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${field} must be an object`)
    return
  }
  if (!Object.values(value).every((item) => isJsonValue(item))) {
    errors.push(`${field} must contain JSON-safe deterministic values only`)
  }
}

function validateAuthorityContext(value: unknown, targetSystem: unknown, effectClass: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push("authorityContext must be an object")
    return
  }

  const currentAuthority = value.currentAuthority
  const requestedAuthority = value.requestedAuthority
  const ownerSystem = value.ownerSystem
  const humanReviewRequired = value.humanReviewRequired

  if (!isNonEmptyString(currentAuthority)) errors.push("authorityContext.currentAuthority is required")
  if (!isNonEmptyString(requestedAuthority)) errors.push("authorityContext.requestedAuthority is required")
  if (currentAuthority === "PROHIBITED") errors.push("authorityContext.currentAuthority cannot be PROHIBITED")
  if (requestedAuthority === "PROHIBITED") errors.push("authorityContext.requestedAuthority cannot be PROHIBITED")
  if (!(ownerSystem === null || isKnownSystem(ownerSystem))) {
    errors.push("authorityContext.ownerSystem must be a known system or null")
  }
  if (typeof humanReviewRequired !== "boolean") {
    errors.push("authorityContext.humanReviewRequired must be boolean")
  }

  if (effectClass === "OWNER_STATE_MUTATION") {
    if (!isKnownSystem(targetSystem) || ownerSystem !== targetSystem) {
      errors.push("OWNER_STATE_MUTATION must target the declared ownerSystem")
    }
    if (humanReviewRequired !== true) {
      errors.push("OWNER_STATE_MUTATION requires explicit human review")
    }
  }

  if (effectClass === "EXTERNAL_SIDE_EFFECT") {
    if (requestedAuthority !== "EXPLICIT_EXTERNAL") {
      errors.push("EXTERNAL_SIDE_EFFECT requires EXPLICIT_EXTERNAL requested authority")
    }
    if (humanReviewRequired !== true) {
      errors.push("EXTERNAL_SIDE_EFFECT requires explicit human review")
    }
  }
}

function validateHopTrace(value: unknown, sourceSystem: unknown, targetSystem: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push("hopTrace must be an array")
    return
  }
  if (value.length > MAX_COLLABORATION_HOPS) {
    errors.push(`hopTrace exceeds maximum of ${MAX_COLLABORATION_HOPS} hops`)
  }

  const seen = new Set<string>()
  for (const hop of value) {
    if (!isRecord(hop) || !isKnownSystem(hop.sourceSystem) || !isKnownSystem(hop.targetSystem)) {
      errors.push("hopTrace contains an invalid system hop")
      continue
    }
    if (hop.sourceSystem === hop.targetSystem) {
      errors.push("hopTrace cannot contain self-routing hops")
    }
    const key = `${hop.sourceSystem}->${hop.targetSystem}`
    if (seen.has(key)) errors.push(`hopTrace contains repeated directed hop ${key}`)
    seen.add(key)
  }

  if (isKnownSystem(sourceSystem) && isKnownSystem(targetSystem)) {
    const currentKey = `${sourceSystem}->${targetSystem}`
    if (seen.has(currentKey)) {
      errors.push(`current collaboration hop repeats prior directed hop ${currentKey}`)
    }
  }
}

export function validateCollaborationRequest(value: unknown): CollaborationValidationReport {
  const errors: string[] = []
  if (!isRecord(value)) return { valid: false, errors: ["request must be an object"] }

  if (value.schemaVersion !== COLLABORATION_SCHEMA_VERSION) errors.push("unsupported collaboration schemaVersion")
  if (!isNonEmptyString(value.projectId)) errors.push("projectId is required")
  if (!isNonEmptyString(value.correlationId)) errors.push("correlationId is required")
  if (!isKnownSystem(value.sourceSystem)) errors.push("sourceSystem is unknown")
  if (!isKnownSystem(value.targetSystem)) errors.push("targetSystem is unknown")
  if (isKnownSystem(value.sourceSystem) && value.sourceSystem === value.targetSystem) {
    errors.push("sourceSystem and targetSystem must be different")
  }
  if (!isNonEmptyString(value.intent)) errors.push("intent is required")
  if (!isNonEmptyString(value.projectPhase)) errors.push("projectPhase is required")
  if (!isNonEmptyString(value.projectMode)) errors.push("projectMode is required")
  if (!isStringArray(value.capabilityRefs)) errors.push("capabilityRefs must be a string array")
  if (!isStringArray(value.inputRefs)) errors.push("inputRefs must be a string array")
  if (!isStringArray(value.evidenceRefs)) errors.push("evidenceRefs must be a string array")
  if (!EFFECT_CLASSES.includes(value.requestedEffectClass as CollaborationEffectClass)) {
    errors.push("requestedEffectClass is unknown")
  }
  if (value.status !== "REQUESTED") errors.push("request status must be REQUESTED")

  validateJsonRecord(value.structuredInputs, "structuredInputs", errors)
  validateAuthorityContext(value.authorityContext, value.targetSystem, value.requestedEffectClass, errors)
  validateHopTrace(value.hopTrace, value.sourceSystem, value.targetSystem, errors)

  return { valid: errors.length === 0, errors }
}

function validateSideEffectRequest(value: unknown, errors: string[]): void {
  if (value === null) return
  if (!isRecord(value)) {
    errors.push("sideEffectRequest must be an object or null")
    return
  }
  if (!isKnownSystem(value.ownerSystem)) errors.push("sideEffectRequest.ownerSystem is unknown")
  if (!EFFECT_CLASSES.includes(value.effectClass as CollaborationEffectClass) || value.effectClass === "NONE") {
    errors.push("sideEffectRequest.effectClass must be a non-NONE effect class")
  }
  if (!isNonEmptyString(value.requestedAuthority) || value.requestedAuthority === "PROHIBITED") {
    errors.push("sideEffectRequest.requestedAuthority must be explicit and non-PROHIBITED")
  }
  if (typeof value.humanReviewRequired !== "boolean") {
    errors.push("sideEffectRequest.humanReviewRequired must be boolean")
  }
  if (!isNonEmptyString(value.description)) errors.push("sideEffectRequest.description is required")
  if ((value.effectClass === "OWNER_STATE_MUTATION" || value.effectClass === "EXTERNAL_SIDE_EFFECT") && value.humanReviewRequired !== true) {
    errors.push(`${value.effectClass} sideEffectRequest requires explicit human review`)
  }
  if (value.effectClass === "EXTERNAL_SIDE_EFFECT" && value.requestedAuthority !== "EXPLICIT_EXTERNAL") {
    errors.push("EXTERNAL_SIDE_EFFECT sideEffectRequest requires EXPLICIT_EXTERNAL authority")
  }
}

export function validateCollaborationResult(value: unknown): CollaborationValidationReport {
  const errors: string[] = []
  if (!isRecord(value)) return { valid: false, errors: ["result must be an object"] }

  if (value.schemaVersion !== COLLABORATION_SCHEMA_VERSION) errors.push("unsupported collaboration schemaVersion")
  if (!isNonEmptyString(value.projectId)) errors.push("projectId is required")
  if (!isNonEmptyString(value.correlationId)) errors.push("correlationId is required")
  if (!isKnownSystem(value.sourceSystem)) errors.push("sourceSystem is unknown")
  if (!isKnownSystem(value.targetSystem)) errors.push("targetSystem is unknown")
  if (isKnownSystem(value.sourceSystem) && value.sourceSystem === value.targetSystem) {
    errors.push("sourceSystem and targetSystem must be different")
  }
  if (!(value.capabilityUsed === null || isNonEmptyString(value.capabilityUsed))) {
    errors.push("capabilityUsed must be a non-empty string or null")
  }
  if (!isNonEmptyString(value.resultStatus)) errors.push("resultStatus is required")
  if (!Array.isArray(value.qualityResults) || !value.qualityResults.every((item) => isJsonValue(item))) {
    errors.push("qualityResults must be a JSON-safe array")
  }
  if (!isStringArray(value.evidenceRefs)) errors.push("evidenceRefs must be a string array")
  if (!isStringArray(value.provenanceRefs)) errors.push("provenanceRefs must be a string array")
  if (!isStringArray(value.limitations)) errors.push("limitations must be a string array")
  if (!(value.recommendedNextStep === null || isNonEmptyString(value.recommendedNextStep))) {
    errors.push("recommendedNextStep must be a non-empty string or null")
  }

  validateJsonRecord(value.structuredOutput, "structuredOutput", errors)
  validateSideEffectRequest(value.sideEffectRequest, errors)

  return { valid: errors.length === 0, errors }
}

export function validateCollaborationExchange(
  request: CollaborationRequest,
  result: CollaborationResult
): CollaborationValidationReport {
  const requestReport = validateCollaborationRequest(request)
  const resultReport = validateCollaborationResult(result)
  const errors = [...requestReport.errors, ...resultReport.errors]

  if (request.projectId !== result.projectId) errors.push("result projectId must match request projectId")
  if (request.correlationId !== result.correlationId) errors.push("result correlationId must match request correlationId")
  if (request.targetSystem !== result.sourceSystem) errors.push("result sourceSystem must equal request targetSystem")
  if (request.sourceSystem !== result.targetSystem) errors.push("result targetSystem must equal request sourceSystem")

  return { valid: errors.length === 0, errors }
}

function stableNormalize(value: CollaborationJsonValue): CollaborationJsonValue {
  if (Array.isArray(value)) return value.map((item) => stableNormalize(item))
  if (!isRecord(value)) return value

  const normalized: Record<string, CollaborationJsonValue> = {}
  for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
    normalized[key] = stableNormalize(value[key] as CollaborationJsonValue)
  }
  return normalized
}

export function serializeCollaborationValue(value: CollaborationJsonValue): string {
  return JSON.stringify(stableNormalize(value))
}
