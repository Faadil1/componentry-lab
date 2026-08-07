import type { AuthorityCeiling } from "../types"
import type { CreativeProjectMode, CreativeProjectPhase } from "../../director/types"

export type FilmKitCapabilityType =
  | "SHOT_PLANNING"
  | "CAMERA_LANGUAGE"
  | "UI_CAPTURE"
  | "PRODUCT_FILM"
  | "MOTION_COMPOSITION"
  | "B_ROLL"
  | "CINEMATIC_PROMPTING"
  | "SOUND_DESIGN"
  | "ASSEMBLY"

export type ExternalCapabilityExecutionMode = "NOT_EXECUTED" | "SIMULATED"

export type ExternalCapabilityExecutionStatus =
  | "USE_NATIVE"
  | "USE_EXISTING_INTERNAL"
  | "EXTERNAL_PLAN_READY"
  | "EXTERNAL_EXPERIMENTAL_CANDIDATE"
  | "DISCOVERY_REQUIRED"
  | "HUMAN_APPROVAL_REQUIRED"
  | "NO_MATCH"
  | "BLOCKED"

export type HumanApprovalState = "NOT_REQUIRED" | "REQUIRED" | "GRANTED" | "DENIED"

export type CostStatus = "FREE" | "PAID" | "SUBSCRIPTION" | "UNKNOWN"

export type PrivacyStatus =
  | "LOCAL_ONLY"
  | "ZERO_RETENTION"
  | "TRAINING_OPT_OUT"
  | "THIRD_PARTY_PROCESSED"
  | "UNKNOWN"

export interface ExternalCapabilityPlanRequest {
  capabilityGap?: string
  artifactType?: string
  projectMode: CreativeProjectMode
  phase: CreativeProjectPhase
  currentAuthority: AuthorityCeiling
  frameworkOrSurface?: string
  metadata?: Record<string, unknown>
}

export interface ExternalCapabilityPlan {
  resourceId: string | null
  capabilityId: string
  decomposedCapabilities: FilmKitCapabilityType[]

  requestedArtifact: string | null

  compatibilityStatus: "VERIFIED" | "DECLARED" | "UNKNOWN" | "INCOMPATIBLE"
  compatibilityEvidence: string | null

  lifecycleState: string | null

  currentAuthority: AuthorityCeiling
  requiredAuthority: AuthorityCeiling
  requiredHumanApproval: boolean
  humanApprovalState: HumanApprovalState

  costStatus: CostStatus
  estimatedCost: string | null

  privacyStatus: PrivacyStatus
  licenseStatus: string | null

  requiredInputs: string[]
  expectedOutputs: string[]

  executionMode: ExternalCapabilityExecutionMode
  executionStatus: ExternalCapabilityExecutionStatus

  blockers: string[]
  missingEvidence: string[]

  planFingerprint: string
}
