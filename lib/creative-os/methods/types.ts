import type { CreativeProjectMode, CreativeProjectPhase } from "@/lib/director/types"

// Authority is narrowed to only what a read-only advisory method can request
export type CreativeMethodAuthority = "READ_ONLY" | "SUGGEST"

export type CreativeMethodStatus =
  | "NOT_RUN"
  | "COMPLETE"
  | "FAILED"
  | "BLOCKED"

/**
 * Definition contract for a Creative Method.
 * Registered once per method; immutable at runtime.
 */
export interface CreativeMethodDefinition {
  id: string
  resourceId: string  // links to ResourceMetadata.id in the Slice 3A registry
  name: string
  version: string
  supportedModes: CreativeProjectMode[]
  supportedPhases: CreativeProjectPhase[]
  capabilityGaps: string[]
  requiredInputs: string[]
  optionalInputs: string[]
  outputSchemaId: string
  qualityGateIds: string[]
  authorityRequired: CreativeMethodAuthority
  deterministic: true
}

/**
 * Structured input provided at runtime to a specific method invocation.
 */
export interface CreativeMethodInput {
  methodId: string
  projectMode: CreativeProjectMode
  phase: CreativeProjectPhase
  subjectDescription: string  // e.g. "Music documentary about Mara's journey"
  subjectContext: string      // e.g. "Short-form competition film, 8-minute format"
  capabilityGap: string       // e.g. "category-differentiation"
  evaluatorType?: string
  supplementaryFields?: Record<string, string>
}

/**
 * A single step within a method's structured reasoning process.
 */
export interface CreativeMethodStep {
  stepIndex: number
  label: string
  instruction: string  // Deterministic instruction text, may embed input values
  outputKey: string    // Key used in rawOutputs
}

/**
 * A named section of the method's advisory output.
 */
export interface CreativeMethodOutputSection {
  sectionKey: string
  label: string
  content: string
}

/**
 * Intermediate result produced by executing a method's steps.
 */
export interface CreativeMethodResult {
  methodId: string
  status: CreativeMethodStatus
  steps: CreativeMethodStep[]
  outputSections: CreativeMethodOutputSection[]
  rawOutputs: Record<string, string>
}

/**
 * A single quality gate that evaluates a method result synchronously and deterministically.
 * No external calls. Pure function of the result.
 */
export interface CreativeMethodQualityGate {
  gateId: string
  label: string
  description: string
  passCriteria: string[]
  evaluate: (result: CreativeMethodResult) => CreativeMethodQualityResult
}

/**
 * The outcome of evaluating a single quality gate.
 */
export interface CreativeMethodQualityResult {
  gateId: string
  label: string
  passed: boolean
  failReasons: string[]
}

/**
 * The full execution result returned from the Creative Method Runtime.
 * Always advisory. Never executes external production.
 */
export interface CreativeMethodExecutionResult {
  methodId: string
  resourceId: string
  input: CreativeMethodInput
  result: CreativeMethodResult
  qualityResults: CreativeMethodQualityResult[]
  allGatesPassed: boolean
  advisoryEvidence: string[]
  status: CreativeMethodStatus
  isReadOnly: true
  sideEffects: null
}

/**
 * Runtime context for method lookup and execution coordination.
 */
export interface CreativeMethodRuntimeContext {
  methods: Map<string, CreativeMethodDefinition>
}

// ─── Trust Evaluation Types (SRB V3) ────────────────────────────────────────

export type TrustConventionEffect = "SUPPORTS" | "WEAKENS" | "NEUTRAL" | "CONTEXT_DEPENDENT"

export interface TrustImpactEvaluation {
  requirement: string
  audienceBelief: string
  conventionEffect: TrustConventionEffect
  reasoning: string
}

// ─── Somatic Perceptual & Formal Types (SRD V3) ──────────────────────────────

export interface SomaticPerceptualPrinciple {
  responseTarget: string
  principle: string
  reasoning: string
}

export type StereotypeRiskRating = "LOW" | "MEDIUM" | "HIGH"

export interface SomaticFormalOption {
  option: string
  whyItSupportsResponse: string
  contextFit: string
  stereotypeRisk: StereotypeRiskRating
  stereotypeRiskReason: string
}

export interface SomaticSelectedDirection {
  chosenExpression: string
  because: string
  rejectedAlternatives: string[]
}

/**
 * Audit log structure for method executions.
 * Links input metadata, output fingerprints, evaluation results, and human review status.
 */
export interface CreativeMethodEvaluationRecord {
  methodId: string
  projectId: string
  capabilityGap: string
  inputFingerprint: string
  outputFingerprint: string
  qualityResults: CreativeMethodQualityResult[]
  humanReviewStatus: "PENDING" | "APPROVED" | "REJECTED"
  notes?: string
}
