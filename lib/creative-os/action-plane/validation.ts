import { PROJECT_PHASES } from "../../projects/schema"
import type { ProjectAction } from "../../projects/types"
import { fingerprintCanonicalJson } from "../../projects/fingerprint"
import { PROJECT_NEXT_ACTION_APPEND_SCOPE } from "../../projects/next-action-writer"
import { PROJECT_NEXT_ACTION_START_SCOPE } from "../../projects/next-action-status-writer"
import { COLLABORATION_SYSTEM_IDS } from "../collaboration/validation"
import type { CollaborationSystemId } from "../collaboration/types"
import {
  GOVERNED_ACTION_SCHEMA_VERSION,
  type GovernedActionApproval,
  type GovernedActionOperation,
  type GovernedActionProposal,
  type GovernedActionValidationReport,
} from "./types"

const SHA256_PATTERN = /^[a-f0-9]{64}$/
const ACTION_STATUSES = new Set(["todo", "doing", "done", "blocked"])
const SUPPORTED_OPERATIONS = new Set<GovernedActionOperation>([
  "PROJECT_BRAIN_APPEND_NEXT_ACTION",
  "PROJECT_BRAIN_START_NEXT_ACTION",
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isKnownSystem(value: unknown): value is CollaborationSystemId {
  return typeof value === "string" && COLLABORATION_SYSTEM_IDS.includes(value as CollaborationSystemId)
}

function isIsoTimestamp(value: unknown): boolean {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value))
}

function expectedScopeForOperation(operation: unknown): string | null {
  if (operation === "PROJECT_BRAIN_APPEND_NEXT_ACTION") return PROJECT_NEXT_ACTION_APPEND_SCOPE
  if (operation === "PROJECT_BRAIN_START_NEXT_ACTION") return PROJECT_NEXT_ACTION_START_SCOPE
  return null
}

function validateExactScope(value: unknown, field: string, expectedScope: string | null, errors: string[]): void {
  if (!expectedScope) {
    errors.push(`${field} cannot be validated for an unsupported operation`)
    return
  }
  if (!isStringArray(value)) {
    errors.push(`${field} must be a string array`)
    return
  }
  if (value.length !== 1 || value[0] !== expectedScope) {
    errors.push(`${field} must contain only ${expectedScope}`)
  }
}

function parseProjectAction(value: unknown, errors: string[]): ProjectAction | null {
  if (!isRecord(value)) {
    errors.push("payload.action must be an object")
    return null
  }

  if (!isNonEmptyString(value.id)) errors.push("payload.action.id is required")
  if (!isNonEmptyString(value.label)) errors.push("payload.action.label is required")
  if (!isNonEmptyString(value.description)) errors.push("payload.action.description is required")
  if (!PROJECT_PHASES.includes(value.phase as never)) errors.push("payload.action.phase is invalid")
  if (!ACTION_STATUSES.has(String(value.status))) errors.push("payload.action.status is invalid")
  if (value.status !== "todo") errors.push("PROJECT_BRAIN_APPEND_NEXT_ACTION must append a todo action")
  if (!(value.assignedTo === undefined || isNonEmptyString(value.assignedTo))) {
    errors.push("payload.action.assignedTo must be a non-empty string when present")
  }
  if (!(value.deadlineLabel === undefined || isNonEmptyString(value.deadlineLabel))) {
    errors.push("payload.action.deadlineLabel must be a non-empty string when present")
  }

  if (errors.length > 0) return null
  return value as unknown as ProjectAction
}

function validateStartActionPayload(payload: Record<string, unknown>, errors: string[]): void {
  if (!isNonEmptyString(payload.actionId)) errors.push("payload.actionId is required")
  if (payload.fromStatus !== "todo") errors.push("PROJECT_BRAIN_START_NEXT_ACTION requires fromStatus=todo")
  if (payload.toStatus !== "doing") errors.push("PROJECT_BRAIN_START_NEXT_ACTION requires toStatus=doing")

  const allowedKeys = new Set(["actionId", "fromStatus", "toStatus"])
  const unexpectedKeys = Object.keys(payload).filter((key) => !allowedKeys.has(key))
  if (unexpectedKeys.length > 0) {
    errors.push(`PROJECT_BRAIN_START_NEXT_ACTION payload contains unsupported keys: ${unexpectedKeys.sort().join(", ")}`)
  }
}

export function fingerprintGovernedActionProposal(proposal: GovernedActionProposal): string {
  return fingerprintCanonicalJson(proposal)
}

export function validateGovernedActionProposal(value: unknown): GovernedActionValidationReport {
  const errors: string[] = []
  if (!isRecord(value)) return { valid: false, errors: ["proposal must be an object"] }

  if (value.schemaVersion !== GOVERNED_ACTION_SCHEMA_VERSION) errors.push("unsupported governed action schemaVersion")
  if (!isNonEmptyString(value.actionId)) errors.push("actionId is required")
  if (!isNonEmptyString(value.correlationId)) errors.push("correlationId is required")
  if (!isNonEmptyString(value.projectId)) errors.push("projectId is required")
  if (!isKnownSystem(value.sourceSystem)) errors.push("sourceSystem is unknown")
  if (!isKnownSystem(value.targetSystem)) errors.push("targetSystem is unknown")
  if (value.sourceSystem !== "CREATIVE_DIRECTOR") {
    errors.push("governed Project Brain mutation proposals must originate from CREATIVE_DIRECTOR")
  }
  if (value.targetSystem !== "PROJECT_BRAIN") {
    errors.push("governed Project Brain mutations must target PROJECT_BRAIN")
  }

  const operationSupported = SUPPORTED_OPERATIONS.has(value.operation as GovernedActionOperation)
  if (!operationSupported) errors.push("operation is unsupported")

  if (value.effectClass !== "OWNER_STATE_MUTATION") errors.push("governed project writes require OWNER_STATE_MUTATION effect class")
  if (value.requiredAuthority !== "LOCAL_REVERSIBLE") errors.push("governed project writes require LOCAL_REVERSIBLE authority")
  if (value.approvalRequirement !== "EXPLICIT") errors.push("governed project writes require EXPLICIT approval")
  if (value.humanReviewRequired !== true) errors.push("governed project writes require human review")
  validateExactScope(value.requiredScopes, "requiredScopes", expectedScopeForOperation(value.operation), errors)

  if (!isNonEmptyString(value.beforeFingerprint) || !SHA256_PATTERN.test(value.beforeFingerprint)) {
    errors.push("beforeFingerprint must be a canonical SHA-256 fingerprint")
  }

  if (!isRecord(value.payload)) {
    errors.push("payload must be an object")
  } else {
    if (value.operation === "PROJECT_BRAIN_APPEND_NEXT_ACTION") {
      const payloadErrors: string[] = []
      parseProjectAction(value.payload.action, payloadErrors)
      errors.push(...payloadErrors)
    } else if (value.operation === "PROJECT_BRAIN_START_NEXT_ACTION") {
      validateStartActionPayload(value.payload, errors)
    }

    try {
      fingerprintCanonicalJson(value.payload)
    } catch {
      errors.push("payload must contain JSON-serializable deterministic values only")
    }
  }

  if (!isStringArray(value.evidenceRefs)) errors.push("evidenceRefs must be a string array")
  if (!isStringArray(value.provenanceRefs)) errors.push("provenanceRefs must be a string array")
  if (!isIsoTimestamp(value.proposedAt)) errors.push("proposedAt must be an ISO timestamp")
  if (value.status !== "PROPOSED") errors.push("proposal status must be PROPOSED")

  return { valid: errors.length === 0, errors }
}

export function validateGovernedActionApproval(
  proposal: GovernedActionProposal,
  value: unknown,
): GovernedActionValidationReport {
  const errors: string[] = []
  if (!isRecord(value)) return { valid: false, errors: ["approval must be an object"] }

  if (value.schemaVersion !== GOVERNED_ACTION_SCHEMA_VERSION) errors.push("unsupported governed action approval schemaVersion")
  if (value.actionId !== proposal.actionId) errors.push("approval actionId must match proposal")
  if (value.projectId !== proposal.projectId) errors.push("approval projectId must match proposal")
  if (!isNonEmptyString(value.proposalFingerprint) || value.proposalFingerprint !== fingerprintGovernedActionProposal(proposal)) {
    errors.push("approval proposalFingerprint must match the exact proposal")
  }
  if (value.decision !== "APPROVED") errors.push("approval decision must be APPROVED")
  if (!isNonEmptyString(value.approvedBy)) errors.push("approvedBy is required")
  if (!isIsoTimestamp(value.approvedAt)) errors.push("approvedAt must be an ISO timestamp")
  if (value.grantedAuthority !== "LOCAL_REVERSIBLE") errors.push("approval must grant LOCAL_REVERSIBLE authority only")
  validateExactScope(value.grantedScopes, "grantedScopes", expectedScopeForOperation(proposal.operation), errors)
  if (value.status !== "GRANTED") errors.push("approval status must be GRANTED")

  return { valid: errors.length === 0, errors }
}

export function getProjectActionFromGovernedProposal(proposal: GovernedActionProposal): ProjectAction | null {
  if (proposal.operation !== "PROJECT_BRAIN_APPEND_NEXT_ACTION") return null
  const errors: string[] = []
  const action = parseProjectAction(proposal.payload.action, errors)
  return errors.length === 0 ? action : null
}

export function getStartActionIdFromGovernedProposal(proposal: GovernedActionProposal): string | null {
  if (proposal.operation !== "PROJECT_BRAIN_START_NEXT_ACTION") return null
  const actionId = proposal.payload.actionId
  return typeof actionId === "string" && actionId.trim() ? actionId.trim() : null
}
