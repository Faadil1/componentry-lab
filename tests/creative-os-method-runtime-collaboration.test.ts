import test from "node:test"
import assert from "node:assert/strict"

import { adaptDirectorResult, adaptProjectBrainToDirectorInput } from "../lib/director"
import { getProjectById } from "../lib/projects/selectors"
import type { CreativeMethodInput } from "../lib/creative-os/methods"
import {
  COLLABORATION_SCHEMA_VERSION,
  GOVERNED_METHOD_RUNTIME_IDS,
  executeGovernedMethodCollaboration,
  type CollaborationRequest
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
  status: "pending" as const
}

function selectedLibraryFirstSkill() {
  const input = adaptProjectBrainToDirectorInput(
    project,
    "HACKATHON",
    project.currentPhase,
    suggestAuthority,
    "2026-08-18T00:00:00.000Z"
  )
  const directorResult = adaptDirectorResult(input)
  const skill = directorResult.selectedSkills.find(
    (candidate) => candidate.runtimeMethodId === "method_library_first_composition_router"
  )
  assert.ok(skill)
  return { skill, directorResult }
}

function runtimeRequest(skillId: string, phase: string): CollaborationRequest {
  return {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: project.id,
    correlationId: "method-runtime-001",
    sourceSystem: "CREATIVE_DIRECTOR",
    targetSystem: "CREATIVE_METHOD_RUNTIME",
    intent: "REQUEST_ADVISORY_WORK",
    projectPhase: phase,
    projectMode: "HACKATHON",
    capabilityRefs: [skillId],
    authorityContext: {
      currentAuthority: "SUGGEST",
      requestedAuthority: "SUGGEST",
      ownerSystem: null,
      humanReviewRequired: false
    },
    structuredInputs: { selectedCapabilityRef: skillId },
    inputRefs: [`project-brain:${project.id}`],
    evidenceRefs: ["director:selection:001"],
    requestedEffectClass: "NONE",
    hopTrace: [
      { sourceSystem: "PROJECT_BRAIN", targetSystem: "CREATIVE_DIRECTOR" }
    ],
    status: "REQUESTED"
  }
}

function methodInput(methodId: string, phase: CreativeMethodInput["phase"]): CreativeMethodInput {
  return {
    methodId,
    projectMode: "HACKATHON",
    phase,
    subjectDescription: "Compose the current product surface from governed internal primitives",
    subjectContext: "Componentry Lab governed collaboration feature preview",
    capabilityGap: "library-composition",
    evaluatorType: "judge",
    supplementaryFields: {
      requestedCapability: "layout",
      projectObjective: "build a governed composition",
      artifactType: "composition-tree",
      frameworkOrSurface: "React/NextJS"
    }
  }
}

test("GOVERNED_METHOD_DISPATCHER_IS_CLOSED_TO_SIX_INTERNAL_METHODS", () => {
  assert.equal(GOVERNED_METHOD_RUNTIME_IDS.length, 6)
  assert.ok(GOVERNED_METHOD_RUNTIME_IDS.includes("method_library_first_composition_router"))
})

test("DIRECTOR_SELECTED_METHOD_EXECUTES_THROUGH_COLLABORATION_RUNTIME", () => {
  const before = JSON.stringify(project)
  const { skill, directorResult } = selectedLibraryFirstSkill()
  const request = runtimeRequest(skill.skillId, directorResult.resolvedPhase)
  const input = methodInput(skill.runtimeMethodId!, directorResult.resolvedPhase)

  const execution = executeGovernedMethodCollaboration(request, skill, input)

  assert.equal(execution.valid, true)
  assert.ok(execution.execution)
  assert.ok(execution.result)
  assert.equal(execution.execution!.methodId, skill.runtimeMethodId)
  assert.equal(execution.execution!.isReadOnly, true)
  assert.equal(execution.execution!.sideEffects, null)
  assert.equal(execution.result!.sourceSystem, "CREATIVE_METHOD_RUNTIME")
  assert.equal(execution.result!.targetSystem, "CREATIVE_DIRECTOR")
  assert.equal(execution.result!.capabilityUsed, skill.skillId)
  assert.equal(execution.result!.sideEffectRequest, null)
  assert.ok(execution.result!.qualityResults.length > 0)
  assert.ok(execution.result!.provenanceRefs.includes(skill.skillId))
  assert.equal(JSON.stringify(project), before, "method collaboration must not mutate Project Brain")
})

test("RUNTIME_METHOD_ID_MISMATCH_FAILS_CLOSED", () => {
  const { skill, directorResult } = selectedLibraryFirstSkill()
  const request = runtimeRequest(skill.skillId, directorResult.resolvedPhase)
  const input = methodInput("method_sacred_rules_breaker", directorResult.resolvedPhase)

  const execution = executeGovernedMethodCollaboration(request, skill, input)
  assert.equal(execution.valid, false)
  assert.equal(execution.execution, null)
  assert.equal(execution.result, null)
  assert.ok(execution.errors.some((error) => error.includes("methodId must match")))
})

test("NON_METHOD_SKILL_CANNOT_ENTER_CREATIVE_METHOD_RUNTIME", () => {
  const { skill, directorResult } = selectedLibraryFirstSkill()
  const forged = { ...skill, sourceEntityKind: "REFERENCE" }
  const request = runtimeRequest(forged.skillId, directorResult.resolvedPhase)
  const input = methodInput(forged.runtimeMethodId!, directorResult.resolvedPhase)

  const execution = executeGovernedMethodCollaboration(request, forged, input)
  assert.equal(execution.valid, false)
  assert.ok(execution.errors.some((error) => error.includes("METHOD entity")))
})

test("SIDE_EFFECT_REQUEST_CANNOT_EXECUTE_IN_CREATIVE_METHOD_RUNTIME", () => {
  const { skill, directorResult } = selectedLibraryFirstSkill()
  const request = {
    ...runtimeRequest(skill.skillId, directorResult.resolvedPhase),
    requestedEffectClass: "EXTERNAL_SIDE_EFFECT" as const,
    authorityContext: {
      currentAuthority: "SUGGEST" as const,
      requestedAuthority: "EXPLICIT_EXTERNAL" as const,
      ownerSystem: null,
      humanReviewRequired: true
    }
  }
  const input = methodInput(skill.runtimeMethodId!, directorResult.resolvedPhase)

  const execution = executeGovernedMethodCollaboration(request, skill, input)
  assert.equal(execution.valid, false)
  assert.equal(execution.execution, null)
  assert.ok(execution.errors.some((error) => error.includes("effect class NONE")))
})

test("CREATIVE_METHOD_COLLABORATION_IS_DETERMINISTIC_FOR_SAME_INPUT", () => {
  const { skill, directorResult } = selectedLibraryFirstSkill()
  const request = runtimeRequest(skill.skillId, directorResult.resolvedPhase)
  const input = methodInput(skill.runtimeMethodId!, directorResult.resolvedPhase)

  const first = executeGovernedMethodCollaboration(request, skill, input)
  const second = executeGovernedMethodCollaboration(request, skill, input)
  assert.equal(first.valid, true)
  assert.equal(second.valid, true)
  assert.deepEqual(first.result, second.result)
  assert.deepEqual(first.execution, second.execution)
})
