import type {
  ProjectAction,
  ProjectBrain,
  ProjectEvidence,
  ProjectLearning,
  ProjectPhase,
  ProjectStatus,
} from "@/lib/projects"
import type { EpisodeStateCardProps } from "@/components/workflow/episode-state-card"

export type CreativeProjectMode = "DAY_CHALLENGE" | "HACKATHON" | "MARA" | "DATA_STORY"

export type CreativeProjectPhase =
  | "intake"
  | "clarify"
  | "route"
  | "build"
  | "verify"
  | "review"
  | "submit"
  | "publish"
  | "reflect"

export type DirectorEvaluatorType =
  | "judge"
  | "audience"
  | "client"
  | "stakeholder"
  | "self-directed"

export type GateStatus = "pass" | "fail" | "blocked" | "conditional"
export type AuthorityLevel =
  | "suggest"
  | "prepare"
  | "local-reversible-execution"
  | "prepare-external-action"
  | "authorized-reversible-external-action"
  | "prohibited"

export type LearningLifecycle = "OBSERVATION" | "CANDIDATE" | "TESTING" | "EARNED" | "SUPERSEDED" | "REJECTED"
export type SkillLoadingPolicy = "metadata-first" | "progressive" | "explicit-approval"

export interface CreativeObjective {
  statement: string
  intendedOutcome: string
  primaryAudienceOrEvaluator: string
  successEvidence: string[]
  constraints: string[]
  nonGoals: string[]
}

export interface DirectorEvaluator {
  evaluatorType: DirectorEvaluatorType
  decisionTheyMustMake: string
  whatTheyNeedToUnderstand: string[]
  whatTheyNeedToBelieve: string[]
  requiredProof: string[]
  memorySentence: string
}

export interface CanonicalBlocker {
  blockerId: string
  category: string
  description: string
  severity: "info" | "warning" | "critical"
  status: "open" | "resolved" | "blocked"
  owner?: string
  source: string
  blockingScope: string
  createdTime?: string
  resolutionCondition: string
  resolvedTime?: string | null
  relatedGateId?: string | null
  relatedEvidenceId?: string | null
  humanActionRequired: boolean
}

export interface HeroDemoMoment {
  title: string
  description: string
  trigger: string
  visibleTransformationOrProof: string
  evaluatorInterpretation: string
  requiredEvidence: string[]
  readinessStatus: "not-ready" | "blocked" | "ready"
  blockers: CanonicalBlocker[]
  modeSpecificMetadata: Record<string, string>
}

export interface DecisionLock {
  decisionId: string
  scope: string
  value: string
  rationale: string
  source: string
  lockedTimestamp: string
  lockedBy: string
  unlockConditions: string[]
  supersessionReference?: string | null
  status: "locked" | "superseded" | "unlocked"
}

export interface QualityGate {
  gateId: string
  name: string
  status: GateStatus
  requiredEvidence: string[]
  controllingEvidence?: string | null
  decision: "pass" | "hold" | "rework" | "review"
  conditions: string[]
  blockers: CanonicalBlocker[]
  evaluatedAt: string
  evaluator: DirectorEvaluatorType
  provenance: string
}

export interface AuthorityContext {
  authorityLevel: AuthorityLevel
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

export interface AuthorizedAction {
  actionId: string
  actionType: string
  title: string
  description: string
  rationale: string
  mode: CreativeProjectMode
  phase: CreativeProjectPhase
  authorityRequirement: AuthorityLevel
  approvalStatus: "not-required" | "pending" | "approved" | "rejected"
  preconditions: string[]
  blockers: CanonicalBlocker[]
  expectedResult: string
  reversibility: "reversible" | "irreversible" | "unknown"
  evidenceNeededAfterCompletion: string[]
  sourceDecisionOrGate: string
}

export interface LearningProposal {
  id: string
  sourceProject: string
  mode: CreativeProjectMode
  observation: string
  evidence: string[]
  suspectedCause: string
  proposedRule: string
  scope: string[]
  confidence: number
  contradictions: string[]
  validationCount: number
  status: LearningLifecycle
  humanApprovalState: "pending" | "approved" | "rejected" | "not-required"
  ruleVersion: string
  supersessionLink?: string | null
  provenance: string
}

export interface SkillMetadata {
  skillId: string
  title: string
  description: string
  version: string
  provenance: string
  supportedModes: CreativeProjectMode[]
  supportedPhases: CreativeProjectPhase[]
  activationConditions: string[]
  requiredInputs: string[]
  producedOutputs: string[]
  dependencies: string[]
  conflicts: string[]
  authorityRequirement: AuthorityLevel
  maturity: "draft" | "candidate" | "tested" | "approved"
  loadingPolicy: SkillLoadingPolicy
  sourcePaths: string[]
  status: "available" | "inactive" | "deprecated"
}

export interface CreativeProjectModeState {
  mode: CreativeProjectMode
  phasePolicy: CreativeProjectPhase[]
  evaluator: DirectorEvaluator
  expectedProof: string[]
  prohibitedFallbacks: string[]
  completionCriteria: string[]
}

export interface DirectorEvidenceReference {
  id: string
  label: string
  source: string
  status: string
  linkedDecisionId?: string
}

export interface DirectorInput {
  project: ProjectBrain
  mode: CreativeProjectMode
  phaseContext: ProjectPhase
  evidence: DirectorEvidenceReference[]
  authorityContext: AuthorityContext
  availableSkills: SkillMetadata[]
  lockedDecisions: DecisionLock[]
  learningProposals: LearningProposal[]
  evaluationTimestamp?: string
}

export interface DirectorResult {
  mode: CreativeProjectMode
  resolvedPhase: CreativeProjectPhase
  objective: CreativeObjective
  evaluatorPath: DirectorEvaluator
  heroDemoMoment: HeroDemoMoment
  gateEvaluations: QualityGate[]
  blockers: CanonicalBlocker[]
  selectedSkills: SkillMetadata[]
  nextAction: AuthorizedAction
  learningProposals: LearningProposal[]
  validationIssues: string[]
  provenance: string[]
  sideEffectPayload: null
}

export interface DirectorFixture {
  project: ProjectBrain
  mode: CreativeProjectMode
  phaseContext: ProjectPhase
  evaluationTimestamp: string
  lockedDecisions: DecisionLock[]
  learningProposals: LearningProposal[]
  authorityContext: AuthorityContext
  availableSkills: SkillMetadata[]
  evidence: DirectorEvidenceReference[]
}

export interface DirectorCompatibilityProjection {
  episodeState: EpisodeStateCardProps
  blockers: CanonicalBlocker[]
  nextActionLabel: string
}

export type ProjectBrainNextAction = ProjectAction
export type ProjectBrainLearning = ProjectLearning
export type ProjectBrainEvidence = ProjectEvidence
export type ProjectBrainPhase = ProjectPhase
export type ProjectBrainStatus = ProjectStatus
