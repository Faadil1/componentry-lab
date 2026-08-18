import type { AuthorityCeiling } from "../types"

export const COLLABORATION_SCHEMA_VERSION = "1.0.0" as const

export type CollaborationSystemId =
  | "PROJECT_BRAIN"
  | "CREATIVE_DIRECTOR"
  | "CREATIVE_OS_REGISTRY_V2"
  | "COMPONENT_LIBRARY"
  | "CREATIVE_METHOD_RUNTIME"
  | "FILM_KIT"
  | "PLAYBOOKS"
  | "AUDIT_EVIDENCE"

export type CollaborationIntent =
  | "REQUEST_CONTEXT"
  | "DISCOVER_CAPABILITY"
  | "REQUEST_ADVISORY_WORK"
  | "REQUEST_COMPOSITION"
  | "REQUEST_PRODUCTION"
  | "RETURN_EVIDENCE"
  | "EVALUATE_RESULT"
  | "PROPOSE_MUTATION"

export type CollaborationEffectClass =
  | "NONE"
  | "LOCAL_REVERSIBLE"
  | "OWNER_STATE_MUTATION"
  | "EXTERNAL_SIDE_EFFECT"

export type CollaborationRequestStatus = "REQUESTED"

export type CollaborationResultStatus =
  | "COMPLETE"
  | "PARTIAL"
  | "BLOCKED"
  | "REJECTED"
  | "NO_MATCH"

export type CollaborationJsonPrimitive = string | number | boolean | null
export type CollaborationJsonValue =
  | CollaborationJsonPrimitive
  | readonly CollaborationJsonValue[]
  | { readonly [key: string]: CollaborationJsonValue }

export interface CollaborationHop {
  sourceSystem: CollaborationSystemId
  targetSystem: CollaborationSystemId
}

export interface CollaborationAuthorityContext {
  currentAuthority: AuthorityCeiling
  requestedAuthority: AuthorityCeiling
  ownerSystem: CollaborationSystemId | null
  humanReviewRequired: boolean
}

export interface CollaborationRequest {
  schemaVersion: typeof COLLABORATION_SCHEMA_VERSION
  projectId: string
  correlationId: string
  sourceSystem: CollaborationSystemId
  targetSystem: CollaborationSystemId
  intent: CollaborationIntent
  projectPhase: string
  projectMode: string
  capabilityRefs: readonly string[]
  authorityContext: CollaborationAuthorityContext
  structuredInputs: Readonly<Record<string, CollaborationJsonValue>>
  inputRefs: readonly string[]
  evidenceRefs: readonly string[]
  requestedEffectClass: CollaborationEffectClass
  hopTrace: readonly CollaborationHop[]
  status: CollaborationRequestStatus
}

export interface CollaborationSideEffectRequest {
  ownerSystem: CollaborationSystemId
  effectClass: Exclude<CollaborationEffectClass, "NONE">
  requestedAuthority: AuthorityCeiling
  humanReviewRequired: boolean
  description: string
}

export interface CollaborationResult {
  schemaVersion: typeof COLLABORATION_SCHEMA_VERSION
  projectId: string
  correlationId: string
  sourceSystem: CollaborationSystemId
  targetSystem: CollaborationSystemId
  capabilityUsed: string | null
  resultStatus: CollaborationResultStatus
  structuredOutput: Readonly<Record<string, CollaborationJsonValue>>
  qualityResults: readonly CollaborationJsonValue[]
  evidenceRefs: readonly string[]
  provenanceRefs: readonly string[]
  limitations: readonly string[]
  recommendedNextStep: string | null
  sideEffectRequest: CollaborationSideEffectRequest | null
}

export interface CollaborationValidationReport {
  valid: boolean
  errors: readonly string[]
}
