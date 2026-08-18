import assert from "node:assert/strict"
import test, { describe } from "node:test"
import { readFileSync } from "node:fs"

import { savePlanPostgresWithSql } from "../lib/creative-os/production/planning-repository-postgres"
import type { ExternalCapabilityPlan } from "../lib/creative-os/film-kit/types"

function makeSqlMock() {
  const calls: Array<{ text: string; values: unknown[] }> = []
  const mock = Object.assign((strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = Array.from(strings).join("${}")
    calls.push({ text, values })
    if (text.includes("WHERE plan_fingerprint =")) {
      return Promise.resolve([])
    }
    return Promise.resolve([])
  }, {
    begin: async <T>(callback: (txnSql: typeof mock) => Promise<T>): Promise<T> => {
      return callback(mock)
    },
    unsafe: async (query: string, values: unknown[] = []) => {
      calls.push({ text: query, values })
      return [] as Array<Record<string, unknown>>
    },
  })
  return { mock, calls }
}

const canonicalPlan: ExternalCapabilityPlan = {
  projectId: "release01c-test-project",
  projectBrainFingerprint: "brain_abc123",
  resourceId: "res_cineprompt",
  capabilityId: "PROMPT_SHARE_LINK_CREATION",
  decomposedCapabilities: ["CINEMATIC_PROMPTING"],
  requestedArtifact: "product-demo-film",
  compatibilityStatus: "VERIFIED",
  compatibilityEvidence: "fixture",
  lifecycleState: "VALIDATED",
  currentAuthority: "LOCAL_REVERSIBLE",
  requiredAuthority: "LOCAL_REVERSIBLE",
  requiredHumanApproval: true,
  humanApprovalState: "GRANTED",
  costStatus: "FREE",
  estimatedCost: null,
  privacyStatus: "ZERO_RETENTION",
  licenseStatus: "CLEARED",
  requiredInputs: ["project-brain"],
  expectedOutputs: ["film-plan"],
  executionMode: "NOT_EXECUTED",
  executionStatus: "HUMAN_APPROVAL_REQUIRED",
  blockers: [],
  missingEvidence: [],
  planFingerprint: "plan_fixture_1",
}

describe("release-01 corr planning adapter", () => {
  test("adapter source does not import the planner", () => {
    const source = readFileSync(new URL("../lib/creative-os/production/planning-repository-postgres.ts", import.meta.url), "utf8")
    assert.equal(source.includes("planExternalCapability"), false)
  })

  test("savePlanPostgresWithSql persists canonical plan without synthesizing one", async () => {
    const { mock, calls } = makeSqlMock()
    const result = await savePlanPostgresWithSql(mock as never, canonicalPlan)

    assert.equal(result.status, "SAVED")
    assert.equal(result.plan?.projectId, canonicalPlan.projectId)
    assert.equal(result.plan?.planFingerprint, canonicalPlan.planFingerprint)
    assert.deepEqual(result.plan, canonicalPlan)
    assert.equal(calls.some((call) => call.text.includes("INSERT INTO componentry_plans")), true)
  })
})