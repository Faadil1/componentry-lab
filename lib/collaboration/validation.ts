import {
  COLLABORATION_SCHEMA_VERSION,
  MAX_COLLABORATION_HOPS,
  type CollaborationAuthorityContext,
  type CollaborationEffectClass,
  type CollaborationRequest,
  type CollaborationResult,
  type CollaborationSystemId,
  type CollaborationValidationResult,
} from "./types"

const SYSTEM_IDS = new Set<CollaborationSystemId>([
  "project-brain",
  "creative-director",
  "registry-v2",
  "component-library",
  "creative-method-runtime",
  "film-kit",
  "playbooks",
  "references",
  "sources",
  "decisions-audit-learnings",
])

const AUTHORITY_RANK: Record<CollaborationAuthorityContext["authorityLevel"], number> = {
  suggest: 0,
  prepare: 1,
  "local-reversible-execution": 2,
  "prepare-external-action": 3,
  "authorized-reversible-external-action": 4,
  prohibited: -1,
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function validateStringArray(name: string, value: unknown, errors: string[]): void {
  if (!Array.isArray(value) || value.some((item) => !isNonEmptyString(item))) {
    errors.push(`${name} must be an array of non-empty strings`)
  }
}

function requiredAuthorityRank(effect: CollaborationEffectClass): number {
  if (effect === "read" || effect === "advisory") return 0
  if (effect === "prepare") return 1
  if (effect === "local-reversible") return 2
  if (effect === "external-reversible") return 4
  return Number.POSITIVE_INFINITY
}

export function validateEffectAgainstAuthority(
  effect: CollaborationEffectClass,
  authority: CollaborationAuthorityContext,
): CollaborationValidationResult {
  const errors: string[] = []

  if (effect === "irreversible") {
    errors.push("irreversible effects are prohibited in collaboration contract v1")
    return { valid: false, errors }
  }

  if (authority.authorityLevel === "prohibited" || authority.status === "denied" || authority.status === "expired") {
    errors.push("authority context does not permit collaboration")
    return { valid: false, errors }
  }

  if (effect === "read" || effect === "advisory") {
    return { valid: true, errors }
  }

  if (authority.status !== "granted") {
    errors.push(`${effect} requires explicitly granted authority`)
  }

  if (AUTHORITY_RANK[authority.authorityLevel] < requiredAuthorityRank(effect)) {
    errors.push(`authority level ${authority.authorityLevel} is insufficient for ${effect}`)
  }

  if (effect === "local-reversible" || effect === "external-reversible") {
    if (authority.reversibility !== "reversible") {
      errors.push(`${effect} requires explicitly reversible authority context`)
    }
  }

  if (effect === "external-reversible") {
    if (authority.approvalRequirement === "none") {
      errors.push("external-reversible effects require explicit or human-review approval")
    }
    if (authority.grantedScope.length === 0) {
      errors.push("external-reversible effects require a non-empty granted scope")
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateCollaborationRequest(request: CollaborationRequest): CollaborationValidationResult {
  const errors: string[] = []

  if (request.schemaVersion !== COLLABORATION_SCHEMA_VERSION) errors.push("unsupported collaboration schema version")
  if (!isNonEmptyString(request.requestId)) errors.push("requestId is required")
  if (!isNonEmptyString(request.projectId)) errors.push("projectId is required")
  if (!isNonEmptyString(request.correlationId)) errors.push("correlationId is required")
  if (!SYSTEM_IDS.has(request.sourceSystem)) errors.push(`unknown source system: ${request.sourceSystem}`)
  if (!SYSTEM_IDS.has(request.targetSystem)) errors.push(`unknown target system: ${request.targetSystem}`)
  if (request.sourceSystem === request.targetSystem) errors.push("sourceSystem and targetSystem must differ")
  if (!isNonEmptyString(request.intent)) errors.push("intent is required")
  if (!isNonEmptyString(request.projectPhase)) errors.push("projectPhase is required")
  if (!isNonEmptyString(request.authorityContext.requestedAction)) errors.push("authorityContext.requestedAction is required")
  if (!isNonEmptyString(request.authorityContext.target)) errors.push("authorityContext.target is required")

  validateStringArray("capabilityRefs", request.capabilityRefs, errors)
  validateStringArray("inputRefs", request.inputRefs, errors)
  validateStringArray("evidenceRefs", request.evidenceRefs, errors)
  validateStringArray("authorityContext.grantedScope", request.authorityContext.grantedScope, errors)

  if (!request.structuredInputs || typeof request.structuredInputs !== "object" || Array.isArray(request.structuredInputs)) {
    errors.push("structuredInputs must be an object")
  }

  const route = request.route
  if (!route || !Array.isArray(route.visitedSystems) || route.visitedSystems.length === 0) {
    errors.push("route.visitedSystems must contain at least the source system")
  } else {
    if (route.visitedSystems.some((system) => !SYSTEM_IDS.has(system))) {
      errors.push("route.visitedSystems contains an unknown system")
    }
    if (route.visitedSystems[route.visitedSystems.length - 1] !== request.sourceSystem) {
      errors.push("route.visitedSystems must end at sourceSystem")
    }
    if (route.visitedSystems.includes(request.targetSystem)) {
      errors.push("collaboration cycle detected: targetSystem was already visited")
    }
    if (new Set(route.visitedSystems).size !== route.visitedSystems.length) {
      errors.push("collaboration cycle detected: visitedSystems contains a repeated system")
    }
  }

  if (!Number.isInteger(route?.hopCount) || route.hopCount < 0) errors.push("route.hopCount must be a non-negative integer")
  if (!Number.isInteger(route?.maxHops) || route.maxHops < 1 || route.maxHops > MAX_COLLABORATION_HOPS) {
    errors.push(`route.maxHops must be between 1 and ${MAX_COLLABORATION_HOPS}`)
  }
  if (route && Array.isArray(route.visitedSystems) && route.hopCount !== route.visitedSystems.length - 1) {
    errors.push("route.hopCount must match visitedSystems traversal length")
  }
  if (route && route.hopCount >= route.maxHops) errors.push("collaboration route has reached its hop limit")

  const effectValidation = validateEffectAgainstAuthority(request.requestedEffectClass, request.authorityContext)
  errors.push(...effectValidation.errors)

  return { valid: errors.length === 0, errors }
}

export function validateCollaborationResult(result: CollaborationResult): CollaborationValidationResult {
  const errors: string[] = []

  if (result.schemaVersion !== COLLABORATION_SCHEMA_VERSION) errors.push("unsupported collaboration schema version")
  if (!isNonEmptyString(result.requestId)) errors.push("requestId is required")
  if (!isNonEmptyString(result.projectId)) errors.push("projectId is required")
  if (!isNonEmptyString(result.correlationId)) errors.push("correlationId is required")
  if (!SYSTEM_IDS.has(result.sourceSystem)) errors.push(`unknown source system: ${result.sourceSystem}`)
  if (!SYSTEM_IDS.has(result.targetSystem)) errors.push(`unknown target system: ${result.targetSystem}`)
  if (result.sourceSystem === result.targetSystem) errors.push("sourceSystem and targetSystem must differ")

  if (!result.structuredOutput || typeof result.structuredOutput !== "object" || Array.isArray(result.structuredOutput)) {
    errors.push("structuredOutput must be an object")
  }

  validateStringArray("evidenceRefs", result.evidenceRefs, errors)
  validateStringArray("provenance", result.provenance, errors)
  validateStringArray("limitations", result.limitations, errors)

  if (result.capabilityUsed !== null && !isNonEmptyString(result.capabilityUsed)) {
    errors.push("capabilityUsed must be null or a non-empty string")
  }

  if (result.recommendedNextStep !== null && !isNonEmptyString(result.recommendedNextStep)) {
    errors.push("recommendedNextStep must be null or a non-empty string")
  }

  if (result.sideEffectRequest !== null) errors.push("sideEffectRequest must remain null in collaboration contract v1")

  if (!Array.isArray(result.qualityResults)) {
    errors.push("qualityResults must be an array")
  } else {
    for (const quality of result.qualityResults) {
      if (!isNonEmptyString(quality.gateId)) errors.push("qualityResults.gateId is required")
      validateStringArray("qualityResults.evidenceRefs", quality.evidenceRefs, errors)
      validateStringArray("qualityResults.notes", quality.notes, errors)
    }
  }

  return { valid: errors.length === 0, errors }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = canonicalize((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

export function serializeCollaborationEnvelope(value: CollaborationRequest | CollaborationResult): string {
  return JSON.stringify(canonicalize(value))
}
