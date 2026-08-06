import type { EpisodeStateCardProps } from "@/components/workflow/episode-state-card"
import type { ProjectBrain } from "@/lib/projects"
import type {
  AuthorizedAction,
  CanonicalBlocker,
  CreativeObjective,
  CreativeProjectMode,
  DirectorCompatibilityProjection,
  DirectorEvidenceReference,
  DirectorInput,
  DirectorResult,
  HeroDemoMoment,
  LearningProposal,
  QualityGate,
} from "./types"
import { evaluateGate, getUniversalGateIds } from "./gates"
import { resolveDirectorPhase } from "./phases"
import { resolveModeState } from "./modes"
import { canAuthorizeExternalAction, defaultAuthorityLevelForAction } from "./authority"
import { selectSkillsForMode } from "./skills"


function mapBlockers(project: ProjectBrain): CanonicalBlocker[] {
  return [
    ...project.blockedBy.map((blocker, index) => ({
      blockerId: `blockedBy-${index + 1}`,
      category: "project-blockedBy",
      description: blocker,
      severity: "warning" as const,
      status: "open" as const,
      source: "ProjectBrain.blockedBy",
      blockingScope: "project",
      resolutionCondition: blocker,
      humanActionRequired: true,
    })),
    ...project.blockers.map((blocker, index) => ({
      blockerId: `blocker-${index + 1}`,
      category: "project-blockers",
      description: blocker,
      severity: "warning" as const,
      status: "open" as const,
      source: "ProjectBrain.blockers",
      blockingScope: "project",
      resolutionCondition: blocker,
      humanActionRequired: true,
    })),
  ]
}

function mapEvidence(project: ProjectBrain): DirectorEvidenceReference[] {
  return project.evidence.map((item) => ({
    id: item.id,
    label: item.label,
    source: item.source,
    status: item.status,
    linkedDecisionId: item.linkedDecisionId,
  }))
}

function mapLearning(project: ProjectBrain): LearningProposal[] {
  return project.learnings.map((learning, index) => ({
    id: learning.id,
    sourceProject: project.id,
    mode: "DAY_CHALLENGE",
    observation: learning.description,
    evidence: [],
    suspectedCause: learning.impactArea,
    proposedRule: learning.label,
    scope: [learning.impactArea],
    confidence: 0.5,
    contradictions: [],
    validationCount: index,
    status: "OBSERVATION",
    humanApprovalState: "not-required",
    ruleVersion: "legacy",
    supersessionLink: null,
    provenance: "ProjectBrain.learnings",
  }))
}

function mapHeroMoment(project: ProjectBrain, mode: string): HeroDemoMoment {
  const requiredEvidence = project.evidence.slice(0, 1).map((e) => e.id)
  const blockers = mapBlockers(project)
  return {
    title: project.heroDemoMoment || project.proofMoment || project.judgeMemorySentence || project.memoryHook,
    description: project.description,
    trigger: project.currentPhase,
    visibleTransformationOrProof: project.proofMoment || project.heroDemoMoment,
    evaluatorInterpretation: project.judgeMemorySentence || project.memoryHook,
    requiredEvidence,
    readinessStatus: blockers.length > 0 ? "blocked" : requiredEvidence.length > 0 ? "ready" : "not-ready",
    blockers,
    modeSpecificMetadata: { mode },
  }
}

function mapObjective(project: ProjectBrain): CreativeObjective {
  return {
    statement: project.primaryGoal,
    intendedOutcome: project.successDefinition,
    primaryAudienceOrEvaluator: project.judgeMemorySentence || project.audience,
    successEvidence: project.evidence.map((item) => item.id),
    constraints: project.constraints.map((constraint) => constraint.description),
    nonGoals: project.rejectedAngles,
  }
}

function mapCreativePhase(projectPhase: string): "intake" | "clarify" | "route" | "build" | "verify" | "review" | "submit" | "publish" | "reflect" {
  switch (projectPhase) {
    case "intake":
      return "intake"
    case "verify":
      return "verify"
    case "submit":
      return "submit"
    case "publish":
      return "publish"
    case "build":
      return "build"
    case "review":
      return "review"
    default:
      return "review"
  }
}

function mapActionCandidate(
  project: ProjectBrain,
  mode: CreativeProjectMode,
  phase: string,
  blockers: CanonicalBlocker[],
  authorityRequirement: string,
  sourceDecisionOrGate: string
): AuthorizedAction {
  const baseAction = project.nextActions[0]
  return {
    actionId: baseAction?.id ?? `${project.id}-safe-review`,
    actionType: baseAction?.status === "blocked" ? "review-required" : "next-action",
    title: baseAction?.label ?? "Review blockers",
    description: baseAction?.description ?? "Resolve blockers and review evidence.",
    rationale: baseAction?.description ?? "Deterministic fallback action.",
    mode,
    phase: mapCreativePhase(phase),
    authorityRequirement: authorityRequirement as never,
    approvalStatus: canAuthorizeExternalAction({
      authorityLevel: authorityRequirement as never,
      requestedAction: baseAction?.label ?? "Review blockers",
      target: project.id,
      reversibility: "reversible",
      risk: "low",
      approvalRequirement: "none",
      grantedScope: [],
      status: "pending",
    })
      ? "approved"
      : "not-required",
    preconditions: blockers.map((blocker) => blocker.resolutionCondition),
    blockers,
    expectedResult: baseAction?.label ?? "A safe review step is selected.",
    reversibility: "reversible",
    evidenceNeededAfterCompletion: project.evidence.map((item) => item.id),
    sourceDecisionOrGate,
  }
}

function mapGates(input: DirectorInput, heroDemoMoment: HeroDemoMoment): QualityGate[] {
  const modeState = resolveModeState(input.mode)
  const evidence = input.evidence
  const blockers = mapBlockers(input.project)
  const evaluatedAt = input.evaluationTimestamp ?? new Date().toISOString()

  const gates: QualityGate[] = []
  for (const gateId of getUniversalGateIds()) {
    const requiredEvidence =
      gateId === "hero-demo-moment"
        ? heroDemoMoment.requiredEvidence
        : gateId === "proof-or-evidence"
          ? input.project.evidence.map((item) => item.id)
          : []
    gates.push(
      evaluateGate(
        gateId,
        gateId.replace(/-/g, " "),
        modeState.evaluator.evaluatorType,
        requiredEvidence,
        evidence,
        blockers,
        requiredEvidence.length > 0 ? "review" : "pass",
        [input.mode, input.phaseContext],
        "director:gates",
        evaluatedAt
      )
    )
  }

  return gates
}

export function adaptProjectBrainToDirectorInput(
  project: ProjectBrain,
  mode: DirectorInput["mode"],
  phaseContext: DirectorInput["phaseContext"],
  authorityContext: DirectorInput["authorityContext"],
  evaluationTimestamp?: string
): DirectorInput {
  return {
    project,
    mode,
    phaseContext,
    evidence: mapEvidence(project),
    authorityContext,
    availableSkills: [],
    lockedDecisions: project.decisions
      .filter((decision) => decision.status === "approved")
      .map((decision) => ({
        decisionId: decision.id,
        scope: decision.phase,
        value: decision.label,
        rationale: decision.rationale,
        source: decision.source,
        lockedTimestamp: evaluationTimestamp ?? new Date().toISOString(),
        lockedBy: decision.approvedBy ?? "project-brain",
        unlockConditions: [],
        supersessionReference: decision.supersedes ?? null,
        status: "locked",
      })),
    learningProposals: mapLearning(project),
    evaluationTimestamp,
  }
}

export function adaptNextActions(project: ProjectBrain): AuthorizedAction[] {
  return project.nextActions.map((action) => ({
    actionId: action.id,
    actionType: action.status,
    title: action.label,
    description: action.description,
    rationale: action.description,
    mode: "HACKATHON",
    phase: mapCreativePhase(action.phase),
    authorityRequirement: defaultAuthorityLevelForAction(action.status),
    approvalStatus: "not-required",
    preconditions: [],
    blockers: mapBlockers(project),
    expectedResult: action.label,
    reversibility: "reversible",
    evidenceNeededAfterCompletion: project.evidence.map((item) => item.id),
    sourceDecisionOrGate: action.id,
  }))
}

export function adaptEpisodeStateCardToDirectorProjection(
  card: EpisodeStateCardProps
): DirectorCompatibilityProjection {
  const blockers = (card.blockers ?? []).map((blocker) => ({
    blockerId: blocker.id,
    category: "episode-state-card",
    description: blocker.label,
    severity: blocker.severity,
    status: "open" as const,
    source: "EpisodeStateCard",
    blockingScope: card.workflowState,
    resolutionCondition: blocker.label,
    humanActionRequired: card.humanReviewStatus === "required",
  }))
  return {
    episodeState: card,
    blockers,
    nextActionLabel: card.nextAuthorizedAction ?? "Review episode state",
  }
}

export function adaptDirectorResult(input: DirectorInput): DirectorResult {
  const modeState = resolveModeState(input.mode)
  const objective = mapObjective(input.project)
  const heroDemoMoment = mapHeroMoment(input.project, input.mode)
  const gateEvaluations = mapGates(input, heroDemoMoment)
  const blockers = mapBlockers(input.project)
  const selectedSkills = selectSkillsForMode(
    input.availableSkills,
    input.mode,
    resolveDirectorPhase(input.mode),
    input.authorityContext.authorityLevel
  )

  const nextAction = mapActionCandidate(
    input.project,
    input.mode,
    resolveDirectorPhase(input.mode),
    blockers,
    input.authorityContext.authorityLevel,
    gateEvaluations.find((gate) => gate.gateId === "hero-demo-moment")?.gateId ?? "director:gates"
  )

  return {
    mode: input.mode,
    resolvedPhase: resolveDirectorPhase(input.mode),
    objective,
    evaluatorPath: modeState.evaluator,
    heroDemoMoment,
    gateEvaluations,
    blockers,
    selectedSkills,
    nextAction,
    learningProposals: input.learningProposals,
    validationIssues: [],
    provenance: ["ProjectBrain", "DirectorAdapters"],
    sideEffectPayload: null,
  }
}










