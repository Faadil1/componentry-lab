import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import os from "node:os"

import type { ResourceEvaluation } from "@/lib/creative-os/types"
import { planExternalCapability } from "../film-kit/planner"
import type { ExternalCapabilityPlan, ExternalCapabilityPlanRequest } from "../film-kit/types"
import type { ProjectBrain } from "@/lib/projects"

export type PlanningRepositoryHealth = "HEALTHY" | "ABSENT" | "CORRUPT" | "UNREADABLE"

export interface ProductionPlanningRequest {
  project: ProjectBrain
  selectedResource: ResourceEvaluation | null
  request: ExternalCapabilityPlanRequest
}

export interface PlanRecord {
  projectId: string
  requestFingerprint: string
  plan: ExternalCapabilityPlan
}

export interface PlanningRepositoryState {
  plans: PlanRecord[]
}

export interface SavePlanResult {
  status: "SAVED" | "ALREADY_EXISTS" | "INVALID_INPUT" | "REPOSITORY_CORRUPT" | "PERSISTENCE_FAILED"
  plan?: ExternalCapabilityPlan
  existingPlan?: ExternalCapabilityPlan
  error?: string
}

const DEFAULT_DATA_DIR = join(os.homedir(), ".componentry-lab")

function getDataDir(): string {
  return process.env.COMPONENTRY_LAB_DATA_DIR || DEFAULT_DATA_DIR
}

function getRepositoryFilePath(): string {
  return join(getDataDir(), "planning-repository", "plans.json")
}

function getRepositoryTempFilePath(): string {
  return join(getDataDir(), "planning-repository", "plans.json.tmp")
}

function clonePlan(plan: ExternalCapabilityPlan): ExternalCapabilityPlan {
  return JSON.parse(JSON.stringify(plan)) as ExternalCapabilityPlan
}

function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj)
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`
  const keys = Object.keys(obj as Record<string, unknown>).sort()
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify((obj as Record<string, unknown>)[key])}`).join(",")}}`
}

function fingerprint(value: unknown): string {
  let acc = 0
  for (const ch of stableStringify(value)) acc = (acc * 33 + ch.charCodeAt(0)) >>> 0
  return `plan_${acc.toString(16)}`
}

function readRepository(): { health: PlanningRepositoryHealth; state: PlanningRepositoryState | null } {
  const file = getRepositoryFilePath()
  if (!existsSync(file)) return { health: "ABSENT", state: null }
  try {
    const raw = readFileSync(file, "utf8")
    const parsed = JSON.parse(raw) as Partial<PlanningRepositoryState>
    const plans = Array.isArray(parsed.plans) ? parsed.plans.map((record) => ({ ...record, plan: clonePlan(record.plan) })) : []
    return { health: "HEALTHY", state: { plans } }
  } catch (error) {
    return { health: error instanceof SyntaxError ? "CORRUPT" : "UNREADABLE", state: null }
  }
}

function writeRepositoryAtomic(state: PlanningRepositoryState): void {
  const file = getRepositoryFilePath()
  const temp = getRepositoryTempFilePath()
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(temp, JSON.stringify(state, null, 2), "utf8")
  renameSync(temp, file)
}

export function getPlanningRepositoryPath(): string {
  return getRepositoryFilePath()
}

export function getPlanningRepositoryHealth(): PlanningRepositoryHealth {
  return readRepository().health
}

export function listPlansForProject(projectId: string): ExternalCapabilityPlan[] {
  const repository = readRepository()
  if (repository.health !== "HEALTHY" || !repository.state) return []
  return repository.state.plans.filter((record) => record.projectId === projectId).map((record) => clonePlan(record.plan))
}

export function getPlan(planFingerprint: string): ExternalCapabilityPlan | undefined {
  const repository = readRepository()
  if (repository.health !== "HEALTHY" || !repository.state) return undefined
  const record = repository.state.plans.find((item) => item.plan.planFingerprint === planFingerprint)
  return record ? clonePlan(record.plan) : undefined
}

export function prepareProductionPlan(input: ProductionPlanningRequest): ExternalCapabilityPlan {
  return planExternalCapability(input.request, input.selectedResource)
}

export function savePlan(input: ProductionPlanningRequest): SavePlanResult {
  if (!input.project || !input.request) {
    return { status: "INVALID_INPUT", error: "Project and planning request are required." }
  }

  const repository = readRepository()
  if (repository.health === "CORRUPT") {
    return { status: "REPOSITORY_CORRUPT", error: "Canonical planning repository is corrupt and must be repaired before writes." }
  }
  if (repository.health === "UNREADABLE") {
    return { status: "PERSISTENCE_FAILED", error: "Canonical planning repository is unreadable." }
  }

  const plan = prepareProductionPlan(input)
  const existing = repository.state?.plans.find((record) => record.plan.planFingerprint === plan.planFingerprint)
  if (existing) {
    return { status: "ALREADY_EXISTS", existingPlan: clonePlan(existing.plan) }
  }

  const nextState: PlanningRepositoryState = {
    plans: [...(repository.state?.plans ?? []), { projectId: input.project.id, requestFingerprint: fingerprint(input.request), plan: clonePlan(plan) }],
  }

  try {
    writeRepositoryAtomic(nextState)
  } catch (error) {
    try {
      if (existsSync(getRepositoryTempFilePath())) rmSync(getRepositoryTempFilePath(), { force: true })
    } catch {
      // best effort
    }
    return { status: "PERSISTENCE_FAILED", error: (error as Error).message }
  }

  return { status: "SAVED", plan: clonePlan(plan) }
}

export function clearPlanningRepositoryForTests(): void {
  try {
    const file = getRepositoryFilePath()
    const temp = getRepositoryTempFilePath()
    if (existsSync(file)) rmSync(file, { force: true })
    if (existsSync(temp)) rmSync(temp, { force: true })
  } catch {
    // best effort
  }
}
