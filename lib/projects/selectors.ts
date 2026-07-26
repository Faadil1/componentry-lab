// ─────────────────────────────────────────────────────────────
// Project Brain Workspace — Selectors
// ─────────────────────────────────────────────────────────────

import { projectPresets } from "./presets"
import type { ProjectBrain, ProjectId } from "./types"

export function getProjectById(id: ProjectId): ProjectBrain | undefined {
  return projectPresets.find((p) => p.id === id)
}

export function getProjectBySlug(slug: string): ProjectBrain | undefined {
  return projectPresets.find((p) => p.slug === slug)
}

export function getAllProjects(): ProjectBrain[] {
  return projectPresets
}
