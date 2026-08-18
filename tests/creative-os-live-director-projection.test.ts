import test from "node:test"
import assert from "node:assert/strict"

import { getProjectById } from "../lib/projects/selectors"
import {
  buildLiveDirectorProjection,
  resolveDirectorModeForProject,
  resolveDirectorModeForProjectKind,
} from "../lib/director/live-projection"

test("LIVE_DIRECTOR_PROJECT_KIND_MAPPING_IS_EXPLICIT_AND_FAILS_CLOSED", () => {
  assert.equal(resolveDirectorModeForProjectKind("hackathon"), "HACKATHON")
  assert.equal(resolveDirectorModeForProjectKind("data-story"), "DATA_STORY")
  assert.equal(resolveDirectorModeForProjectKind("design-challenge"), "DAY_CHALLENGE")
  assert.equal(resolveDirectorModeForProjectKind("creative-experiment"), "DAY_CHALLENGE")
  assert.equal(resolveDirectorModeForProjectKind("demo-film"), "MARA")
  assert.equal(resolveDirectorModeForProjectKind("website"), null)
  assert.equal(resolveDirectorModeForProjectKind("internal-tool"), null)
})

test("LIVE_DIRECTOR_CAN_RESOLVE_MODE_FROM_NON_AMBIGUOUS_PROJECT_BRAIN_EVIDENCE", () => {
  const project = getProjectById("stated")!
  assert.equal(project.kind, "product-prototype")
  const resolved = resolveDirectorModeForProject(project)
  assert.deepEqual(resolved, { mode: "HACKATHON", resolution: "PROJECT_EVIDENCE" })
})

test("LIVE_DIRECTOR_PROJECTION_USES_CANONICAL_PROJECT_AND_GOVERNED_METHODS", () => {
  const project = getProjectById("stated")!
  const before = JSON.stringify(project)
  const projection = buildLiveDirectorProjection(project)

  assert.ok(projection)
  assert.equal(projection!.projectId, project.id)
  assert.equal(projection!.mode, "HACKATHON")
  assert.equal(projection!.modeResolution, "PROJECT_EVIDENCE")
  assert.equal(projection!.input.project, project)
  assert.equal(projection!.input.availableSkills.length, 6)
  assert.ok(projection!.input.availableSkills.every((skill) => skill.sourceEntityKind === "METHOD"))
  assert.equal(projection!.result.sideEffectPayload, null)
  assert.ok(projection!.result.nextAction)
  assert.equal(JSON.stringify(project), before)
})

test("LIVE_DIRECTOR_PROJECTION_IS_DETERMINISTIC_FOR_SAME_PROJECT_STATE", () => {
  const project = getProjectById("stated")!
  const first = buildLiveDirectorProjection(project)
  const second = buildLiveDirectorProjection(project)

  assert.ok(first)
  assert.ok(second)
  assert.deepEqual(first, second)
})

test("LIVE_DIRECTOR_SKIPS_DONE_ACTION_AND_ROUTES_TO_EXISTING_NON_TERMINAL_ACTION", () => {
  const source = getProjectById("stated")!
  const project = structuredClone(source)
  project.nextActions = [
    { ...project.nextActions[0], status: "done" },
    {
      id: "act2",
      label: "Verify submission bundle",
      description: "Review the existing proof bundle before submission.",
      phase: "verify",
      status: "todo",
    },
  ]
  const before = JSON.stringify(project)

  const projection = buildLiveDirectorProjection(project)

  assert.ok(projection)
  assert.equal(projection!.result.nextAction.actionId, "act2")
  assert.equal(projection!.result.nextAction.title, "Verify submission bundle")
  assert.notEqual(projection!.result.nextAction.actionId, "act1")
  assert.equal(projection!.result.sideEffectPayload, null)
  assert.equal(JSON.stringify(project), before)
})

test("LIVE_DIRECTOR_USES_DETERMINISTIC_READ_ONLY_FALLBACK_WHEN_ALL_CANONICAL_ACTIONS_ARE_DONE", () => {
  const source = getProjectById("stated")!
  const project = structuredClone(source)
  project.nextActions = [{ ...project.nextActions[0], status: "done" }]
  const before = JSON.stringify(project)

  const first = buildLiveDirectorProjection(project)
  const second = buildLiveDirectorProjection(project)

  assert.ok(first)
  assert.ok(second)
  assert.equal(first!.result.nextAction.actionId, "stated-hackathon-safe-action")
  assert.equal(first!.result.nextAction.title, "Prepare hackathon demo review")
  assert.equal(first!.result.nextAction.actionType, "next-action")
  assert.equal(first!.result.sideEffectPayload, null)
  assert.deepEqual(first, second)
  assert.equal(JSON.stringify(project), before)
})

test("UNMAPPED_PROJECT_WITHOUT_MODE_EVIDENCE_DOES_NOT_GET_FORCED_INTO_A_DIRECTOR_MODE", () => {
  const project = getProjectById("stated")!
  const unsupported = {
    ...project,
    kind: "website" as const,
    challenge: "General website refresh",
    selectedPlaybookIds: ["system-principles"],
    videoPlan: {
      ...project.videoPlan,
      audience: "General website visitors",
    },
  }
  assert.deepEqual(resolveDirectorModeForProject(unsupported), { mode: null, resolution: "UNMAPPED" })
  assert.equal(buildLiveDirectorProjection(unsupported), null)
})
