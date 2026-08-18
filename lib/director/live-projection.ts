import type { ProjectBrain, ProjectKind } from "../projects"
import type { AuthorityContext, CreativeProjectMode, DirectorInput, DirectorResult } from "./types"
import { adaptDirectorResult, adaptProjectBrainToDirectorInput } from "./adapters"

export interface LiveDirectorProjectSummary {
  id: string
  title: string
  kind: ProjectKind
  currentPhase: string
  mode: CreativeProjectMode | null
  compatible: boolean
}

export interface LiveDirectorProjection {
  projectId: string
  mode: CreativeProjectMode
  input: DirectorInput
  result: DirectorResult
  evaluationTimestamp: string
}

export function resolveDirectorModeForProjectKind(kind: ProjectKind): CreativeProjectMode | null {
  switch (kind) {
    case "hackathon":
      return "HACKATHON"
    case "data-story":
      return "DATA_STORY"
    case "design-challenge":
    case "creative-experiment":
      return "DAY_CHALLENGE"
    case "demo-film":
      return "MARA"
    default:
      return null
  }
}

export function summarizeLiveDirectorProject(project: ProjectBrain): LiveDirectorProjectSummary {
  const mode = resolveDirectorModeForProjectKind(project.kind)
  return {
    id: project.id,
    title: project.title,
    kind: project.kind,
    currentPhase: project.currentPhase,
    mode,
    compatible: mode !== null,
  }
}

function stableEvaluationTimestamp(project: ProjectBrain): string {
  const parsed = Date.parse(project.updatedLabel)
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString()
  return "2000-01-01T00:00:00.000Z"
}

export function buildLiveDirectorProjection(project: ProjectBrain): LiveDirectorProjection | null {
  const mode = resolveDirectorModeForProjectKind(project.kind)
  if (!mode) return null

  const authorityContext: AuthorityContext = {
    authorityLevel: "suggest",
    requestedAction: "",
    target: project.id,
    reversibility: "unknown",
    risk: "low",
    approvalRequirement: "none",
    grantedScope: [],
    status: "pending",
  }
  const evaluationTimestamp = stableEvaluationTimestamp(project)
  const input = adaptProjectBrainToDirectorInput(
    project,
    mode,
    project.currentPhase,
    authorityContext,
    evaluationTimestamp,
  )
  const result = adaptDirectorResult(input)

  return {
    projectId: project.id,
    mode,
    input,
    result,
    evaluationTimestamp,
  }
}
