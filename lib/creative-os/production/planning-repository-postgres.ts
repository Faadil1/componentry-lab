import type { ExternalCapabilityPlan } from "../film-kit/types"

type SqlClient = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Array<Record<string, unknown>>>
}

function clonePlan(plan: ExternalCapabilityPlan): ExternalCapabilityPlan {
  return JSON.parse(JSON.stringify(plan)) as ExternalCapabilityPlan
}

function assertCanonicalPlanIdentity(plan: ExternalCapabilityPlan): void {
  if (!plan.projectId) {
    throw new Error("Canonical plan requires a projectId.")
  }
  if (!plan.planFingerprint) {
    throw new Error("Canonical plan requires a planFingerprint.")
  }
}

async function loadDatabase(): Promise<SqlClient> {
  const { getDatabase } = await import("../../persistence/db")
  return getDatabase() as unknown as SqlClient
}

async function ensureSchema(sql: SqlClient): Promise<void> {
  const { ensureCanonicalStorageSchema } = await import("../../persistence/canonical-storage-bootstrap")
  await ensureCanonicalStorageSchema(sql as never)
}

export async function listPlansForProjectPostgres(projectId: string): Promise<ExternalCapabilityPlan[]> {
  const sql = await loadDatabase()
  return listPlansForProjectPostgresWithSql(sql, projectId)
}

export async function listPlansForProjectPostgresWithSql(sql: SqlClient, projectId: string): Promise<ExternalCapabilityPlan[]> {
  await ensureSchema(sql)
  const rows = await sql`
    SELECT payload
    FROM componentry_plans
    WHERE project_id = ${projectId}
    ORDER BY created_at ASC
  `
  return rows.map((row) => clonePlan((row as { payload: ExternalCapabilityPlan }).payload))
}

export async function getPlanPostgres(planFingerprint: string): Promise<ExternalCapabilityPlan | undefined> {
  const sql = await loadDatabase()
  return getPlanPostgresWithSql(sql, planFingerprint)
}

export async function getPlanPostgresWithSql(sql: SqlClient, planFingerprint: string): Promise<ExternalCapabilityPlan | undefined> {
  await ensureSchema(sql)
  const rows = await sql`
    SELECT payload
    FROM componentry_plans
    WHERE plan_fingerprint = ${planFingerprint}
  `
  return rows[0] ? clonePlan((rows[0] as { payload: ExternalCapabilityPlan }).payload) : undefined
}

export async function savePlanPostgres(plan: ExternalCapabilityPlan): Promise<{ status: "SAVED" | "ALREADY_EXISTS" | "INVALID_INPUT" | "REPOSITORY_CORRUPT" | "PERSISTENCE_FAILED"; plan?: ExternalCapabilityPlan; existingPlan?: ExternalCapabilityPlan; error?: string }> {
  const sql = await loadDatabase()
  return savePlanPostgresWithSql(sql, plan)
}

export async function savePlanPostgresWithSql(sql: SqlClient, plan: ExternalCapabilityPlan): Promise<{ status: "SAVED" | "ALREADY_EXISTS" | "INVALID_INPUT" | "REPOSITORY_CORRUPT" | "PERSISTENCE_FAILED"; plan?: ExternalCapabilityPlan; existingPlan?: ExternalCapabilityPlan; error?: string }> {
  assertCanonicalPlanIdentity(plan)
  const projectId = plan.projectId
  await ensureSchema(sql)
  const now = new Date().toISOString()
  const existing = await getPlanPostgresWithSql(sql, plan.planFingerprint)
  if (existing) {
    return { status: "ALREADY_EXISTS", existingPlan: existing }
  }
  await sql`
    INSERT INTO componentry_plans (plan_fingerprint, project_id, request_fingerprint, payload, created_at, updated_at)
    VALUES (${plan.planFingerprint}, ${projectId}, ${plan.planFingerprint}, ${JSON.stringify(plan)}::jsonb, ${now}, ${now})
  `
  return { status: "SAVED", plan: clonePlan(plan) }
}
