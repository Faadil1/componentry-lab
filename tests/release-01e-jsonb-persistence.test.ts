import assert from "node:assert/strict"
import { test } from "node:test"

import { createProjectPostgresWithSql, getProjectByIdPostgresWithSql, getProjectBySlugPostgresWithSql, listProjectsPostgresWithSql } from "../lib/projects/repository-postgres-core.ts"
import { getPlanPostgresWithSql, listPlansForProjectPostgresWithSql, savePlanPostgresWithSql } from "../lib/creative-os/production/planning-repository-postgres.ts"
import type { ExternalCapabilityPlan } from "../lib/creative-os/film-kit/types.ts"
import type { AuthorityContext } from "../lib/director/types.ts"

const projectAuthority: AuthorityContext = {
  authorityLevel: "local-reversible-execution",
  requestedAction: "Create project",
  target: "project-repository",
  reversibility: "reversible",
  risk: "low",
  approvalRequirement: "explicit",
  grantedScope: ["project:create"],
  grantedBy: "system",
  grantedAt: new Date().toISOString(),
  expiration: null,
  status: "granted",
} as const

function makeProject(id: string) {
  return { id, slug: id, title: id, shortTitle: id }
}

function makePlan(planFingerprint: string, projectId: string): ExternalCapabilityPlan {
  return {
    planFingerprint,
    projectId,
    projectBrainFingerprint: `brain-${projectId}`,
    resourceId: null,
    capabilityId: "PROMPT_SHARE_LINK_CREATION",
    decomposedCapabilities: ["CINEMATIC_PROMPTING"],
    requestedArtifact: "product-demo-film",
    compatibilityStatus: "VERIFIED",
    compatibilityEvidence: null,
    lifecycleState: "VALIDATED",
    currentAuthority: "LOCAL_REVERSIBLE",
    requiredAuthority: "LOCAL_REVERSIBLE",
    requiredHumanApproval: true,
    humanApprovalState: "GRANTED",
    costStatus: "FREE",
    estimatedCost: null,
    privacyStatus: "ZERO_RETENTION",
    licenseStatus: null,
    requiredInputs: [],
    expectedOutputs: [],
    executionMode: "NOT_EXECUTED",
    executionStatus: "NOT_EXECUTED",
    blockers: [],
    missingEvidence: [],
  }
}

function makeProjectSql() {
  const writes: Array<{ text: string; values: unknown[] }> = []
  const sql = Object.assign(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = Array.from(strings).join("${}")
    writes.push({ text, values })
    if (text.includes("ORDER BY slug ASC")) {
      return [
        { payload: makeProject("project-1") },
        { payload: JSON.stringify(makeProject("legacy-project")) },
        { payload: "{\"id\":\"bad-project\"" },
      ]
    }
    return []
  }, {
    unsafe: async (query: string, values: unknown[] = []) => {
      writes.push({ text: query, values })
      return []
    },
  })
  return { sql, writes }
}

function makePlanSql() {
  const writes: Array<{ text: string; values: unknown[] }> = []
  const sql = Object.assign(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = Array.from(strings).join("${}")
    writes.push({ text, values })
    if (text.includes("WHERE project_id =")) {
      return [
        { payload: makePlan("plan-object", "project-1") },
        { payload: JSON.stringify(makePlan("plan-legacy", "project-legacy")) },
        { payload: "bad plan" },
      ]
    }
    if (text.includes("WHERE plan_fingerprint =")) {
      return values[0] === "plan-legacy" ? [{ payload: JSON.stringify(makePlan("plan-legacy", "project-legacy")) }] : []
    }
    return []
  }, {
    unsafe: async (query: string, values: unknown[] = []) => {
      writes.push({ text: query, values })
      return []
    },
  })
  return { sql, writes }
}

test("JSONB persistence stores structured objects and decodes legacy string rows once", async () => {
  const project = makeProjectSql()
  await createProjectPostgresWithSql(project.sql as never, { title: "JSONB Project", kind: "client-product", problem: "p", primaryGoal: "g" }, projectAuthority)

  const projectInsert = project.writes.find((call) => call.text.includes("INSERT INTO componentry_projects"))
  assert.ok(projectInsert)
  assert.equal(typeof projectInsert?.values[2], "object")
  assert.notEqual(typeof projectInsert?.values[2], "string")

  const projectRows = await listProjectsPostgresWithSql(project.sql as never)
  assert.equal(projectRows.some((row) => row.id === "project-1"), true)
  assert.equal(projectRows.some((row) => row.id === "legacy-project"), true)
  assert.equal(projectRows.some((row) => row.id === "bad-project"), false)
  assert.equal((await getProjectByIdPostgresWithSql(project.sql as never, "legacy-project"))?.id, "legacy-project")
  assert.equal((await getProjectBySlugPostgresWithSql(project.sql as never, "legacy-project"))?.slug, "legacy-project")

  const plan = makePlanSql()
  await savePlanPostgresWithSql(plan.sql as never, makePlan("plan-save", "project-1") as never)
  const planInsert = plan.writes.find((call) => call.text.includes("INSERT INTO componentry_plans"))
  assert.ok(planInsert)
  assert.equal(typeof planInsert?.values[3], "object")
  assert.notEqual(typeof planInsert?.values[3], "string")

  const planRows = await listPlansForProjectPostgresWithSql(plan.sql as never, "project-1")
  assert.equal(planRows.some((row) => row.planFingerprint === "plan-object"), true)
  assert.equal(planRows.some((row) => row.planFingerprint === "plan-legacy"), true)
  assert.equal(planRows.some((row) => row.planFingerprint === "bad plan"), false)
  assert.equal((await getPlanPostgresWithSql(plan.sql as never, "plan-legacy"))?.projectId, "project-legacy")
})

test("malformed legacy string is not silently accepted as valid canonical truth", async () => {
  const project = makeProjectSql()
  const rows = await listProjectsPostgresWithSql(project.sql as never)
  assert.equal(rows.some((row) => row.id === "bad-project"), false)

  const plan = makePlanSql()
  const plans = await listPlansForProjectPostgresWithSql(plan.sql as never, "project-1")
  assert.equal(plans.some((row) => row.planFingerprint === "bad plan"), false)
})
