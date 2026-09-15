import "server-only"

import { ensureCanonicalStorageSchema } from "../persistence/canonical-storage-bootstrap"
import { getProjectById } from "../projects/repository"
import type { ProjectBrain } from "../projects/types"
import { validateProjectBrain } from "../projects/validation"
import { getTraceAction, getTraceRuntimeSql, updateTraceAction } from "./storage"
import type { TraceRuntimeAction } from "./types"

const PATCHABLE_PROJECT_KEYS = new Set<keyof ProjectBrain>([
  "visualDirection",
  "typographyDirection",
  "colorDirection",
  "layoutDirection",
  "interactionDirection",
  "responsiveStrategy",
  "accessibilityStrategy",
  "designPrinciples",
  "antiPatterns",
  "references",
  "selectedRegistryIds",
  "selectedPlaybookIds",
  "selectedReadingPathIds",
  "selectedRecipeIds",
  "architectureNotes",
  "implementationConstraints",
  "acceptanceCriteria",
  "technicalRisks",
  "evidence",
  "auditResults",
  "currentScore",
  "readiness",
  "warnings",
  "blockers",
  "nextActions",
  "decisions",
])

type RuntimeActionRecord = TraceRuntimeAction & { projectId?: string }

export interface TraceActionExecutionResult {
  action: RuntimeActionRecord
  message: string
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function assertPatchPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const patch = payload.patch
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error("PROJECT_BRAIN_PATCH action is missing a patch object.")
  }
  for (const key of Object.keys(patch)) {
    if (!PATCHABLE_PROJECT_KEYS.has(key as keyof ProjectBrain)) {
      throw new Error(`Project Brain field is outside the TRACE runtime reversible allowlist: ${key}`)
    }
  }
  return patch as Record<string, unknown>
}

async function persistProject(project: ProjectBrain): Promise<void> {
  const sql = await getTraceRuntimeSql()
  await ensureCanonicalStorageSchema(sql as never)
  const now = new Date().toISOString()
  await sql.unsafe(
    `INSERT INTO componentry_projects (project_id, slug, payload, created_at, updated_at)
     VALUES ($1,$2,$3::jsonb,$4,$5)
     ON CONFLICT (project_id) DO UPDATE SET slug=EXCLUDED.slug, payload=EXCLUDED.payload, updated_at=EXCLUDED.updated_at`,
    [project.id, project.slug, JSON.stringify(project), now, now],
  )
}

async function executeProjectBrainPatch(action: RuntimeActionRecord): Promise<Record<string, unknown>> {
  if (!action.projectId) throw new Error("Project Brain patch requires a project id.")
  const project = await getProjectById(action.projectId)
  if (!project) throw new Error(`Project Brain project not found: ${action.projectId}`)
  const patch = assertPatchPayload(action.payload)
  const previousValues: Record<string, unknown> = {}
  const next = clone(project) as ProjectBrain & Record<string, unknown>

  for (const [key, value] of Object.entries(patch)) {
    previousValues[key] = clone((next as Record<string, unknown>)[key])
    ;(next as Record<string, unknown>)[key] = clone(value)
  }
  next.updatedLabel = new Date().toISOString().slice(0, 10)

  const validation = validateProjectBrain(next)
  if (!validation.valid) {
    throw new Error(`Project Brain patch failed validation: ${validation.errors.join("; ")}`)
  }

  await persistProject(next)
  return {
    projectId: project.id,
    appliedPatch: patch,
    previousValues,
    updatedLabel: next.updatedLabel,
  }
}

async function revertProjectBrainPatch(action: RuntimeActionRecord): Promise<Record<string, unknown>> {
  if (!action.projectId) throw new Error("Project Brain patch requires a project id.")
  const previousValues = action.result?.previousValues
  if (!previousValues || typeof previousValues !== "object" || Array.isArray(previousValues)) {
    throw new Error("No reversible Project Brain snapshot is recorded for this action.")
  }
  const project = await getProjectById(action.projectId)
  if (!project) throw new Error(`Project Brain project not found: ${action.projectId}`)
  const next = clone(project) as ProjectBrain & Record<string, unknown>

  for (const [key, value] of Object.entries(previousValues as Record<string, unknown>)) {
    if (!PATCHABLE_PROJECT_KEYS.has(key as keyof ProjectBrain)) continue
    ;(next as Record<string, unknown>)[key] = clone(value)
  }
  next.updatedLabel = new Date().toISOString().slice(0, 10)
  const validation = validateProjectBrain(next)
  if (!validation.valid) throw new Error(`Project Brain revert failed validation: ${validation.errors.join("; ")}`)
  await persistProject(next)
  return { ...(action.result ?? {}), revertedAt: new Date().toISOString() }
}

function githubHeaders(accessToken: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  }
}

async function githubJson(url: string, accessToken: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    ...init,
    headers: { ...githubHeaders(accessToken), ...(init?.headers ?? {}) },
    cache: "no-store",
  })
  const text = await response.text()
  const body = text ? JSON.parse(text) as Record<string, unknown> : {}
  if (!response.ok) {
    const message = typeof body.message === "string" ? body.message : `${response.status} ${response.statusText}`
    throw new Error(`GitHub action failed: ${message}`)
  }
  return body
}

async function executeGithubEvidenceBranch(action: RuntimeActionRecord, accessToken?: string): Promise<Record<string, unknown>> {
  if (!accessToken) throw new Error("GitHub OAuth write token is unavailable. Sign out and sign back in to grant the repository scope before executing this external action.")
  const repository = String(action.payload.repository ?? "")
  const baseBranch = String(action.payload.baseBranch ?? "master")
  const branch = String(action.payload.branch ?? "")
  const path = String(action.payload.path ?? "")
  const content = String(action.payload.content ?? "")
  const commitMessage = String(action.payload.commitMessage ?? `evidence(trace-design): ${action.runId}`)
  if (!/^Faadil1\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error("External action repository is outside the owner allowlist.")
  if (!branch.startsWith("trace-run/")) throw new Error("TRACE runtime external writes are restricted to trace-run/* branches.")
  if (!path.startsWith("docs/evidence/trace-runs/")) throw new Error("TRACE runtime GitHub writes are restricted to docs/evidence/trace-runs/.")

  const apiBase = `https://api.github.com/repos/${repository}`
  const baseRef = await githubJson(`${apiBase}/git/ref/heads/${encodeURIComponent(baseBranch)}`, accessToken)
  const baseObject = baseRef.object as Record<string, unknown> | undefined
  const baseSha = typeof baseObject?.sha === "string" ? baseObject.sha : undefined
  if (!baseSha) throw new Error("Unable to resolve the base branch SHA.")

  const branchRefUrl = `${apiBase}/git/ref/heads/${encodeURIComponent(branch)}`
  const existing = await fetch(branchRefUrl, { headers: githubHeaders(accessToken), cache: "no-store" })
  if (existing.ok) throw new Error(`Branch already exists: ${branch}`)
  if (existing.status !== 404) throw new Error(`Unable to verify branch availability: ${existing.status}`)

  await githubJson(`${apiBase}/git/refs`, accessToken, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  })

  const encodedPath = path.split("/").map(encodeURIComponent).join("/")
  try {
    const written = await githubJson(`${apiBase}/contents/${encodedPath}`, accessToken, {
      method: "PUT",
      body: JSON.stringify({
        message: commitMessage,
        content: Buffer.from(content, "utf8").toString("base64"),
        branch,
      }),
    })
    const commit = written.commit as Record<string, unknown> | undefined
    return {
      repository,
      branch,
      path,
      commitSha: typeof commit?.sha === "string" ? commit.sha : null,
      branchUrl: `https://github.com/${repository}/tree/${branch}`,
      fileUrl: `https://github.com/${repository}/blob/${branch}/${path}`,
    }
  } catch (error) {
    await fetch(branchRefUrl, { method: "DELETE", headers: githubHeaders(accessToken), cache: "no-store" }).catch(() => undefined)
    throw error
  }
}

async function revertGithubEvidenceBranch(action: RuntimeActionRecord, accessToken?: string): Promise<Record<string, unknown>> {
  if (!accessToken) throw new Error("GitHub OAuth write token is unavailable for branch deletion.")
  const repository = String(action.payload.repository ?? "")
  const branch = String(action.payload.branch ?? "")
  if (!/^Faadil1\/[A-Za-z0-9_.-]+$/.test(repository) || !branch.startsWith("trace-run/")) {
    throw new Error("External revert is outside the TRACE runtime branch allowlist.")
  }
  const response = await fetch(`https://api.github.com/repos/${repository}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "DELETE",
    headers: githubHeaders(accessToken),
    cache: "no-store",
  })
  if (!response.ok && response.status !== 404) {
    const body = await response.text()
    throw new Error(`GitHub branch revert failed: ${response.status} ${body}`)
  }
  return { ...(action.result ?? {}), branchDeleted: true, revertedAt: new Date().toISOString() }
}

export async function executeTraceAction(actionId: string, accessToken?: string): Promise<TraceActionExecutionResult> {
  const action = await getTraceAction(actionId)
  if (!action) throw new Error(`TRACE runtime action not found: ${actionId}`)
  if (action.status !== "PREPARED") throw new Error(`Action is not prepared: ${action.status}`)

  try {
    const result = action.type === "PROJECT_BRAIN_PATCH"
      ? await executeProjectBrainPatch(action)
      : await executeGithubEvidenceBranch(action, accessToken)
    await updateTraceAction(actionId, "EXECUTED", result)
    const updated = await getTraceAction(actionId)
    if (!updated) throw new Error("Action disappeared after execution.")
    return { action: updated, message: `${action.title} executed.` }
  } catch (error) {
    const result = { error: error instanceof Error ? error.message : String(error) }
    await updateTraceAction(actionId, "FAILED", result)
    throw error
  }
}

export async function revertTraceAction(actionId: string, accessToken?: string): Promise<TraceActionExecutionResult> {
  const action = await getTraceAction(actionId)
  if (!action) throw new Error(`TRACE runtime action not found: ${actionId}`)
  if (!action.reversible) throw new Error("Action is not reversible.")
  if (action.status !== "EXECUTED") throw new Error(`Only executed actions can be reverted: ${action.status}`)

  const result = action.type === "PROJECT_BRAIN_PATCH"
    ? await revertProjectBrainPatch(action)
    : await revertGithubEvidenceBranch(action, accessToken)
  await updateTraceAction(actionId, "REVERTED", result)
  const updated = await getTraceAction(actionId)
  if (!updated) throw new Error("Action disappeared after revert.")
  return { action: updated, message: `${action.title} reverted.` }
}
