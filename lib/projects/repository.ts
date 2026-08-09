import { getComponentryLabStorageMode } from "../persistence/storage-mode"
import * as local from "./repository-local"
import type { AuthorityContext } from "@/lib/director/types"
import type { ProjectBrain, ProjectId, ProjectSlug, ProjectKind } from "./types"

export type ProjectMode = local.ProjectMode
export type RepositoryHealth = local.RepositoryHealth
export type CreateProjectInput = local.CreateProjectInput
export type CreateProjectStatus = local.CreateProjectStatus
export type CreateProjectResult = local.CreateProjectResult
export type ProjectRepositoryResolution = local.ProjectRepositoryResolution

function isPostgresMode(): boolean {
  return getComponentryLabStorageMode() === "postgres"
}

export function getProjectDataDirResolution(): ProjectRepositoryResolution {
  return local.getProjectDataDirResolution()
}

export function listProjects(): ProjectBrain[] {
  return local.listProjects()
}

export function getProjectRepositoryHealth(): RepositoryHealth {
  return local.getProjectRepositoryHealth()
}

export function getProjectById(id: ProjectId): ProjectBrain | undefined {
  return local.getProjectById(id)
}

export function getProjectBySlug(slug: ProjectSlug): ProjectBrain | undefined {
  return local.getProjectBySlug(slug)
}

export function createProject(input: CreateProjectInput, authorityContext: AuthorityContext): CreateProjectResult {
  return local.createProject(input, authorityContext)
}

export function getProjectRepositoryPath(): string {
  return isPostgresMode() ? "postgres://componentry_projects" : local.getProjectRepositoryPath()
}

export function getProjectRepositoryDataDir(): string {
  return local.getProjectRepositoryDataDir()
}

export function clearProjectRepositoryForTests(): void {
  local.clearProjectRepositoryForTests()
}

export function resolveProjectMode(kind: ProjectKind): ProjectMode {
  return local.resolveProjectMode(kind)
}
