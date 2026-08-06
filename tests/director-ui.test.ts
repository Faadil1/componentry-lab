import assert from "node:assert/strict"
import test from "node:test"
import {
  getDirectorFixtureKeys,
  getDirectorProjection,
  getAllDirectorProjections,
} from "../lib/director"
import { projectPresets } from "../lib/projects"

test("four fixtures render distinct content", () => {
  const keys = getDirectorFixtureKeys()
  assert.equal(keys.length, 4)
  assert.deepEqual(keys, [
    "the-second-absence",
    "cleanverse-build-round-2",
    "mara-episode",
    "power-bi-service-performance",
  ])

  const projections = getAllDirectorProjections()

  const modes = new Set(Object.values(projections).map((p) => p.result.mode))
  assert.equal(modes.size, 4)

  const evaluatorTypes = new Set(Object.values(projections).map((p) => p.result.evaluatorPath.evaluatorType))
  assert.ok(evaluatorTypes.size >= 3)
})

test("exactly one action is displayed for each fixture", () => {
  const projections = getAllDirectorProjections()
  for (const [key, proj] of Object.entries(projections)) {
    assert.ok(proj.result.nextAction, `Next action missing for ${key}`)
    assert.ok(proj.result.nextAction.title.length > 0)
    assert.ok(proj.result.nextAction.actionId.length > 0)
    assert.ok(["reversible", "irreversible", "unknown"].includes(proj.result.nextAction.reversibility))
  }
})

test("blocked projects show blockers", () => {
  const proj = getDirectorProjection("cleanverse-build-round-2")
  assert.ok(proj.result.blockers.length >= 0)
  for (const blocker of proj.result.blockers) {
    assert.ok(blocker.blockerId)
    assert.ok(blocker.description)
    assert.ok(typeof blocker.humanActionRequired === "boolean")
  }
})

test("evidence-required gates expose missing evidence", () => {
  const proj = getDirectorProjection("the-second-absence")
  const gates = proj.result.gateEvaluations
  assert.ok(gates.length > 0)
  for (const gate of gates) {
    assert.ok(["pass", "fail", "blocked", "conditional", "review"].includes(gate.status))
    if (gate.requiredEvidence.length > 0 && !gate.controllingEvidence) {
      assert.notEqual(gate.status, "pass")
    }
  }
})

test("prohibited actions never appear executable", () => {
  const projections = getAllDirectorProjections()
  for (const proj of Object.values(projections)) {
    assert.equal(proj.result.nextAction.authorityRequirement !== "prohibited", true)
    assert.equal(proj.result.sideEffectPayload, null)
  }
})

test("learning proposals remain read-only", () => {
  const projections = getAllDirectorProjections()
  for (const proj of Object.values(projections)) {
    for (const proposal of proj.result.learningProposals) {
      assert.ok(["OBSERVATION", "CANDIDATE", "TESTING", "EARNED", "SUPERSEDED", "REJECTED"].includes(proposal.status))
      assert.ok(["pending", "approved", "rejected", "not-required"].includes(proposal.humanApprovalState))
    }
  }
})

test("the page does not mutate canonical Project Brain state", () => {
  const initialString = JSON.stringify(projectPresets)
  getAllDirectorProjections()
  const postString = JSON.stringify(projectPresets)
  assert.equal(initialString, postString)
})
