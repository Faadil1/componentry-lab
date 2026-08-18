import type { ProjectBrain, ProjectKind } from "../projects"
import type { AuthorityContext, CreativeProjectMode, DirectorInput, DirectorResult } from "./types"
import { adaptDirectorResult, adaptProjectBrainToDirectorInput } from "./adapters"

export interface LiveDirectorProjectSummary {
  id: string
  title: string
  kind: ProjectKind
  currentPhase: string
  mode: CreativeProjectMode | null
  modeResolution: "EXPLICIT_KIND" | "PROJECT_EVIDENCE" | "UNMAPPED"
  compatible: boolean
}

export interface LiveDirectorProjection {
  projectId: string
  mode: CreativeProjectMode
  modeResolution: "EXPLICIT_KIND" | "PROJECT_EVIDENCE"
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

function resolveDirectorModeFromProjectEvidence(project: ProjectBrain): CreativeProjectMode | null {
  const playbookSignals = project.selectedPlaybookIds.map((id) => id.toLowerCase())
  const audience = project.videoPlan.audience.toLowerCase()
  const challenge = (project.challenge ?? "").toLowerCase()

  const hasHackathonEvidence =
    playbookSignals.some((id) => id.startsWith("hackathon-") || id.includes("hackathon")) ||
    audience.includes("hackathon judge") ||
    challenge.includes("hackathon")

  if (hasHackathonEvidence) return "HACKATHON"
  return null
}

export function resolveDirectorModeForProject(project: ProjectBrain): {
  mode: CreativeProjectMode | null
  resolution: "EXPLICIT_KIND" | "PROJECT_EVIDENCE" | "UNMAPPED"
} {
  const explicitMode = resolveDirectorModeForProjectKind(project.kind)
  if (explicitMode) return { mode: explicitMode, resolution: "EXPLICIT_KIND" }

  const evidenceMode = resolveDirectorModeFromProjectEvidence(project)
  if (evidenceMode) return { mode: evidenceMode, resolution: "PROJECT_EVIDENCE" }

  return { mode: null, resolution: "UNMAPPED" }
}

export function summarizeLiveDirectorProject(project: ProjectBrain): LiveDirectorProjectSummary {
  const resolved = resolveDirectorModeForProject(project)
  return {
    id: project.id,
    title: project.title,
    kind: project.kind,
    currentPhase: project.currentPhase,
    mode: resolved.mode,
    modeResolution: resolved.resolution,
    compatible: resolved.mode !== null,
  }
}

export function normalizeDirectorEvaluationTimestamp(timestamp: string): string | null {
  const parsed = Date.parse(timestamp)
  if (!Number.isFinite(parsed)) return null
  const date = new Date(parsed).toISOString().slice(0, 10)
  return `${date}T00:00:00.000Z`
}

export function buildLiveDirectorProjection(
  project: ProjectBrain,
  evaluationTimestamp: string = new Date().toISOString(),
): LiveDirectorProjection | null {
  const resolved = resolveDirectorModeForProject(project)
  if (!resolved.mode || resolved.resolution === "UNMAPPED") return null

  const normalizedEvaluationTimestamp = normalizeDirectorEvaluationTimestamp(evaluationTimestamp)
  if (!normalizedEvaluationTimestamp) return null

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
  const input = adaptProjectBrainToDirectorInput(
    project,
    resolved.mode,
    project.currentPhase,
    authorityContext,
    normalizedEvaluationTimestamp,
  )
  const result = adaptDirectorResult(input)

  return {
    projectId: project.id,
    mode: resolved.mode,
    modeResolution: resolved.resolution,
    input,
    result,
    evaluationTimestamp: normalizedEvaluationTimestamp,
  }
}
