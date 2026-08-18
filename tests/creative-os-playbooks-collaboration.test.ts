import test from "node:test"
import assert from "node:assert/strict"

import {
  COLLABORATION_SCHEMA_VERSION,
  projectPlaybooksKnowledgeCollaboration,
  type CollaborationRequest,
} from "../lib/creative-os/collaboration"

function requestFor(query: string): CollaborationRequest {
  return {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: "stated",
    correlationId: "playbooks-knowledge-001",
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "PLAYBOOKS",
    intent: "REQUEST_CONTEXT",
    projectPhase: "build",
    projectMode: "HACKATHON",
    capabilityRefs: [],
    authorityContext: {
      currentAuthority: "READ_ONLY",
      requestedAuthority: "READ_ONLY",
      ownerSystem: null,
      humanReviewRequired: false,
    },
    structuredInputs: { query, limit: 4 },
    inputRefs: ["project-brain:stated"],
    evidenceRefs: ["director:knowledge-need:001"],
    requestedEffectClass: "NONE",
    hopTrace: [{ sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" }],
    status: "REQUESTED",
  }
}

test("PLAYBOOKS_RETURNS_READ_ONLY_KNOWLEDGE_METADATA", () => {
  const projection = projectPlaybooksKnowledgeCollaboration(requestFor("judge proof demo"))

  assert.equal(projection.valid, true)
  assert.ok(projection.result)
  assert.equal(projection.result!.sourceSystem, "PLAYBOOKS")
  assert.equal(projection.result!.targetSystem, "CREATIVE_DIRECTOR")
  assert.equal(projection.result!.capabilityUsed, null)
  assert.equal(projection.result!.sideEffectRequest, null)
  assert.ok(["COMPLETE", "NO_MATCH"].includes(projection.result!.resultStatus))
})

test("PLAYBOOKS_MATCHES_PRESERVE_RELATIONS_LIMITATIONS_AND_CLASSIFICATION", () => {
  const projection = projectPlaybooksKnowledgeCollaboration(requestFor("ui ux build"))
  assert.equal(projection.valid, true)
  assert.ok(projection.result)

  const matches = projection.result!.structuredOutput.matches
  assert.ok(Array.isArray(matches))
  assert.ok(matches.length > 0)

  const first = matches[0] as Record<string, unknown>
  assert.equal(typeof first.playbookRef, "string")
  assert.ok(Array.isArray(first.relatedRegistryIds))
  assert.ok(Array.isArray(first.recommendedFor))
  assert.ok(Array.isArray(first.limitations))
  assert.ok(first.classification === "public-playbook" || first.classification === "public-reference")
})

test("PLAYBOOKS_DOES_NOT_TRANSFER_FULL_MARKDOWN_OR_GRANT_CAPABILITY_AUTHORITY", () => {
  const projection = projectPlaybooksKnowledgeCollaboration(requestFor("video production"))
  assert.equal(projection.valid, true)
  assert.ok(projection.result)
  assert.equal(projection.result!.capabilityUsed, null)

  const serialized = JSON.stringify(projection.result)
  assert.equal(serialized.includes('"nodes"'), false)
  assert.ok(projection.result!.limitations.some((item) => item.includes("never grants execution authority")))
})

test("PLAYBOOKS_EXTERNAL_EFFECT_REQUEST_FAILS_CLOSED", () => {
  const request = {
    ...requestFor("demo"),
    requestedEffectClass: "EXTERNAL_SIDE_EFFECT" as const,
    authorityContext: {
      currentAuthority: "READ_ONLY" as const,
      requestedAuthority: "EXPLICIT_EXTERNAL" as const,
      ownerSystem: null,
      humanReviewRequired: true,
    },
  }

  const projection = projectPlaybooksKnowledgeCollaboration(request)
  assert.equal(projection.valid, false)
  assert.equal(projection.result, null)
  assert.ok(projection.errors.some((error) => error.includes("read-only")))
})

test("PLAYBOOKS_REQUEST_MUST_ORIGINATE_FROM_DIRECTOR", () => {
  const request = { ...requestFor("evidence"), sourceSystem: "PROJECT_BRAIN" as const }
  const projection = projectPlaybooksKnowledgeCollaboration(request)

  assert.equal(projection.valid, false)
  assert.equal(projection.result, null)
  assert.ok(projection.errors.some((error) => error.includes("CREATIVE_DIRECTOR")))
})

test("PLAYBOOKS_EMPTY_QUERY_FAILS_CLOSED", () => {
  const projection = projectPlaybooksKnowledgeCollaboration(requestFor("   "))
  assert.equal(projection.valid, false)
  assert.equal(projection.result, null)
  assert.ok(projection.errors.some((error) => error.includes("structuredInputs.query")))
})

test("PLAYBOOKS_KNOWLEDGE_COLLABORATION_IS_DETERMINISTIC", () => {
  const request = requestFor("hackathon evidence")
  const first = projectPlaybooksKnowledgeCollaboration(request)
  const second = projectPlaybooksKnowledgeCollaboration(request)

  assert.equal(first.valid, true)
  assert.equal(second.valid, true)
  assert.deepEqual(first.result, second.result)
})
