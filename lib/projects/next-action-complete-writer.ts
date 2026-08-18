import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import type { AuthorityContext } from "../director/types"
import { decodeCanonicalJsonbPayload } from "../persistence/jsonb-compat"
import { getComponentryLabStorageMode } from "../persistence/storage-mode"
import { fingerprintProjectBrain } from "./fingerprint"
import { getProjectById, getProjectRepositoryHealth, getProjectRepositoryPath } from "./repository"
import type { ProjectBrain, ProjectId } from "./types"
import { validateProjectBrain } from "./validation"

export const PROJECT_NEXT_ACTION_COMPLETE_SCOPE = "project:next-action:complete" as const
export const PROJECT_NEXT_ACTION_COMPLETE_AUTHORITY_TARGET = "project-brain:next-action-lifecycle" as const

export type CompleteProjectNextActionStatus =
  | "COMPLETED"
  | "NO_CHANGE"
  | "PROJECT_NOT_FOUND"
  | "ACTION_NOT_FOUND"
  | "EVIDENCE_NOT_FOUND"
  | "EVIDENCE_NOT_AVAILABLE"
  | "STALE_PRECONDITION"
  | "INVALID_ACTION_STATE"
  | "VALIDATION_FAILED"
  | "INSUFFICIENT_AUTHORITY"
  | "REPOSITORY_CORRUPT"
  | "PERSISTENCE_FAILED"

export interface CompleteProjectNextActionInput {
  projectId: ProjectId
  actionId: string
  evidenceId: string
  expectedProjectFingerprint: string
  executedAt: string
}

export interface CompleteProjectNextActionResult {
  status: CompleteProjectNextActionStatus
  project?: ProjectBrain
  beforeFingerprint?: string
  afterFingerprint?: string
  evidenceRef?: string
  error?: string
}

interface LocalProjectRepositoryState {
  runtimeProjects: ProjectBrain[]
}

export type ProjectNextActionCompleteSqlClient = {
  unsafe<T extends Array<Record<string, unknown>> = Array<Record<string, unknown>>>(query: string, values?: unknown[]): Promise<T>
}

export type ProjectNextActionCompleteStorageBootstrap = (sql: ProjectNextActionCompleteSqlClient) => Promise<void>

function cloneProject(project: ProjectBrain): ProjectBrain {
  return JSON.parse(JSON.stringify(project)) as ProjectBrain
}

function hasCompleteAuthority(authorityContext: AuthorityContext): boolean {
  return (
    authorityContext.status === "granted" &&
    authorityContext.authorityLevel === "local-reversible-execution" &&
    authorityContext.approvalRequirement === "explicit" &&
    authorityContext.reversibility === "reversible" &&
    authorityContext.target === PROJECT_NEXT_ACTION_COMPLETE_AUTHORITY_TARGET &&
    authorityContext.grantedScope.includes(PROJECT_NEXT_ACTION_COMPLETE_SCOPE)
  )
}

function canonicalEvidenceRef(projectId: string, evidenceId: string): string {
  return `project-brain:${projectId}:evidence:${evidenceId}`
}

function buildCompletedProject(
  current: ProjectBrain,
  actionId: string,
  evidenceId: string,
  executedAt: string,
): CompleteProjectNextActionResult | ProjectBrain {
  const actionIndex = current.nextActions.findIndex((action) => action.id === actionId)
  if (actionIndex < 0) {
    return {
      status: "ACTION_NOT_FOUND",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: `Canonical next action not found: ${actionId}`,
    }
  }

  const evidence = current.evidence.find((item) => item.id === evidenceId)
  if (!evidence) {
    return {
      status: "EVIDENCE_NOT_FOUND",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: `Canonical completion evidence not found: ${evidenceId}`,
    }
  }
  if (evidence.status !== "available") {
    return {
      status: "EVIDENCE_NOT_AVAILABLE",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      error: `Completion evidence ${evidenceId} is ${evidence.status}, not available.`,
    }
  }

  const action = current.nextActions[actionIndex]
  if (action.status === "done") {
    const fingerprint = fingerprintProjectBrain(current)
    return {
      status: "NO_CHANGE",
      project: cloneProject(current),
      beforeFingerprint: fingerprint,
      afterFingerprint: fingerprint,
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
    }
  }
  if (action.status !== "doing") {
    return {
      status: "INVALID_ACTION_STATE",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
      error: `Only doing actions can be completed; ${actionId} is ${action.status}.`,
    }
  }

  const updated = cloneProject(current)
  updated.nextActions[actionIndex] = {
    ...updated.nextActions[actionIndex],
    status: "done",
  }
  updated.updatedLabel = executedAt.slice(0, 10)

  const validation = validateProjectBrain(updated)
  if (!validation.valid) {
    return {
      status: "VALIDATION_FAILED",
      project: updated,
      beforeFingerprint: fingerprintProjectBrain(current),
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
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
  const tempFilePath = `${repositoryFilePath}.governed-complete.tmp`
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
  evidenceId: string,
): Promise<CompleteProjectNextActionResult> {
  const repositoryHealth = getProjectRepositoryHealth()
  if (repositoryHealth === "CORRUPT" || repositoryHealth === "UNREADABLE") {
    return {
      status: repositoryHealth === "CORRUPT" ? "REPOSITORY_CORRUPT" : "PERSISTENCE_FAILED",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
      error: `Canonical project repository is ${repositoryHealth.toLowerCase()}.`,
    }
  }

  const currentAtWrite = await getProjectById(current.id)
  if (!currentAtWrite || fingerprintProjectBrain(currentAtWrite) !== expectedProjectFingerprint) {
    return {
      status: "STALE_PRECONDITION",
      project: currentAtWrite ? cloneProject(currentAtWrite) : undefined,
      beforeFingerprint: currentAtWrite ? fingerprintProjectBrain(currentAtWrite) : undefined,
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
      error: "Project Brain changed after the completion proposal was prepared.",
    }
  }

  try {
    const repositoryFilePath = getProjectRepositoryPath()
    const state = readLocalRuntimeState(repositoryFilePath)
    const runtimeProjects = state.runtimeProjects.filter((project) => project.id !== updated.id)
    runtimeProjects.push(cloneProject(updated))
    writeLocalRuntimeState(repositoryFilePath, { runtimeProjects })
    return {
      status: "COMPLETED",
      project: cloneProject(updated),
      beforeFingerprint: expectedProjectFingerprint,
      afterFingerprint: fingerprintProjectBrain(updated),
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
    }
  } catch (error) {
    return {
      status: "PERSISTENCE_FAILED",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
      error: error instanceof Error ? error.message : "Local Project Brain persistence failed.",
    }
  }
}

async function loadSqlClient(): Promise<ProjectNextActionCompleteSqlClient> {
  const { getDatabase } = await import("../persistence/db")
  return getDatabase() as unknown as ProjectNextActionCompleteSqlClient
}

async function ensureStorage(sql: ProjectNextActionCompleteSqlClient): Promise<void> {
  const { ensureCanonicalStorageSchema } = await import("../persistence/canonical-storage-bootstrap")
  await ensureCanonicalStorageSchema(sql as never)
}

export async function completeProjectNextActionPostgresWithSql(
  sql: ProjectNextActionCompleteSqlClient,
  current: ProjectBrain,
  updated: ProjectBrain,
  expectedProjectFingerprint: string,
  evidenceId: string,
  executedAt: string,
  bootstrap: ProjectNextActionCompleteStorageBootstrap = ensureStorage,
): Promise<CompleteProjectNextActionResult> {
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
          evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
          error: "Project Brain changed after the completion proposal was prepared.",
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
          evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
          error: "Project Brain was concurrently persisted before completion could be applied.",
        }
      }
    } else {
      const persisted = decodeCanonicalJsonbPayload<ProjectBrain>((rows[0] as { payload: unknown }).payload)
      if (!persisted || fingerprintProjectBrain(persisted) !== expectedProjectFingerprint) {
        return {
          status: "STALE_PRECONDITION",
          project: persisted ? cloneProject(persisted) : undefined,
          beforeFingerprint: persisted ? fingerprintProjectBrain(persisted) : undefined,
          evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
          error: "Persisted Project Brain no longer matches the approved completion precondition.",
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
          evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
          error: "Project Brain changed concurrently while completion was being applied.",
        }
      }
    }

    return {
      status: "COMPLETED",
      project: cloneProject(updated),
      beforeFingerprint: expectedProjectFingerprint,
      afterFingerprint: fingerprintProjectBrain(updated),
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
    }
  } catch (error) {
    return {
      status: "PERSISTENCE_FAILED",
      project: cloneProject(current),
      beforeFingerprint: fingerprintProjectBrain(current),
      evidenceRef: canonicalEvidenceRef(current.id, evidenceId),
      error: error instanceof Error ? error.message : "Postgres Project Brain persistence failed.",
    }
  }
}

async function persistPostgres(
  current: ProjectBrain,
  updated: ProjectBrain,
  expectedProjectFingerprint: string,
  evidenceId: string,
  executedAt: string,
): Promise<CompleteProjectNextActionResult> {
  return completeProjectNextActionPostgresWithSql(
    await loadSqlClient(),
    current,
    updated,
    expectedProjectFingerprint,
    evidenceId,
    executedAt,
  )
}

export async function completeProjectNextAction(
  input: CompleteProjectNextActionInput,
  authorityContext: AuthorityContext,
): Promise<CompleteProjectNextActionResult> {
  if (!hasCompleteAuthority(authorityContext)) {
    return {
      status: "INSUFFICIENT_AUTHORITY",
      error: "Local reversible authority with explicit approval and project:next-action:complete scope is required.",
    }
  }
  if (!input.actionId.trim()) return { status: "VALIDATION_FAILED", error: "actionId is required." }
  if (!input.evidenceId.trim()) return { status: "VALIDATION_FAILED", error: "evidenceId is required." }
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
      error: "Project Brain changed after the completion proposal was prepared.",
    }
  }

  const candidate = buildCompletedProject(current, input.actionId, input.evidenceId, input.executedAt)
  if (!("id" in candidate)) return candidate

  if (getComponentryLabStorageMode() === "postgres") {
    return persistPostgres(current, candidate, input.expectedProjectFingerprint, input.evidenceId, input.executedAt)
  }
  return persistLocal(current, candidate, input.expectedProjectFingerprint, input.evidenceId)
}
