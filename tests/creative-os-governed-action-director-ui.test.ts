import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  projectDirectorNextActionToGovernedStartIntent,
  projectDirectorNextActionToGovernedWriteIntent,
} from "../lib/creative-os/action-plane"
import { buildLiveDirectorProjection } from "../lib/director/live-projection"
import { fingerprintProjectBrain } from "../lib/projects/fingerprint"
import { PROJECT_NEXT_ACTION_APPEND_SCOPE } from "../lib/projects/next-action-writer"
import { PROJECT_NEXT_ACTION_START_SCOPE } from "../lib/projects/next-action-status-writer"
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

test("LIVE_DIRECTOR_CAN_PROJECT_EXISTING_TODO_ACTION_TO_TYPED_START_PROPOSAL", () => {
  const project = stated()
  const projection = buildLiveDirectorProjection(project)
  assert.ok(projection)
  const before = fingerprintProjectBrain(project)

  const intent = projectDirectorNextActionToGovernedStartIntent(
    project,
    projection.result,
    projection.evaluationTimestamp,
  )

  assert.equal(intent.status, "PROPOSAL_READY")
  assert.equal(intent.mutationRequired, true)
  assert.ok(intent.proposal)
  assert.ok(intent.proposalFingerprint)
  assert.equal(intent.proposal.operation, "PROJECT_BRAIN_START_NEXT_ACTION")
  assert.equal(intent.proposal.sourceSystem, "CREATIVE_DIRECTOR")
  assert.equal(intent.proposal.targetSystem, "PROJECT_BRAIN")
  assert.deepEqual(intent.proposal.requiredScopes, [PROJECT_NEXT_ACTION_START_SCOPE])
  assert.deepEqual(intent.proposal.payload, {
    actionId: projection.result.nextAction.actionId,
    fromStatus: "todo",
    toStatus: "doing",
  })
  assert.equal(intent.proposal.beforeFingerprint, before)
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

  const appendIntent = projectDirectorNextActionToGovernedWriteIntent(
    project,
    projection.result,
    projection.evaluationTimestamp,
  )
  const startIntent = projectDirectorNextActionToGovernedStartIntent(
    project,
    projection.result,
    projection.evaluationTimestamp,
  )

  assert.equal(appendIntent.status, "IDENTITY_CONFLICT")
  assert.equal(appendIntent.mutationRequired, false)
  assert.equal(appendIntent.proposal, null)
  assert.equal(startIntent.status, "IDENTITY_CONFLICT")
  assert.equal(startIntent.mutationRequired, false)
  assert.equal(startIntent.proposal, null)
})

test("DIRECTOR_WRITE_SERVER_ACTION_REGENERATES_CANONICAL_PROPOSALS_AND_DOES_NOT_TRUST_CLIENT_PAYLOAD", () => {
  const source = readFileSync(new URL("../app/director/live/actions.ts", import.meta.url), "utf8")

  assert.equal(source.includes('formData.get("projectId")'), true)
  assert.equal(source.includes('formData.get("proposalFingerprint")'), true)
  assert.equal(source.includes('formData.get("payload")'), false)
  assert.equal(source.includes('formData.get("approvedBy")'), false)
  assert.equal(source.includes("getProjectById(identifiers.projectId)"), true)
  assert.equal(source.includes("buildLiveDirectorProjection(project)"), true)
  assert.equal(source.includes("projectDirectorNextActionToGovernedWriteIntent"), true)
  assert.equal(source.includes("projectDirectorNextActionToGovernedStartIntent"), true)
  assert.equal(source.includes("intent.proposalFingerprint !== identifiers.proposalFingerprint"), true)
  assert.equal(source.includes("executeProjectBrainNextActionProposal"), true)
  assert.equal(source.includes("executeProjectBrainStartNextActionProposal"), true)
})

test("DIRECTOR_WRITE_UI_HAS_NO_ANONYMOUS_OR_DEVELOPMENT_BYPASS_AND_EXPOSES_TYPED_START_ONLY", () => {
  const page = readFileSync(new URL("../app/director/live/page.tsx", import.meta.url), "utf8")
  const panel = readFileSync(new URL("../components/director/governed-action-panel.tsx", import.meta.url), "utf8")

  assert.equal(page.includes("authRuntimeSummary.oauthConfigured"), true)
  assert.equal(page.includes("authRuntimeSummary.ownerAccountIdConfigured"), true)
  assert.equal(page.includes("requireCanonicalWriteAccess()"), true)
  assert.equal(page.includes('operation="PROJECT_BRAIN_START_NEXT_ACTION"'), true)
  assert.equal(page.includes("PROJECT_NEXT_ACTION_START_SCOPE"), true)
  assert.equal(page.includes("does not change project phase, execute external work, or authorize any provider"), true)
  assert.equal(panel.includes("Write locked for this environment"), true)
  assert.equal(panel.includes("Approve governed write"), true)
  assert.equal(panel.includes("Approve start action"), true)
  assert.equal(panel.includes("NODE_ENV"), false)
  assert.equal(panel.includes("anonymous bypass"), false)
})
