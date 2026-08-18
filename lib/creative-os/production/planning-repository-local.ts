import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import os from "node:os"

import type { ExternalCapabilityPlan } from "../film-kit/types"

export type PlanningRepositoryHealth = "HEALTHY" | "ABSENT" | "CORRUPT" | "UNREADABLE"

export interface PlanningRepositoryState {
  plans: ExternalCapabilityPlan[]
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

function readRepository(): { health: PlanningRepositoryHealth; state: PlanningRepositoryState | null } {
  const file = getRepositoryFilePath()
  if (!existsSync(file)) return { health: "ABSENT", state: null }
  try {
    const raw = readFileSync(file, "utf8")
    const parsed = JSON.parse(raw) as Partial<PlanningRepositoryState>
    const plans = Array.isArray(parsed.plans) ? parsed.plans.map(clonePlan) : []
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
  return repository.state.plans.filter((plan) => plan.projectId === projectId).map(clonePlan)
}

export function getPlan(planFingerprint: string): ExternalCapabilityPlan | undefined {
  const repository = readRepository()
  if (repository.health !== "HEALTHY" || !repository.state) return undefined
  const plan = repository.state.plans.find((item) => item.planFingerprint === planFingerprint)
  return plan ? clonePlan(plan) : undefined
}

export function savePlan(plan: ExternalCapabilityPlan): SavePlanResult {
  if (!plan.projectId || !plan.planFingerprint) {
    return { status: "INVALID_INPUT", error: "Canonical plan requires a projectId and planFingerprint." }
  }

  const repository = readRepository()
  if (repository.health === "CORRUPT") {
    return { status: "REPOSITORY_CORRUPT", error: "Canonical planning repository is corrupt and must be repaired before writes." }
  }
  if (repository.health === "UNREADABLE") {
    return { status: "PERSISTENCE_FAILED", error: "Canonical planning repository is unreadable." }
  }

  const existing = repository.state?.plans.find((record) => record.planFingerprint === plan.planFingerprint)
  if (existing) {
    return { status: "ALREADY_EXISTS", existingPlan: clonePlan(existing) }
  }

  const nextState: PlanningRepositoryState = {
    plans: [...(repository.state?.plans ?? []), clonePlan(plan)],
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