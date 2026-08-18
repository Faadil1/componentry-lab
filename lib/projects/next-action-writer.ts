import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import type { AuthorityContext } from "../director/types"
import { decodeCanonicalJsonbPayload } from "../persistence/jsonb-compat"
import { getComponentryLabStorageMode } from "../persistence/storage-mode"
import { fingerprintProjectBrain } from "./fingerprint"
import { getProjectById, getProjectRepositoryHealth, getProjectRepositoryPath } from "./repository"
import type { ProjectAction, ProjectBrain, ProjectId } from "./types"
import { validateProjectBrain } from "./validation"

export const PROJECT_NEXT_ACTION_APPEND_SCOPE = "project:next-action:append" as const
export const PROJECT_NEXT_ACTION_AUTHORITY_TARGET = "project-brain:next-actions" as const

export type AppendProjectNextActionStatus =
  | "APPENDED"
  | "NO_CHANGE"
  | "PROJECT_NOT_FOUND"
  | "STALE_PRECONDITION"
  | "DUPLICATE_ACTION_ID"
  | "VALIDATION_FAILED"
  | "INSUFFICIENT_AUTHORITY"
  | "REPOSITORY_CORRUPT"
  | "PERSISTENCE_FAILED"

export interface AppendProjectNextActionInput {
  projectId: ProjectId
  action: ProjectAction
  expectedProjectFingerprint: string
  executedAt: string
}

export interface AppendProjectNextActionResult {
  status: AppendProjectNextActionStatus
  project?: ProjectBrain
  beforeFingerprint?: string
  afterFingerprint?: string
  error?: string
}

interface LocalProjectRepositoryState {
  runtimeProjects: ProjectBrain[]
}

export type ProjectNextActionSqlClient = {
  unsafe<T extends Array<Record<string, unknown>> = Array<Record<string, unknown>>>(query: string, values?: unknown[]): Promise<T>
}

export type ProjectNextActionStorageBootstrap = (sql: ProjectNextActionSqlClient) => Promise<void>

function cloneProject(project: ProjectBrain): ProjectBrain {
  return JSON.parse(JSON.stringify(project)) as ProjectBrain
}

function actionsEqual(left: ProjectAction, right: ProjectAction): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function hasAppendAuthority(authorityContext: AuthorityContext): boolean {
  return (
    authorityContext.status === "granted" &&
    authorityContext.authorityLevel === "local-reversible-execution" &&
    authorityContext.approvalRequirement === "explicit" &&
    authorityContext.reversibility === "reversible" &&
    authorityContext.target === PROJECT_NEXT_ACTION_AUTHORITY_TARGET &&
    authorityContext.grantedScope.includes(PROJECT_NEXT_ACTION_APPEND_SCOPE)
  )
}

function validateAction(action: ProjectAction): string | null {
  if (!action.id.trim()) return "Project action id is required."
  if (!action.label.trim()) return "Project action label is required."
  if (!action.description.trim()) return "Project action description is required."
  if (!action.phase) return "Project action phase is required."
  if (!["todo", "doing", "done", "blocked"].includes(action.status)) return "Project action status is invalid."
  return null
}

function buildUpdatedProject(current: ProjectBrain, action: ProjectAction, executedAt: string): AppendProjectNextActionResult | ProjectBrain {
  const existing = current.nextActions.find((item) => item.id === action.id)
  if (existing) {
    if (actionsEqual(existing, action)) {
      const fingerprint = fingerprintProjectBrain(current)
      return {
        status: "NO_CHANGE",
        project: cloneProject(current),
        beforeFingerprint: fingerprint,
        afterFingerprint: fingerprint,
      }
    }
    return {
      status: "DUPLICATE_ACTION_ID",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: `Project action id already exists with different content: ${action.id}`,
    }
  }

  const updated = cloneProject(current)
  updated.nextActions = [...updated.nextActions, { ...action }]
  updated.updatedLabel = executedAt.slice(0, 10)

  const validation = validateProjectBrain(updated)
  if (!validation.valid) {
    return {
      status: "VALIDATION_FAILED",
      project: updated,
      beforeFingerprint: fingerprintProjectBrain(current),
      error: validation.errors.join("; "),
    }
  }
  return updated
}

function readLocalRuntimeState(repositoryFilePath: string): LocalProjectRepositoryState {
  if (!existsSync(repositoryFilePath)) return { runtimeProjects: [] }
  const parsed = JSON.parse(readFileSync(repositoryFilePath, "utf8")) as Partial<LocalProjectRepositoryState>
  return {
    runtimeProjects: Array.isArray(parsed.runtimeProjects) ? parsed.runtimeProjects.map(cloneProject) : [],
  }
}

function writeLocalRuntimeState(repositoryFilePath: string, state: LocalProjectRepositoryState): void {
  const tempFilePath = `${repositoryFilePath}.governed-action.tmp`
  mkdirSync(dirname(repositoryFilePath), { recursive: true })
  try {
    writeFileSync(tempFilePath, JSON.stringify(state, null, 2), "utf8")
    renameSync(tempFilePath, repositoryFilePath)
  } finally {
    if (existsSync(tempFilePath)) {
      try {
        rmSync(tempFilePath, { force: true })
      } catch {
        // Best-effort cleanup after an interrupted atomic write.
      }
    }
  }
}

async function appendLocal(
  current: ProjectBrain,
  updated: ProjectBrain,
  expectedProjectFingerprint: string,
): Promise<AppendProjectNextActionResult> {
  const repositoryHealth = getProjectRepositoryHealth()
  if (repositoryHealth === "CORRUPT" || repositoryHealth === "UNREADABLE") {
    return {
      status: repositoryHealth === "CORRUPT" ? "REPOSITORY_CORRUPT" : "PERSISTENCE_FAILED",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: `Canonical project repository is ${repositoryHealth.toLowerCase()}.`,
    }
  }

  const currentAtWrite = await getProjectById(current.id)
  if (!currentAtWrite || fingerprintProjectBrain(currentAtWrite) !== expectedProjectFingerprint) {
    return {
      status: "STALE_PRECONDITION",
      project: currentAtWrite ? cloneProject(currentAtWrite) : undefined,
      beforeFingerprint: currentAtWrite ? fingerprintProjectBrain(currentAtWrite) : undefined,
      error: "Project Brain changed after the governed action proposal was prepared.",
    }
  }

  try {
    const repositoryFilePath = getProjectRepositoryPath()
    const state = readLocalRuntimeState(repositoryFilePath)
    const nextRuntimeProjects = state.runtimeProjects.filter((project) => project.id !== updated.id)
    nextRuntimeProjects.push(cloneProject(updated))
    writeLocalRuntimeState(repositoryFilePath, { runtimeProjects: nextRuntimeProjects })
    return {
      status: "APPENDED",
      project: cloneProject(updated),
      beforeFingerprint: expectedProjectFingerprint,
      afterFingerprint: fingerprintProjectBrain(updated),
    }
  } catch (error) {
    return {
      status: "PERSISTENCE_FAILED",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: error instanceof Error ? error.message : "Local Project Brain persistence failed.",
    }
  }
}

async function loadProjectSqlClient(): Promise<ProjectNextActionSqlClient> {
  const { getDatabase } = await import("../persistence/db")
  return getDatabase() as unknown as ProjectNextActionSqlClient
}

async function ensureProjectStorage(sql: ProjectNextActionSqlClient): Promise<void> {
  const { ensureCanonicalStorageSchema } = await import("../persistence/canonical-storage-bootstrap")
  await ensureCanonicalStorageSchema(sql as never)
}

export async function appendProjectNextActionPostgresWithSql(
  sql: ProjectNextActionSqlClient,
  current: ProjectBrain,
  updated: ProjectBrain,
  expectedProjectFingerprint: string,
  executedAt: string,
  bootstrap: ProjectNextActionStorageBootstrap = ensureProjectStorage,
): Promise<AppendProjectNextActionResult> {
  try {
    await bootstrap(sql)

    const rows = await sql.unsafe(
      `SELECT payload FROM componentry_projects WHERE project_id = $1 LIMIT 1`,
      [current.id],
    )

    if (rows.length === 0) {
      if (fingerprintProjectBrain(current) !== expectedProjectFingerprint) {
        return {
          status: "STALE_PRECONDITION",
          project: cloneProject(current),
          beforeFingerprint: fingerprintProjectBrain(current),
          error: "Project Brain changed after the governed action proposal was prepared.",
        }
      }

      const inserted = await sql.unsafe(
        `
        INSERT INTO componentry_projects (project_id, slug, payload, created_at, updated_at)
        VALUES ($1, $2, $3::jsonb, $4, $4)
        ON CONFLICT (project_id) DO NOTHING
        RETURNING project_id
        `,
        [updated.id, updated.slug, JSON.stringify(updated), executedAt],
      )

      if (inserted.length === 0) {
        return {
          status: "STALE_PRECONDITION",
          error: "Project Brain was concurrently persisted before this governed action could be applied.",
        }
      }
    } else {
      const persisted = decodeCanonicalJsonbPayload<ProjectBrain>((rows[0] as { payload: unknown }).payload)
      if (!persisted || fingerprintProjectBrain(persisted) !== expectedProjectFingerprint) {
        return {
          status: "STALE_PRECONDITION",
          project: persisted ? cloneProject(persisted) : undefined,
          beforeFingerprint: persisted ? fingerprintProjectBrain(persisted) : undefined,
          error: "Persisted Project Brain no longer matches the approved proposal precondition.",
        }
      }

      const changed = await sql.unsafe(
        `
        UPDATE componentry_projects
        SET slug = $2, payload = $3::jsonb, updated_at = $4
        WHERE project_id = $1 AND payload = $5::jsonb
        RETURNING project_id
        `,
        [updated.id, updated.slug, JSON.stringify(updated), executedAt, JSON.stringify(persisted)],
      )

      if (changed.length === 0) {
        return {
          status: "STALE_PRECONDITION",
          error: "Project Brain changed concurrently while the governed action was being applied.",
        }
      }
    }

    return {
      status: "APPENDED",
      project: cloneProject(updated),
      beforeFingerprint: expectedProjectFingerprint,
      afterFingerprint: fingerprintProjectBrain(updated),
    }
  } catch (error) {
    return {
      status: "PERSISTENCE_FAILED",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: error instanceof Error ? error.message : "Postgres Project Brain persistence failed.",
    }
  }
}

async function appendPostgres(
  current: ProjectBrain,
  updated: ProjectBrain,
  expectedProjectFingerprint: string,
  executedAt: string,
): Promise<AppendProjectNextActionResult> {
  const sql = await loadProjectSqlClient()
  return appendProjectNextActionPostgresWithSql(
    sql,
    current,
    updated,
    expectedProjectFingerprint,
    executedAt,
  )
}

export async function appendProjectNextAction(
  input: AppendProjectNextActionInput,
  authorityContext: AuthorityContext,
): Promise<AppendProjectNextActionResult> {
  if (!hasAppendAuthority(authorityContext)) {
    return {
      status: "INSUFFICIENT_AUTHORITY",
      error: "Local reversible authority with explicit approval and project:next-action:append scope is required.",
    }
  }

  const actionError = validateAction(input.action)
  if (actionError) return { status: "VALIDATION_FAILED", error: actionError }
  if (!/^[a-f0-9]{64}$/.test(input.expectedProjectFingerprint)) {
    return { status: "VALIDATION_FAILED", error: "A canonical 64-character Project Brain fingerprint is required." }
  }
  if (!input.executedAt.trim()) {
    return { status: "VALIDATION_FAILED", error: "executedAt is required." }
  }

  const current = await getProjectById(input.projectId)
  if (!current) {
    return { status: "PROJECT_NOT_FOUND", error: `Project not found: ${input.projectId}` }
  }

  const beforeFingerprint = fingerprintProjectBrain(current)
  if (beforeFingerprint !== input.expectedProjectFingerprint) {
    return {
      status: "STALE_PRECONDITION",
      project: cloneProject(current),
      beforeFingerprint,
      error: "Project Brain changed after the governed action proposal was prepared.",
    }
  }

  const candidate = buildUpdatedProject(current, input.action, input.executedAt)
  if (!("id" in candidate)) return candidate

  if (getComponentryLabStorageMode() === "postgres") {
    return appendPostgres(current, candidate, input.expectedProjectFingerprint, input.executedAt)
  }
  return appendLocal(current, candidate, input.expectedProjectFingerprint)
}
