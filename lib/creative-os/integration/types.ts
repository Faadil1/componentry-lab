import type { ProjectBrain } from "../../projects"
import type { AuthorityCeiling, ResourceEvaluation } from "../types"
import type { DirectorResult, AuthorizedAction } from "../../director/types"
import type { CreativeMethodExecutionResult } from "../methods/types"

/**
 * Continuation compatibility classification.
 *
 * NONE         — first run, no previous continuation state provided.
 * MATCH        — same project + same ProjectBrain fingerprint; previous state is valid.
 * STALE        — same projectId but ProjectBrain fingerprint differs; pipeline must recompute.
 * INCOMPATIBLE — different projectId; previous state cannot be applied.
 */
export type ContinuationCompatibility = "NONE" | "MATCH" | "STALE" | "INCOMPATIBLE"

export interface CreativeOSContinuationState {
  schemaVersion: string
  projectId: string
  projectBrainFingerprint: string
  phase: string
  mode: string
  currentObjective: string
  evaluator: string
  heroDemoMomentIdOrFingerprint: string
  activeBlockerIds: string[]
  detectedCapabilityGap: string | null
  selectedResourceId: string | null
  selectedMethodId: string | null
  methodInputFingerprint: string | null
  methodOutputFingerprint: string | null
  qualitySummary: string | null
  authorizedNextActionFingerprint: string
  /**
   * integrationFingerprint: deterministic fingerprint of the full integrated decision pipeline
   * (Project Brain fingerprint + director projection + routing + method output + director final).
   */
  integrationFingerprint: string
  /**
   * continuationFingerprint: deterministic fingerprint of this CreativeOSContinuationState
   * (computed from all canonical continuation fields excluding itself).
   */
  continuationFingerprint: string
  provenanceReferences: string[]
  /**
   * Compatibility of this state relative to the previous continuation state, if any.
   */
  continuationCompatibility: ContinuationCompatibility
  // Human-readable continuity fields
  resumeSummary: string
  currentDecision: string
  whyThisIsNext: string
  unresolvedBlocker: string
  evidenceStillNeeded: string
}

export interface CreativeOSIntegrationRequest {
  projectBrainSnapshot: ProjectBrain
  currentAuthority: AuthorityCeiling
  optionalRequestedCapabilityGap?: string
  optionalPreviousContinuationState?: CreativeOSContinuationState
}

export type IntegrationStatus =
  | "COMPLETE"
  | "NO_METHOD_REQUIRED"
  | "NO_MATCH"
  | "METHOD_BLOCKED"
  | "METHOD_PARTIAL"
  | "INTEGRATION_BLOCKED"

export interface CreativeOSIntegrationResult {
  projectId: string
  projectBrainFingerprint: string
  directorBefore: DirectorResult
  detectedCapabilityGap: string | null
  routingDecision: "MATCH" | "NO_MATCH" | "BLOCKED" | "INSUFFICIENT_AUTHORITY" | "NO_GAP"
  selectedResource: ResourceEvaluation | null
  methodExecution: CreativeMethodExecutionResult | null
  methodQualityEvidence: {
    status: string
    qualityResults: { gateId: string; passed: boolean; failReasons?: string[] }[]
    inputSignature?: string
    outputSignature?: string
    resourceLifecycle?: string
    resourceId?: string
    methodId?: string
  } | null
  directorAfter: DirectorResult
  authorizedNextAction: AuthorizedAction
  integrationProvenance: {
    projectBrainFingerprint: string
    directorProjectionFingerprint: string
    capabilityGapSource: "DIRECTOR_DERIVED" | "REQUEST_OVERRIDE"
    routingResult: string
    resourceId: string | null
    resourceLifecycle: string | null
    methodId: string | null
    methodInputFingerprint: string | null
    methodOutputFingerprint: string | null
    qualitySummary: string | null
    directorFinalFingerprint: string
    authorizedActionFingerprint: string
    continuationFingerprint: string
  }
  continuationState: CreativeOSContinuationState
  status: IntegrationStatus
}
