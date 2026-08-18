import { describe, it } from "node:test"
import assert from "node:assert"

import {
  COLLABORATION_SCHEMA_VERSION,
  MAX_COLLABORATION_HOPS,
  serializeCollaborationEnvelope,
  validateCollaborationRequest,
  validateCollaborationResult,
  validateEffectAgainstAuthority,
  type CollaborationRequest,
  type CollaborationResult,
} from "../lib/collaboration"

function makeRequest(overrides: Partial<CollaborationRequest> = {}): CollaborationRequest {
  return {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    requestId: "req-001",
    projectId: "project-stated",
    correlationId: "corr-001",
    sourceSystem: "project-brain",
    targetSystem: "creative-director",
    intent: "Evaluate the canonical next action without mutating project state",
    projectMode: "HACKATHON",
    projectPhase: "BUILDING",
    capabilityRefs: [],
    authorityContext: {
      authorityLevel: "suggest",
      requestedAction: "inspect-project-context",
      target: "project-stated",
      reversibility: "unknown",
      risk: "low",
      approvalRequirement: "none",
      grantedScope: [],
      status: "pending",
    },
    inputRefs: [],
    structuredInputs: { projectId: "project-stated" },
    evidenceRefs: [],
    requestedEffectClass: "advisory",
    route: {
      visitedSystems: ["project-brain"],
      hopCount: 0,
      maxHops: MAX_COLLABORATION_HOPS,
    },
    status: "requested",
    ...overrides,
  }
}

function makeResult(overrides: Partial<CollaborationResult> = {}): CollaborationResult {
  return {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    requestId: "req-001",
    projectId: "project-stated",
    correlationId: "corr-001",
    sourceSystem: "creative-director",
    targetSystem: "project-brain",
    capabilityUsed: null,
    resultStatus: "completed",
    structuredOutput: { nextAction: "inspect" },
    qualityResults: [],
    evidenceRefs: [],
    provenance: ["creative-director"],
    limitations: [],
    recommendedNextStep: "Review the advisory result",
    sideEffectRequest: null,
    ...overrides,
  }
}

describe("Governed cross-system collaboration contract v1", () => {
  it("accepts a read-only advisory request with pending suggest authority", () => {
    const validation = validateCollaborationRequest(makeRequest())
    assert.deepStrictEqual(validation, { valid: true, errors: [] })
  })

  it("fails closed for an unknown system identity", () => {
    const request = makeRequest()
    ;(request as unknown as { targetSystem: string }).targetSystem = "unknown-orchestrator"

    const validation = validateCollaborationRequest(request)
    assert.strictEqual(validation.valid, false)
    assert.ok(validation.errors.some((error) => error.includes("unknown target system")))
  })

  it("rejects same-system requests to prevent hidden self-routing", () => {
    const request = makeRequest({ targetSystem: "project-brain" })
    const validation = validateCollaborationRequest(request)

    assert.strictEqual(validation.valid, false)
    assert.ok(validation.errors.includes("sourceSystem and targetSystem must differ"))
  })

  it("rejects a route that revisits the target system", () => {
    const request = makeRequest({
      sourceSystem: "creative-director",
      targetSystem: "registry-v2",
      route: {
        visitedSystems: ["project-brain", "registry-v2", "creative-director"],
        hopCount: 2,
        maxHops: MAX_COLLABORATION_HOPS,
      },
    })

    const validation = validateCollaborationRequest(request)
    assert.strictEqual(validation.valid, false)
    assert.ok(validation.errors.some((error) => error.includes("cycle detected")))
  })

  it("rejects repeated systems in traversal history", () => {
    const request = makeRequest({
      sourceSystem: "creative-director",
      targetSystem: "component-library",
      route: {
        visitedSystems: ["project-brain", "creative-director", "project-brain", "creative-director"],
        hopCount: 3,
        maxHops: MAX_COLLABORATION_HOPS,
      },
    })

    const validation = validateCollaborationRequest(request)
    assert.strictEqual(validation.valid, false)
    assert.ok(validation.errors.some((error) => error.includes("repeated system")))
  })

  it("rejects routes at or beyond the configured hop bound", () => {
    const request = makeRequest({
      route: {
        visitedSystems: ["project-brain"],
        hopCount: 0,
        maxHops: 0,
      },
    })

    const validation = validateCollaborationRequest(request)
    assert.strictEqual(validation.valid, false)
    assert.ok(validation.errors.some((error) => error.includes("maxHops")))
  })

  it("prohibits irreversible collaboration effects in v1 regardless of authority", () => {
    const validation = validateEffectAgainstAuthority("irreversible", {
      authorityLevel: "authorized-reversible-external-action",
      requestedAction: "publish",
      target: "external-target",
      reversibility: "irreversible",
      risk: "high",
      approvalRequirement: "explicit",
      grantedScope: ["publish"],
      status: "granted",
    })

    assert.strictEqual(validation.valid, false)
    assert.ok(validation.errors.some((error) => error.includes("irreversible effects are prohibited")))
  })

  it("does not allow routing to widen local reversible authority", () => {
    const request = makeRequest({
      requestedEffectClass: "local-reversible",
      authorityContext: {
        authorityLevel: "suggest",
        requestedAction: "mutate-local-state",
        target: "project-stated",
        reversibility: "reversible",
        risk: "low",
        approvalRequirement: "none",
        grantedScope: [],
        status: "pending",
      },
    })

    const validation = validateCollaborationRequest(request)
    assert.strictEqual(validation.valid, false)
    assert.ok(validation.errors.some((error) => error.includes("explicitly granted authority")))
    assert.ok(validation.errors.some((error) => error.includes("insufficient")))
  })

  it("requires explicit approval and scope for external reversible effects", () => {
    const request = makeRequest({
      requestedEffectClass: "external-reversible",
      authorityContext: {
        authorityLevel: "authorized-reversible-external-action",
        requestedAction: "external-update",
        target: "external-target",
        reversibility: "reversible",
        risk: "medium",
        approvalRequirement: "none",
        grantedScope: [],
        status: "granted",
      },
    })

    const validation = validateCollaborationRequest(request)
    assert.strictEqual(validation.valid, false)
    assert.ok(validation.errors.some((error) => error.includes("approval")))
    assert.ok(validation.errors.some((error) => error.includes("granted scope")))
  })

  it("accepts a properly scoped external reversible request without performing it", () => {
    const request = makeRequest({
      requestedEffectClass: "external-reversible",
      authorityContext: {
        authorityLevel: "authorized-reversible-external-action",
        requestedAction: "external-update",
        target: "external-target",
        reversibility: "reversible",
        risk: "medium",
        approvalRequirement: "explicit",
        grantedScope: ["external-update"],
        status: "granted",
      },
    })

    const validation = validateCollaborationRequest(request)
    assert.strictEqual(validation.valid, true)
    assert.deepStrictEqual(validation.errors, [])
  })

  it("keeps collaboration results side-effect free in v1", () => {
    const result = makeResult()
    assert.deepStrictEqual(validateCollaborationResult(result), { valid: true, errors: [] })

    ;(result as unknown as { sideEffectRequest: unknown }).sideEffectRequest = { type: "write" }
    const invalid = validateCollaborationResult(result)
    assert.strictEqual(invalid.valid, false)
    assert.ok(invalid.errors.includes("sideEffectRequest must remain null in collaboration contract v1"))
  })

  it("serializes envelopes deterministically regardless of object key insertion order", () => {
    const request = makeRequest({
      structuredInputs: { z: 1, nested: { beta: true, alpha: false }, a: 2 },
    })

    const equivalent = makeRequest({
      structuredInputs: { a: 2, nested: { alpha: false, beta: true }, z: 1 },
    })

    assert.strictEqual(
      serializeCollaborationEnvelope(request),
      serializeCollaborationEnvelope(equivalent),
    )
  })
})
