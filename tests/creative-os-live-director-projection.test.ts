import test from "node:test"
import assert from "node:assert/strict"

import { getProjectById } from "../lib/projects/selectors"
import {
  buildLiveDirectorProjection,
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

test("LIVE_DIRECTOR_PROJECTION_USES_CANONICAL_PROJECT_AND_GOVERNED_METHODS", () => {
  const project = getProjectById("stated")!
  const before = JSON.stringify(project)
  const projection = buildLiveDirectorProjection(project)

  assert.ok(projection)
  assert.equal(projection!.projectId, project.id)
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

test("UNMAPPED_PROJECT_KIND_DOES_NOT_GET_FORCED_INTO_A_DIRECTOR_MODE", () => {
  const project = getProjectById("stated")!
  const unsupported = { ...project, kind: "website" as const }
  assert.equal(buildLiveDirectorProjection(unsupported), null)
})
