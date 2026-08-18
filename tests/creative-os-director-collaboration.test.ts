import test from "node:test"
import assert from "node:assert/strict"

import { adaptDirectorResult, adaptProjectBrainToDirectorInput } from "../lib/director"
import { getProjectById } from "../lib/projects/selectors"
import { projectGovernedDirectorSkills } from "../lib/creative-os/collaboration"

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

test("DIRECTOR_GOVERNED_SKILL_PROJECTION_EXPOSES_ONLY_SIX_METHODS", () => {
  const projection = projectGovernedDirectorSkills()
  assert.equal(projection.valid, true)
  assert.equal(projection.skills.length, 6)
  assert.ok(projection.skills.every((skill) => skill.sourceEntityKind === "METHOD"))
  assert.ok(projection.skills.every((skill) => skill.skillId.startsWith("creative-os-registry-v2:")))
  assert.ok(projection.skills.every((skill) => skill.canonicalCapabilityRef === skill.skillId))
  assert.ok(projection.skills.every((skill) => typeof skill.runtimeMethodId === "string" && skill.runtimeMethodId.length > 0))
  assert.ok(projection.skills.every((skill) => skill.authorityRequirement === "suggest"))
  assert.ok(projection.skills.every((skill) => skill.status === "available"))
})

test("PROJECT_BRAIN_TO_DIRECTOR_INPUT_USES_GOVERNED_REGISTRY_METHODS", () => {
  const before = JSON.stringify(project)
  const input = adaptProjectBrainToDirectorInput(
    project,
    "HACKATHON",
    project.currentPhase,
    suggestAuthority,
    "2026-08-18T00:00:00.000Z"
  )

  assert.equal(input.availableSkills.length, 6)
  assert.ok(input.availableSkills.every((skill) => skill.sourceEntityKind === "METHOD"))
  assert.ok(input.availableSkills.every((skill) => skill.sourceLifecycleState === "VALIDATED" || skill.sourceLifecycleState === "APPROVED"))
  assert.equal(JSON.stringify(project), before, "Director capability projection must not mutate Project Brain")
})

test("DIRECTOR_SELECTS_MODE_PHASE_COMPATIBLE_GOVERNED_METHODS", () => {
  const input = adaptProjectBrainToDirectorInput(
    project,
    "HACKATHON",
    project.currentPhase,
    suggestAuthority,
    "2026-08-18T00:00:00.000Z"
  )
  const result = adaptDirectorResult(input)

  assert.ok(result.selectedSkills.length > 0)
  assert.ok(result.selectedSkills.every((skill) => skill.supportedModes.includes("HACKATHON")))
  assert.ok(result.selectedSkills.every((skill) => skill.supportedPhases.includes(result.resolvedPhase)))
  assert.ok(result.selectedSkills.every((skill) => skill.skillId.startsWith("creative-os-registry-v2:")))
  assert.ok(result.selectedSkills.some((skill) => skill.runtimeMethodId === "method_library_first_composition_router"))
  assert.equal(result.sideEffectPayload, null)
})

test("REFERENCE_SOURCE_RESOURCE_PROVIDER_NEVER_ENTER_DIRECTOR_SKILL_POOL", () => {
  const input = adaptProjectBrainToDirectorInput(
    project,
    "HACKATHON",
    project.currentPhase,
    suggestAuthority,
    "2026-08-18T00:00:00.000Z"
  )

  const forbiddenKinds = new Set(["REFERENCE", "SOURCE", "RESOURCE", "PROVIDER"])
  assert.ok(input.availableSkills.every((skill) => !forbiddenKinds.has(skill.sourceEntityKind ?? "")))
})

test("DIRECTOR_DOES_NOT_WIDEN_METHOD_ELIGIBILITY_AT_PREPARE_AUTHORITY", () => {
  const input = adaptProjectBrainToDirectorInput(
    project,
    "HACKATHON",
    project.currentPhase,
    {
      ...suggestAuthority,
      authorityLevel: "prepare" as const
    },
    "2026-08-18T00:00:00.000Z"
  )
  const result = adaptDirectorResult(input)

  assert.equal(input.availableSkills.length, 6, "Discovery remains available")
  assert.equal(result.selectedSkills.length, 0, "Strict authority compatibility prevents widening")
  assert.equal(result.sideEffectPayload, null)
})
