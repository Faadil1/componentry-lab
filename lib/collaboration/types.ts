export const COLLABORATION_SCHEMA_VERSION = "1.0" as const
export const MAX_COLLABORATION_HOPS = 8 as const

export type CollaborationSystemId =
  | "project-brain"
  | "creative-director"
  | "registry-v2"
  | "component-library"
  | "creative-method-runtime"
  | "film-kit"
  | "playbooks"
  | "references"
  | "sources"
  | "decisions-audit-learnings"

export type CollaborationProjectMode = "DAY_CHALLENGE" | "HACKATHON" | "MARA" | "DATA_STORY"

export type CollaborationAuthorityLevel =
  | "suggest"
  | "prepare"
  | "local-reversible-execution"
  | "prepare-external-action"
  | "authorized-reversible-external-action"
  | "prohibited"

export type CollaborationEffectClass =
  | "read"
  | "advisory"
  | "prepare"
  | "local-reversible"
  | "external-reversible"
  | "irreversible"

export type CollaborationRequestStatus = "requested" | "accepted" | "blocked"
export type CollaborationResultStatus = "completed" | "blocked" | "rejected" | "failed"

export interface CollaborationAuthorityContext {
  authorityLevel: CollaborationAuthorityLevel
  requestedAction: string
  target: string
  reversibility: "reversible" | "irreversible" | "unknown"
  risk: "low" | "medium" | "high" | "critical"
  approvalRequirement: "none" | "explicit" | "human-review"
  grantedScope: string[]
  grantedBy?: string
  grantedAt?: string
  expiration?: string | null
  status: "pending" | "granted" | "denied" | "expired"
}

export interface CollaborationRoute {
  visitedSystems: CollaborationSystemId[]
  hopCount: number
  maxHops: number
}

export interface CollaborationRequest {
  schemaVersion: typeof COLLABORATION_SCHEMA_VERSION
  requestId: string
  projectId: string
  correlationId: string
  sourceSystem: CollaborationSystemId
  targetSystem: CollaborationSystemId
  intent: string
  projectMode: CollaborationProjectMode
  projectPhase: string
  capabilityRefs: string[]
  authorityContext: CollaborationAuthorityContext
  inputRefs: string[]
  structuredInputs: Record<string, unknown>
  evidenceRefs: string[]
  requestedEffectClass: CollaborationEffectClass
  route: CollaborationRoute
  status: CollaborationRequestStatus
}

export interface CollaborationQualityResult {
  gateId: string
  status: "pass" | "fail" | "blocked" | "conditional"
  evidenceRefs: string[]
  notes: string[]
}

export interface CollaborationResult {
  schemaVersion: typeof COLLABORATION_SCHEMA_VERSION
  requestId: string
  projectId: string
  correlationId: string
  sourceSystem: CollaborationSystemId
  targetSystem: CollaborationSystemId
  capabilityUsed: string | null
  resultStatus: CollaborationResultStatus
  structuredOutput: Record<string, unknown>
  qualityResults: CollaborationQualityResult[]
  evidenceRefs: string[]
  provenance: string[]
  limitations: string[]
  recommendedNextStep: string | null
  sideEffectRequest: null
}

export interface CollaborationValidationResult {
  valid: boolean
  errors: string[]
}
