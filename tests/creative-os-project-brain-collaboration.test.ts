import test from "node:test"
import assert from "node:assert/strict"

import { getProjectById } from "../lib/projects/selectors"
import {
  COLLABORATION_SCHEMA_VERSION,
  createProjectBrainCollaborationRequest,
  projectCollaborationResultToProjectBrainProposal,
  type CollaborationResult
} from "../lib/creative-os/collaboration"

const project = getProjectById("stated")!

test("PROJECT_BRAIN_CONTEXT_REQUEST_IS_READ_ONLY_AND_CANONICAL", () => {
  const before = JSON.stringify(project)
  const projection = createProjectBrainCollaborationRequest(project, {
    correlationId: "project-stated-context-001",
    targetSystem: "CREATIVE_DIRECTOR",
    intent: "REQUEST_ADVISORY_WORK",
    capabilityRefs: ["creative-os-registry-v2:res_library_first_composition_router"]
  })

  assert.equal(projection.valid, true)
  assert.ok(projection.request)
  assert.equal(projection.request!.projectId, project.id)
  assert.equal(projection.request!.sourceSystem, "PROJECT_BRAIN")
  assert.equal(projection.request!.targetSystem, "CREATIVE_DIRECTOR")
  assert.equal(projection.request!.projectPhase, project.currentPhase)
  assert.equal(projection.request!.projectMode, project.kind)
  assert.equal(projection.request!.requestedEffectClass, "NONE")
  assert.equal(projection.request!.authorityContext.currentAuthority, "READ_ONLY")
  assert.equal(projection.request!.authorityContext.requestedAuthority, "READ_ONLY")
  assert.equal(projection.request!.authorityContext.ownerSystem, null)
  assert.equal(projection.request!.authorityContext.humanReviewRequired, false)
  assert.deepEqual(projection.request!.structuredInputs.projectBrain, project)
  assert.equal(JSON.stringify(project), before, "Project Brain remains immutable during projection")
})

test("PROJECT_BRAIN_REQUEST_EXPOSES_TRACEABLE_INPUT_AND_EVIDENCE_REFS", () => {
  const projection = createProjectBrainCollaborationRequest(project, {
    correlationId: "project-stated-context-002",
    targetSystem: "CREATIVE_METHOD_RUNTIME",
    inputRefs: ["custom-input:brief"],
    evidenceRefs: ["custom-evidence:gate"]
  })

  assert.equal(projection.valid, true)
  assert.ok(projection.request!.inputRefs.includes(`project-brain:${project.id}`))
  assert.ok(projection.request!.inputRefs.includes("custom-input:brief"))
  assert.ok(projection.request!.evidenceRefs.includes("custom-evidence:gate"))
  assert.deepEqual(
    projection.request!.capabilityRefs,
    [],
    "Project Brain adapter must not fabricate capability identity"
  )
})

test("INVALID_PROJECT_BRAIN_FAILS_CLOSED_BEFORE_COLLABORATION", () => {
  const invalidProject = { ...project, id: "" }
  const projection = createProjectBrainCollaborationRequest(invalidProject, {
    correlationId: "invalid-project",
    targetSystem: "CREATIVE_DIRECTOR"
  })

  assert.equal(projection.valid, false)
  assert.equal(projection.request, null)
  assert.ok(projection.errors.some((error) => error.includes("Project Brain integrity")))
})

test("PROJECT_BRAIN_SELF_ROUTING_FAILS_CLOSED", () => {
  const projection = createProjectBrainCollaborationRequest(project, {
    correlationId: "self-route",
    targetSystem: "PROJECT_BRAIN" as never
  })

  assert.equal(projection.valid, false)
  assert.equal(projection.request, null)
  assert.ok(projection.errors.some((error) => error.includes("sourceSystem and targetSystem")))
})

test("COLLABORATION_RESULT_RETURNS_AS_PROPOSAL_WITHOUT_PROJECT_MUTATION", () => {
  const requestProjection = createProjectBrainCollaborationRequest(project, {
    correlationId: "project-stated-result-001",
    targetSystem: "CREATIVE_DIRECTOR",
    intent: "REQUEST_ADVISORY_WORK"
  })
  assert.ok(requestProjection.request)

  const result: CollaborationResult = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: project.id,
    correlationId: requestProjection.request!.correlationId,
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "PROJECT_BRAIN",
    capabilityUsed: "creative-os-registry-v2:res_library_first_composition_router",
    resultStatus: "COMPLETE",
    structuredOutput: {
      proposalType: "NEXT_ACTION_INPUT",
      summary: "Inspect composition-ready candidates before build selection"
    },
    qualityResults: [{ gate: "read-only", passed: true }],
    evidenceRefs: ["director:evidence:001"],
    provenanceRefs: ["creative-director"],
    limitations: ["Advisory only"],
    recommendedNextStep: "Review proposal in Project Brain",
    sideEffectRequest: {
      ownerSystem: "PROJECT_BRAIN",
      effectClass: "OWNER_STATE_MUTATION",
      requestedAuthority: "PREPARE",
      humanReviewRequired: true,
      description: "Prepare an owner-reviewed next-action update"
    }
  }

  const before = JSON.stringify(project)
  const proposalProjection = projectCollaborationResultToProjectBrainProposal(
    project,
    requestProjection.request!,
    result
  )

  assert.equal(proposalProjection.valid, true)
  assert.ok(proposalProjection.proposal)
  assert.equal(proposalProjection.proposal!.mutationApplied, false)
  assert.equal(proposalProjection.proposal!.requiresOwnerReview, true)
  assert.deepEqual(proposalProjection.proposal!.sideEffectRequest, result.sideEffectRequest)
  assert.equal(JSON.stringify(project), before, "Result projection must not mutate Project Brain")
})

test("MISMATCHED_RESULT_CANNOT_BE_PROJECTED_BACK_TO_PROJECT_BRAIN", () => {
  const requestProjection = createProjectBrainCollaborationRequest(project, {
    correlationId: "project-stated-result-002",
    targetSystem: "CREATIVE_DIRECTOR"
  })
  assert.ok(requestProjection.request)

  const wrongResult: CollaborationResult = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: project.id,
    correlationId: "wrong-correlation",
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "PROJECT_BRAIN",
    capabilityUsed: null,
    resultStatus: "REJECTED",
    structuredOutput: {},
    qualityResults: [],
    evidenceRefs: [],
    provenanceRefs: [],
    limitations: [],
    recommendedNextStep: null,
    sideEffectRequest: null
  }

  const projection = projectCollaborationResultToProjectBrainProposal(
    project,
    requestProjection.request!,
    wrongResult
  )
  assert.equal(projection.valid, false)
  assert.equal(projection.proposal, null)
  assert.ok(projection.errors.some((error) => error.includes("correlationId")))
})
