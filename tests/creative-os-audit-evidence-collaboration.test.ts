import test from "node:test"
import assert from "node:assert/strict"

import {
  COLLABORATION_SCHEMA_VERSION,
  projectAuditEvidenceCollaboration,
  type CollaborationRequest,
  type CollaborationSystemId,
} from "../lib/creative-os/collaboration"

function requestFor(sourceSystem: CollaborationSystemId = "CREATIVE_METHOD_RUNTIME"): CollaborationRequest {
  return {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: "stated",
    correlationId: "audit-evidence-001",
    sourceSystem,
    targetSystem: "AUDIT_EVIDENCE",
    intent: "RETURN_EVIDENCE",
    projectPhase: "verify",
    projectMode: "HACKATHON",
    capabilityRefs: [],
    authorityContext: {
      currentAuthority: "READ_ONLY",
      requestedAuthority: "READ_ONLY",
      ownerSystem: null,
      humanReviewRequired: false,
    },
    structuredInputs: {
      subject: "Creative Method advisory result",
      claimedStatus: "PASS",
      qualityGateRefs: ["quality:method:gate-1"],
      limitationRefs: ["limitation:advisory-only"],
      provenanceRefs: ["creative-method-runtime:library-first-composition-router"],
    },
    inputRefs: ["project-brain:stated"],
    evidenceRefs: ["method:evidence:002", "method:evidence:001", "method:evidence:001"],
    requestedEffectClass: "NONE",
    hopTrace: [
      { sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" },
      { sourceSystem: "CREATIVE_DIRECTOR", targetSystem: sourceSystem },
    ],
    status: "REQUESTED",
  }
}

test("AUDIT_EVIDENCE_NORMALIZES_TRACE_WITHOUT_PERSISTENCE_OR_MUTATION", () => {
  const projection = projectAuditEvidenceCollaboration(requestFor())

  assert.equal(projection.valid, true)
  assert.ok(projection.result)
  assert.equal(projection.result!.sourceSystem, "AUDIT_EVIDENCE")
  assert.equal(projection.result!.targetSystem, "CREATIVE_METHOD_RUNTIME")
  assert.equal(projection.result!.capabilityUsed, null)
  assert.equal(projection.result!.sideEffectRequest, null)
  assert.equal(projection.result!.structuredOutput.persistenceApplied, false)
  assert.equal(projection.result!.structuredOutput.mutationApplied, false)
})

test("AUDIT_EVIDENCE_DEDUPLICATES_AND_SORTS_EVIDENCE_REFS_DETERMINISTICALLY", () => {
  const projection = projectAuditEvidenceCollaboration(requestFor())
  assert.equal(projection.valid, true)
  assert.deepEqual(projection.result!.evidenceRefs, ["method:evidence:001", "method:evidence:002"])
})

test("AUDIT_EVIDENCE_ACCEPTS_KNOWN_EVIDENCE_PRODUCERS", () => {
  const sources: CollaborationSystemId[] = [
    "CREATIVE_DIRECTOR",
    "CREATIVE_METHOD_RUNTIME",
    "FILM_KIT",
    "PLAYBOOKS",
    "CREATIVE_OS_REGISTRY_V2",
    "COMPONENT_LIBRARY",
  ]

  for (const source of sources) {
    const request = requestFor(source)
    request.hopTrace = []
    const projection = projectAuditEvidenceCollaboration(request)
    assert.equal(projection.valid, true, source)
    assert.equal(projection.result!.targetSystem, source)
  }
})

test("PROJECT_BRAIN_CANNOT_BYPASS_PROPOSAL_PATH_BY_WRITING_DIRECTLY_TO_AUDIT", () => {
  const request = requestFor("PROJECT_BRAIN")
  request.hopTrace = []
  const projection = projectAuditEvidenceCollaboration(request)

  assert.equal(projection.valid, false)
  assert.equal(projection.result, null)
  assert.ok(projection.errors.some((error) => error.includes("approved evidence-producing collaborator")))
})

test("AUDIT_EVIDENCE_REQUIRES_EVIDENCE_REFS_AND_SUBJECT", () => {
  const request = {
    ...requestFor(),
    evidenceRefs: [],
    structuredInputs: { subject: "" },
  }
  const projection = projectAuditEvidenceCollaboration(request)

  assert.equal(projection.valid, false)
  assert.equal(projection.result, null)
  assert.ok(projection.errors.some((error) => error.includes("at least one evidenceRef")))
  assert.ok(projection.errors.some((error) => error.includes("structuredInputs.subject")))
})

test("AUDIT_EVIDENCE_MUTATION_OR_EXTERNAL_EFFECT_FAILS_CLOSED", () => {
  for (const effect of ["OWNER_STATE_MUTATION", "EXTERNAL_SIDE_EFFECT"] as const) {
    const request = {
      ...requestFor(),
      requestedEffectClass: effect,
      authorityContext: {
        currentAuthority: "READ_ONLY" as const,
        requestedAuthority: effect === "EXTERNAL_SIDE_EFFECT" ? "EXPLICIT_EXTERNAL" as const : "SUGGEST" as const,
        ownerSystem: effect === "OWNER_STATE_MUTATION" ? "AUDIT_EVIDENCE" as const : null,
        humanReviewRequired: true,
      },
    }
    const projection = projectAuditEvidenceCollaboration(request)
    assert.equal(projection.valid, false, effect)
    assert.equal(projection.result, null)
    assert.ok(projection.errors.some((error) => error.includes("projection-only")))
  }
})

test("AUDIT_EVIDENCE_DOES_NOT_CLAIM_INDEPENDENT_VERIFICATION", () => {
  const projection = projectAuditEvidenceCollaboration(requestFor("FILM_KIT"))
  assert.equal(projection.valid, true)
  assert.ok(projection.result!.limitations.some((item) => item.includes("not a claim")))
})

test("AUDIT_EVIDENCE_PROJECTION_IS_DETERMINISTIC", () => {
  const request = requestFor("PLAYBOOKS")
  request.hopTrace = []
  const first = projectAuditEvidenceCollaboration(request)
  const second = projectAuditEvidenceCollaboration(request)

  assert.equal(first.valid, true)
  assert.equal(second.valid, true)
  assert.deepEqual(first.result, second.result)
})
