import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import type { AuthorityContext } from "../director/types"
import { decodeCanonicalJsonbPayload } from "../persistence/jsonb-compat"
import { getComponentryLabStorageMode } from "../persistence/storage-mode"
import { fingerprintProjectBrain } from "./fingerprint"
import { getProjectById, getProjectRepositoryHealth, getProjectRepositoryPath } from "./repository"
import type { ProjectBrain, ProjectId } from "./types"
import { validateProjectBrain } from "./validation"

export const PROJECT_NEXT_ACTION_START_SCOPE = "project:next-action:start" as const
export const PROJECT_NEXT_ACTION_START_AUTHORITY_TARGET = "project-brain:next-action-lifecycle" as const

export type StartProjectNextActionStatus =
  | "STARTED"
  | "NO_CHANGE"
  | "PROJECT_NOT_FOUND"
  | "ACTION_NOT_FOUND"
  | "STALE_PRECONDITION"
  | "INVALID_ACTION_STATE"
  | "VALIDATION_FAILED"
  | "INSUFFICIENT_AUTHORITY"
  | "REPOSITORY_CORRUPT"
  | "PERSISTENCE_FAILED"

export interface StartProjectNextActionInput {
  projectId: ProjectId
  actionId: string
  expectedProjectFingerprint: string
  executedAt: string
}

export interface StartProjectNextActionResult {
  status: StartProjectNextActionStatus
  project?: ProjectBrain
  beforeFingerprint?: string
  afterFingerprint?: string
  error?: string
}

interface LocalProjectRepositoryState {
  runtimeProjects: ProjectBrain[]
}

export type ProjectNextActionStatusSqlClient = {
  unsafe<T extends Array<Record<string, unknown>> = Array<Record<string, unknown>>>(query: string, values?: unknown[]): Promise<T>
}

export type ProjectNextActionStatusStorageBootstrap = (sql: ProjectNextActionStatusSqlClient) => Promise<void>

function cloneProject(project: ProjectBrain): ProjectBrain {
  return JSON.parse(JSON.stringify(project)) as ProjectBrain
}

function hasStartAuthority(authorityContext: AuthorityContext): boolean {
  return (
    authorityContext.status === "granted" &&
    authorityContext.authorityLevel === "local-reversible-execution" &&
    authorityContext.approvalRequirement === "explicit" &&
    authorityContext.reversibility === "reversible" &&
    authorityContext.target === PROJECT_NEXT_ACTION_START_AUTHORITY_TARGET &&
    authorityContext.grantedScope.includes(PROJECT_NEXT_ACTION_START_SCOPE)
  )
}

function buildStartedProject(current: ProjectBrain, actionId: string, executedAt: string): StartProjectNextActionResult | ProjectBrain {
  const actionIndex = current.nextActions.findIndex((action) => action.id === actionId)
  if (actionIndex < 0) {
    return {
      status: "ACTION_NOT_FOUND",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: `Canonical next action not found: ${actionId}`,
    }
  }

  const action = current.nextActions[actionIndex]
  if (action.status === "doing") {
    const fingerprint = fingerprintProjectBrain(current)
    return {
      status: "NO_CHANGE",
      project: cloneProject(current),
      beforeFingerprint: fingerprint,
      afterFingerprint: fingerprint,
    }
  }
  if (action.status !== "todo") {
    return {
      status: "INVALID_ACTION_STATE",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: `Only todo actions can be started; ${actionId} is ${action.status}.`,
    }
  }

  const updated = cloneProject(current)
  updated.nextActions[actionIndex] = {
    ...updated.nextActions[actionIndex],
    status: "doing",
  }
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
  const tempFilePath = `${repositoryFilePath}.governed-start.tmp`
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

async function persistLocal(
  current: ProjectBrain,
  updated: ProjectBrain,
  expectedProjectFingerprint: string,
): Promise<StartProjectNextActionResult> {
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
      error: "Project Brain changed after the start-action proposal was prepared.",
    }
  }

  try {
    const repositoryFilePath = getProjectRepositoryPath()
    const state = readLocalRuntimeState(repositoryFilePath)
    const runtimeProjects = state.runtimeProjects.filter((project) => project.id !== updated.id)
    runtimeProjects.push(cloneProject(updated))
    writeLocalRuntimeState(repositoryFilePath, { runtimeProjects })
    return {
      status: "STARTED",
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

async function loadSqlClient(): Promise<ProjectNextActionStatusSqlClient> {
  const { getDatabase } = await import("../persistence/db")
  return getDatabase() as unknown as ProjectNextActionStatusSqlClient
}

async function ensureStorage(sql: ProjectNextActionStatusSqlClient): Promise<void> {
  const { ensureCanonicalStorageSchema } = await import("../persistence/canonical-storage-bootstrap")
  await ensureCanonicalStorageSchema(sql as never)
}

export async function startProjectNextActionPostgresWithSql(
  sql: ProjectNextActionStatusSqlClient,
  current: ProjectBrain,
  updated: ProjectBrain,
  expectedProjectFingerprint: string,
  executedAt: string,
  bootstrap: ProjectNextActionStatusStorageBootstrap = ensureStorage,
): Promise<StartProjectNextActionResult> {
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
          error: "Project Brain changed after the start-action proposal was prepared.",
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
          error: "Project Brain was concurrently persisted before the start action could be applied.",
        }
      }
    } else {
      const persisted = decodeCanonicalJsonbPayload<ProjectBrain>((rows[0] as { payload: unknown }).payload)
      if (!persisted || fingerprintProjectBrain(persisted) !== expectedProjectFingerprint) {
        return {
          status: "STALE_PRECONDITION",
          project: persisted ? cloneProject(persisted) : undefined,
          beforeFingerprint: persisted ? fingerprintProjectBrain(persisted) : undefined,
          error: "Persisted Project Brain no longer matches the approved start-action precondition.",
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
          error: "Project Brain changed concurrently while the start action was being applied.",
        }
      }
    }

    return {
      status: "STARTED",
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

async function persistPostgres(
  current: ProjectBrain,
  updated: ProjectBrain,
  expectedProjectFingerprint: string,
  executedAt: string,
): Promise<StartProjectNextActionResult> {
  return startProjectNextActionPostgresWithSql(
    await loadSqlClient(),
    current,
    updated,
    expectedProjectFingerprint,
    executedAt,
  )
}

export async function startProjectNextAction(
  input: StartProjectNextActionInput,
  authorityContext: AuthorityContext,
): Promise<StartProjectNextActionResult> {
  if (!hasStartAuthority(authorityContext)) {
    return {
      status: "INSUFFICIENT_AUTHORITY",
      error: "Local reversible authority with explicit approval and project:next-action:start scope is required.",
    }
  }
  if (!input.actionId.trim()) return { status: "VALIDATION_FAILED", error: "actionId is required." }
  if (!/^[a-f0-9]{64}$/.test(input.expectedProjectFingerprint)) {
    return { status: "VALIDATION_FAILED", error: "A canonical 64-character Project Brain fingerprint is required." }
  }
  if (!input.executedAt.trim()) return { status: "VALIDATION_FAILED", error: "executedAt is required." }

  const current = await getProjectById(input.projectId)
  if (!current) return { status: "PROJECT_NOT_FOUND", error: `Project not found: ${input.projectId}` }

  const beforeFingerprint = fingerprintProjectBrain(current)
  if (beforeFingerprint !== input.expectedProjectFingerprint) {
    return {
      status: "STALE_PRECONDITION",
      project: cloneProject(current),
      beforeFingerprint,
      error: "Project Brain changed after the start-action proposal was prepared.",
    }
  }

  const candidate = buildStartedProject(current, input.actionId, input.executedAt)
  if (!("id" in candidate)) return candidate

  if (getComponentryLabStorageMode() === "postgres") {
    return persistPostgres(current, candidate, input.expectedProjectFingerprint, input.executedAt)
  }
  return persistLocal(current, candidate, input.expectedProjectFingerprint)
}
