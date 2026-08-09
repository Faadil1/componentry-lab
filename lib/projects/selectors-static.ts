import { projectPresets } from "./presets"
import type { ProjectBrain, ProjectId } from "./types"

export const CANONICAL_DEFAULT_PROJECT_ID: ProjectId = "stated"

export function getProjectById(id: ProjectId): ProjectBrain | undefined {
  return projectPresets.find((project) => project.id === id)
}

export function getProjectBySlug(slug: string): ProjectBrain | undefined {
  return projectPresets.find((project) => project.slug === slug)
}

export function getAllProjects(): ProjectBrain[] {
  return projectPresets
}
