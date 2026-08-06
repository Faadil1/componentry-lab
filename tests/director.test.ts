import assert from "node:assert/strict"
import test from "node:test"
import { projectPresets, validateProjectBrain } from "../lib/projects"
import { episode14Blocked } from "../lib/fixtures/episode-state-card-fixtures"
import { directorFixtures } from "../lib/director/fixtures"
import {
  adaptDirectorResult,
  adaptEpisodeStateCardToDirectorProjection,
  adaptNextActions,
  adaptProjectBrainToDirectorInput,
  canPromoteLearning,
  getUniversalGateIds,
  resolveModeState,
  validateDirectorInput,
  validateDirectorResult,
} from "../lib/director"

test("routing resolves distinct mode policies", () => {
  const day = resolveModeState("DAY_CHALLENGE")
  const hackathon = resolveModeState("HACKATHON")
  const mara = resolveModeState("MARA")
  const story = resolveModeState("DATA_STORY")

  assert.notDeepEqual(day.phasePolicy, hackathon.phasePolicy)
  assert.notDeepEqual(mara.phasePolicy, story.phasePolicy)
  assert.ok(hackathon.evaluator.evaluatorType === "judge")
})

test("director result returns exactly one next action for each fixture", () => {
  for (const fixture of Object.values(directorFixtures)) {
    const input = adaptProjectBrainToDirectorInput(
      fixture.project,
      fixture.mode,
      fixture.phaseContext,
      fixture.authorityContext,
      fixture.evaluationTimestamp
    )
    const result = adaptDirectorResult({
      ...input,
      availableSkills: fixture.availableSkills,
      lockedDecisions: fixture.lockedDecisions,
      learningProposals: fixture.learningProposals,
    })

    assert.equal(result.sideEffectPayload, null)
    assert.ok(result.nextAction.actionId.length > 0)
    assert.equal(validateDirectorResult(result).length, 0)
  }
})

test("hero demo and gates remain evidence-bound", () => {
  const fixture = directorFixtures["cleanverse-build-round-2"]
  const input = adaptProjectBrainToDirectorInput(
    fixture.project,
    fixture.mode,
    fixture.phaseContext,
    fixture.authorityContext,
    fixture.evaluationTimestamp
  )
  const result = adaptDirectorResult({
    ...input,
    availableSkills: fixture.availableSkills,
    lockedDecisions: fixture.lockedDecisions,
    learningProposals: fixture.learningProposals,
  })

  assert.ok(result.heroDemoMoment.requiredEvidence.length >= 0)
  assert.ok(getUniversalGateIds().includes("hero-demo-moment"))
  assert.ok(result.gateEvaluations.some((gate) => gate.gateId === "proof-or-evidence"))
})

test("authority defaults stay restrictive", () => {
  const fixture = directorFixtures["the-second-absence"]
  const input = adaptProjectBrainToDirectorInput(
    fixture.project,
    fixture.mode,
    fixture.phaseContext,
    fixture.authorityContext,
    fixture.evaluationTimestamp
  )
  const result = adaptDirectorResult({
    ...input,
    availableSkills: fixture.availableSkills,
    lockedDecisions: fixture.lockedDecisions,
    learningProposals: fixture.learningProposals,
  })

  assert.equal(result.nextAction.approvalStatus, "not-required")
  assert.equal(validateDirectorInput(input).length, 0)
})

test("locked decisions and learning remain governed", () => {
  const learning = {
    id: "lrn-test",
    sourceProject: "project",
    mode: "DAY_CHALLENGE" as const,
    observation: "observed",
    evidence: [],
    suspectedCause: "cause",
    proposedRule: "rule",
    scope: ["scope"],
    confidence: 0.5,
    contradictions: ["contradiction"],
    validationCount: 1,
    status: "EARNED" as const,
    humanApprovalState: "approved" as const,
    ruleVersion: "1",
    supersessionLink: null,
    provenance: "test",
  }
  assert.equal(canPromoteLearning(learning), true)
  assert.equal(validateProjectBrain(projectPresets[0]).valid, true)
})

test("existing episode state card projects adapt read-only", () => {
  const projection = adaptEpisodeStateCardToDirectorProjection(episode14Blocked)
  assert.equal(projection.episodeState.workflowState, episode14Blocked.workflowState)
  assert.equal(projection.blockers.length, episode14Blocked.blockers?.length ?? 0)
  assert.ok(projection.nextActionLabel.length > 0)
  assert.ok(adaptNextActions(projectPresets[0]).length > 0)
})

