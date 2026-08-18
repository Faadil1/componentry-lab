import assert from "node:assert/strict"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

import {
  createProjectBrainStartNextActionProposal,
  executeProjectBrainStartNextActionProposal,
  fingerprintGovernedActionProposal,
  projectDirectorNextActionToGovernedStartIntent,
  validateGovernedActionProposal,
} from "../lib/creative-os/action-plane"
import { buildLiveDirectorProjection } from "../lib/director/live-projection"
import { fingerprintProjectBrain } from "../lib/projects/fingerprint"
import {
  PROJECT_NEXT_ACTION_START_SCOPE,
  startProjectNextAction,
} from "../lib/projects/next-action-status-writer"
import { clearProjectRepositoryForTests, getProjectById } from "../lib/projects/repository"
import type { ProjectBrain } from "../lib/projects/types"

const ownerAuthState = {
  getOwnerGithubAccountId: () => "owner-123",
  canAuthorizeOwnerGithubAccount: (providerAccountId: string | undefined | null) => providerAccountId === "owner-123",
}

function ownerSession() {
  return { user: { id: "owner-123" } }
}

function nonOwnerSession() {
  return { user: { id: "someone-else" } }
}

async function withTempProjectRepository<T>(callback: () => Promise<T>): Promise<T> {
  const previousDataDir = process.env.COMPONENTRY_LAB_DATA_DIR
  const previousStorageMode = process.env.COMPONENTRY_LAB_STORAGE_MODE
  const root = join(tmpdir(), `governed-start-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  process.env.COMPONENTRY_LAB_DATA_DIR = root
  process.env.COMPONENTRY_LAB_STORAGE_MODE = "local-file"
  clearProjectRepositoryForTests()
  try {
    return await callback()
  } finally {
    clearProjectRepositoryForTests()
    if (previousDataDir === undefined) delete process.env.COMPONENTRY_LAB_DATA_DIR
    else process.env.COMPONENTRY_LAB_DATA_DIR = previousDataDir
    if (previousStorageMode === undefined) delete process.env.COMPONENTRY_LAB_STORAGE_MODE
    else process.env.COMPONENTRY_LAB_STORAGE_MODE = previousStorageMode
    rmSync(root, { recursive: true, force: true })
  }
}

async function statedProject(): Promise<ProjectBrain> {
  const project = await getProjectById("stated")
  assert.ok(project)
  return project
}

function startAuthority() {
  return {
    authorityLevel: "local-reversible-execution" as const,
    requestedAction: "Start canonical next action",
    target: "project-brain:next-action-lifecycle",
    reversibility: "reversible" as const,
    risk: "low" as const,
    approvalRequirement: "explicit" as const,
    grantedScope: [PROJECT_NEXT_ACTION_START_SCOPE],
    grantedBy: "owner-123",
    grantedAt: "2026-08-18T12:20:00.000Z",
    expiration: null,
    status: "granted" as const,
  }
}

test("START_ACTION_PROPOSAL_IS_PURE_DETERMINISTIC_AND_TYPED_TODO_TO_DOING", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const before = fingerprintProjectBrain(project)
    const options = {
      actionId: "act1",
      correlationId: "corr-start-001",
      proposedAt: "2026-08-18T12:20:00.000Z",
      evidenceRefs: ["evidence:b", "evidence:a"],
      provenanceRefs: ["director:live"],
    }

    const first = createProjectBrainStartNextActionProposal(project, options)
    const second = createProjectBrainStartNextActionProposal(project, options)

    assert.equal(first.valid, true)
    assert.ok(first.proposal)
    assert.ok(second.proposal)
    assert.equal(first.proposal.operation, "PROJECT_BRAIN_START_NEXT_ACTION")
    assert.equal(first.proposal.sourceSystem, "CREATIVE_DIRECTOR")
    assert.equal(first.proposal.targetSystem, "PROJECT_BRAIN")
    assert.equal(first.proposal.effectClass, "OWNER_STATE_MUTATION")
    assert.equal(first.proposal.requiredAuthority, "LOCAL_REVERSIBLE")
    assert.deepEqual(first.proposal.requiredScopes, [PROJECT_NEXT_ACTION_START_SCOPE])
    assert.deepEqual(first.proposal.payload, {
      actionId: "act1",
      fromStatus: "todo",
      toStatus: "doing",
    })
    assert.equal(fingerprintGovernedActionProposal(first.proposal), fingerprintGovernedActionProposal(second.proposal))
    assert.equal(fingerprintProjectBrain(await statedProject()), before)
  })
})

test("START_ACTION_INVALID_PAYLOAD_SCOPE_AND_EXTERNAL_EFFECT_FAIL_CLOSED", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const proposal = createProjectBrainStartNextActionProposal(project, {
      actionId: "act1",
      correlationId: "corr-start-invalid",
      proposedAt: "2026-08-18T12:20:00.000Z",
    }).proposal
    assert.ok(proposal)

    const wrongFrom = validateGovernedActionProposal({ ...proposal, payload: { actionId: "act1", fromStatus: "doing", toStatus: "doing" } })
    assert.equal(wrongFrom.valid, false)
    assert.ok(wrongFrom.errors.some((error) => error.includes("fromStatus=todo")))

    const wrongTo = validateGovernedActionProposal({ ...proposal, payload: { actionId: "act1", fromStatus: "todo", toStatus: "done" } })
    assert.equal(wrongTo.valid, false)
    assert.ok(wrongTo.errors.some((error) => error.includes("toStatus=doing")))

    const extraPayload = validateGovernedActionProposal({ ...proposal, payload: { ...proposal.payload, phase: "verify" } })
    assert.equal(extraPayload.valid, false)
    assert.ok(extraPayload.errors.some((error) => error.includes("unsupported keys")))

    const wrongScope = validateGovernedActionProposal({ ...proposal, requiredScopes: ["project:phase:update"] })
    assert.equal(wrongScope.valid, false)
    assert.ok(wrongScope.errors.some((error) => error.includes(PROJECT_NEXT_ACTION_START_SCOPE)))

    const external = validateGovernedActionProposal({
      ...proposal,
      effectClass: "EXTERNAL_SIDE_EFFECT",
      requiredAuthority: "EXPLICIT_EXTERNAL",
    })
    assert.equal(external.valid, false)
    assert.ok(external.errors.some((error) => error.includes("OWNER_STATE_MUTATION")))
    assert.ok(external.errors.some((error) => error.includes("LOCAL_REVERSIBLE")))
  })
})

test("START_ACTION_REQUIRES_AUTHENTICATED_CANONICAL_OWNER", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const proposal = createProjectBrainStartNextActionProposal(project, {
      actionId: "act1",
      correlationId: "corr-start-auth",
      proposedAt: "2026-08-18T12:20:00.000Z",
    }).proposal
    assert.ok(proposal)
    const proposalFingerprint = fingerprintGovernedActionProposal(proposal)

    const anonymous = await executeProjectBrainStartNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint },
      executedAt: "2026-08-18T12:21:00.000Z",
      sessionLoader: async () => null,
      authState: ownerAuthState,
    })
    assert.equal(anonymous.receipt.executionStatus, "REJECTED")
    assert.equal(anonymous.receipt.mutationApplied, false)

    const nonOwner = await executeProjectBrainStartNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint },
      executedAt: "2026-08-18T12:22:00.000Z",
      sessionLoader: async () => nonOwnerSession() as never,
      authState: ownerAuthState,
    })
    assert.equal(nonOwner.receipt.executionStatus, "REJECTED")
    assert.equal(nonOwner.receipt.mutationApplied, false)

    const after = await statedProject()
    assert.equal(after.nextActions.find((action) => action.id === "act1")?.status, "todo")
  })
})

test("START_ACTION_APPROVAL_MUST_BIND_TO_EXACT_PROPOSAL_FINGERPRINT", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const proposal = createProjectBrainStartNextActionProposal(project, {
      actionId: "act1",
      correlationId: "corr-start-fingerprint",
      proposedAt: "2026-08-18T12:20:00.000Z",
    }).proposal
    assert.ok(proposal)

    const result = await executeProjectBrainStartNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint: "0".repeat(64) },
      executedAt: "2026-08-18T12:21:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })

    assert.equal(result.receipt.executionStatus, "REJECTED")
    assert.equal(result.receipt.mutationApplied, false)
    assert.equal((await statedProject()).nextActions.find((action) => action.id === "act1")?.status, "todo")
  })
})

test("AUTHORIZED_OWNER_STARTS_ONLY_THE_SELECTED_ACTION_TODO_TO_DOING", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const before = JSON.parse(JSON.stringify(project)) as ProjectBrain
    const proposal = createProjectBrainStartNextActionProposal(project, {
      actionId: "act1",
      correlationId: "corr-start-apply",
      proposedAt: "2026-08-18T12:20:00.000Z",
      evidenceRefs: ["project-brain:stated:evidence:ev1"],
    }).proposal
    assert.ok(proposal)

    const result = await executeProjectBrainStartNextActionProposal(proposal, {
      approvalIntent: {
        decision: "APPROVE",
        proposalFingerprint: fingerprintGovernedActionProposal(proposal),
      },
      executedAt: "2026-08-18T12:23:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })

    assert.equal(result.receipt.executionStatus, "APPLIED")
    assert.equal(result.receipt.mutationApplied, true)
    assert.equal(result.approval?.approvedBy, "owner-123")
    assert.deepEqual(result.approval?.grantedScopes, [PROJECT_NEXT_ACTION_START_SCOPE])
    assert.equal(result.receipt.beforeFingerprint, fingerprintProjectBrain(before))
    assert.ok(result.receipt.afterFingerprint)
    assert.notEqual(result.receipt.afterFingerprint, result.receipt.beforeFingerprint)

    const after = await statedProject()
    assert.equal(after.nextActions.find((action) => action.id === "act1")?.status, "doing")
    assert.equal(after.currentPhase, before.currentPhase)
    assert.equal(after.status, before.status)
    assert.deepEqual(after.decisions, before.decisions)
    assert.deepEqual(after.evidence, before.evidence)
    assert.deepEqual(after.blockers, before.blockers)
    assert.equal(after.nextActions.length, before.nextActions.length)
    assert.equal(after.updatedLabel, "2026-08-18")

    const normalized = JSON.parse(JSON.stringify(after)) as ProjectBrain
    normalized.nextActions = normalized.nextActions.map((action) => action.id === "act1" ? { ...action, status: "todo" } : action)
    normalized.updatedLabel = before.updatedLabel
    assert.deepEqual(normalized, before)
  })
})

test("REUSING_A_START_PROPOSAL_AFTER_MUTATION_FAILS_STALE_WITH_ZERO_SECOND_MUTATION", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const proposal = createProjectBrainStartNextActionProposal(project, {
      actionId: "act1",
      correlationId: "corr-start-reuse",
      proposedAt: "2026-08-18T12:20:00.000Z",
    }).proposal
    assert.ok(proposal)
    const proposalFingerprint = fingerprintGovernedActionProposal(proposal)

    const first = await executeProjectBrainStartNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint },
      executedAt: "2026-08-18T12:24:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })
    assert.equal(first.receipt.executionStatus, "APPLIED")

    const afterFirst = await statedProject()
    const firstAfterFingerprint = fingerprintProjectBrain(afterFirst)

    const second = await executeProjectBrainStartNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint },
      executedAt: "2026-08-18T12:25:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })
    assert.equal(second.receipt.executionStatus, "BLOCKED")
    assert.equal(second.receipt.mutationApplied, false)
    assert.equal(fingerprintProjectBrain(await statedProject()), firstAfterFingerprint)
  })
})

test("START_WRITER_IS_IDEMPOTENT_FOR_DOING_AND_REJECTS_DONE_OR_BLOCKED", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const pristine = JSON.parse(JSON.stringify(project)) as ProjectBrain
    const first = await startProjectNextAction({
      projectId: project.id,
      actionId: "act1",
      expectedProjectFingerprint: fingerprintProjectBrain(project),
      executedAt: "2026-08-18T12:26:00.000Z",
    }, startAuthority())
    assert.equal(first.status, "STARTED")

    const doing = await statedProject()
    const noChange = await startProjectNextAction({
      projectId: doing.id,
      actionId: "act1",
      expectedProjectFingerprint: fingerprintProjectBrain(doing),
      executedAt: "2026-08-18T12:27:00.000Z",
    }, startAuthority())
    assert.equal(noChange.status, "NO_CHANGE")
    assert.equal(noChange.beforeFingerprint, noChange.afterFingerprint)

    const doneProject = JSON.parse(JSON.stringify(pristine)) as ProjectBrain
    const done = doneProject.nextActions.find((action) => action.id === "act1")
    assert.ok(done)
    done.status = "done"
    const doneProposal = createProjectBrainStartNextActionProposal(doneProject, {
      actionId: "act1",
      correlationId: "corr-start-done",
      proposedAt: "2026-08-18T12:20:00.000Z",
    })
    assert.equal(doneProposal.valid, false)

    const blockedProject = JSON.parse(JSON.stringify(pristine)) as ProjectBrain
    const blocked = blockedProject.nextActions.find((action) => action.id === "act1")
    assert.ok(blocked)
    blocked.status = "blocked"
    const blockedProposal = createProjectBrainStartNextActionProposal(blockedProject, {
      actionId: "act1",
      correlationId: "corr-start-blocked",
      proposedAt: "2026-08-18T12:20:00.000Z",
    })
    assert.equal(blockedProposal.valid, false)
  })
})

test("DIRECTOR_START_INTENT_REFLECTS_TODO_DOING_DONE_AND_BLOCKED_STATES", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const projection = buildLiveDirectorProjection(project)
    assert.ok(projection)

    const ready = projectDirectorNextActionToGovernedStartIntent(project, projection.result, projection.evaluationTimestamp)
    assert.equal(ready.status, "PROPOSAL_READY")
    assert.ok(ready.proposalFingerprint)

    const doing = JSON.parse(JSON.stringify(project)) as ProjectBrain
    const doingAction = doing.nextActions.find((action) => action.id === projection.result.nextAction.actionId)
    assert.ok(doingAction)
    doingAction.status = "doing"
    assert.equal(projectDirectorNextActionToGovernedStartIntent(doing, projection.result, projection.evaluationTimestamp).status, "ALREADY_STARTED")

    const done = JSON.parse(JSON.stringify(project)) as ProjectBrain
    const doneAction = done.nextActions.find((action) => action.id === projection.result.nextAction.actionId)
    assert.ok(doneAction)
    doneAction.status = "done"
    assert.equal(projectDirectorNextActionToGovernedStartIntent(done, projection.result, projection.evaluationTimestamp).status, "ALREADY_COMPLETED")

    const blocked = JSON.parse(JSON.stringify(project)) as ProjectBrain
    const blockedAction = blocked.nextActions.find((action) => action.id === projection.result.nextAction.actionId)
    assert.ok(blockedAction)
    blockedAction.status = "blocked"
    assert.equal(projectDirectorNextActionToGovernedStartIntent(blocked, projection.result, projection.evaluationTimestamp).status, "ACTION_BLOCKED")
  })
})

test("DIRECTOR_START_INTENT_REQUIRES_ACTION_TO_EXIST_CANONICALLY", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const projection = buildLiveDirectorProjection(project)
    assert.ok(projection)
    project.nextActions = []

    const intent = projectDirectorNextActionToGovernedStartIntent(project, projection.result, projection.evaluationTimestamp)
    assert.equal(intent.status, "ACTION_NOT_CANONICAL")
    assert.equal(intent.proposal, null)
    assert.equal(intent.mutationRequired, false)
  })
})
