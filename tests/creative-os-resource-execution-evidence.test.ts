import test from "node:test"
import assert from "node:assert"

import {
  RESOURCE_REGISTRY,
  RESOURCE_EXECUTION_EVIDENCE,
  RESOURCE_EXECUTION_EVIDENCE_COUNT,
  getAllResourceExecutionEvidence,
  getResourceExecutionEvidence,
  isResourcePlanningOnly,
  isResourceStructurallyExecutable,
  runResourceRadar,
  runIntegration
} from "../lib/creative-os"
import { getRegisteredAdapters } from "../lib/creative-os/film-kit/adapters"
import { directorFixtures } from "../lib/director/fixtures"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function getProjectFixture(key: string): typeof directorFixtures[string]["project"] {
  const fixture = directorFixtures[key]
  if (!fixture) throw new Error('Fixture ' + key + ' not found')
  return clone(fixture.project)
}

test("EXECUTION_EVIDENCE_COVERAGE_GATE", () => {
  const registryIds = RESOURCE_REGISTRY.map((resource) => resource.id).sort()
  const evidenceIds = Object.keys(RESOURCE_EXECUTION_EVIDENCE).sort()
  const evidenceRecords = getAllResourceExecutionEvidence()

  assert.strictEqual(RESOURCE_REGISTRY.length, 20)
  assert.strictEqual(RESOURCE_EXECUTION_EVIDENCE_COUNT, 20)
  assert.strictEqual(evidenceRecords.length, 20)
  assert.deepStrictEqual(evidenceIds, registryIds)
  assert.strictEqual(new Set(evidenceIds).size, 20)
  assert.strictEqual(new Set(evidenceRecords.map((record) => record.resourceId)).size, 20)
  assert.strictEqual(evidenceRecords.filter((record) => !registryIds.includes(record.resourceId)).length, 0)
})

test("CORE_METHOD_EXECUTION_GATE", () => {
  const coreMethods = [
    "res_sacred_rules_breaker",
    "res_somatic_response_design",
    "res_relationship_preserving_abstraction",
    "res_cognitive_metaphor_illustrator",
    "res_physical_situation_storyboarder",
    "res_library_first_composition_router"
  ]

  for (const resourceId of coreMethods) {
    const evidence = getResourceExecutionEvidence(resourceId)
    assert.ok(evidence)
    assert.strictEqual(evidence?.implementationStatus, "IMPLEMENTED")
    assert.strictEqual(evidence?.executionBoundary, "INTERNAL_METHOD")
    assert.strictEqual(evidence?.adapterEvidenceStatus, "NOT_APPLICABLE")
    assert.strictEqual(evidence?.executionReadiness, "EXECUTION_STRUCTURALLY_AVAILABLE")
    assert.strictEqual(isResourceStructurallyExecutable(resourceId), true)
    assert.strictEqual(isResourcePlanningOnly(resourceId), false)
  }
})

test("PLANNING_ONLY_RESOURCE_GATE", () => {
  for (const resourceId of ["res_video_shotcraft", "res_remocn", "res_originkit"]) {
    const evidence = getResourceExecutionEvidence(resourceId)
    assert.ok(evidence)
    assert.strictEqual(evidence?.implementationStatus, "PARTIAL_IMPLEMENTATION")
    assert.strictEqual(evidence?.executionBoundary, "PLANNING_ONLY")
    assert.strictEqual(evidence?.adapterEvidenceStatus, "NOT_APPLICABLE")
    assert.strictEqual(evidence?.executionReadiness, "PLANNING_ONLY")
    assert.strictEqual(isResourcePlanningOnly(resourceId), true)
    assert.strictEqual(isResourceStructurallyExecutable(resourceId), false)
  }
})

test("CINEPROMPT_EVIDENCE_GATE", () => {
  const evidence = getResourceExecutionEvidence("res_cineprompt")
  assert.ok(evidence)
  assert.strictEqual(evidence?.implementationStatus, "PARTIAL_IMPLEMENTATION")
  assert.strictEqual(evidence?.executionBoundary, "EXTERNAL_ADAPTER")
  assert.strictEqual(evidence?.adapterEvidenceStatus, "PRESENT_UNVERIFIED")
  assert.strictEqual(evidence?.executionReadiness, "EXECUTION_STRUCTURALLY_AVAILABLE")
  assert.ok(evidence?.evidenceReferences.includes("lib/creative-os/film-kit/adapters/cineprompt-adapter.ts"))
  assert.ok(evidence?.evidenceReferences.includes("tests/creative-os-cineprompt.test.ts"))
})

test("DISCOVERY_FEED_NOT_EXECUTABLE_GATE", () => {
  for (const resourceId of ["res_awesome_claude_code_skills", "res_helloianneo_ecosystem"]) {
    const evidence = getResourceExecutionEvidence(resourceId)
    assert.ok(evidence)
    assert.strictEqual(evidence?.implementationStatus, "DISCOVERY_ONLY")
    assert.strictEqual(evidence?.executionBoundary, "NONE")
    assert.strictEqual(evidence?.executionReadiness, "NOT_EXECUTABLE")
    assert.strictEqual(isResourceStructurallyExecutable(resourceId), false)
    assert.strictEqual(isResourcePlanningOnly(resourceId), false)
  }
})


test("YUMMY_METADATA_ONLY_GATE", () => {
  const resource = RESOURCE_REGISTRY.find((item) => item.id === "res_yummy_design_sprint")
  assert.ok(resource)
  assert.strictEqual(resource?.type, "DISCOVERY_FEED")

  const evidence = getResourceExecutionEvidence("res_yummy_design_sprint")
  assert.ok(evidence)
  assert.strictEqual(evidence?.implementationStatus, "METADATA_ONLY")
  assert.strictEqual(evidence?.executionBoundary, "NONE")
  assert.strictEqual(evidence?.adapterEvidenceStatus, "NOT_APPLICABLE")
  assert.strictEqual(evidence?.executionReadiness, "NOT_EXECUTABLE")
  assert.strictEqual(isResourceStructurallyExecutable("res_yummy_design_sprint"), false)
  assert.strictEqual(isResourcePlanningOnly("res_yummy_design_sprint"), false)
})

test("METADATA_NOT_EXECUTION_GATE", () => {
  const resource = RESOURCE_REGISTRY.find((item) => item.id === "res_open_kimi_ppt")
  assert.ok(resource)
  assert.strictEqual(resource?.type, "PROVIDER")
  assert.ok(resource?.sourceUrl)
  assert.strictEqual(resource?.maxExecutionAuthority, "READ_ONLY")
  assert.strictEqual(isResourceStructurallyExecutable(resource.id), false)
  assert.strictEqual(getResourceExecutionEvidence(resource.id)?.executionReadiness, "NOT_EXECUTABLE")
})

test("RADAR_EXECUTION_EVIDENCE_GATE", () => {
  const radar = runResourceRadar({
    projectMode: "HACKATHON",
    phase: "submit",
    capabilityGap: "cinematic-product-demo",
    artifactType: "product-demo-film",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(radar.decision, "USE_EXISTING")
  assert.strictEqual(radar.topMatch?.resourceId, "res_video_shotcraft")
  assert.strictEqual(radar.topMatch?.planningOnly, true)
  assert.strictEqual(radar.topMatch?.planningOnly, isResourcePlanningOnly("res_video_shotcraft"))
})

test("RADAR_NON_REGRESSION_GATE", () => {
  const radar = runResourceRadar({
    projectMode: "DAY_CHALLENGE",
    phase: "verify",
    capabilityGap: "rules-governance",
    currentAuthority: "SUGGEST"
  })

  assert.strictEqual(radar.decision, "USE_EXISTING")
  assert.strictEqual(radar.topMatch?.resourceId, "res_sacred_rules_breaker")
  assert.strictEqual(radar.topMatch?.planningOnly, false)
})

test("PLANNING_ONLY_INTEGRATION_GATE", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "LOCAL_REVERSIBLE",
    optionalRequestedCapabilityGap: "remocn-render"
  })

  assert.strictEqual(result.selectedResource?.resourceId, "res_remocn")
  assert.strictEqual(result.methodExecution, null)
  assert.strictEqual(result.status, "METHOD_PARTIAL")
  assert.ok(result.externalCapabilityPlan)
  assert.notStrictEqual(result.externalCapabilityPlan?.executionStatus, "EXECUTED")
  assert.strictEqual(result.externalCapabilityPlan?.executionResult, undefined)
})


test("PLANNER_PRECEDENCE_REGRESSION_GATE", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("mara-episode"),
    currentAuthority: "SUGGEST",
    optionalRequestedCapabilityGap: "definitely-not-a-real-gap"
  })

  assert.strictEqual(result.status, "NO_MATCH")
  assert.strictEqual(result.routingDecision, "NO_MATCH")
  assert.strictEqual(result.selectedResource, null)
  assert.strictEqual(result.methodExecution, null)
  assert.strictEqual(result.externalCapabilityPlan, null)
})

test("PLANNING_ONLY_SANDBOX_GUARD_GATE", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("cleanverse-build-round-2"),
    currentAuthority: "SUGGEST",
    optionalRequestedCapabilityGap: "bootstrap-kit"
  })

  assert.strictEqual(result.selectedResource?.resourceId, "res_originkit")
  assert.ok(result.externalCapabilityPlan)
  assert.strictEqual(result.externalCapabilityPlan?.executionStatus, "EXTERNAL_EXPERIMENTAL_CANDIDATE")
  assert.strictEqual(result.status, "METHOD_BLOCKED")
  assert.strictEqual(result.methodExecution, null)
  assert.strictEqual(result.externalCapabilityPlan?.executionResult, undefined)
  assert.strictEqual(isResourcePlanningOnly("res_originkit"), true)
  assert.strictEqual(isResourceStructurallyExecutable("res_originkit"), false)
})
test("STRUCTURAL_EXECUTION_NOT_AUTHORITY_GATE", async () => {
  assert.strictEqual(isResourceStructurallyExecutable("res_cineprompt"), true)

  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("mara-episode"),
    currentAuthority: "SUGGEST",
    optionalRequestedCapabilityGap: "PROMPT_SHARE_LINK_CREATION"
  })

  assert.strictEqual(result.selectedResource, null)
  assert.strictEqual(result.status, "INTEGRATION_BLOCKED")
  assert.strictEqual(result.routingDecision, "INSUFFICIENT_AUTHORITY")
  assert.strictEqual(result.methodExecution, null)
})

test("STRUCTURAL_EXECUTION_NOT_APPROVAL_GATE", async () => {
  const result = await runIntegration({
    projectBrainSnapshot: getProjectFixture("mara-episode"),
    currentAuthority: "EXPLICIT_EXTERNAL",
    optionalRequestedCapabilityGap: "PROMPT_SHARE_LINK_CREATION"
  })

  assert.strictEqual(result.selectedResource?.resourceId, "res_cineprompt")
  assert.strictEqual(result.externalCapabilityPlan?.requiredHumanApproval, true)
  assert.strictEqual(result.externalCapabilityPlan?.executionStatus, "APPROVAL_REQUIRED")
  assert.strictEqual(result.status, "METHOD_BLOCKED")
})

test("NO_ADAPTER_REGISTRATION_SIDE_EFFECT_GATE", () => {
  const before = getRegisteredAdapters().length
  const evidenceA = getAllResourceExecutionEvidence()
  const evidenceB = getAllResourceExecutionEvidence()
  assert.deepStrictEqual(evidenceA, evidenceB)
  assert.strictEqual(getRegisteredAdapters().length, before)
})

test("DETERMINISTIC_EVIDENCE_GATE", () => {
  const a = getResourceExecutionEvidence("res_cineprompt")
  const b = getResourceExecutionEvidence("res_cineprompt")
  const c = getAllResourceExecutionEvidence()
  const d = getAllResourceExecutionEvidence()
  assert.deepStrictEqual(a, b)
  assert.deepStrictEqual(c, d)
})

test("REGISTRY_IMMUTABILITY_GATE", () => {
  const before = RESOURCE_REGISTRY.length
  getAllResourceExecutionEvidence()
  getResourceExecutionEvidence("res_open_kimi_ppt")
  assert.strictEqual(RESOURCE_REGISTRY.length, before)
  assert.strictEqual(before, 20)
})

test("NO_EXTERNAL_SIDE_EFFECT_GATE", () => {
  const registryBefore = RESOURCE_REGISTRY.length
  const adapterBefore = getRegisteredAdapters().length
  const evidenceBefore = RESOURCE_EXECUTION_EVIDENCE_COUNT

  assert.strictEqual(registryBefore, 20)
  assert.strictEqual(adapterBefore, getRegisteredAdapters().length)
  assert.strictEqual(evidenceBefore, 20)
  assert.strictEqual(getAllResourceExecutionEvidence().length, 20)
})
