import test, { describe } from "node:test"
import assert from "node:assert"
import { clearProviderAdapters, getRegisteredAdapters, registerProviderAdapter } from "../lib/creative-os/film-kit/adapters"
import { registerProductionAdapters } from "../lib/creative-os/film-kit/adapters/index"
import { executeSandboxedPlan, RUNTIME_CONTRACT_FINGERPRINT } from "../lib/creative-os/film-kit/sandbox"
import { getRealHttpCallCount } from "../lib/creative-os/film-kit/adapters/cineprompt-transport"
import { ExternalCapabilityPlan, HumanApprovalDecision } from "../lib/creative-os/film-kit/types"
import crypto from "crypto"
import { setExecutionLedger, LocalPersistentExecutionLedger, InMemoryExecutionLedger } from "../lib/creative-os/film-kit/execution-ledger"
import path from "path"
import os from "os"

function hash(obj: unknown): string {
  const stableStr = JSON.stringify(obj, Object.keys(obj as object).sort())
  return crypto.createHash("sha256").update(stableStr).digest("hex").slice(0, 16)
}

import { createCinePromptAdapter } from "../lib/creative-os/film-kit/adapters/cineprompt-adapter"
import { FakeCinePromptTransport } from "../lib/creative-os/film-kit/adapters/cineprompt-transport"

describe("Attempt #3 Regression Tests", () => {

  test("without production bootstrap: CinePrompt adapter is unavailable", () => {
    clearProviderAdapters()
    const adapters = getRegisteredAdapters()
    assert.strictEqual(adapters.length, 0)
    const found = adapters.find(a => a.id === "adapter_cineprompt_share_link_v2")
    assert.ok(!found)
  })

  test("with canonical registerProductionAdapters and provider enablement configured externally: adapter_cineprompt_share_link_v2 becomes discoverable", () => {
    clearProviderAdapters()
    const oldEnv = process.env.CINEPROMPT_PROVIDER_ENABLED
    const oldKey = process.env.CINEPROMPT_API_KEY
    try {
      process.env.CINEPROMPT_PROVIDER_ENABLED = "true"
      process.env.CINEPROMPT_API_KEY = "dummy"
      registerProductionAdapters()
      
      const adapters = getRegisteredAdapters()
      const found = adapters.find(a => a.id === "adapter_cineprompt_share_link_v2")
      assert.ok(found)
    } finally {
      process.env.CINEPROMPT_PROVIDER_ENABLED = oldEnv
      process.env.CINEPROMPT_API_KEY = oldKey
    }
  })

  test("bootstrap alone performs 0 provider calls and HTTP calls", () => {
    clearProviderAdapters()
    const callsBefore = getRealHttpCallCount()
    const oldEnv = process.env.CINEPROMPT_PROVIDER_ENABLED
    const oldKey = process.env.CINEPROMPT_API_KEY
    try {
      process.env.CINEPROMPT_PROVIDER_ENABLED = "true"
      process.env.CINEPROMPT_API_KEY = "dummy"
      registerProductionAdapters()
      const callsAfter = getRealHttpCallCount()
      assert.strictEqual(callsAfter - callsBefore, 0)
    } finally {
      process.env.CINEPROMPT_PROVIDER_ENABLED = oldEnv
      process.env.CINEPROMPT_API_KEY = oldKey
    }
  })

  test("approval bound to 8dcb0425c38d0837 cannot authorize execution under the NEW runtime contract", async () => {
    // This is the old Attempt #3 fingerprint
    const OLD_RUNTIME_FINGERPRINT = "8dcb0425c38d0837"
    
    // Ensure the new fingerprint is different
    assert.notStrictEqual(RUNTIME_CONTRACT_FINGERPRINT, OLD_RUNTIME_FINGERPRINT)
    
    const plan: ExternalCapabilityPlan = {
      resourceId: "res_cineprompt",
      capabilityId: "PROMPT_SHARE_LINK_CREATION",
      decomposedCapabilities: ["CINEMATIC_PROMPTING"],
      requestedArtifact: "EXTERNAL_SHARE_REFERENCE",
      compatibilityStatus: "VERIFIED",
      compatibilityEvidence: null,
      lifecycleState: "TEST_CANDIDATE",
      currentAuthority: "EXPLICIT_EXTERNAL",
      requiredAuthority: "EXPLICIT_EXTERNAL",
      requiredHumanApproval: true,
      humanApprovalState: "REQUIRED",
      costStatus: "UNKNOWN",
      estimatedCost: null,
      privacyStatus: "UNKNOWN",
      licenseStatus: "UNKNOWN",
      requiredInputs: [],
      expectedOutputs: [],
      executionMode: "NOT_EXECUTED",
      executionStatus: "EXTERNAL_PLAN_READY",
      blockers: [],
      missingEvidence: [],
      planFingerprint: "dummy-plan-hash"
    }

    const approval = {
      approvalState: "GRANTED",
      projectId: "test_proj",
      projectBrainFingerprint: "test_brain",
      planFingerprint: plan.planFingerprint,
      resourceId: "res_cineprompt",
      capabilityId: "PROMPT_SHARE_LINK_CREATION",
      providerAdapterId: "adapter_cineprompt_share_link_v2",
      approvedAuthority: "EXPLICIT_EXTERNAL",
      costCeiling: "0",
      approvedConstraints: {},
      runtimeContractFingerprint: OLD_RUNTIME_FINGERPRINT // Bound to old fingerprint
    } as unknown as HumanApprovalDecision
    
    approval.approvalFingerprint = hash(approval) // Signed with old fingerprint

    const res = await executeSandboxedPlan(plan, "test_proj", "test_brain", approval, "EXPLICIT_EXTERNAL", {})
    assert.strictEqual(res.status, "APPROVAL_INVALID")
  })
  
  test("canonical plan.resourceId matches adapter resource binding and cost exception", async () => {
    clearProviderAdapters()
    registerProviderAdapter(createCinePromptAdapter(new FakeCinePromptTransport()))
    
    const plan: ExternalCapabilityPlan = {
      resourceId: "res_cineprompt",
      capabilityId: "PROMPT_SHARE_LINK_CREATION",
      decomposedCapabilities: ["CINEMATIC_PROMPTING"],
      requestedArtifact: "EXTERNAL_SHARE_REFERENCE",
      compatibilityStatus: "VERIFIED",
      compatibilityEvidence: null,
      lifecycleState: "TEST_CANDIDATE",
      currentAuthority: "EXPLICIT_EXTERNAL",
      requiredAuthority: "EXPLICIT_EXTERNAL",
      requiredHumanApproval: true,
      humanApprovalState: "REQUIRED",
      costStatus: "UNKNOWN",
      estimatedCost: null,
      privacyStatus: "UNKNOWN",
      licenseStatus: "UNKNOWN",
      requiredInputs: [],
      expectedOutputs: [],
      executionMode: "NOT_EXECUTED",
      executionStatus: "EXTERNAL_PLAN_READY",
      blockers: [],
      missingEvidence: [],
      planFingerprint: "dummy-plan-hash"
    }
    
    const approval = {
      approvalState: "GRANTED",
      projectId: "test_proj",
      projectBrainFingerprint: "test_brain",
      planFingerprint: plan.planFingerprint,
      resourceId: "res_cineprompt",
      capabilityId: "PROMPT_SHARE_LINK_CREATION",
      providerAdapterId: "adapter_cineprompt_share_link_v2",
      approvedAuthority: "EXPLICIT_EXTERNAL",
      costCeiling: "0",
      approvedConstraints: {
        subscriptionEntitlement: "HUMAN_ATTESTED_ACTIVE",
        downstreamSpend: "PROHIBITED",
        endpoint: "https://cineprompt.io/api/share"
      },
      runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT
    } as unknown as HumanApprovalDecision
    
    approval.approvalFingerprint = hash({
      approvalState: approval.approvalState,
      projectId: approval.projectId,
      projectBrainFingerprint: approval.projectBrainFingerprint,
      planFingerprint: approval.planFingerprint,
      resourceId: approval.resourceId,
      capabilityId: approval.capabilityId,
      providerAdapterId: approval.providerAdapterId,
      approvedAuthority: approval.approvedAuthority,
      costCeiling: approval.costCeiling,
      approvedConstraints: approval.approvedConstraints,
      runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT
    })

    const tmpLedger = path.join(os.tmpdir(), `attempt3-test-${Date.now()}.json`)
    setExecutionLedger(new LocalPersistentExecutionLedger(tmpLedger))

    const res = await executeSandboxedPlan(plan, "test_proj", "test_brain", approval, "EXPLICIT_EXTERNAL", {})
    
    setExecutionLedger(new InMemoryExecutionLedger())
    
    assert.notStrictEqual(res.status, "COST_BLOCKED")
    assert.strictEqual(res.status, "EXECUTED")
  })

  test("general cost bypass is NOT introduced for other resources", async () => {
    clearProviderAdapters()
    registerProviderAdapter(createCinePromptAdapter(new FakeCinePromptTransport()))
    
    const plan: ExternalCapabilityPlan = {
      resourceId: "res_other",
      capabilityId: "PROMPT_SHARE_LINK_CREATION",
      decomposedCapabilities: ["CINEMATIC_PROMPTING"],
      requestedArtifact: "EXTERNAL_SHARE_REFERENCE",
      compatibilityStatus: "VERIFIED",
      compatibilityEvidence: null,
      lifecycleState: "TEST_CANDIDATE",
      currentAuthority: "EXPLICIT_EXTERNAL",
      requiredAuthority: "EXPLICIT_EXTERNAL",
      requiredHumanApproval: true,
      humanApprovalState: "REQUIRED",
      costStatus: "UNKNOWN",
      estimatedCost: null,
      privacyStatus: "UNKNOWN",
      licenseStatus: "UNKNOWN",
      requiredInputs: [],
      expectedOutputs: [],
      executionMode: "NOT_EXECUTED",
      executionStatus: "EXTERNAL_PLAN_READY",
      blockers: [],
      missingEvidence: [],
      planFingerprint: "dummy-plan-hash"
    }
    
    const approval = {
      approvalState: "GRANTED",
      projectId: "test_proj",
      projectBrainFingerprint: "test_brain",
      planFingerprint: plan.planFingerprint,
      resourceId: "res_other",
      capabilityId: "PROMPT_SHARE_LINK_CREATION",
      providerAdapterId: "adapter_cineprompt_share_link_v2",
      approvedAuthority: "EXPLICIT_EXTERNAL",
      costCeiling: "0",
      approvedConstraints: {
        subscriptionEntitlement: "HUMAN_ATTESTED_ACTIVE",
        downstreamSpend: "PROHIBITED",
        endpoint: "https://cineprompt.io/api/share"
      },
      runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT
    } as unknown as HumanApprovalDecision
    
    approval.approvalFingerprint = hash({
      approvalState: approval.approvalState,
      projectId: approval.projectId,
      projectBrainFingerprint: approval.projectBrainFingerprint,
      planFingerprint: approval.planFingerprint,
      resourceId: approval.resourceId,
      capabilityId: approval.capabilityId,
      providerAdapterId: approval.providerAdapterId,
      approvedAuthority: approval.approvedAuthority,
      costCeiling: approval.costCeiling,
      approvedConstraints: approval.approvedConstraints,
      runtimeContractFingerprint: RUNTIME_CONTRACT_FINGERPRINT
    })

    const res = await executeSandboxedPlan(plan, "test_proj", "test_brain", approval, "EXPLICIT_EXTERNAL", {})
    
    assert.strictEqual(res.status, "ADAPTER_MISSING")
  })
})
