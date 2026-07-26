// ─────────────────────────────────────────────────────────────
// Project Brain Workspace — Core Types
// ─────────────────────────────────────────────────────────────

import type { CaptureState } from "../capture/types"

export type ProjectId = string
export type ProjectSlug = string

export type ProjectKind =
  | "client-product"
  | "internal-tool"
  | "website"
  | "product-prototype"
  | "hackathon"
  | "design-challenge"
  | "creative-experiment"
  | "data-story"
  | "broadcast-interface"
  | "demo-film"
  | "portfolio-case-study"

export type ProjectStatus =
  | "intake"
  | "researching"
  | "positioning"
  | "designing"
  | "building"
  | "verifying"
  | "presenting"
  | "submitted"
  | "published"
  | "paused"
  | "archived"

export type ProjectPhase =
  | "intake"
  | "qualify"
  | "research"
  | "position"
  | "differentiate"
  | "concept"
  | "design"
  | "prototype"
  | "build"
  | "verify"
  | "audit"
  | "capture"
  | "present"
  | "submit"
  | "publish"
  | "retrospective"

export type ProjectPriority = "low" | "medium" | "high" | "critical"

export type ProjectConstraintType = "technical" | "time" | "budget" | "scope" | "compliance"

export interface ProjectFact {
  id: string
  label: string
  description: string
  category: "context" | "technical" | "constraint" | "business"
  phase: ProjectPhase
}

export interface ProjectAssumption {
  id: string
  label: string
  description: string
  status: "unresolved" | "validated" | "rejected"
  validationCriteria: string
  resolvedEvidenceId?: string
}

export type DecisionStatus = "proposed" | "approved" | "superseded" | "rejected" | "deferred"

export interface ProjectDecision {
  id: string
  label: string
  description: string
  status: DecisionStatus
  rationale: string
  alternativesConsidered: string[]
  evidenceIds: string[]
  source: string
  phase: ProjectPhase
  supersedes?: string // id of another decision
  supersededBy?: string // id of another decision
  reversible: boolean
  impact: "low" | "medium" | "high" | "critical"
  approvedBy?: string
  approvedLabel?: string
}

export interface ProjectRejection {
  id: string
  label: string
  reason: string
  rejectedPhase: ProjectPhase
  evidence?: string
  riskAvoided: string
  reconsiderCondition: string
  source: string
}

export type EvidenceType =
  | "user-research"
  | "technical-proof"
  | "live-prototype"
  | "screenshot"
  | "test-result"
  | "source-document"
  | "client-confirmation"
  | "guideline"
  | "benchmark"
  | "visual-proof"

export type EvidenceStrength = "direct" | "supporting" | "contextual" | "unresolved"

export interface ProjectEvidence {
  id: string
  label: string
  claimSupported: string
  type: EvidenceType
  source: string
  strength: EvidenceStrength
  status: "available" | "missing" | "disputed" | "expired" | "excluded"
  routeOrFile: string
  linkedDecisionId?: string
  linkedOutputId?: string
  limitation?: string
}

export interface ProjectRisk {
  id: string
  label: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  probability: "low" | "medium" | "high"
  mitigationStrategy: string
  status: "open" | "mitigated" | "triggered" | "closed"
}

export interface ProjectOutput {
  id: string
  label: string
  description: string
  format: "code" | "document" | "design" | "video" | "package"
  phase: ProjectPhase
  status: "pending" | "in-progress" | "blocked" | "completed"
  filepath?: string
  notes?: string
}

export interface ProjectAction {
  id: string
  label: string
  description: string
  phase: ProjectPhase
  status: "todo" | "doing" | "done" | "blocked"
  assignedTo?: string
  deadlineLabel?: string
}

export interface ProjectLearning {
  id: string
  label: string
  description: string
  impactArea: string
  reusableAsset?: string
}

export interface ProjectStakeholder {
  id: string
  label: string
  role: string
  email?: string
}

export interface ProjectSourceLink {
  id: string
  label: string
  sourceType:
    | "user-input"
    | "project-file"
    | "playbook"
    | "registry"
    | "challenge-guideline"
    | "research"
    | "screenshot"
    | "prototype"
    | "audit"
    | "retrospective"
  route?: string
  filePath?: string
  playbookId?: string
  registryId?: string
  externalUrl?: string
  description: string
}

export interface ProjectRequirement {
  id: string
  label: string
  description: string
  priority: ProjectPriority
}

export interface ProjectCriterion {
  id: string
  label: string
  description: string
  weight: number
}

export interface ProjectVisualDirection {
  mood: string
  typography: string
  colors: string[]
  layouts: string
  interactions: string
}

export interface ProjectCapturePlan {
  states: CaptureState[]
}

export interface ProjectVideoShot {
  id: string
  order: number
  label: string
  purpose: string
  sourceRoute: string
  captureState: string
  duration: number
  screenAction: string
  overlay: string
  voiceover: string
  proofShown: string
  transition: string
  fallback: string
}

export interface ProjectVideoPlan {
  purpose: string
  audience: string
  durationSeconds: number
  formats: string[]
  narrative: string
  hook: string
  scenes: string[]
  proofMoments: string[]
  shots: ProjectVideoShot[]
  transitions: string[]
  voiceover: string
  subtitles: string
  soundDirection: string
  cta: string
  outputVariants: string[]
  missingAssets: string[]
  captureDependencies: string[]
  productionReadiness: "draft" | "ready" | "blocked"
}

export interface ProjectAuditResult {
  id: string
  label: string
  passed: boolean
  consequence: string
  remediation?: string
  severity: "info" | "warning" | "error"
}

export interface ProjectRecommendation {
  id: string
  targetType: "playbook" | "registry" | "recipe" | "capture" | "video" | "audit" | "phase"
  targetId: string
  confidence: "strong-match" | "useful-match" | "conditional-match"
  reasons: string[]
  matchedCriteria: string[]
  missingInformation: string[]
  limitations: string[]
}

export interface ProjectBrain {
  // IDENTITY
  id: ProjectId
  slug: ProjectSlug
  title: string
  shortTitle: string
  description: string
  kind: ProjectKind
  status: ProjectStatus
  currentPhase: ProjectPhase
  completedPhases: ProjectPhase[]
  blockedPhases: ProjectPhase[]
  nextRecommendedPhase: ProjectPhase
  priority: ProjectPriority
  createdLabel: string
  updatedLabel: string
  client?: string
  challenge?: string
  deadlineLabel?: string

  // CONTEXT
  problem: string
  audience: string
  primaryGoal: string
  businessGoal?: string
  creativeGoal?: string
  successDefinition: string
  constraints: Array<{ id: string; type: ProjectConstraintType; description: string }>
  stakeholders: ProjectStakeholder[]
  requirements: ProjectRequirement[]
  evaluationCriteria: ProjectCriterion[]
  sourceLinks: ProjectSourceLink[]
  references: string[]

  // POSITIONING
  positioningStatement: string
  tension: string
  memoryHook: string
  judgeMemorySentence?: string
  differentiation: string
  categoryClaim: string
  alternatives: string[]
  rejectedAngles: string[]

  // DESIGN
  visualDirection: string
  typographyDirection: string
  colorDirection: string
  layoutDirection: string
  interactionDirection: string
  responsiveStrategy: string
  accessibilityStrategy: string
  designPrinciples: string[]
  antiPatterns: string[]
  rejectedDirections: string[]

  // PROOF
  primaryClaim: string
  evidence: ProjectEvidence[]
  proofMoment: string
  technicalProof: string
  partnerNativeProof?: string
  failureMode: string
  fallback: string
  unresolvedProofGaps: string[]

  // BUILD
  selectedRegistryIds: string[]
  selectedPlaybookIds: string[]
  selectedReadingPathIds: string[]
  selectedRecipeIds: string[]
  architectureNotes: string
  implementationConstraints: string[]
  acceptanceCriteria: string[]
  technicalRisks: string[]

  // CAPTURE
  capturePlan: ProjectCapturePlan
  signatureStateId: string
  signatureFrame: number
  heroDemoMoment: string
  cleanViewRoute: string
  restoreUrls: Record<string, string>
  captureLimitations: string[]

  // VIDEO
  videoPlan: ProjectVideoPlan

  // PRESENTATION
  coverPlan?: string
  firstFrame?: string
  presentationTitle?: string
  oneLineSummary?: string
  caseStudyOrder?: string[]
  submissionRequirements?: string[]
  portfolioPlan?: string
  socialLaunchPlan?: string

  // STATE
  facts: ProjectFact[]
  assumptions: ProjectAssumption[]
  decisions: ProjectDecision[]
  rejections: ProjectRejection[]
  risks: ProjectRisk[]
  outputs: ProjectOutput[]
  nextActions: ProjectAction[]
  learnings: ProjectLearning[]
  openQuestions: string[]
  blockedBy: string[]

  // AUDIT
  auditResults: ProjectAuditResult[]
  currentScore: number
  readiness: number // 0-100 percentage
  blockers: string[]
  warnings: string[]
  publicationGate: boolean
  submissionGate: boolean
}

export interface ProjectSnapshot {
  activeProjectId: ProjectId
  activeSection: string
  activePhase: ProjectPhase
  activeItemId: string | null
  inspectorVisible: boolean
  recommendationsVisible: boolean
  auditVisible: boolean
  selectedRecommendationId: string | null
  timestamp: string
}

export interface ProjectIntegrityReport {
  valid: boolean
  errors: string[]
  warnings: string[]
  unknownRegistryIds: string[]
  unknownPlaybookIds: string[]
  unknownRecipeIds: string[]
  invalidDecisionRelations: string[]
  invalidEvidenceRelations: string[]
  missingProof: boolean
  missingAudience: boolean
  missingSuccessDefinition: boolean
  unresolvedAssumptions: string[]
  unresolvedRisks: string[]
  missingCaptureStates: boolean
  missingSignatureFrame: boolean
  missingVideoPurpose: boolean
  inconsistentPhases: string[]
  blockedOutputs: string[]
  readinessScore: number
}

export interface ProjectContext {
  state: {
    activeProjectId: ProjectId
    activeProject: ProjectBrain | null
    activeSection: string
    activePhase: ProjectPhase
    activeItemId: string | null
    inspectorVisible: boolean
    recommendationsVisible: boolean
    auditVisible: boolean
    selectedRecommendationId: string | null
    snapshot: ProjectSnapshot
    validationReport: ProjectIntegrityReport | null
    recommendations: ProjectRecommendation[]
    readiness: number
    allProjects: ProjectBrain[]
  }
  actions: {
    setProject: (id: ProjectId) => void
    setSection: (section: string) => void
    setPhase: (phase: ProjectPhase) => void
    selectItem: (id: string | null) => void
    toggleInspector: () => void
    toggleRecommendations: () => void
    toggleAudit: () => void
    selectRecommendation: (id: string | null) => void
    clearSelection: () => void
    resetProject: () => void
    copySnapshot: () => Promise<void>
    copyProjectBrain: () => Promise<void>
    copyAgentPacket: () => Promise<void>
    copyDesignPacket: () => Promise<void>
    copyBuildPacket: () => Promise<void>
    copyCapturePacket: () => Promise<void>
    copyVideoPacket: () => Promise<void>
    copySubmissionPacket: () => Promise<void>
  }
}
