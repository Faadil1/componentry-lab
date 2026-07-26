// ─────────────────────────────────────────────────────────────
// Project Brain Workspace — Schema & Order Constants
// ─────────────────────────────────────────────────────────────

import type { ProjectPhase, ProjectKind, ProjectStatus } from "./types"

export const PROJECT_PHASES: ProjectPhase[] = [
  "intake",
  "qualify",
  "research",
  "position",
  "differentiate",
  "concept",
  "design",
  "prototype",
  "build",
  "verify",
  "audit",
  "capture",
  "present",
  "submit",
  "publish",
  "retrospective",
]

export const PROJECT_PHASE_LABELS: Record<ProjectPhase, string> = {
  intake: "Intake",
  qualify: "Qualify",
  research: "Research",
  position: "Position",
  differentiate: "Differentiate",
  concept: "Concept",
  design: "Design",
  prototype: "Prototype",
  build: "Build",
  verify: "Verify",
  audit: "Audit",
  capture: "Capture",
  present: "Present",
  submit: "Submit",
  publish: "Publish",
  retrospective: "Retrospective",
}

export const PROJECT_KINDS: Array<{ id: ProjectKind; label: string }> = [
  { id: "client-product", label: "Client Product" },
  { id: "internal-tool", label: "Internal Tool" },
  { id: "website", label: "Website" },
  { id: "product-prototype", label: "Product Prototype" },
  { id: "hackathon", label: "Hackathon Project" },
  { id: "design-challenge", label: "Design Challenge" },
  { id: "creative-experiment", label: "Creative Experiment" },
  { id: "data-story", label: "Data Story" },
  { id: "broadcast-interface", label: "Broadcast Interface" },
  { id: "demo-film", label: "Demo Film" },
  { id: "portfolio-case-study", label: "Portfolio Case Study" },
]

export const PROJECT_STATUSES: Array<{ id: ProjectStatus; label: string }> = [
  { id: "intake", label: "Intake" },
  { id: "researching", label: "Researching" },
  { id: "positioning", label: "Positioning" },
  { id: "designing", label: "Designing" },
  { id: "building", label: "Building" },
  { id: "verifying", label: "Verifying" },
  { id: "presenting", label: "Presenting" },
  { id: "submitted", label: "Submitted" },
  { id: "published", label: "Published" },
  { id: "paused", label: "Paused" },
  { id: "archived", label: "Archived" },
]

export const WORKSPACE_SECTIONS = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "context", label: "Context & Brief", icon: "briefcase" },
  { id: "positioning", label: "Positioning & Tension", icon: "target" },
  { id: "design", label: "Design Direction", icon: "palette" },
  { id: "proof", label: "Proof & Verdicts", icon: "shield" },
  { id: "build", label: "Build & Registry", icon: "cpu" },
  { id: "capture", label: "Capture Plan", icon: "camera" },
  { id: "video", label: "Video Production", icon: "film" },
  { id: "presentation", label: "Presentation & Launch", icon: "share" },
  { id: "decisions", label: "Decision Ledger", icon: "bookmark" },
  { id: "risks", label: "Risks & Gaps", icon: "alert" },
  { id: "outputs", label: "Outputs & Actions", icon: "check" },
  { id: "audit", label: "Audit & Gates", icon: "award" },
  { id: "learnings", label: "Learnings", icon: "book" },
] as const

export const PROJECT_STATUS_TO_PHASE: Record<Exclude<ProjectStatus, "paused" | "archived">, ProjectPhase> = {
  intake: "intake",
  researching: "research",
  positioning: "position",
  designing: "design",
  building: "build",
  verifying: "verify",
  presenting: "present",
  submitted: "submit",
  published: "publish"
}

export function getPhaseFromProjectStatus(
  status: ProjectStatus,
  fallbackPhase: ProjectPhase
): ProjectPhase {
  if (status !== "paused" && status !== "archived") {
    return PROJECT_STATUS_TO_PHASE[status]
  }

  return fallbackPhase
}


