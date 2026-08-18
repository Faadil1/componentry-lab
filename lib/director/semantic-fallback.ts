import type { ProjectBrain, ProjectPhase, ProjectRisk } from "@/lib/projects"
import type { CreativeProjectMode } from "./types"

export type DirectorTemporalState = "NO_DEADLINE" | "BEFORE_DEADLINE" | "DEADLINE_TODAY" | "AFTER_DEADLINE" | "INVALID_DEADLINE"

export interface DirectorSemanticFallback {
  actionId: string
  title: string
  description: string
  phase: ProjectPhase
  temporalState: DirectorTemporalState
  semanticReason: "PROOF_GAP" | "PERTINENT_RISK" | "POST_DEADLINE" | "INVALID_DEADLINE" | "NEXT_PHASE" | "MODE_DEFAULT"
}

function isoDateFromTimestamp(timestamp: string | undefined): string | null {
  if (!timestamp) return null
  const parsed = Date.parse(timestamp)
  if (!Number.isFinite(parsed)) return null
  return new Date(parsed).toISOString().slice(0, 10)
}

function parseDeadlineDate(deadlineLabel: string | undefined): string | null {
  if (!deadlineLabel) return null
  const trimmed = deadlineLabel.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  const parsed = Date.parse(`${trimmed}T00:00:00.000Z`)
  if (!Number.isFinite(parsed)) return null
  return new Date(parsed).toISOString().slice(0, 10) === trimmed ? trimmed : null
}

export function classifyDirectorDeadline(project: ProjectBrain, evaluationTimestamp: string | undefined): DirectorTemporalState {
  if (!project.deadlineLabel?.trim()) return "NO_DEADLINE"
  const deadline = parseDeadlineDate(project.deadlineLabel)
  const evaluationDate = isoDateFromTimestamp(evaluationTimestamp)
  if (!deadline || !evaluationDate) return "INVALID_DEADLINE"
  if (evaluationDate < deadline) return "BEFORE_DEADLINE"
  if (evaluationDate === deadline) return "DEADLINE_TODAY"
  return "AFTER_DEADLINE"
}

function pertinentRisk(project: ProjectBrain): ProjectRisk | null {
  return project.risks.find((risk) => risk.status === "triggered")
    ?? project.risks.find((risk) => risk.status === "open" && (risk.severity === "critical" || risk.severity === "high"))
    ?? project.risks.find((risk) => risk.status === "open" && risk.severity === "medium" && risk.probability === "high")
    ?? null
}

function modeLabel(mode: CreativeProjectMode): string {
  switch (mode) {
    case "HACKATHON": return "hackathon"
    case "DAY_CHALLENGE": return "day challenge"
    case "MARA": return "episodic production"
    case "DATA_STORY": return "data story"
  }
}

function slugPart(value: string): string {
  const normalized = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return normalized.slice(0, 48) || "review"
}

function contextSentence(project: ProjectBrain, temporalState: DirectorTemporalState, evaluationTimestamp: string | undefined): string {
  const parts: string[] = []
  const evaluationDate = isoDateFromTimestamp(evaluationTimestamp)
  if (temporalState === "AFTER_DEADLINE" && project.deadlineLabel && evaluationDate) {
    parts.push(`Deadline ${project.deadlineLabel} passed before evaluation on ${evaluationDate}.`)
  } else if (temporalState === "DEADLINE_TODAY" && project.deadlineLabel) {
    parts.push(`Deadline ${project.deadlineLabel} is today.`)
  }
  if (project.unresolvedProofGaps[0]) {
    parts.push(`Unresolved proof gap: ${project.unresolvedProofGaps[0]}.`)
  }
  const risk = pertinentRisk(project)
  if (risk) {
    parts.push(`Pertinent risk: ${risk.label} (${risk.status}, ${risk.severity}/${risk.probability}).`)
  }
  parts.push(`Next recommended phase: ${project.nextRecommendedPhase}.`)
  return parts.join(" ")
}

function defaultModeFallback(mode: CreativeProjectMode): { title: string; description: string } {
  switch (mode) {
    case "DAY_CHALLENGE":
      return {
        title: "Validate single-day hero proof",
        description: "Verify the core hero demo moment and proof moment before timebox expiration.",
      }
    case "HACKATHON":
      return {
        title: "Prepare hackathon demo review",
        description: "Review hackathon judge criteria, sponsor requirements, and submission completeness.",
      }
    case "MARA":
      return {
        title: "Review episodic narrative continuity",
        description: "Audit narrative continuity, character memory hooks, and audience retention points.",
      }
    case "DATA_STORY":
      return {
        title: "Inspect analytical proof evidence",
        description: "Verify quantitative metrics, stakeholder proof points, and executive evidence clarity.",
      }
  }
}

export function qualifyDirectorSemanticFallback(
  project: ProjectBrain,
  mode: CreativeProjectMode,
  evaluationTimestamp: string | undefined,
): DirectorSemanticFallback {
  const temporalState = classifyDirectorDeadline(project, evaluationTimestamp)
  const phase = project.nextRecommendedPhase
  const context = contextSentence(project, temporalState, evaluationTimestamp)
  const risk = pertinentRisk(project)

  if (temporalState === "INVALID_DEADLINE") {
    return {
      actionId: `${project.id}-${slugPart(phase)}-deadline-metadata-review`,
      title: "Review project deadline metadata",
      description: `The project deadline cannot be qualified safely from the current metadata. ${context}`,
      phase,
      temporalState,
      semanticReason: "INVALID_DEADLINE",
    }
  }

  if (temporalState === "AFTER_DEADLINE") {
    return {
      actionId: `${project.id}-${slugPart(phase)}-post-deadline-review`,
      title: `Run post-deadline ${phase} review`,
      description: `Reconcile the current ${modeLabel(mode)} state before any further canonical work. ${context}`,
      phase,
      temporalState,
      semanticReason: "POST_DEADLINE",
    }
  }

  if (project.unresolvedProofGaps[0]) {
    const gap = project.unresolvedProofGaps[0]
    return {
      actionId: `${project.id}-${slugPart(phase)}-proof-gap-${slugPart(gap)}`,
      title: `Review unresolved proof gap before ${phase}`,
      description: `Inspect the unresolved proof gap before advancing the project. ${context}`,
      phase,
      temporalState,
      semanticReason: "PROOF_GAP",
    }
  }

  if (risk) {
    return {
      actionId: `${project.id}-${slugPart(phase)}-risk-${slugPart(risk.id)}`,
      title: `Review ${risk.label} before ${phase}`,
      description: `Resolve or consciously accept the pertinent project risk before advancing. ${context}`,
      phase,
      temporalState,
      semanticReason: "PERTINENT_RISK",
    }
  }

  if (project.nextRecommendedPhase !== project.currentPhase) {
    return {
      actionId: `${project.id}-${slugPart(phase)}-phase-review`,
      title: `Prepare ${phase} phase review`,
      description: `The canonical project recommends ${phase} as the next phase. Confirm readiness before canonicalizing additional work. ${context}`,
      phase,
      temporalState,
      semanticReason: "NEXT_PHASE",
    }
  }

  const fallback = defaultModeFallback(mode)
  return {
    actionId: `${project.id}-${mode.toLowerCase()}-safe-action`,
    title: fallback.title,
    description: `${fallback.description} ${context}`,
    phase,
    temporalState,
    semanticReason: "MODE_DEFAULT",
  }
}
