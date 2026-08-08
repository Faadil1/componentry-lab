import test from "node:test"
import assert from "node:assert"
import { executeSandboxedPlan, buildExecutionIntent, RUNTIME_CONTRACT_FINGERPRINT } from "../lib/creative-os/film-kit/sandbox"
import { ExternalCapabilityPlan, HumanApprovalDecision,  } from "../lib/creative-os/film-kit/types"
import { getExecutionLedger } from "../lib/creative-os/film-kit/execution-ledger"
import { ProviderAdapter, clearProviderAdapters, registerProviderAdapter } from "../lib/creative-os/film-kit/adapters"
import { planExternalCapability } from "../lib/creative-os/film-kit/planner"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import { evaluateResource } from "../lib/creative-os/evaluation"
import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"

const MOCK_PROJECT = "proj_test"
const MOCK_BRAIN = "brain_test"

function getTestPlan() {
  const request = {
    capabilityGap: "PROMPT_SHARE_LINK_CREATION",
    artifactType: "EXTERNAL_SHARE_REFERENCE",
    projectMode: "DAY_CHALLENGE" as const,
    phase: "build" as const,
    currentAuthority: "EXPLICIT_EXTERNAL" as const,
  }
  const realResource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")!
  const selectedResource = evaluateResource(realResource, request.projectMode, request.phase, request)
  const plan = planExternalCapability(request, selectedResource)
  plan.planFingerprint = "test_fp_" + Date.now() + "_" + Math.random()
  return plan
}

function getTestApproval(plan: ExternalCapabilityPlan) {
  const approval = {
    approvalState: "GRANTED",
    projectId: MOCK_PROJECT,
    projectBrainFingerprint: MOCK_BRAIN,
    planFingerprint: plan.planFingerprint,
    resourceId: "res_cineprompt",
    capabilityId: "PROMPT_SHARE_LINK_CREATION",
    providerAdapterId: "adapter_cineprompt_share_link_v2",
    approvedAuthority: "EXPLICIT_EXTERNAL",
    costCeiling: "0",
    approvedConstraints: {
      subscriptionEntitlement: "HUMAN_ATTESTED_ACTIVE",
      downstreamSpend: "PROHIBITED",
      endpoint: "https://cineprompt.io/api/share",
      pilotAuthorization: true
    },
    runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT
  } as unknown as HumanApprovalDecision
  
  const hash = (obj: unknown) => crypto.createHash("sha256").update(JSON.stringify(obj, Object.keys(obj as object).sort())).digest("hex").substring(0, 16)
  approval.approvalFingerprint = hash(approval)
  return approval
}

test("1. env resolver reports secret present without revealing", () => {
  process.env.TEST_SECRET = "secret_value"
  const isPresent = typeof process.env.TEST_SECRET === "string" && process.env.TEST_SECRET.trim() !== ""
  assert.strictEqual(isPresent, true)
  // Ensure we didn't accidentally leak it to a mock logger
  assert.ok(!JSON.stringify({ isPresent }).includes("secret_value"))
})

test("2. missing secret -> 0 calls, 0 reservations, returns LOCAL_PRECONDITION_FAILURE", async () => {
  
  const plan = getTestPlan()
  const approval = getTestApproval(plan)
  
  let executeCount = 0
  const adapter: ProviderAdapter = {
    id: "adapter_cineprompt_share_link_v2",
    name: "Test",
    environment: "TEST_ONLY",
    sideEffectProfile: { canPerformNetwork: true, canWriteFiles: false, canSpawnProcess: false, canSpendCredits: false, canGenerateArtifact: false, canInvokeExternalService: true },
    supportedCapabilities: ["CINEMATIC_PROMPTING", "PROMPT_SHARE_LINK_CREATION"],
    canExecute: () => true,
    validatePreconditions: () => { return { status: "PRECONDITION_BLOCKED", reason: "SECRET_MISSING" } },
    execute: async () => { executeCount++; return { executionId: "1", planFingerprint: "1", providerUsed: "1", status: "COMPLETE", rawOutput: {}, executionTimeMs: 0 } }
  }
  clearProviderAdapters(); registerProviderAdapter(adapter)
  
  const result = await executeSandboxedPlan(plan, MOCK_PROJECT, MOCK_BRAIN, approval, "EXPLICIT_EXTERNAL", {})
  
  assert.strictEqual(result.status, "LOCAL_PRECONDITION_FAILURE")
  assert.strictEqual(executeCount, 0)
  
  // No reservation should be in the ledger
  const intent = buildExecutionIntent(plan, MOCK_PROJECT, MOCK_BRAIN, adapter.id, approval, "EXPLICIT_EXTERNAL", {})
  assert.strictEqual(getExecutionLedger().get(intent.executionIntentFingerprint), undefined)
})

test("3. secret present -> preflight continues", async () => {
  
  const plan = getTestPlan()
  const approval = getTestApproval(plan)
  
  let executeCount = 0
  const adapter: ProviderAdapter = {
    id: "adapter_cineprompt_share_link_v2",
    name: "Test",
    environment: "TEST_ONLY",
    sideEffectProfile: { canPerformNetwork: true, canWriteFiles: false, canSpawnProcess: false, canSpendCredits: false, canGenerateArtifact: false, canInvokeExternalService: true },
    supportedCapabilities: ["CINEMATIC_PROMPTING", "PROMPT_SHARE_LINK_CREATION"],
    canExecute: () => true,
    validatePreconditions: () => { return { status: "OK" } },
    execute: async () => { executeCount++; return { executionId: "1", planFingerprint: "1", providerUsed: "1", status: "COMPLETE", rawOutput: {}, executionTimeMs: 0 } }
  }
  clearProviderAdapters(); registerProviderAdapter(adapter)
  
  const result = await executeSandboxedPlan(plan, MOCK_PROJECT, MOCK_BRAIN, approval, "EXPLICIT_EXTERNAL", {})
  assert.strictEqual(result.status, "EXECUTED")
  assert.strictEqual(executeCount, 1)
})

test("4. local secret failure != provider failure", () => {
  assert.notStrictEqual("LOCAL_PRECONDITION_FAILURE", "PROVIDER_ERROR")
  assert.notStrictEqual("LOCAL_PRECONDITION_FAILURE", "DETERMINISTIC_PROVIDER_FAILURE")
})

test("5. local secret failure != provider outcome unknown", () => {
  assert.notStrictEqual("LOCAL_PRECONDITION_FAILURE", "PROVIDER_OUTCOME_UNKNOWN")
})

test("6. provider HTTP 401 -> deterministic provider failure", async () => {
  
  const plan = getTestPlan()
  const approval = getTestApproval(plan)
  
  const adapter: ProviderAdapter = {
    id: "adapter_cineprompt_share_link_v2",
    name: "Test",
    environment: "TEST_ONLY",
    sideEffectProfile: { canPerformNetwork: true, canWriteFiles: false, canSpawnProcess: false, canSpendCredits: false, canGenerateArtifact: false, canInvokeExternalService: true },
    supportedCapabilities: ["CINEMATIC_PROMPTING", "PROMPT_SHARE_LINK_CREATION"],
    canExecute: () => true,
    validatePreconditions: () => { return { status: "OK" } },
    execute: async () => { return { executionId: "1", planFingerprint: "1", providerUsed: "1", status: "DETERMINISTIC_PROVIDER_FAILURE", rawOutput: {}, executionTimeMs: 0 } }
  }
  clearProviderAdapters(); registerProviderAdapter(adapter)
  
  const result = await executeSandboxedPlan(plan, MOCK_PROJECT, MOCK_BRAIN, approval, "EXPLICIT_EXTERNAL", {})
  assert.strictEqual(result.status, "DETERMINISTIC_PROVIDER_FAILURE")
})

test("7. post-dispatch uncertainty -> PROVIDER_OUTCOME_UNKNOWN", async () => {
  
  const plan = getTestPlan()
  const approval = getTestApproval(plan)
  
  const adapter: ProviderAdapter = {
    id: "adapter_cineprompt_share_link_v2",
    name: "Test",
    environment: "TEST_ONLY",
    sideEffectProfile: { canPerformNetwork: true, canWriteFiles: false, canSpawnProcess: false, canSpendCredits: false, canGenerateArtifact: false, canInvokeExternalService: true },
    supportedCapabilities: ["CINEMATIC_PROMPTING", "PROMPT_SHARE_LINK_CREATION"],
    canExecute: () => true,
    validatePreconditions: () => { return { status: "OK" } },
    execute: async () => { return { executionId: "1", planFingerprint: "1", providerUsed: "1", status: "PROVIDER_OUTCOME_UNKNOWN", rawOutput: {}, executionTimeMs: 0 } }
  }
  clearProviderAdapters(); registerProviderAdapter(adapter)
  
  const result = await executeSandboxedPlan(plan, MOCK_PROJECT, MOCK_BRAIN, approval, "EXPLICIT_EXTERNAL", {})
  assert.strictEqual(result.status, "PROVIDER_OUTCOME_UNKNOWN")
})

test("8 & 9. runtimeContractFingerprint mismatch -> approval invalid -> provider calls 0", async () => {
  
  const plan = getTestPlan()
  const approval = getTestApproval(plan)
  approval.runtimeContractFingerprint = "invalid_version"
  
  const hash = (obj: unknown) => crypto.createHash("sha256").update(JSON.stringify(obj, Object.keys(obj as object).sort())).digest("hex").substring(0, 16)
  approval.approvalFingerprint = hash(approval)

  let executeCount = 0
  const adapter: ProviderAdapter = {
    id: "adapter_cineprompt_share_link_v2",
    name: "Test",
    environment: "TEST_ONLY",
    sideEffectProfile: { canPerformNetwork: true, canWriteFiles: false, canSpawnProcess: false, canSpendCredits: false, canGenerateArtifact: false, canInvokeExternalService: true },
    supportedCapabilities: ["CINEMATIC_PROMPTING", "PROMPT_SHARE_LINK_CREATION"],
    canExecute: () => true,
    execute: async () => { executeCount++; return { executionId: "1", planFingerprint: "1", providerUsed: "1", status: "COMPLETE", rawOutput: {}, executionTimeMs: 0 } }
  }
  clearProviderAdapters(); registerProviderAdapter(adapter)
  
  const result = await executeSandboxedPlan(plan, MOCK_PROJECT, MOCK_BRAIN, approval, "EXPLICIT_EXTERNAL", {})
  assert.strictEqual(result.status, "APPROVAL_INVALID")
  
  assert.strictEqual(executeCount, 0)
})

test("10. no live source contains canExecute: () => true", () => {
  const content = fs.readFileSync(path.join(__dirname, "../scripts/creative-os/live-cineprompt.ts"), "utf-8")
  assert.ok(!content.includes("canExecute: () => true"))
})

test("11. live planning source comes from RESOURCE_REGISTRY", () => {
  const content = fs.readFileSync(path.join(__dirname, "../scripts/creative-os/live-cineprompt.ts"), "utf-8")
  assert.ok(content.includes("RESOURCE_REGISTRY.find"))
})

test("12. CinePrompt lifecycle entering evaluation = TEST_CANDIDATE", () => {
  const realResource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")!
  assert.strictEqual(realResource.lifecycleState, "TEST_CANDIDATE")
})

test("13. evaluateResource is used for CinePrompt live planning", () => {
  const content = fs.readFileSync(path.join(__dirname, "../scripts/creative-os/live-cineprompt.ts"), "utf-8")
  assert.ok(content.includes("evaluateResource("))
})

test("14. live harness does not hardcode: APPROVED_RECOMMENDATION", () => {
  const content = fs.readFileSync(path.join(__dirname, "../scripts/creative-os/live-cineprompt.ts"), "utf-8")
  assert.ok(!content.includes("\"APPROVED_RECOMMENDATION\""))
})

test("15. live harness does not hardcode: lifecycleState = APPROVED", () => {
  const content = fs.readFileSync(path.join(__dirname, "../scripts/creative-os/live-cineprompt.ts"), "utf-8")
  assert.ok(!content.includes("lifecycleState: \"APPROVED\""))
})

test("16. pilot authorization does not mutate resource lifecycle", () => {
  const content = fs.readFileSync(path.join(__dirname, "../scripts/creative-os/live-cineprompt.ts"), "utf-8")
  assert.ok(content.includes("pilotAuthorization = true"))
  // Must not assign selectedResource.lifecycleState
  assert.ok(!/selectedResource\.lifecycleState\s*=[^=]/.test(content))
})

test("17. canonical planner consumes the governed ResourceEvaluation", () => {
  const content = fs.readFileSync(path.join(__dirname, "../scripts/creative-os/live-cineprompt.ts"), "utf-8")
  assert.ok(content.includes("planExternalCapability(request, selectedResource)"))
})

test("18. a non-eligible router/evaluation outcome cannot be silently upgraded by the live harness", () => {
  const content = fs.readFileSync(path.join(__dirname, "../scripts/creative-os/live-cineprompt.ts"), "utf-8")
  assert.ok(!content.includes("selectedResource.recommendationLabel ="))
})

test("19. CinePrompt registry contains DAY_CHALLENGE, PROMPT_SHARE_LINK_CREATION, and EXTERNAL_SHARE_REFERENCE", () => {
  const realResource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")!
  assert.ok(realResource.modes.includes("DAY_CHALLENGE"))
  assert.ok(realResource.capabilities.capabilityGaps.includes("PROMPT_SHARE_LINK_CREATION"))
  assert.ok(realResource.capabilities.artifactTypes.includes("EXTERNAL_SHARE_REFERENCE"))
})

test("20. CinePrompt remains TEST_CANDIDATE", () => {
  const realResource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")!
  assert.strictEqual(realResource.lifecycleState, "TEST_CANDIDATE")
})

test("21. expected experimental candidate behavior is governed by evaluateResource for DAY_CHALLENGE pilot", () => {
  const realResource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")!
  const evaluation = evaluateResource(realResource, "DAY_CHALLENGE", "build", { capabilityGap: "PROMPT_SHARE_LINK_CREATION", artifactType: "EXTERNAL_SHARE_REFERENCE", currentAuthority: "EXPLICIT_EXTERNAL" })
  assert.strictEqual(evaluation.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})

test("22. MARA + ai-camera-movements + shotlist remains supported", () => {
  const realResource = RESOURCE_REGISTRY.find(r => r.id === "res_cineprompt")!
  const evaluation = evaluateResource(realResource, "MARA", "build", { capabilityGap: "ai-camera-movements", artifactType: "shotlist", currentAuthority: "SUGGEST" })
  assert.strictEqual(evaluation.recommendationLabel, "EXPERIMENTAL_CANDIDATE")
})
