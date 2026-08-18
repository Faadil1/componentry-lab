// Project Brain selectors

import { projectPresets } from "./presets"
import { listProjects as listRuntimeProjects } from "./repository-local"
import type { ProjectBrain, ProjectId } from "./types"

export const CANONICAL_DEFAULT_PROJECT_ID: ProjectId = "stated"

export function getProjectById(id: ProjectId): ProjectBrain | undefined {
  return listRuntimeProjects().find((project) => project.id === id) ?? projectPresets.find((project) => project.id === id)
}

export function getProjectBySlug(slug: string): ProjectBrain | undefined {
  return listRuntimeProjects().find((project) => project.slug === slug) ?? projectPresets.find((project) => project.slug === slug)
}

export function getAllProjects(): ProjectBrain[] {
  return listRuntimeProjects()
}
