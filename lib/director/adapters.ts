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
import { qualifyDirectorSemanticFallback } from "./semantic-fallback"
import { projectGovernedDirectorSkills } from "../creative-os/collaboration/director-adapter"

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
  sourceDecisionOrGate: string,
  evaluationTimestamp: string | undefined,
): AuthorizedAction {
  const creativePhase = mapCreativePhase(phase)
  const nonTerminalActions = project.nextActions.filter((action) => action.status !== "done")
  const matchingAction = nonTerminalActions.find((act) => mapCreativePhase(act.phase) === creativePhase)
  const baseAction = matchingAction ?? nonTerminalActions[0]
  const semanticFallback = baseAction ? null : qualifyDirectorSemanticFallback(project, mode, evaluationTimestamp)
  const hasBlockers = blockers.length > 0

  const title = baseAction?.label
    ?? (hasBlockers ? `Review ${mode.toLowerCase().replace("_", " ")} blockers` : semanticFallback!.title)
  const description = baseAction?.description
    ?? (hasBlockers
      ? "Review the canonical Project Brain blockers and their resolution conditions before advancing."
      : semanticFallback!.description)
  const actionType = baseAction?.status === "blocked" || hasBlockers ? "review-required" : "next-action"
  const actionId = baseAction?.id
    ?? (hasBlockers ? `${project.id}-${mode.toLowerCase()}-blocker-review` : semanticFallback!.actionId)
  const actionPhase = baseAction || hasBlockers
    ? creativePhase
    : mapCreativePhase(semanticFallback!.phase)

  return {
    actionId,
    actionType,
    title,
    description,
    rationale: description,
    mode,
    phase: actionPhase,
    authorityRequirement: authorityRequirement as never,
    approvalStatus: canAuthorizeExternalAction({
      authorityLevel: authorityRequirement as never,
      requestedAction: title,
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
    expectedResult: description,
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
  const governedSkills = projectGovernedDirectorSkills()

  return {
    project,
    mode,
    phaseContext,
    evidence: mapEvidence(project),
    authorityContext,
    availableSkills: governedSkills.valid ? [...governedSkills.skills] : [],
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
    blockingScope: card.workflowState ?? "",
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
    resolveDirectorPhase(input.mode, input.phaseContext),
    input.authorityContext.authorityLevel
  )

  const nextAction = mapActionCandidate(
    input.project,
    input.mode,
    resolveDirectorPhase(input.mode, input.phaseContext),
    blockers,
    input.authorityContext.authorityLevel,
    gateEvaluations.find((gate) => gate.gateId === "hero-demo-moment")?.gateId ?? "director:gates",
    input.evaluationTimestamp,
  )

  return {
    mode: input.mode,
    resolvedPhase: resolveDirectorPhase(input.mode, input.phaseContext),
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

export function adaptDirectorResultWithAdvisoryEvidence(
  input: DirectorInput,
  advisoryEvidence: DirectorEvidenceReference[]
): DirectorResult {
  const mergedInput = {
    ...input,
    evidence: [...input.evidence, ...advisoryEvidence]
  }

  const baseResult = adaptDirectorResult(mergedInput)

  if (advisoryEvidence.length > 0) {
    const failEvidence = advisoryEvidence.find(e => e.status === "fail")
    if (failEvidence) {
      const newBlocker: CanonicalBlocker = {
        blockerId: `advisory-fail-${failEvidence.id}`,
        category: "advisory-contradiction",
        description: `Advisory evidence failed: ${failEvidence.label}`,
        severity: "warning",
        status: "open",
        source: "AdvisoryEvidence",
        blockingScope: "project",
        resolutionCondition: `Resolve contradiction in ${failEvidence.label}`,
        humanActionRequired: true
      }
      baseResult.blockers.push(newBlocker)
      baseResult.nextAction.blockers.push(newBlocker)
      baseResult.nextAction.actionType = "review-required"
      baseResult.nextAction.title = `Resolve contradiction: ${failEvidence.label}`
      baseResult.nextAction.rationale = `${baseResult.nextAction.rationale} (Contradicts assumption: ${failEvidence.label} failed)`
    } else {
      const passEvidences = advisoryEvidence.filter(e => e.status === "pass")
      const partialEvidences = advisoryEvidence.filter(e => e.status === "partial")

      if (passEvidences.length > 0) {
        const passLabels = passEvidences.map(e => e.label).join(", ")
        baseResult.nextAction.rationale = `${baseResult.nextAction.rationale} (Confirmed by validated advisory evidence: ${passLabels})`
      } else if (partialEvidences.length > 0) {
        const partialLabels = partialEvidences.map(e => e.label).join(", ")
        baseResult.nextAction.rationale = `${baseResult.nextAction.rationale} (Acknowledge uncertainty: guided by partial advisory evidence: ${partialLabels})`
      }
    }
  }

  return baseResult
}
