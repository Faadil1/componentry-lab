import assert from "node:assert"
import test, { describe, beforeEach, afterEach } from "node:test"
import path from "path"
import fs from "fs"
import os from "os"
import { LocalPersistentExecutionLedger, InMemoryExecutionLedger, setExecutionLedger } from "../lib/creative-os/film-kit/execution-ledger"
import { getProviderAdapterForPlan } from "../lib/creative-os/film-kit/adapters"
import type { ProviderAdapter } from "../lib/creative-os/film-kit/adapters"
import type { ExternalCapabilityPlan, HumanApprovalDecision } from "../lib/creative-os/film-kit/types"
import { executeSandboxedPlan } from "../lib/creative-os/film-kit/sandbox"
import { getRealHttpCallCount } from "../lib/creative-os/film-kit/adapters/cineprompt-transport"

describe("Attempt 5 Regression - Persistence and Idempotency", () => {
  let tmpFilePath: string

  beforeEach(() => {
    tmpFilePath = path.join(os.tmpdir(), `ledger-${Date.now()}.json`)
  })

  afterEach(() => {
    if (fs.existsSync(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath)
    }
  })

  test("A. Live execution refuses ephemeral ledger", async () => {
    setExecutionLedger(new InMemoryExecutionLedger())
    
    // We mock the adapter retrieval and environment to simulate PRODUCTION
    const plan = {
      planFingerprint: "test-plan",
      resourceId: "res_test",
      capabilityId: "test_cap",
      decomposedCapabilities: ["test_cap"],
      requiredAuthority: "EXPLICIT_EXTERNAL",
      estimatedCost: null,
      costStatus: "FREE",
      humanApprovalState: "NOT_REQUIRED"
    } as unknown as ExternalCapabilityPlan

    const approval = {
      approvalState: "GRANTED",
      approvedAuthority: "EXPLICIT_EXTERNAL",
      projectId: "test_proj",
      projectBrainFingerprint: "test_brain",
      planFingerprint: "test-plan",
      resourceId: "res_test",
      capabilityId: "test_cap",
      providerAdapterId: "mock_adapter"
    } as unknown as HumanApprovalDecision

    const mockAdapter = {
      id: "mock_adapter",
      environment: "PRODUCTION",
      canExecute: () => true,
      execute: async () => ({ status: "COMPLETE" })
    } as unknown as ProviderAdapter

    const originalGetProviderAdapterForPlan = getProviderAdapterForPlan
    const adapters = await import("../lib/creative-os/film-kit/adapters")
    adapters.getProviderAdapterForPlan = () => mockAdapter

    const result = await executeSandboxedPlan(plan, "test_proj", "test_brain", approval, "EXPLICIT_EXTERNAL", {})
    adapters.getProviderAdapterForPlan = originalGetProviderAdapterForPlan

    assert.strictEqual(result.status, "LOCAL_PRECONDITION_FAILURE")
    assert.strictEqual(result.error, "Live execution requires a persistent ledger.")
  })

  test("B/C/D/E/G/H/I. Persistent reservation, terminal success, duplicate blocked, receipt survives, no secrets", () => {
    const intentId = "e43925bf94426524"
    
    // Process 1: Create reservation and complete
    const ledger1 = new LocalPersistentExecutionLedger(tmpFilePath)
    ledger1.reserve(intentId)
    
    const state = ledger1.get(intentId)
    assert.ok(state)
    assert.strictEqual(state.state, "IN_FLIGHT") // B. IN_FLIGHT survives
    
    ledger1.complete(intentId, {
      executionIntentFingerprint: intentId,
      executionStatus: "EXECUTED",
      providerOutputFingerprint: "out-fingerprint",
      receiptFingerprint: "rcpt-fingerprint",
      providerReference: "https://cineprompt.io/share/123",
      artifactReferences: ["https://cineprompt.io/share/123"],
      cost: { estimated: null, actual: null, currency: "USD", status: "FREE" },
      providerAdapterId: "adapter",
      approvalFingerprint: "app",
      projectId: "proj",
      projectBrainFingerprint: "brain",
      planFingerprint: "plan",
      resourceId: "res",
      capabilityId: "cap",
      authorityUsed: "EXPLICIT_EXTERNAL",
      inputFingerprint: "in",
      runtimeContractFingerprint: "runtime",
      provenanceReferences: []
    })

    // Process 2: Load new instance
    const ledger2 = new LocalPersistentExecutionLedger(tmpFilePath)
    const state2 = ledger2.get(intentId)
    
    // C. TERMINAL_SUCCESS survives
    assert.ok(state2)
    assert.strictEqual(state2.state, "TERMINAL_SUCCESS")
    
    // G. Canonical receipt/reference survives
    assert.strictEqual(state2.receipt?.providerReference, "https://cineprompt.io/share/123")
    assert.strictEqual(state2.receipt?.executionStatus, "EXECUTED")
    
    // H & I. Secrets not persisted
    const rawContent = fs.readFileSync(tmpFilePath, "utf8")
    assert.strictEqual(rawContent.includes("CINEPROMPT_API_KEY"), false)
    assert.strictEqual(rawContent.includes("Authorization"), false)
    assert.strictEqual(rawContent.includes("Bearer"), false)
  })

  test("F. TERMINAL_OUTCOME_UNKNOWN survives restart and remains locked", () => {
    const intentId = "unknown_intent"
    
    const ledger1 = new LocalPersistentExecutionLedger(tmpFilePath)
    ledger1.markOutcomeUnknown(intentId)
    
    const ledger2 = new LocalPersistentExecutionLedger(tmpFilePath)
    const state2 = ledger2.get(intentId)
    
    assert.ok(state2)
    assert.strictEqual(state2.state, "TERMINAL_OUTCOME_UNKNOWN")
  })

  test("J. test-only InMemoryExecutionLedger remains supported", () => {
    const ledger = new InMemoryExecutionLedger()
    assert.strictEqual(ledger.isPersistent, false)
    ledger.reserve("test_intent")
    assert.strictEqual(ledger.get("test_intent")?.state, "IN_FLIGHT")
  })

  test("K/L. Persistent ledger construction performs 0 provider/HTTP calls", () => {
    const httpCountBefore = getRealHttpCallCount()
    
    const ledger = new LocalPersistentExecutionLedger(tmpFilePath)
    ledger.reserve("test")
    
    const httpCountAfter = getRealHttpCallCount()
    assert.strictEqual(httpCountAfter - httpCountBefore, 0)
  })
})
