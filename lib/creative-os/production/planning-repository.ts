import { getComponentryLabStorageMode } from "../../persistence/storage-mode"
import * as local from "./planning-repository-local"
import type { ExternalCapabilityPlan } from "../film-kit/types"

export type PlanningRepositoryHealth = local.PlanningRepositoryHealth
export type SavePlanResult = local.SavePlanResult

type PlanningRepositoryBackend = {
  listPlansForProject: (projectId: string) => ExternalCapabilityPlan[] | Promise<ExternalCapabilityPlan[]>
  getPlan: (planFingerprint: string) => ExternalCapabilityPlan | undefined | Promise<ExternalCapabilityPlan | undefined>
  savePlan: (plan: ExternalCapabilityPlan) => SavePlanResult | Promise<SavePlanResult>
}

type PlanningRepositoryBackendFactory = (mode: "local-file" | "postgres") => PlanningRepositoryBackend | Promise<PlanningRepositoryBackend>

let planningRepositoryBackendFactoryForTests: PlanningRepositoryBackendFactory | null = null

function isPostgresMode(): boolean {
  return getComponentryLabStorageMode() === "postgres"
}

async function getPlanningRepositoryBackend(): Promise<PlanningRepositoryBackend> {
  if (planningRepositoryBackendFactoryForTests) {
    return planningRepositoryBackendFactoryForTests(getComponentryLabStorageMode())
  }

  if (isPostgresMode()) {
    const postgres = await import("./planning-repository-postgres")
    return {
      listPlansForProject: (projectId) => postgres.listPlansForProjectPostgres(projectId),
      getPlan: (planFingerprint) => postgres.getPlanPostgres(planFingerprint),
      savePlan: (plan) => postgres.savePlanPostgres(plan),
    }
  }

  return local
}

export function __setPlanningRepositoryBackendFactoryForTests(backendFactory: PlanningRepositoryBackendFactory | null): void {
  planningRepositoryBackendFactoryForTests = backendFactory
}

export function getPlanningRepositoryPath(): string {
  return isPostgresMode() ? "postgres://componentry_plans" : local.getPlanningRepositoryPath()
}

export function getPlanningRepositoryHealth(): PlanningRepositoryHealth {
  return local.getPlanningRepositoryHealth()
}

export async function listPlansForProject(projectId: string): Promise<ExternalCapabilityPlan[]> {
  return (await getPlanningRepositoryBackend()).listPlansForProject(projectId)
}

export async function getPlan(planFingerprint: string): Promise<ExternalCapabilityPlan | undefined> {
  return (await getPlanningRepositoryBackend()).getPlan(planFingerprint)
}

export async function savePlan(plan: ExternalCapabilityPlan): Promise<SavePlanResult> {
  return (await getPlanningRepositoryBackend()).savePlan(plan)
}

export function clearPlanningRepositoryForTests(): void {
  local.clearPlanningRepositoryForTests()
}
