import "server-only"

import { getDatabase } from "@/lib/persistence/db"
import { ensureCanonicalStorageSchema } from "@/lib/persistence/canonical-storage-bootstrap"
import type { ResourceEvaluation } from "@/lib/creative-os/types"
import { planExternalCapability } from "../film-kit/planner"
import type { ExternalCapabilityPlan, ExternalCapabilityPlanRequest } from "../film-kit/types"
import type { ProjectBrain } from "@/lib/projects"

function clonePlan(plan: ExternalCapabilityPlan): ExternalCapabilityPlan {
  return JSON.parse(JSON.stringify(plan)) as ExternalCapabilityPlan
}

export async function listPlansForProjectPostgres(projectId: string): Promise<ExternalCapabilityPlan[]> {
  const sql = getDatabase()
  await ensureCanonicalStorageSchema(sql)
  const rows = await sql`
    SELECT payload
    FROM componentry_plans
    WHERE project_id = ${projectId}
    ORDER BY created_at ASC
  `
  return rows.map((row) => clonePlan((row as { payload: ExternalCapabilityPlan }).payload))
}

export async function getPlanPostgres(planFingerprint: string): Promise<ExternalCapabilityPlan | undefined> {
  const sql = getDatabase()
  await ensureCanonicalStorageSchema(sql)
  const rows = await sql`
    SELECT payload
    FROM componentry_plans
    WHERE plan_fingerprint = ${planFingerprint}
  `
  return rows[0] ? clonePlan((rows[0] as { payload: ExternalCapabilityPlan }).payload) : undefined
}

export async function savePlanPostgres(input: { project: ProjectBrain; selectedResource: ResourceEvaluation | null; request: ExternalCapabilityPlanRequest }): Promise<{ status: "SAVED" | "ALREADY_EXISTS" | "INVALID_INPUT" | "REPOSITORY_CORRUPT" | "PERSISTENCE_FAILED"; plan?: ExternalCapabilityPlan; existingPlan?: ExternalCapabilityPlan; error?: string }> {
  if (!input.project || !input.request) {
    return { status: "INVALID_INPUT", error: "Project and planning request are required." }
  }
  const sql = getDatabase()
  await ensureCanonicalStorageSchema(sql)
  const plan = planExternalCapability(input.request, input.selectedResource)
  const now = new Date().toISOString()
  const existing = await getPlanPostgres(plan.planFingerprint)
  if (existing) {
    return { status: "ALREADY_EXISTS", existingPlan: existing }
  }
  await sql`
    INSERT INTO componentry_plans (plan_fingerprint, project_id, request_fingerprint, payload, created_at, updated_at)
    VALUES (${plan.planFingerprint}, ${input.project.id}, ${JSON.stringify(input.request)}, ${JSON.stringify(plan)}::jsonb, ${now}, ${now})
  `
  return { status: "SAVED", plan: clonePlan(plan) }
}
