import { getComponentryLabStorageMode } from "../../persistence/storage-mode"
import * as local from "./repository-local"
import type { AuthorityContext } from "@/lib/director/types"
import type { ExternalCapabilityPlan, HumanApprovalDecision } from "../film-kit/types"
import type { ProductionRoute, ProductionState } from "./types"
import type { ProjectBrain } from "@/lib/projects"

export type ProductionRepositoryHealth = local.ProductionRepositoryHealth
export interface EnterProductionInput {
  project: ProjectBrain
  plan: ExternalCapabilityPlan
  approval: HumanApprovalDecision
  authorityContext: AuthorityContext
}
export type EnterProductionResult = local.EnterProductionResult

function isPostgresMode(): boolean {
  return getComponentryLabStorageMode() === "postgres"
}

export function getProductionRepositoryPath(): string {
  return isPostgresMode() ? "postgres://componentry_routes" : local.getProductionRepositoryPath()
}

export function getProductionRepositoryHealth(): ProductionRepositoryHealth {
  return local.getProductionRepositoryHealth()
}

export function listRoutes(projectId: string): ProductionRoute[] {
  return local.listRoutes(projectId)
}

export function getRoute(routeId: string): ProductionRoute | undefined {
  return local.getRoute(routeId)
}

export function getProductionState(projectId: string): { routes: ProductionRoute[]; state: ProductionState | "NONE"; health: ProductionRepositoryHealth } {
  return local.getProductionState(projectId)
}

export function createRoute(input: EnterProductionInput): EnterProductionResult {
  return local.saveRoute((input as unknown as { plan: ProductionRoute }).plan)
}

export function clearProductionRepositoryForTests(): void {
  local.clearProductionRepositoryForTests()
}
