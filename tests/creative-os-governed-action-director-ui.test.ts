import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { projectDirectorNextActionToGovernedWriteIntent } from "../lib/creative-os/action-plane"
import { buildLiveDirectorProjection } from "../lib/director/live-projection"
import { fingerprintProjectBrain } from "../lib/projects/fingerprint"
import { PROJECT_NEXT_ACTION_APPEND_SCOPE } from "../lib/projects/next-action-writer"
import { projectPresets } from "../lib/projects/presets"
import type { ProjectBrain } from "../lib/projects/types"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function stated(): ProjectBrain {
  const project = projectPresets.find((item) => item.id === "stated")
  assert.ok(project)
  return clone(project)
}

test("LIVE_DIRECTOR_EXISTING_ACTION_IS_RECOGNIZED_AS_ALREADY_CANONICAL", () => {
  const project = stated()
  const projection = buildLiveDirectorProjection(project)
  assert.ok(projection)
  const before = fingerprintProjectBrain(project)

  const intent = projectDirectorNextActionToGovernedWriteIntent(
    project,
    projection.result,
    projection.evaluationTimestamp,
  )

  assert.equal(intent.status, "ALREADY_CANONICAL")
  assert.equal(intent.mutationRequired, false)
  assert.equal(intent.proposal, null)
  assert.equal(intent.existingAction?.id, projection.result.nextAction.actionId)
  assert.equal(fingerprintProjectBrain(project), before)
})

test("LIVE_DIRECTOR_FALLBACK_ACTION_CAN_BECOME_A_TYPED_APPEND_PROPOSAL", () => {
  const project = stated()
  project.nextActions = []
  const projection = buildLiveDirectorProjection(project)
  assert.ok(projection)
  const before = fingerprintProjectBrain(project)

  const intent = projectDirectorNextActionToGovernedWriteIntent(
    project,
    projection.result,
    projection.evaluationTimestamp,
  )

  assert.equal(intent.status, "PROPOSAL_READY")
  assert.equal(intent.mutationRequired, true)
  assert.ok(intent.proposal)
  assert.ok(intent.proposalFingerprint)
  assert.equal(intent.proposal.operation, "PROJECT_BRAIN_APPEND_NEXT_ACTION")
  assert.equal(intent.proposal.sourceSystem, "CREATIVE_DIRECTOR")
  assert.equal(intent.proposal.targetSystem, "PROJECT_BRAIN")
  assert.deepEqual(intent.proposal.requiredScopes, [PROJECT_NEXT_ACTION_APPEND_SCOPE])
  assert.equal(intent.proposal.beforeFingerprint, before)
  assert.equal(intent.candidateAction.status, "todo")
  assert.equal(fingerprintProjectBrain(project), before)
})

test("LIVE_DIRECTOR_ACTION_IDENTITY_CONFLICT_FAILS_CLOSED_WITHOUT_PROPOSAL", () => {
  const project = stated()
  const projection = buildLiveDirectorProjection(project)
  assert.ok(projection)
  const selectedId = projection.result.nextAction.actionId
  const existing = project.nextActions.find((action) => action.id === selectedId)
  assert.ok(existing)
  existing.description = `${existing.description} conflicting canonical edit`

  const intent = projectDirectorNextActionToGovernedWriteIntent(
    project,
    projection.result,
    projection.evaluationTimestamp,
  )

  assert.equal(intent.status, "IDENTITY_CONFLICT")
  assert.equal(intent.mutationRequired, false)
  assert.equal(intent.proposal, null)
  assert.ok(intent.errors.some((error) => error.includes("already exists with different canonical content")))
})

test("DIRECTOR_WRITE_SERVER_ACTION_REGENERATES_CANONICAL_PROPOSAL_AND_DOES_NOT_TRUST_CLIENT_PAYLOAD", () => {
  const source = readFileSync(new URL("../app/director/live/actions.ts", import.meta.url), "utf8")

  assert.equal(source.includes('formData.get("projectId")'), true)
  assert.equal(source.includes('formData.get("proposalFingerprint")'), true)
  assert.equal(source.includes('formData.get("payload")'), false)
  assert.equal(source.includes('formData.get("approvedBy")'), false)
  assert.equal(source.includes("getProjectById(projectId)"), true)
  assert.equal(source.includes("buildLiveDirectorProjection(project)"), true)
  assert.equal(source.includes("projectDirectorNextActionToGovernedWriteIntent"), true)
  assert.equal(source.includes("intent.proposalFingerprint !== expectedProposalFingerprint"), true)
  assert.equal(source.includes("executeProjectBrainNextActionProposal"), true)
})

test("DIRECTOR_WRITE_UI_HAS_NO_ANONYMOUS_OR_DEVELOPMENT_BYPASS", () => {
  const page = readFileSync(new URL("../app/director/live/page.tsx", import.meta.url), "utf8")
  const panel = readFileSync(new URL("../components/director/governed-action-panel.tsx", import.meta.url), "utf8")

  assert.equal(page.includes("authRuntimeSummary.oauthConfigured"), true)
  assert.equal(page.includes("authRuntimeSummary.ownerAccountIdConfigured"), true)
  assert.equal(page.includes("requireCanonicalWriteAccess()"), true)
  assert.equal(panel.includes("Write locked for this environment"), true)
  assert.equal(panel.includes("Approve governed write"), true)
  assert.equal(panel.includes("NODE_ENV"), false)
  assert.equal(panel.includes("anonymous bypass"), false)
})
