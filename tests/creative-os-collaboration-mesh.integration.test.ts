import test from "node:test"
import assert from "node:assert/strict"

import { adaptDirectorResult, adaptProjectBrainToDirectorInput } from "../lib/director"
import { buildFilmProject } from "../lib/film-kit"
import { getProjectById } from "../lib/projects/selectors"
import type { CreativeMethodInput } from "../lib/creative-os/methods"
import {
  COLLABORATION_SCHEMA_VERSION,
  buildDualLibraryProjection,
  createProjectBrainCollaborationRequest,
  executeGovernedMethodCollaboration,
  projectAuditEvidenceCollaboration,
  projectFilmKitPlanningCollaboration,
  projectPlaybooksKnowledgeCollaboration,
  type CollaborationRequest,
} from "../lib/creative-os/collaboration"

const project = getProjectById("stated")!

const suggestAuthority = {
  authorityLevel: "suggest" as const,
  requestedAction: "",
  target: project.id,
  reversibility: "unknown" as const,
  risk: "low" as const,
  approvalRequirement: "none" as const,
  grantedScope: [],
  status: "pending" as const,
}

test("GOVERNED_COLLABORATION_MESH_PROVES_ALL_CURRENT_SYSTEM_PLANES_WITHOUT_MUTATION", () => {
  const projectBefore = JSON.stringify(project)

  // 1. Project Brain supplies canonical context without mutation.
  const projectRequest = createProjectBrainCollaborationRequest(project, {
    correlationId: "mesh-project-director-001",
    targetSystem: "CREATIVE_DIRECTOR",
    intent: "REQUEST_ADVISORY_WORK",
  })
  assert.equal(projectRequest.valid, true)
  assert.ok(projectRequest.request)

  // 2. Both Library planes participate distinctly: Registry V2 governs; Component Library composes.
  const libraries = buildDualLibraryProjection()
  assert.equal(libraries.valid, true)
  assert.equal(libraries.governedCapabilities.length, 35)
  assert.ok(libraries.compositions.length > 0)
  assert.ok(libraries.governedCapabilities.some((entry) => entry.entityKind === "REFERENCE" && entry.collaborationAccess === "READ_DISCOVERY_ONLY"))
  assert.ok(libraries.governedCapabilities.some((entry) => entry.entityKind === "SOURCE" && entry.collaborationAccess === "READ_DISCOVERY_ONLY"))
  assert.ok(libraries.compositions.some((entry) => entry.canonicalRef === "component-library:capture-bridge"))

  // 3. Director consumes governed methods and keeps one canonical next action contract.
  const directorInput = adaptProjectBrainToDirectorInput(
    project,
    "HACKATHON",
    project.currentPhase,
    suggestAuthority,
    "2026-08-18T00:00:00.000Z",
  )
  const directorResult = adaptDirectorResult(directorInput)
  assert.equal(directorInput.availableSkills.length, 6)
  assert.equal(directorResult.sideEffectPayload, null)
  assert.ok(directorResult.nextAction)

  const skill = directorResult.selectedSkills.find(
    (candidate) => candidate.runtimeMethodId === "method_library_first_composition_router",
  )
  assert.ok(skill)

  // 4. Creative Method Runtime executes only the Director-selected governed internal method.
  const runtimeRequest: CollaborationRequest = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: project.id,
    correlationId: "mesh-method-001",
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "CREATIVE_METHOD_RUNTIME",
    intent: "REQUEST_ADVISORY_WORK",
    projectPhase: directorResult.resolvedPhase,
    projectMode: "HACKATHON",
    capabilityRefs: [skill!.skillId],
    authorityContext: {
      currentAuthority: "SUGGEST",
      requestedAuthority: "SUGGEST",
      ownerSystem: null,
      humanReviewRequired: false,
    },
    structuredInputs: { selectedCapabilityRef: skill!.skillId },
    inputRefs: [`project-brain:${project.id}`],
    evidenceRefs: ["director:selection:mesh"],
    requestedEffectClass: "NONE",
    hopTrace: [{ sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" }],
    status: "REQUESTED",
  }
  const methodInput: CreativeMethodInput = {
    methodId: skill!.runtimeMethodId!,
    projectMode: "HACKATHON",
    phase: directorResult.resolvedPhase,
    subjectDescription: "Compose the current product surface from governed internal primitives",
    subjectContext: "Integrated governed collaboration mesh QA",
    capabilityGap: "library-composition",
    evaluatorType: "judge",
    supplementaryFields: {
      requestedCapability: "layout",
      projectObjective: "prove governed cross-system collaboration",
      artifactType: "composition-tree",
      frameworkOrSurface: "React/NextJS",
    },
  }
  const methodExecution = executeGovernedMethodCollaboration(runtimeRequest, skill!, methodInput)
  assert.equal(methodExecution.valid, true)
  assert.ok(methodExecution.result)
  assert.equal(methodExecution.result!.sideEffectRequest, null)

  // 5. Method evidence is normalized by Audit/Evidence without persistence or truth inflation.
  const auditRequest: CollaborationRequest = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: project.id,
    correlationId: "mesh-audit-001",
    sourceSystem: "CREATIVE_METHOD_RUNTIME",
    targetSystem: "AUDIT_EVIDENCE",
    intent: "RETURN_EVIDENCE",
    projectPhase: directorResult.resolvedPhase,
    projectMode: "HACKATHON",
    capabilityRefs: [skill!.skillId],
    authorityContext: {
      currentAuthority: "READ_ONLY",
      requestedAuthority: "READ_ONLY",
      ownerSystem: null,
      humanReviewRequired: false,
    },
    structuredInputs: {
      subject: "Integrated Creative Method result",
      claimedStatus: methodExecution.result!.resultStatus,
      provenanceRefs: [...methodExecution.result!.provenanceRefs],
      limitationRefs: [...methodExecution.result!.limitations],
    },
    inputRefs: [`collaboration:${runtimeRequest.correlationId}`],
    evidenceRefs: [...methodExecution.result!.evidenceRefs],
    requestedEffectClass: "NONE",
    hopTrace: [
      { sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" },
      { sourceSystem: "CREATIVE_DIRECTOR", targetSystem: "CREATIVE_METHOD_RUNTIME" },
    ],
    status: "REQUESTED",
  }
  const auditProjection = projectAuditEvidenceCollaboration(auditRequest)
  assert.equal(auditProjection.valid, true)
  assert.equal(auditProjection.result!.structuredOutput.persistenceApplied, false)
  assert.equal(auditProjection.result!.structuredOutput.mutationApplied, false)

  // 6. Playbooks contributes knowledge only, never executable authority.
  const playbookRequest: CollaborationRequest = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: project.id,
    correlationId: "mesh-playbooks-001",
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "PLAYBOOKS",
    intent: "REQUEST_CONTEXT",
    projectPhase: directorResult.resolvedPhase,
    projectMode: "HACKATHON",
    capabilityRefs: [],
    authorityContext: {
      currentAuthority: "READ_ONLY",
      requestedAuthority: "READ_ONLY",
      ownerSystem: null,
      humanReviewRequired: false,
    },
    structuredInputs: { query: "judge proof demo", limit: 3 },
    inputRefs: [`project-brain:${project.id}`],
    evidenceRefs: ["director:knowledge-need:mesh"],
    requestedEffectClass: "NONE",
    hopTrace: [{ sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" }],
    status: "REQUESTED",
  }
  const playbooks = projectPlaybooksKnowledgeCollaboration(playbookRequest)
  assert.equal(playbooks.valid, true)
  assert.equal(playbooks.result!.capabilityUsed, null)
  assert.equal(playbooks.result!.sideEffectRequest, null)

  // 7. Film Kit contributes honest planning intent without inventing production truth.
  const film = buildFilmProject(project.id)
  const filmRequest: CollaborationRequest = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: project.id,
    correlationId: "mesh-film-kit-001",
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "FILM_KIT",
    intent: "REQUEST_PRODUCTION",
    projectPhase: directorResult.resolvedPhase,
    projectMode: "HACKATHON",
    capabilityRefs: [],
    authorityContext: {
      currentAuthority: "READ_ONLY",
      requestedAuthority: "READ_ONLY",
      ownerSystem: null,
      humanReviewRequired: false,
    },
    structuredInputs: { productionNeed: "Plan judge-facing proof film" },
    inputRefs: [`project-brain:${project.id}`],
    evidenceRefs: ["director:production-need:mesh"],
    requestedEffectClass: "NONE",
    hopTrace: [{ sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" }],
    status: "REQUESTED",
  }
  const filmProjection = projectFilmKitPlanningCollaboration(filmRequest, film)
  assert.equal(filmProjection.valid, true)
  assert.equal(filmProjection.result!.capabilityUsed, null)
  assert.equal(filmProjection.result!.sideEffectRequest, null)

  // Global invariant: this entire representative mesh is read-only against Project Brain.
  assert.equal(JSON.stringify(project), projectBefore)
})
