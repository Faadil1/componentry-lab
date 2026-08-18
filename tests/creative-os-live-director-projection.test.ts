import test from "node:test"
import assert from "node:assert/strict"

import { projectDirectorNextActionToGovernedCompleteIntent } from "../lib/creative-os/action-plane"
import { getProjectById } from "../lib/projects/selectors"
import {
  buildLiveDirectorProjection,
  normalizeDirectorEvaluationTimestamp,
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

test("LIVE_DIRECTOR_EVALUATION_TIMESTAMP_IS_EXPLICIT_DAY_STABLE_AND_FAILS_CLOSED", () => {
  assert.equal(
    normalizeDirectorEvaluationTimestamp("2026-08-18T16:47:31-04:00"),
    "2026-08-18T00:00:00.000Z",
  )
  assert.equal(
    normalizeDirectorEvaluationTimestamp("2026-08-18T23:59:59.999Z"),
    "2026-08-18T00:00:00.000Z",
  )
  assert.equal(normalizeDirectorEvaluationTimestamp("not-a-date"), null)
})

test("LIVE_DIRECTOR_PROJECTION_USES_CANONICAL_PROJECT_AND_GOVERNED_METHODS", () => {
  const project = getProjectById("stated")!
  const before = JSON.stringify(project)
  const projection = buildLiveDirectorProjection(project, "2026-08-18T16:47:00-04:00")

  assert.ok(projection)
  assert.equal(projection!.projectId, project.id)
  assert.equal(projection!.mode, "HACKATHON")
  assert.equal(projection!.modeResolution, "PROJECT_EVIDENCE")
  assert.equal(projection!.evaluationTimestamp, "2026-08-18T00:00:00.000Z")
  assert.equal(projection!.input.project, project)
  assert.equal(projection!.input.availableSkills.length, 6)
  assert.ok(projection!.input.availableSkills.every((skill) => skill.sourceEntityKind === "METHOD"))
  assert.equal(projection!.result.sideEffectPayload, null)
  assert.ok(projection!.result.nextAction)
  assert.equal(JSON.stringify(project), before)
})

test("LIVE_DIRECTOR_PROJECTION_IS_DETERMINISTIC_FOR_SAME_PROJECT_AND_EVALUATION_DAY", () => {
  const project = getProjectById("stated")!
  const first = buildLiveDirectorProjection(project, "2026-08-18T01:00:00.000Z")
  const second = buildLiveDirectorProjection(project, "2026-08-18T22:00:00.000Z")

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

  const projection = buildLiveDirectorProjection(project, "2026-08-18T16:47:00-04:00")

  assert.ok(projection)
  assert.equal(projection!.result.nextAction.actionId, "act2")
  assert.equal(projection!.result.nextAction.title, "Verify submission bundle")
  assert.notEqual(projection!.result.nextAction.actionId, "act1")
  assert.deepEqual(projection!.result.nextAction.evidenceNeededAfterCompletion, ["ev1"])
  assert.equal(projection!.result.sideEffectPayload, null)
  assert.equal(JSON.stringify(project), before)
})

test("LIVE_DIRECTOR_POST_DEADLINE_FALLBACK_ROUTES_TO_RECOMMENDED_PHASE_WITH_SEMANTIC_CONTEXT", () => {
  const source = getProjectById("stated")!
  const project = structuredClone(source)
  project.nextActions = [{ ...project.nextActions[0], status: "done" }]
  const before = JSON.stringify(project)

  const first = buildLiveDirectorProjection(project, "2026-08-18T16:47:00-04:00")
  const second = buildLiveDirectorProjection(project, "2026-08-18T17:30:00-04:00")

  assert.ok(first)
  assert.ok(second)
  assert.equal(first!.result.nextAction.actionId, "stated-verify-post-deadline-review")
  assert.equal(first!.result.nextAction.title, "Run post-deadline verify review")
  assert.equal(first!.result.nextAction.phase, "verify")
  assert.equal(first!.result.nextAction.actionType, "next-action")
  assert.deepEqual(first!.result.nextAction.evidenceNeededAfterCompletion, [])
  assert.match(first!.result.nextAction.description, /Deadline 2026-08-15 passed before evaluation on 2026-08-18\./)
  assert.match(first!.result.nextAction.description, /Unresolved proof gap: Offline verification mode validation\./)
  assert.match(first!.result.nextAction.description, /Pertinent risk: Session Reset Loss \(open, medium\/high\)\./)
  assert.match(first!.result.nextAction.description, /Next recommended phase: verify\./)
  assert.equal(first!.result.sideEffectPayload, null)
  assert.deepEqual(first, second)
  assert.equal(JSON.stringify(project), before)
})

test("LIVE_DIRECTOR_CANONICALIZED_SEMANTIC_FALLBACK_STAYS_EVIDENCE_BLOCKED_UNTIL_SPECIFIC_PROOF_EXISTS", () => {
  const source = getProjectById("stated")!
  const project = structuredClone(source)
  project.nextActions = [{ ...project.nextActions[0], status: "done" }]

  const initial = buildLiveDirectorProjection(project, "2026-08-18T16:47:00-04:00")
  assert.ok(initial)
  const fallback = initial!.result.nextAction
  assert.deepEqual(fallback.evidenceNeededAfterCompletion, [])

  project.nextActions = [
    ...project.nextActions,
    {
      id: fallback.actionId,
      label: fallback.title,
      description: fallback.description,
      phase: project.nextRecommendedPhase,
      status: "doing",
    },
  ]

  const canonicalized = buildLiveDirectorProjection(project, "2026-08-18T17:00:00-04:00")
  assert.ok(canonicalized)
  assert.equal(canonicalized!.result.nextAction.actionId, fallback.actionId)
  assert.deepEqual(canonicalized!.result.nextAction.evidenceNeededAfterCompletion, [])

  const completionIntent = projectDirectorNextActionToGovernedCompleteIntent(
    project,
    canonicalized!.result,
    canonicalized!.evaluationTimestamp,
  )
  assert.equal(completionIntent.status, "EVIDENCE_REQUIRED")
  assert.equal(completionIntent.evidenceId, null)
  assert.equal(completionIntent.proposal, null)
  assert.match(completionIntent.errors.join(" "), /No Director-required canonical completion evidence/)
})

test("LIVE_DIRECTOR_BEFORE_DEADLINE_PRIORITIZES_UNRESOLVED_PROOF_GAP", () => {
  const source = getProjectById("stated")!
  const project = structuredClone(source)
  project.nextActions = [{ ...project.nextActions[0], status: "done" }]
  project.deadlineLabel = "2026-08-25"

  const projection = buildLiveDirectorProjection(project, "2026-08-18T16:47:00-04:00")

  assert.ok(projection)
  assert.equal(
    projection!.result.nextAction.actionId,
    "stated-verify-proof-gap-offline-verification-mode-validation",
  )
  assert.equal(projection!.result.nextAction.title, "Review unresolved proof gap before verify")
  assert.equal(projection!.result.nextAction.phase, "verify")
  assert.deepEqual(projection!.result.nextAction.evidenceNeededAfterCompletion, [])
  assert.equal(projection!.result.sideEffectPayload, null)
})

test("LIVE_DIRECTOR_BEFORE_DEADLINE_PRIORITIZES_PERTINENT_RISK_AFTER_PROOF_GAPS_CLEAR", () => {
  const source = getProjectById("stated")!
  const project = structuredClone(source)
  project.nextActions = [{ ...project.nextActions[0], status: "done" }]
  project.deadlineLabel = "2026-08-25"
  project.unresolvedProofGaps = []

  const projection = buildLiveDirectorProjection(project, "2026-08-18T16:47:00-04:00")

  assert.ok(projection)
  assert.equal(projection!.result.nextAction.actionId, "stated-verify-risk-risk1")
  assert.equal(projection!.result.nextAction.title, "Review Session Reset Loss before verify")
  assert.equal(projection!.result.nextAction.phase, "verify")
  assert.deepEqual(projection!.result.nextAction.evidenceNeededAfterCompletion, [])
  assert.equal(projection!.result.sideEffectPayload, null)
})

test("LIVE_DIRECTOR_INVALID_DEADLINE_FAILS_CLOSED_TO_METADATA_REVIEW", () => {
  const source = getProjectById("stated")!
  const project = structuredClone(source)
  project.nextActions = [{ ...project.nextActions[0], status: "done" }]
  project.deadlineLabel = "August-ish"

  const projection = buildLiveDirectorProjection(project, "2026-08-18T16:47:00-04:00")

  assert.ok(projection)
  assert.equal(projection!.result.nextAction.actionId, "stated-verify-deadline-metadata-review")
  assert.equal(projection!.result.nextAction.title, "Review project deadline metadata")
  assert.equal(projection!.result.nextAction.phase, "verify")
  assert.deepEqual(projection!.result.nextAction.evidenceNeededAfterCompletion, [])
  assert.equal(projection!.result.sideEffectPayload, null)
})

test("LIVE_DIRECTOR_NEXT_RECOMMENDED_PHASE_QUALIFIES_FALLBACK_WHEN_NO_STRONGER_SIGNAL_EXISTS", () => {
  const source = getProjectById("stated")!
  const project = structuredClone(source)
  project.nextActions = [{ ...project.nextActions[0], status: "done" }]
  delete project.deadlineLabel
  project.unresolvedProofGaps = []
  project.risks = []

  const projection = buildLiveDirectorProjection(project, "2026-08-18T16:47:00-04:00")

  assert.ok(projection)
  assert.equal(projection!.result.nextAction.actionId, "stated-verify-phase-review")
  assert.equal(projection!.result.nextAction.title, "Prepare verify phase review")
  assert.equal(projection!.result.nextAction.phase, "verify")
  assert.deepEqual(projection!.result.nextAction.evidenceNeededAfterCompletion, [])
  assert.equal(projection!.result.sideEffectPayload, null)
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
  assert.equal(buildLiveDirectorProjection(unsupported, "2026-08-18T16:47:00-04:00"), null)
})
