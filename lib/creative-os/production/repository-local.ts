import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import os from "node:os"

import type { ProductionRoute, ProductionState } from "./types"

export type ProductionRepositoryHealth = "HEALTHY" | "ABSENT" | "CORRUPT" | "UNREADABLE"

export interface ProductionRepositoryState {
  routes: ProductionRoute[]
}

export interface EnterProductionResult {
  status: "CREATED" | "ALREADY_REGISTERED" | "INSUFFICIENT_AUTHORITY" | "INVALID_INPUT" | "REPOSITORY_CORRUPT" | "PERSISTENCE_FAILED"
  route?: ProductionRoute
  existingRoute?: ProductionRoute
  error?: string
}

const DEFAULT_DATA_DIR = join(os.homedir(), ".componentry-lab")

function getDataDir(): string {
  return process.env.COMPONENTRY_LAB_DATA_DIR || DEFAULT_DATA_DIR
}

function getRepositoryFilePath(): string {
  return join(getDataDir(), "production-repository", "routes.json")
}

function getRepositoryTempFilePath(): string {
  return join(getDataDir(), "production-repository", "routes.json.tmp")
}

function cloneRoute(route: ProductionRoute): ProductionRoute {
  return JSON.parse(JSON.stringify(route)) as ProductionRoute
}

function readRepository(): { health: ProductionRepositoryHealth; state: ProductionRepositoryState | null } {
  const repositoryFilePath = getRepositoryFilePath()
  if (!existsSync(repositoryFilePath)) {
    return { health: "ABSENT", state: null }
  }

  try {
    const raw = readFileSync(repositoryFilePath, "utf8")
    const parsed = JSON.parse(raw) as Partial<ProductionRepositoryState>
    const routes = Array.isArray(parsed.routes) ? parsed.routes.map(cloneRoute) : []
    return { health: "HEALTHY", state: { routes } }
  } catch (error) {
    return { health: error instanceof SyntaxError ? "CORRUPT" : "UNREADABLE", state: null }
  }
}

function writeRepositoryAtomic(state: ProductionRepositoryState): void {
  const repositoryFilePath = getRepositoryFilePath()
  const tempFilePath = getRepositoryTempFilePath()
  mkdirSync(dirname(repositoryFilePath), { recursive: true })
  writeFileSync(tempFilePath, JSON.stringify(state, null, 2), "utf8")
  renameSync(tempFilePath, repositoryFilePath)
}

function routeIdentity(route: ProductionRoute): string {
  return [
    route.projectId,
    route.planFingerprint ?? "none",
    route.requestedArtifactType,
    route.productionCapability ?? "none",
    route.resourceId ?? "none",
    route.authorityRequired,
    route.estimatedCost ?? "none",
    route.licenseState,
    route.privacyClass,
  ].join("|")
}

export function getProductionRepositoryPath(): string {
  return getRepositoryFilePath()
}

export function getProductionRepositoryHealth(): ProductionRepositoryHealth {
  return readRepository().health
}

export function listRoutes(projectId: string): ProductionRoute[] {
  const repository = readRepository()
  if (repository.health !== "HEALTHY" || !repository.state) return []
  return repository.state.routes.filter((route) => route.projectId === projectId).map(cloneRoute)
}

export function getRoute(routeId: string): ProductionRoute | undefined {
  const repository = readRepository()
  if (repository.health !== "HEALTHY" || !repository.state) return undefined
  return repository.state.routes.find((route) => route.routeId === routeId)
}

export function getProductionState(projectId: string): { routes: ProductionRoute[]; state: ProductionState | "NONE"; health: ProductionRepositoryHealth } {
  const routes = listRoutes(projectId)
  return { routes, state: routes.length > 0 ? routes[0].status : "NONE", health: getProductionRepositoryHealth() }
}

export function saveRoute(route: ProductionRoute): EnterProductionResult {
  if (!route?.projectId || !route?.planFingerprint) {
    return { status: "INVALID_INPUT", error: "Canonical production route requires a projectId and planFingerprint." }
  }

  const repository = readRepository()
  if (repository.health === "CORRUPT") {
    return { status: "REPOSITORY_CORRUPT", error: "Canonical production repository is corrupt and must be repaired before writes." }
  }
  if (repository.health === "UNREADABLE") {
    return { status: "PERSISTENCE_FAILED", error: "Canonical production repository is unreadable." }
  }

  const existingRoutes = repository.state?.routes ?? []
  const existing = existingRoutes.find((candidate) => routeIdentity(candidate) === routeIdentity(route))
  if (existing) {
    return { status: "ALREADY_REGISTERED", existingRoute: cloneRoute(existing) }
  }

  try {
    writeRepositoryAtomic({ routes: [...existingRoutes, cloneRoute(route)] })
  } catch (error) {
    try {
      if (existsSync(getRepositoryTempFilePath())) rmSync(getRepositoryTempFilePath(), { force: true })
    } catch {
      // best effort
    }
    return { status: "PERSISTENCE_FAILED", error: (error as Error).message }
  }

  return { status: "CREATED", route: cloneRoute(route) }
}

export function clearProductionRepositoryForTests(): void {
  try {
    const file = getRepositoryFilePath()
    const temp = getRepositoryTempFilePath()
    if (existsSync(file)) rmSync(file, { force: true })
    if (existsSync(temp)) rmSync(temp, { force: true })
  } catch {
    // best effort
  }
}