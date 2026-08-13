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

type ProjectRepositoryBackend = {
  listProjects: () => ProjectBrain[] | Promise<ProjectBrain[]>
  getProjectById: (id: ProjectId) => ProjectBrain | undefined | Promise<ProjectBrain | undefined>
  getProjectBySlug: (slug: ProjectSlug) => ProjectBrain | undefined | Promise<ProjectBrain | undefined>
  createProject: (input: CreateProjectInput, authorityContext: AuthorityContext) => CreateProjectResult | Promise<CreateProjectResult>
}

type ProjectRepositoryBackendFactory = (mode: "local-file" | "postgres") => ProjectRepositoryBackend | Promise<ProjectRepositoryBackend>

let projectRepositoryBackendFactoryForTests: ProjectRepositoryBackendFactory | null = null

function isPostgresMode(): boolean {
  return getComponentryLabStorageMode() === "postgres"
}

async function getProjectRepositoryBackend(): Promise<ProjectRepositoryBackend> {
  if (projectRepositoryBackendFactoryForTests) {
    return projectRepositoryBackendFactoryForTests(getComponentryLabStorageMode())
  }

  if (isPostgresMode()) {
    const postgres = await import("./repository-postgres")
    return {
      listProjects: () => postgres.listProjectsPostgres(),
      getProjectById: (id) => postgres.getProjectByIdPostgres(id),
      getProjectBySlug: (slug) => postgres.getProjectBySlugPostgres(slug),
      createProject: (input, authorityContext) => postgres.createProjectPostgres(input, authorityContext),
    }
  }

  return local
}

export function __setProjectRepositoryBackendFactoryForTests(backendFactory: ProjectRepositoryBackendFactory | null): void {
  projectRepositoryBackendFactoryForTests = backendFactory
}

export function getProjectDataDirResolution(): ProjectRepositoryResolution {
  return local.getProjectDataDirResolution()
}

export async function listProjects(): Promise<ProjectBrain[]> {
  return (await getProjectRepositoryBackend()).listProjects()
}

export function getProjectRepositoryHealth(): RepositoryHealth {
  return local.getProjectRepositoryHealth()
}

export async function getProjectById(id: ProjectId): Promise<ProjectBrain | undefined> {
  return (await getProjectRepositoryBackend()).getProjectById(id)
}

export async function getProjectBySlug(slug: ProjectSlug): Promise<ProjectBrain | undefined> {
  return (await getProjectRepositoryBackend()).getProjectBySlug(slug)
}

export async function createProject(input: CreateProjectInput, authorityContext: AuthorityContext): Promise<CreateProjectResult> {
  return (await getProjectRepositoryBackend()).createProject(input, authorityContext)
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
