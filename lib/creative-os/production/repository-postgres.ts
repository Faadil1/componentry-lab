import "server-only"

import { getDatabase } from "@/lib/persistence/db"
import { ensureCanonicalStorageSchema } from "@/lib/persistence/canonical-storage-bootstrap"
import type { AuthorityContext } from "@/lib/director/types"
import { resolveProductionRoute } from "./router"
import type { ExternalCapabilityPlan, HumanApprovalDecision } from "../film-kit/types"
import type { ProductionRoute, ProductionState } from "./types"
import type { ProjectBrain } from "@/lib/projects"

function cloneRoute(route: ProductionRoute): ProductionRoute {
  return JSON.parse(JSON.stringify(route)) as ProductionRoute
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

export async function listRoutesPostgres(projectId: string): Promise<ProductionRoute[]> {
  const sql = getDatabase()
  await ensureCanonicalStorageSchema(sql)
  const rows = await sql`
    SELECT payload
    FROM componentry_routes
    WHERE project_id = ${projectId}
    ORDER BY created_at ASC
  `
  return rows.map((row) => cloneRoute((row as { payload: ProductionRoute }).payload))
}

export async function getRoutePostgres(routeId: string): Promise<ProductionRoute | undefined> {
  const sql = getDatabase()
  await ensureCanonicalStorageSchema(sql)
  const rows = await sql`
    SELECT payload
    FROM componentry_routes
    WHERE route_id = ${routeId}
  `
  return rows[0] ? cloneRoute((rows[0] as { payload: ProductionRoute }).payload) : undefined
}

export async function getProductionStatePostgres(projectId: string): Promise<{ routes: ProductionRoute[]; state: ProductionState | "NONE"; health: string }> {
  const routes = await listRoutesPostgres(projectId)
  return { routes, state: routes.length > 0 ? routes[0].status : "NONE", health: "HEALTHY" }
}

export async function createRoutePostgres(input: {
  project: ProjectBrain
  plan: ExternalCapabilityPlan
  approval: HumanApprovalDecision
  authorityContext: AuthorityContext
}): Promise<{ status: "CREATED" | "ALREADY_REGISTERED" | "INSUFFICIENT_AUTHORITY" | "INVALID_INPUT" | "REPOSITORY_CORRUPT" | "PERSISTENCE_FAILED"; route?: ProductionRoute; existingRoute?: ProductionRoute; error?: string }> {
  const sql = getDatabase()
  await ensureCanonicalStorageSchema(sql)
  const nextRoute = resolveProductionRoute(input.plan, input.project.id, false)
  const route: ProductionRoute = {
    ...nextRoute,
    routeId: `route_${input.plan.planFingerprint.replace(/[^a-zA-Z0-9]+/g, "_")}`,
    projectId: input.project.id,
    planFingerprint: input.plan.planFingerprint,
    requestedArtifactType: input.plan.requestedArtifact ?? "unknown",
    productionCapability: input.plan.capabilityId,
    resourceId: input.plan.resourceId,
    providerAdapterId: input.plan.executionMode === "NOT_EXECUTED" ? null : input.approval.providerAdapterId,
    authorityRequired: input.approval.approvedAuthority,
    executionMode: "NOT_EXECUTED",
    estimatedCost: input.approval.costCeiling ?? input.plan.estimatedCost ?? null,
    licenseState: input.plan.licenseStatus ?? "UNKNOWN",
    privacyClass: input.plan.privacyStatus,
    inputArtifacts: input.plan.requiredInputs,
    expectedOutputArtifacts: input.plan.expectedOutputs,
    heroDemoContribution: nextRoute.heroDemoContribution,
    qualityGates: [...new Set([...nextRoute.qualityGates, "PRODUCTION_ENTRY_REVIEW", "NO_EXECUTION"])],
    evidenceRequired: [...new Set([...nextRoute.evidenceRequired, "HUMAN_APPROVAL"])],
    reversibility: "LOCAL_REVERSIBLE",
    status: "READY",
  }
  const identity = routeIdentity(route)
  const now = new Date().toISOString()
  const existing = await sql`
    SELECT payload
    FROM componentry_routes
    WHERE route_identity = ${identity}
  `
  if (existing.length > 0) {
    return { status: "ALREADY_REGISTERED", existingRoute: cloneRoute((existing[0] as { payload: ProductionRoute }).payload) }
  }
  await sql`
    INSERT INTO componentry_routes (route_id, project_id, plan_fingerprint, route_identity, payload, created_at, updated_at)
    VALUES (${route.routeId}, ${route.projectId}, ${route.planFingerprint}, ${identity}, ${JSON.stringify(route)}::jsonb, ${now}, ${now})
  `
  return { status: "CREATED", route: cloneRoute(route) }
}
