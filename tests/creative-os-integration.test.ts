import { test } from "node:test"
import assert from "node:assert"
import fs from "fs"
import path from "path"
import { runIntegration } from "../lib/creative-os/integration"
import { directorFixtures } from "../lib/director/fixtures"

// Helper to get a deep clone of a fixture project
function getProjectFixture(key: string) {
  const fixture = directorFixtures[key]
  if (!fixture) {
    throw new Error(`Fixture ${key} not found.`)
  }
  return JSON.parse(JSON.stringify(fixture.project))
}

// ─────────────────────────────────────────────────────────────
// 1. Project Brain Immutability
// ─────────────────────────────────────────────────────────────

test("Integration: project-brain-immutable - Project Brain snapshot is never mutated", async () => {
  const projectSnapshot = getProjectFixture("the-second-absence")
  const beforeStr = JSON.stringify(projectSnapshot)

  runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "SUGGEST" as const
  })

  const afterStr = JSON.stringify(projectSnapshot)
  assert.strictEqual(beforeStr, afterStr, "Input project brain snapshot must remain completely immutable")
})

// ─────────────────────────────────────────────────────────────
// 2. Project Identity Throughout Pipeline
// ─────────────────────────────────────────────────────────────

test("Integration: project-identity-preserved - projectId is traceable through Director, Router, Method and ContinuationState", async () => {
  const projectSnapshot = getProjectFixture("the-second-absence")
  const result = await runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "SUGGEST" as const
  })

  assert.strictEqual(result.projectId, projectSnapshot.id)
  assert.strictEqual(result.continuationState.projectId, projectSnapshot.id)
  assert.strictEqual(result.integrationProvenance.projectBrainFingerprint, result.projectBrainFingerprint)
})

// ─────────────────────────────────────────────────────────────
// 3. Exactly One Authorized Next Action (all method statuses)
// ─────────────────────────────────────────────────────────────

test("Integration: exactly-one-next-action - COMPLETE path returns exactly one authorized action", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("the-second-absence"),
    currentAuthority: "SUGGEST" as const
  })
  assert.ok(result.authorizedNextAction)
  assert.ok(typeof result.authorizedNextAction.title === "string")
  assert.ok(typeof result.authorizedNextAction.rationale === "string")
  assert.ok(result.authorizedNextAction.title.length > 0)
})

test("Integration: exactly-one-next-action on METHOD_PARTIAL - Director still returns one action", async () => {
  // DATA_STORY with PREPARE: RPA executes but quality gates partially fail on generic fixture
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("power-bi-service-performance"),
    currentAuthority: "PREPARE" as const
  })
  assert.strictEqual(result.status, "METHOD_PARTIAL")
  // Director still produces exactly one action regardless of method partial status
  assert.ok(result.authorizedNextAction)
  assert.ok(typeof result.authorizedNextAction.title === "string")
  assert.ok(result.authorizedNextAction.title.length > 0)
})

test("Integration: exactly-one-next-action on INTEGRATION_BLOCKED - Director still returns one action", async () => {
  // remocn-render gap with SUGGEST: res_remocn maxExecutionAuthority=LOCAL_REVERSIBLE > SUGGEST
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "SUGGEST" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })
  assert.strictEqual(result.status, "INTEGRATION_BLOCKED")
  assert.strictEqual(result.methodExecution, null)
  assert.ok(result.authorizedNextAction)
  assert.ok(typeof result.authorizedNextAction.title === "string")
})

test("Integration: exactly-one-next-action on NO_MATCH - Director still returns one action", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "SUGGEST" as const,
    optionalRequestedCapabilityGap: "b-roll-generation" // no match in registry for this mode
  })
  assert.strictEqual(result.status, "NO_MATCH")
  assert.strictEqual(result.methodExecution, null)
  assert.ok(result.authorizedNextAction)
  assert.ok(typeof result.authorizedNextAction.title === "string")
})

// ─────────────────────────────────────────────────────────────
// 4. Authority Escalation — Genuine Scenarios
// ─────────────────────────────────────────────────────────────

test("Integration: no-authority-escalation - remocn-render gap requires LOCAL_REVERSIBLE but ceiling is SUGGEST", async () => {
  // res_remocn has maxExecutionAuthority=LOCAL_REVERSIBLE.
  // With currentAuthority=SUGGEST (< LOCAL_REVERSIBLE), the integration layer must block execution.
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "SUGGEST" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.strictEqual(result.status, "INTEGRATION_BLOCKED")
  assert.strictEqual(result.routingDecision, "INSUFFICIENT_AUTHORITY")
  assert.strictEqual(result.methodExecution, null)
  // Method runtime must NOT have been called
  assert.strictEqual(result.selectedResource, null)
})

test("Integration: no-authority-escalation - same gap with sufficient authority proceeds", async () => {
  // With currentAuthority=LOCAL_REVERSIBLE, remocn-render should be reachable
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "LOCAL_REVERSIBLE" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })

  // Routing should produce a MATCH (method execution may be BLOCKED as remocn is an external component)
  // but authority must NOT block it
  assert.notStrictEqual(result.routingDecision, "INSUFFICIENT_AUTHORITY")
  assert.notStrictEqual(result.status, "INTEGRATION_BLOCKED")
})

// ─────────────────────────────────────────────────────────────
// 5. Method Advisory — Never Direct Action
// ─────────────────────────────────────────────────────────────

test("Integration: method-advisory-not-action - method output is advisory evidence, not the Director action", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("the-second-absence"),
    currentAuthority: "SUGGEST" as const
  })

  // Method produces rawOutputs — Director action is separately derived
  assert.ok(result.methodExecution?.result.rawOutputs)
  // The authorized action title must be a Director-level decision, not a raw method output key
  assert.ok(!Object.keys(result.methodExecution!.result.rawOutputs).includes(result.authorizedNextAction.title))
  // method recommendation != authorized Director action contract
  assert.notStrictEqual(
    JSON.stringify(result.methodExecution?.result.rawOutputs),
    JSON.stringify(result.authorizedNextAction)
  )
})

// ─────────────────────────────────────────────────────────────
// 6. Four-Mode Matrix — Orchestration Truth
// ─────────────────────────────────────────────────────────────

test("Integration: four-mode matrix - DAY_CHALLENGE routes to Sacred Rules Breaker (COMPLETE)", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("the-second-absence"),
    currentAuthority: "SUGGEST" as const
  })
  assert.strictEqual(result.routingDecision, "MATCH")
  assert.strictEqual(result.selectedResource?.resourceId, "res_sacred_rules_breaker")
  assert.strictEqual(result.status, "COMPLETE")
  assert.ok(result.authorizedNextAction)
})

test("Integration: four-mode matrix - MARA routes to Physical Situation Storyboarder (COMPLETE)", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("mara-episode"),
    currentAuthority: "SUGGEST" as const
  })
  assert.strictEqual(result.routingDecision, "MATCH")
  assert.strictEqual(result.selectedResource?.resourceId, "res_physical_situation_storyboarder")
  assert.strictEqual(result.status, "COMPLETE")
  assert.ok(result.authorizedNextAction)
})

test("Integration: four-mode matrix - HACKATHON routes to Library-First Composition Router (COMPLETE)", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "PREPARE" as const
  })
  assert.strictEqual(result.routingDecision, "MATCH")
  assert.strictEqual(result.selectedResource?.resourceId, "res_library_first_composition_router")
  assert.strictEqual(result.status, "COMPLETE")
  assert.ok(result.authorizedNextAction)
})

test("Integration: four-mode matrix - DATA_STORY routes to RPA (METHOD_PARTIAL on generic fixture)", async () => {
  // The generic power-bi fixture has no source evidence, so RPA quality gates partially fail.
  // METHOD_PARTIAL is the honest integration result — it is not forced to COMPLETE.
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("power-bi-service-performance"),
    currentAuthority: "PREPARE" as const
  })
  assert.strictEqual(result.routingDecision, "MATCH")
  assert.strictEqual(result.selectedResource?.resourceId, "res_relationship_preserving_abstraction")
  assert.strictEqual(result.status, "METHOD_PARTIAL")
  // Orchestration succeeded: routing matched, method ran, Director produced one action
  assert.ok(result.methodExecution)
  assert.ok(result.authorizedNextAction)
})

test("Integration: four-mode matrix - DATA_STORY SUGGEST is INTEGRATION_BLOCKED (RPA maxAuth=PREPARE)", async () => {
  // RPA maxExecutionAuthority is PREPARE. SUGGEST < PREPARE → authority escalation blocked.
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("power-bi-service-performance"),
    currentAuthority: "SUGGEST" as const
  })
  assert.strictEqual(result.status, "INTEGRATION_BLOCKED")
  assert.strictEqual(result.routingDecision, "INSUFFICIENT_AUTHORITY")
  assert.strictEqual(result.methodExecution, null)
})

// ─────────────────────────────────────────────────────────────
// 7. Continuity Acceptance Test (RUN A / B / C / incompatible)
// ─────────────────────────────────────────────────────────────

test("Integration: continuity-acceptance - RUN A produces fingerprints", async () => {
  const projectSnapshot = getProjectFixture("the-second-absence")
  const resultA = await runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "SUGGEST" as const
  })

  assert.ok(resultA.continuationState.continuationFingerprint, "continuationFingerprint must exist")
  assert.ok(resultA.continuationState.integrationFingerprint, "integrationFingerprint must exist")
  assert.notStrictEqual(
    resultA.continuationState.continuationFingerprint,
    resultA.continuationState.integrationFingerprint,
    "continuationFingerprint and integrationFingerprint must be distinct values"
  )
  assert.strictEqual(resultA.continuationState.continuationCompatibility, "NONE")
})

test("Integration: continuity-acceptance - RUN B (same project + continuation) produces MATCH", async () => {
  const projectSnapshot = getProjectFixture("the-second-absence")
  const resultA = await runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "SUGGEST" as const
  })

  const resultB = await runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "SUGGEST" as const,
    optionalPreviousContinuationState: resultA.continuationState
  })

  assert.strictEqual(resultB.projectBrainFingerprint, resultA.projectBrainFingerprint)
  assert.strictEqual(resultB.projectId, resultA.projectId)
  assert.strictEqual(resultB.continuationState.continuationCompatibility, "MATCH")
  // Deterministic: same canonical inputs produce same fingerprints
  assert.strictEqual(
    resultB.continuationState.continuationFingerprint,
    resultA.continuationState.continuationFingerprint
  )
  assert.strictEqual(
    resultB.continuationState.integrationFingerprint,
    resultA.continuationState.integrationFingerprint
  )
  assert.strictEqual(
    resultB.continuationState.selectedResourceId,
    resultA.continuationState.selectedResourceId
  )
})

test("Integration: continuity-acceptance - RUN C (changed project brain) produces STALE", async () => {
  const projectSnapshot = getProjectFixture("the-second-absence")
  const resultA = await runIntegration({
    projectBrainSnapshot: projectSnapshot,
    currentAuthority: "SUGGEST" as const
  })

  // Change one canonical project fact
  const mutatedProject = {
    ...projectSnapshot,
    primaryGoal: "Completely new objective introduced in this session"
  }

  const resultC = await runIntegration({
    projectBrainSnapshot: mutatedProject,
    currentAuthority: "SUGGEST" as const,
    optionalPreviousContinuationState: resultA.continuationState
  })

  assert.strictEqual(resultC.projectId, resultA.projectId, "projectId must be same")
  assert.notStrictEqual(resultC.projectBrainFingerprint, resultA.projectBrainFingerprint, "fingerprint must differ")
  assert.strictEqual(resultC.continuationState.continuationCompatibility, "STALE")
})

test("Integration: continuity-acceptance - different projectId produces INCOMPATIBLE", async () => {
  const projectA = getProjectFixture("the-second-absence")
  const resultA = await runIntegration({
    projectBrainSnapshot: projectA,
    currentAuthority: "SUGGEST" as const
  })

  const projectB = getProjectFixture("mara-episode") // different projectId
  const resultB = await runIntegration({
    projectBrainSnapshot: projectB,
    currentAuthority: "SUGGEST" as const,
    optionalPreviousContinuationState: resultA.continuationState // from different project
  })

  assert.notStrictEqual(resultB.projectId, resultA.projectId)
  assert.strictEqual(resultB.continuationState.continuationCompatibility, "INCOMPATIBLE")
})

// ─────────────────────────────────────────────────────────────
// 8. Determinism
// ─────────────────────────────────────────────────────────────

test("Integration: determinism - identical canonical inputs produce identical outputs", async () => {
  const projectSnapshot = getProjectFixture("the-second-absence")

  const r1 = await runIntegration({ projectBrainSnapshot: projectSnapshot, currentAuthority: "SUGGEST" as const })
  const r2 = await runIntegration({ projectBrainSnapshot: projectSnapshot, currentAuthority: "SUGGEST" as const })

  assert.strictEqual(r1.projectBrainFingerprint, r2.projectBrainFingerprint)
  assert.strictEqual(r1.continuationState.integrationFingerprint, r2.continuationState.integrationFingerprint)
  assert.strictEqual(r1.continuationState.continuationFingerprint, r2.continuationState.continuationFingerprint)
  assert.strictEqual(r1.authorizedNextAction.title, r2.authorizedNextAction.title)
  assert.strictEqual(r1.status, r2.status)
})

// ─────────────────────────────────────────────────────────────
// 9. Partial Evidence Semantics Preserved
// ─────────────────────────────────────────────────────────────

test("Integration: partial-advisory-preserved - METHOD_PARTIAL status is not converted to COMPLETE", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("power-bi-service-performance"),
    currentAuthority: "PREPARE" as const
  })
  assert.strictEqual(result.status, "METHOD_PARTIAL")
  assert.strictEqual(result.methodExecution?.status, "PARTIAL")
  // Quality evidence is still present
  assert.ok(result.methodQualityEvidence)
  assert.ok(result.methodQualityEvidence!.qualityResults.length > 0)
})

test("Integration: method-blocked-no-positive-evidence - INTEGRATION_BLOCKED produces no methodQualityEvidence", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "SUGGEST" as const,
    optionalRequestedCapabilityGap: "remocn-render"
  })
  assert.strictEqual(result.status, "INTEGRATION_BLOCKED")
  assert.strictEqual(result.methodExecution, null)
  assert.strictEqual(result.methodQualityEvidence, null)
})

test("Integration: no-match-no-method - NO_MATCH does not call method runtime", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "SUGGEST" as const,
    optionalRequestedCapabilityGap: "b-roll-generation"
  })
  assert.strictEqual(result.status, "NO_MATCH")
  assert.strictEqual(result.methodExecution, null)
  assert.strictEqual(result.methodQualityEvidence, null)
})

// ─────────────────────────────────────────────────────────────
// 10. Superseded Evidence Governance
// ─────────────────────────────────────────────────────────────

test("Integration: superseded-evidence-rejected - obsolete evidence packets cannot be canonical", async () => {
  const manifestPath = path.join(process.cwd(), "docs", "evidence", "manifest.json")
  assert.ok(fs.existsSync(manifestPath), "manifest.json must exist")
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"))

  const supersededIds = (manifest.supersededPackets || []).map((p: Record<string, unknown>) => p.packetId)
  assert.ok(supersededIds.includes("director-design-review"), "director-design-review must be superseded")

  const activeIds = (manifest.activePackets || []).map((p: Record<string, unknown>) => p.packetId)
  assert.ok(!activeIds.includes("director-design-review"), "superseded packet must not appear in activePackets")

  // 3B.3 packet must not supersede 3B.2 evidence — they are separate evidence families
  assert.ok(!supersededIds.includes("creative-os-slice-3b2-v3"), "3B.2 evidence must not be superseded by 3B.3")
  assert.ok(activeIds.includes("creative-os-slice-3b2-v3"), "3B.2 evidence must remain active")
})

// ─────────────────────────────────────────────────────────────
// 11. Semantic Isolation — No Cross-Mode Leakage
// ─────────────────────────────────────────────────────────────

test("Integration: semantic-isolation - MARA output contains no Power BI / SaaS / Cleanverse terms", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("mara-episode"),
    currentAuthority: "SUGGEST" as const
  })
  const text = JSON.stringify(result.methodExecution?.result.rawOutputs ?? {}).toLowerCase()
  assert.ok(!text.includes("power bi"), "MARA must not contain Power BI concepts")
  assert.ok(!text.includes("saas"), "MARA must not contain SaaS concepts")
  assert.ok(!text.includes("cleanverse"), "MARA must not contain Cleanverse concepts")
})

test("Integration: semantic-isolation - DAY_CHALLENGE output contains no MARA musicology / episode concepts", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("the-second-absence"),
    currentAuthority: "SUGGEST" as const
  })
  const text = JSON.stringify(result.methodExecution?.result.rawOutputs ?? {}).toLowerCase()
  assert.ok(!text.includes("eight-bar"), "DAY_CHALLENGE must not contain Eight-Bar concepts")
  assert.ok(!text.includes("musicology"), "DAY_CHALLENGE must not contain musicology concepts")
})

// ─────────────────────────────────────────────────────────────
// 12. Side Effects — None
// ─────────────────────────────────────────────────────────────

test("Integration: side-effects-none - method execution has null sideEffects", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("the-second-absence"),
    currentAuthority: "SUGGEST" as const
  })
  assert.strictEqual(result.methodExecution?.sideEffects, null)
})
