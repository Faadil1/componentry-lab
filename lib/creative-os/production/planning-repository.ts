import { getComponentryLabStorageMode } from "../../persistence/storage-mode"
import * as local from "./planning-repository-local"
import type { ExternalCapabilityPlan } from "../film-kit/types"

export type PlanningRepositoryHealth = local.PlanningRepositoryHealth
export type SavePlanResult = local.SavePlanResult

function isPostgresMode(): boolean {
  return getComponentryLabStorageMode() === "postgres"
}

export function getPlanningRepositoryPath(): string {
  return isPostgresMode() ? "postgres://componentry_plans" : local.getPlanningRepositoryPath()
}

export function getPlanningRepositoryHealth(): PlanningRepositoryHealth {
  return local.getPlanningRepositoryHealth()
}

export function listPlansForProject(projectId: string): ExternalCapabilityPlan[] {
  return local.listPlansForProject(projectId)
}

export function getPlan(planFingerprint: string): ExternalCapabilityPlan | undefined {
  return local.getPlan(planFingerprint)
}

export function savePlan(plan: ExternalCapabilityPlan): SavePlanResult {
  return local.savePlan(plan)
}

export function clearPlanningRepositoryForTests(): void {
  local.clearPlanningRepositoryForTests()
}
