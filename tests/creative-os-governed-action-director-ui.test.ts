import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  projectDirectorNextActionToGovernedCompleteIntent,
  projectDirectorNextActionToGovernedStartIntent,
  projectDirectorNextActionToGovernedWriteIntent,
} from "../lib/creative-os/action-plane"
import { buildLiveDirectorProjection } from "../lib/director/live-projection"
import { fingerprintProjectBrain } from "../lib/projects/fingerprint"
import { PROJECT_NEXT_ACTION_APPEND_SCOPE } from "../lib/projects/next-action-writer"
import { PROJECT_NEXT_ACTION_START_SCOPE } from "../lib/projects/next-action-status-writer"
import { PROJECT_NEXT_ACTION_COMPLETE_SCOPE } from "../lib/projects/next-action-complete-writer"
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

  const intent = projectDirectorNextActionToGovernedWriteIntent(project, projection.result, projection.evaluationTimestamp)

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

  const intent = projectDirectorNextActionToGovernedWriteIntent(project, projection.result, projection.evaluationTimestamp)

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

  const intent = projectDirectorNextActionToGovernedStartIntent(project, projection.result, projection.evaluationTimestamp)

  assert.equal(intent.status, "PROPOSAL_READY")
  assert.equal(intent.mutationRequired, true)
  assert.ok(intent.proposal)
  assert.ok(intent.proposalFingerprint)
  assert.equal(intent.proposal.operation, "PROJECT_BRAIN_START_NEXT_ACTION")
  assert.deepEqual(intent.proposal.requiredScopes, [PROJECT_NEXT_ACTION_START_SCOPE])
  assert.deepEqual(intent.proposal.payload, {
    actionId: projection.result.nextAction.actionId,
    fromStatus: "todo",
    toStatus: "doing",
  })
  assert.equal(intent.proposal.beforeFingerprint, before)
  assert.equal(fingerprintProjectBrain(project), before)
})

test("LIVE_DIRECTOR_CAN_PROJECT_DOING_ACTION_TO_EVIDENCE_BACKED_COMPLETION_PROPOSAL", () => {
  const project = stated()
  const projection = buildLiveDirectorProjection(project)
  assert.ok(projection)
  const selected = project.nextActions.find((action) => action.id === projection.result.nextAction.actionId)
  assert.ok(selected)
  selected.status = "doing"
  const before = fingerprintProjectBrain(project)

  const intent = projectDirectorNextActionToGovernedCompleteIntent(project, projection.result, projection.evaluationTimestamp)

  assert.equal(intent.status, "PROPOSAL_READY")
  assert.equal(intent.mutationRequired, true)
  assert.equal(intent.evidenceId, "ev1")
  assert.ok(intent.proposal)
  assert.ok(intent.proposalFingerprint)
  assert.equal(intent.proposal.operation, "PROJECT_BRAIN_COMPLETE_NEXT_ACTION")
  assert.deepEqual(intent.proposal.requiredScopes, [PROJECT_NEXT_ACTION_COMPLETE_SCOPE])
  assert.deepEqual(intent.proposal.payload, {
    actionId: projection.result.nextAction.actionId,
    evidenceId: "ev1",
    fromStatus: "doing",
    toStatus: "done",
  })
  assert.deepEqual(intent.proposal.evidenceRefs, ["project-brain:stated:evidence:ev1"])
  assert.equal(intent.proposal.beforeFingerprint, before)
  assert.equal(fingerprintProjectBrain(project), before)
})

test("LIVE_DIRECTOR_ACTION_IDENTITY_CONFLICT_FAILS_CLOSED_WITHOUT_ANY_LIFECYCLE_PROPOSAL", () => {
  const project = stated()
  const projection = buildLiveDirectorProjection(project)
  assert.ok(projection)
  const selectedId = projection.result.nextAction.actionId
  const existing = project.nextActions.find((action) => action.id === selectedId)
  assert.ok(existing)
  existing.description = `${existing.description} conflicting canonical edit`
  existing.status = "doing"

  const appendIntent = projectDirectorNextActionToGovernedWriteIntent(project, projection.result, projection.evaluationTimestamp)
  const startIntent = projectDirectorNextActionToGovernedStartIntent(project, projection.result, projection.evaluationTimestamp)
  const completeIntent = projectDirectorNextActionToGovernedCompleteIntent(project, projection.result, projection.evaluationTimestamp)

  assert.equal(appendIntent.status, "IDENTITY_CONFLICT")
  assert.equal(startIntent.status, "IDENTITY_CONFLICT")
  assert.equal(completeIntent.status, "IDENTITY_CONFLICT")
  assert.equal(appendIntent.proposal, null)
  assert.equal(startIntent.proposal, null)
  assert.equal(completeIntent.proposal, null)
})

test("DIRECTOR_WRITE_SERVER_ACTION_REGENERATES_ALL_CANONICAL_PROPOSALS_AND_NEVER_TRUSTS_CLIENT_MUTATION_PAYLOAD", () => {
  const source = readFileSync(new URL("../app/director/live/actions.ts", import.meta.url), "utf8")

  assert.equal(source.includes('formData.get("projectId")'), true)
  assert.equal(source.includes('formData.get("proposalFingerprint")'), true)
  assert.equal(source.includes('formData.get("payload")'), false)
  assert.equal(source.includes('formData.get("approvedBy")'), false)
  assert.equal(source.includes('formData.get("evidenceId")'), false)
  assert.equal(source.includes("getProjectById(identifiers.projectId)"), true)
  assert.equal(source.includes("buildLiveDirectorProjection(project)"), true)
  assert.equal(source.includes("projectDirectorNextActionToGovernedWriteIntent"), true)
  assert.equal(source.includes("projectDirectorNextActionToGovernedStartIntent"), true)
  assert.equal(source.includes("projectDirectorNextActionToGovernedCompleteIntent"), true)
  assert.equal(source.includes("intent.proposalFingerprint !== identifiers.proposalFingerprint"), true)
  assert.equal(source.includes("executeProjectBrainNextActionProposal"), true)
  assert.equal(source.includes("executeProjectBrainStartNextActionProposal"), true)
  assert.equal(source.includes("executeProjectBrainCompleteNextActionProposal"), true)
  assert.equal(source.includes("projectGovernedActionReceiptToAuditEvidence"), true)
})

test("DIRECTOR_WRITE_UI_HAS_NO_BYPASS_AND_EXPOSES_APPEND_START_COMPLETE_AS_TYPED_OPERATIONS", () => {
  const page = readFileSync(new URL("../app/director/live/page.tsx", import.meta.url), "utf8")
  const panel = readFileSync(new URL("../components/director/governed-action-panel.tsx", import.meta.url), "utf8")

  assert.equal(page.includes("authRuntimeSummary.oauthConfigured"), true)
  assert.equal(page.includes("authRuntimeSummary.ownerAccountIdConfigured"), true)
  assert.equal(page.includes("requireCanonicalWriteAccess()"), true)
  assert.equal(page.includes('operation="PROJECT_BRAIN_APPEND_NEXT_ACTION"'), true)
  assert.equal(page.includes('operation="PROJECT_BRAIN_START_NEXT_ACTION"'), true)
  assert.equal(page.includes('operation="PROJECT_BRAIN_COMPLETE_NEXT_ACTION"'), true)
  assert.equal(page.includes("PROJECT_NEXT_ACTION_APPEND_SCOPE"), true)
  assert.equal(page.includes("PROJECT_NEXT_ACTION_START_SCOPE"), true)
  assert.equal(page.includes("PROJECT_NEXT_ACTION_COMPLETE_SCOPE"), true)
  assert.equal(page.includes("using canonical available evidence"), true)
  assert.equal(panel.includes("Write locked for this environment"), true)
  assert.equal(panel.includes("Approve governed write"), true)
  assert.equal(panel.includes("Approve start action"), true)
  assert.equal(panel.includes("Approve completion"), true)
  assert.equal(panel.includes("Canonical completion evidence"), true)
  assert.equal(panel.includes("not an independent verification"), true)
  assert.equal(panel.includes("NODE_ENV"), false)
  assert.equal(panel.includes("anonymous bypass"), false)
})

test("DIRECTOR_WRITE_UI_KEEPS_INITIAL_ACTION_STATE_CLIENT_LOCAL_FOR_SSR", () => {
  const panel = readFileSync(new URL("../components/director/governed-action-panel.tsx", import.meta.url), "utf8")

  assert.equal(panel.includes("const INITIAL_GOVERNED_DIRECTOR_ACTION_STATE: GovernedDirectorActionState = {"), true)
  assert.equal(panel.includes('status: "IDLE"'), true)
  assert.equal(panel.includes('const stateStatus = state?.status ?? "IDLE"'), true)
  assert.equal(panel.includes('const panelStatus: GovernedActionPanelStatus = props.status ?? "INVALID_PROPOSAL"'), true)
  assert.equal(panel.includes("replaceAll"), false)
  assert.equal(
    panel.includes('  INITIAL_GOVERNED_DIRECTOR_ACTION_STATE,\n} from "@/app/director/live/actions"'),
    false,
  )
})

test("DIRECTOR_USE_SERVER_BOUNDARY_EXPORTS_ONLY_ASYNC_RUNTIME_FUNCTIONS", () => {
  const source = readFileSync(new URL("../app/director/live/actions.ts", import.meta.url), "utf8")

  assert.equal(source.startsWith('"use server"'), true)
  assert.equal(/export\s+(const|let|var|class)\s/.test(source), false)
  assert.equal(/export\s+function\s/.test(source), false)
  assert.equal(source.includes("INITIAL_GOVERNED_DIRECTOR_ACTION_STATE"), false)

  const runtimeExports = source.match(/export\s+async\s+function\s+[A-Za-z0-9_]+/g) ?? []
  assert.deepEqual(runtimeExports.sort(), [
    "export async function approveDirectorCompleteNextAction",
    "export async function approveDirectorNextAction",
    "export async function approveDirectorStartNextAction",
  ].sort())
})
