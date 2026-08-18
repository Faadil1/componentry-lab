import test from "node:test"
import assert from "node:assert/strict"

import {
  COLLABORATION_SCHEMA_VERSION,
  serializeCollaborationValue,
  validateCollaborationExchange,
  validateCollaborationRequest,
  validateCollaborationResult,
  type CollaborationRequest,
  type CollaborationResult
} from "../lib/creative-os/collaboration"

function validRequest(): CollaborationRequest {
  return {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: "project-demo",
    correlationId: "corr-001",
    sourceSystem: "PROJECT_BRAIN",
    targetSystem: "CREATIVE_DIRECTOR",
    intent: "REQUEST_ADVISORY_WORK",
    projectPhase: "BUILD",
    projectMode: "HACKATHON",
    capabilityRefs: ["res_library_first_composition_router"],
    authorityContext: {
      currentAuthority: "SUGGEST",
      requestedAuthority: "SUGGEST",
      ownerSystem: null,
      humanReviewRequired: false
    },
    structuredInputs: { objective: "Choose the next governed move" },
    inputRefs: ["project-brain:project-demo"],
    evidenceRefs: [],
    requestedEffectClass: "NONE",
    hopTrace: [],
    status: "REQUESTED"
  }
}

function validResult(): CollaborationResult {
  return {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: "project-demo",
    correlationId: "corr-001",
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "PROJECT_BRAIN",
    capabilityUsed: "res_library_first_composition_router",
    resultStatus: "COMPLETE",
    structuredOutput: { nextAction: "Inspect eligible composition primitives" },
    qualityResults: [{ gate: "deterministic", passed: true }],
    evidenceRefs: ["evidence:director-result"],
    provenanceRefs: ["creative-director"],
    limitations: [],
    recommendedNextStep: "Surface the proposal in Project Brain",
    sideEffectRequest: null
  }
}

test("COLLABORATION_REQUEST_VALID_GATE", () => {
  const report = validateCollaborationRequest(validRequest())
  assert.equal(report.valid, true)
  assert.deepEqual(report.errors, [])
})

test("UNKNOWN_SYSTEM_FAILS_CLOSED", () => {
  const request = { ...validRequest(), targetSystem: "UNKNOWN_SYSTEM" }
  const report = validateCollaborationRequest(request)
  assert.equal(report.valid, false)
  assert.ok(report.errors.some((error) => error.includes("targetSystem is unknown")))
})

test("OWNER_MUTATION_REQUIRES_OWNER_AND_HUMAN_REVIEW", () => {
  const request = {
    ...validRequest(),
    targetSystem: "PROJECT_BRAIN",
    sourceSystem: "CREATIVE_DIRECTOR",
    intent: "PROPOSE_MUTATION",
    requestedEffectClass: "OWNER_STATE_MUTATION",
    authorityContext: {
      currentAuthority: "SUGGEST",
      requestedAuthority: "PREPARE",
      ownerSystem: null,
      humanReviewRequired: false
    }
  }
  const report = validateCollaborationRequest(request)
  assert.equal(report.valid, false)
  assert.ok(report.errors.some((error) => error.includes("declared ownerSystem")))
  assert.ok(report.errors.some((error) => error.includes("human review")))
})

test("EXTERNAL_EFFECT_REQUIRES_EXPLICIT_EXTERNAL_AUTHORITY", () => {
  const request = {
    ...validRequest(),
    requestedEffectClass: "EXTERNAL_SIDE_EFFECT",
    authorityContext: {
      currentAuthority: "SUGGEST",
      requestedAuthority: "SUGGEST",
      ownerSystem: null,
      humanReviewRequired: true
    }
  }
  const report = validateCollaborationRequest(request)
  assert.equal(report.valid, false)
  assert.ok(report.errors.some((error) => error.includes("EXPLICIT_EXTERNAL")))
})

test("REPEATED_DIRECTED_HOP_FAILS_CLOSED", () => {
  const request = {
    ...validRequest(),
    hopTrace: [{ sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" }]
  }
  const report = validateCollaborationRequest(request)
  assert.equal(report.valid, false)
  assert.ok(report.errors.some((error) => error.includes("repeats prior directed hop")))
})

test("COLLABORATION_RESULT_AND_EXCHANGE_GATE", () => {
  const resultReport = validateCollaborationResult(validResult())
  assert.equal(resultReport.valid, true)

  const exchange = validateCollaborationExchange(validRequest(), validResult())
  assert.equal(exchange.valid, true)
  assert.deepEqual(exchange.errors, [])

  const wrongResult = { ...validResult(), correlationId: "corr-other" }
  const wrongExchange = validateCollaborationExchange(validRequest(), wrongResult)
  assert.equal(wrongExchange.valid, false)
  assert.ok(wrongExchange.errors.some((error) => error.includes("correlationId")))
})

test("DETERMINISTIC_SERIALIZATION_NORMALIZES_OBJECT_KEYS", () => {
  const left = serializeCollaborationValue({ b: 2, a: { z: 3, y: 4 } })
  const right = serializeCollaborationValue({ a: { y: 4, z: 3 }, b: 2 })
  assert.equal(left, right)
  assert.equal(left, '{"a":{"y":4,"z":3},"b":2}')
})
