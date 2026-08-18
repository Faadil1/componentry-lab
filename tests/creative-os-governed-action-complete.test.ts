import assert from "node:assert/strict"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

import {
  createProjectBrainCompleteNextActionProposal,
  executeProjectBrainCompleteNextActionProposal,
  fingerprintGovernedActionProposal,
  projectDirectorNextActionToGovernedCompleteIntent,
  projectGovernedActionReceiptToAuditEvidence,
  validateGovernedActionProposal,
} from "../lib/creative-os/action-plane"
import { buildLiveDirectorProjection } from "../lib/director/live-projection"
import { fingerprintProjectBrain } from "../lib/projects/fingerprint"
import {
  completeProjectNextAction,
  PROJECT_NEXT_ACTION_COMPLETE_AUTHORITY_TARGET,
  PROJECT_NEXT_ACTION_COMPLETE_SCOPE,
} from "../lib/projects/next-action-complete-writer"
import {
  PROJECT_NEXT_ACTION_START_AUTHORITY_TARGET,
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
  const root = join(tmpdir(), `governed-complete-${Date.now()}-${Math.random().toString(16).slice(2)}`)
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
    target: PROJECT_NEXT_ACTION_START_AUTHORITY_TARGET,
    reversibility: "reversible" as const,
    risk: "low" as const,
    approvalRequirement: "explicit" as const,
    grantedScope: [PROJECT_NEXT_ACTION_START_SCOPE],
    grantedBy: "owner-123",
    grantedAt: "2026-08-18T13:00:00.000Z",
    expiration: null,
    status: "granted" as const,
  }
}

function completeAuthority() {
  return {
    authorityLevel: "local-reversible-execution" as const,
    requestedAction: "Complete canonical next action",
    target: PROJECT_NEXT_ACTION_COMPLETE_AUTHORITY_TARGET,
    reversibility: "reversible" as const,
    risk: "low" as const,
    approvalRequirement: "explicit" as const,
    grantedScope: [PROJECT_NEXT_ACTION_COMPLETE_SCOPE],
    grantedBy: "owner-123",
    grantedAt: "2026-08-18T13:01:00.000Z",
    expiration: null,
    status: "granted" as const,
  }
}

async function startAct1(): Promise<ProjectBrain> {
  const project = await statedProject()
  const result = await startProjectNextAction({
    projectId: project.id,
    actionId: "act1",
    expectedProjectFingerprint: fingerprintProjectBrain(project),
    executedAt: "2026-08-18T13:00:00.000Z",
  }, startAuthority())
  assert.equal(result.status, "STARTED")
  return await statedProject()
}

test("COMPLETE_ACTION_PROPOSAL_IS_PURE_DETERMINISTIC_AND_EVIDENCE_BACKED", async () => {
  await withTempProjectRepository(async () => {
    const project = await startAct1()
    const before = fingerprintProjectBrain(project)
    const options = {
      actionId: "act1",
      evidenceId: "ev1",
      correlationId: "corr-complete-001",
      proposedAt: "2026-08-18T13:02:00.000Z",
      provenanceRefs: ["director:live"],
    }

    const first = createProjectBrainCompleteNextActionProposal(project, options)
    const second = createProjectBrainCompleteNextActionProposal(project, options)

    assert.equal(first.valid, true)
    assert.ok(first.proposal)
    assert.ok(second.proposal)
    assert.equal(first.proposal.operation, "PROJECT_BRAIN_COMPLETE_NEXT_ACTION")
    assert.equal(first.proposal.sourceSystem, "CREATIVE_DIRECTOR")
    assert.equal(first.proposal.targetSystem, "PROJECT_BRAIN")
    assert.equal(first.proposal.effectClass, "OWNER_STATE_MUTATION")
    assert.equal(first.proposal.requiredAuthority, "LOCAL_REVERSIBLE")
    assert.deepEqual(first.proposal.requiredScopes, [PROJECT_NEXT_ACTION_COMPLETE_SCOPE])
    assert.deepEqual(first.proposal.payload, {
      actionId: "act1",
      evidenceId: "ev1",
      fromStatus: "doing",
      toStatus: "done",
    })
    assert.deepEqual(first.proposal.evidenceRefs, ["project-brain:stated:evidence:ev1"])
    assert.equal(fingerprintGovernedActionProposal(first.proposal), fingerprintGovernedActionProposal(second.proposal))
    assert.equal(fingerprintProjectBrain(await statedProject()), before)
  })
})

test("COMPLETE_ACTION_INVALID_PAYLOAD_SCOPE_AND_EXTERNAL_EFFECT_FAIL_CLOSED", async () => {
  await withTempProjectRepository(async () => {
    const project = await startAct1()
    const proposal = createProjectBrainCompleteNextActionProposal(project, {
      actionId: "act1",
      evidenceId: "ev1",
      correlationId: "corr-complete-invalid",
      proposedAt: "2026-08-18T13:02:00.000Z",
    }).proposal
    assert.ok(proposal)

    const wrongFrom = validateGovernedActionProposal({ ...proposal, payload: { ...proposal.payload, fromStatus: "todo" } })
    assert.equal(wrongFrom.valid, false)
    assert.ok(wrongFrom.errors.some((error) => error.includes("fromStatus=doing")))

    const wrongTo = validateGovernedActionProposal({ ...proposal, payload: { ...proposal.payload, toStatus: "doing" } })
    assert.equal(wrongTo.valid, false)
    assert.ok(wrongTo.errors.some((error) => error.includes("toStatus=done")))

    const extraPayload = validateGovernedActionProposal({ ...proposal, payload: { ...proposal.payload, phase: "verify" } })
    assert.equal(extraPayload.valid, false)
    assert.ok(extraPayload.errors.some((error) => error.includes("unsupported keys")))

    const noEvidenceRefs = validateGovernedActionProposal({ ...proposal, evidenceRefs: [] })
    assert.equal(noEvidenceRefs.valid, false)
    assert.ok(noEvidenceRefs.errors.some((error) => error.includes("at least one canonical evidenceRef")))

    const wrongScope = validateGovernedActionProposal({ ...proposal, requiredScopes: ["project:phase:update"] })
    assert.equal(wrongScope.valid, false)
    assert.ok(wrongScope.errors.some((error) => error.includes(PROJECT_NEXT_ACTION_COMPLETE_SCOPE)))

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

test("COMPLETE_ACTION_PROPOSAL_REQUIRES_AVAILABLE_CANONICAL_EVIDENCE", async () => {
  await withTempProjectRepository(async () => {
    const project = await startAct1()

    const missing = createProjectBrainCompleteNextActionProposal(project, {
      actionId: "act1",
      evidenceId: "missing-evidence",
      correlationId: "corr-complete-missing",
      proposedAt: "2026-08-18T13:02:00.000Z",
    })
    assert.equal(missing.valid, false)
    assert.ok(missing.errors.some((error) => error.includes("not found")))

    const unavailable = JSON.parse(JSON.stringify(project)) as ProjectBrain
    const evidence = unavailable.evidence.find((item) => item.id === "ev1")
    assert.ok(evidence)
    evidence.status = "missing"
    const blocked = createProjectBrainCompleteNextActionProposal(unavailable, {
      actionId: "act1",
      evidenceId: "ev1",
      correlationId: "corr-complete-unavailable",
      proposedAt: "2026-08-18T13:02:00.000Z",
    })
    assert.equal(blocked.valid, false)
    assert.ok(blocked.errors.some((error) => error.includes("not available")))
  })
})

test("COMPLETE_ACTION_REQUIRES_AUTHENTICATED_CANONICAL_OWNER", async () => {
  await withTempProjectRepository(async () => {
    const project = await startAct1()
    const proposal = createProjectBrainCompleteNextActionProposal(project, {
      actionId: "act1",
      evidenceId: "ev1",
      correlationId: "corr-complete-auth",
      proposedAt: "2026-08-18T13:02:00.000Z",
    }).proposal
    assert.ok(proposal)
    const proposalFingerprint = fingerprintGovernedActionProposal(proposal)

    const anonymous = await executeProjectBrainCompleteNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint },
      executedAt: "2026-08-18T13:03:00.000Z",
      sessionLoader: async () => null,
      authState: ownerAuthState,
    })
    assert.equal(anonymous.receipt.executionStatus, "REJECTED")
    assert.equal(anonymous.receipt.mutationApplied, false)

    const nonOwner = await executeProjectBrainCompleteNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint },
      executedAt: "2026-08-18T13:04:00.000Z",
      sessionLoader: async () => nonOwnerSession() as never,
      authState: ownerAuthState,
    })
    assert.equal(nonOwner.receipt.executionStatus, "REJECTED")
    assert.equal(nonOwner.receipt.mutationApplied, false)
    assert.equal((await statedProject()).nextActions.find((action) => action.id === "act1")?.status, "doing")
  })
})

test("AUTHORIZED_OWNER_COMPLETES_ONLY_SELECTED_ACTION_WITH_CANONICAL_EVIDENCE", async () => {
  await withTempProjectRepository(async () => {
    const project = await startAct1()
    const before = JSON.parse(JSON.stringify(project)) as ProjectBrain
    const proposal = createProjectBrainCompleteNextActionProposal(project, {
      actionId: "act1",
      evidenceId: "ev1",
      correlationId: "corr-complete-apply",
      proposedAt: "2026-08-18T13:02:00.000Z",
    }).proposal
    assert.ok(proposal)

    const execution = await executeProjectBrainCompleteNextActionProposal(proposal, {
      approvalIntent: {
        decision: "APPROVE",
        proposalFingerprint: fingerprintGovernedActionProposal(proposal),
      },
      executedAt: "2026-08-18T13:05:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })

    assert.equal(execution.receipt.executionStatus, "APPLIED")
    assert.equal(execution.receipt.mutationApplied, true)
    assert.equal(execution.approval?.approvedBy, "owner-123")
    assert.deepEqual(execution.approval?.grantedScopes, [PROJECT_NEXT_ACTION_COMPLETE_SCOPE])
    assert.ok(execution.receipt.evidenceRefs.includes("project-brain:stated:evidence:ev1"))
    assert.ok(execution.receipt.limitations.some((item) => item.includes("does not independently verify")))

    const after = await statedProject()
    assert.equal(after.nextActions.find((action) => action.id === "act1")?.status, "done")
    assert.equal(after.currentPhase, before.currentPhase)
    assert.equal(after.status, before.status)
    assert.deepEqual(after.decisions, before.decisions)
    assert.deepEqual(after.evidence, before.evidence)
    assert.deepEqual(after.blockers, before.blockers)
    assert.equal(after.nextActions.length, before.nextActions.length)
    assert.equal(after.updatedLabel, "2026-08-18")

    const normalized = JSON.parse(JSON.stringify(after)) as ProjectBrain
    normalized.nextActions = normalized.nextActions.map((action) => action.id === "act1" ? { ...action, status: "doing" } : action)
    normalized.updatedLabel = before.updatedLabel
    assert.deepEqual(normalized, before)
  })
})

test("REUSING_COMPLETION_PROPOSAL_AFTER_MUTATION_FAILS_STALE_WITH_ZERO_SECOND_MUTATION", async () => {
  await withTempProjectRepository(async () => {
    const project = await startAct1()
    const proposal = createProjectBrainCompleteNextActionProposal(project, {
      actionId: "act1",
      evidenceId: "ev1",
      correlationId: "corr-complete-reuse",
      proposedAt: "2026-08-18T13:02:00.000Z",
    }).proposal
    assert.ok(proposal)
    const proposalFingerprint = fingerprintGovernedActionProposal(proposal)

    const first = await executeProjectBrainCompleteNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint },
      executedAt: "2026-08-18T13:06:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })
    assert.equal(first.receipt.executionStatus, "APPLIED")
    const afterFirst = await statedProject()
    const afterFingerprint = fingerprintProjectBrain(afterFirst)

    const second = await executeProjectBrainCompleteNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint },
      executedAt: "2026-08-18T13:07:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })
    assert.equal(second.receipt.executionStatus, "BLOCKED")
    assert.equal(second.receipt.mutationApplied, false)
    assert.equal(fingerprintProjectBrain(await statedProject()), afterFingerprint)
  })
})

test("COMPLETE_WRITER_IS_IDEMPOTENT_FOR_DONE_AND_REJECTS_TODO_OR_BLOCKED", async () => {
  await withTempProjectRepository(async () => {
    const project = await startAct1()
    const first = await completeProjectNextAction({
      projectId: project.id,
      actionId: "act1",
      evidenceId: "ev1",
      expectedProjectFingerprint: fingerprintProjectBrain(project),
      executedAt: "2026-08-18T13:08:00.000Z",
    }, completeAuthority())
    assert.equal(first.status, "COMPLETED")

    const done = await statedProject()
    const noChange = await completeProjectNextAction({
      projectId: done.id,
      actionId: "act1",
      evidenceId: "ev1",
      expectedProjectFingerprint: fingerprintProjectBrain(done),
      executedAt: "2026-08-18T13:09:00.000Z",
    }, completeAuthority())
    assert.equal(noChange.status, "NO_CHANGE")
    assert.equal(noChange.beforeFingerprint, noChange.afterFingerprint)
  })

  await withTempProjectRepository(async () => {
    const todo = await statedProject()
    const todoResult = await completeProjectNextAction({
      projectId: todo.id,
      actionId: "act1",
      evidenceId: "ev1",
      expectedProjectFingerprint: fingerprintProjectBrain(todo),
      executedAt: "2026-08-18T13:10:00.000Z",
    }, completeAuthority())
    assert.equal(todoResult.status, "INVALID_ACTION_STATE")
  })
})

test("DIRECTOR_COMPLETION_INTENT_ENFORCES_LIFECYCLE_AND_REQUIRED_EVIDENCE", async () => {
  await withTempProjectRepository(async () => {
    const todo = await statedProject()
    const todoProjection = buildLiveDirectorProjection(todo)
    assert.ok(todoProjection)
    assert.equal(
      projectDirectorNextActionToGovernedCompleteIntent(todo, todoProjection.result, todoProjection.evaluationTimestamp).status,
      "ACTION_NOT_STARTED",
    )

    const doing = await startAct1()
    const projection = buildLiveDirectorProjection(doing)
    assert.ok(projection)
    const ready = projectDirectorNextActionToGovernedCompleteIntent(doing, projection.result, projection.evaluationTimestamp)
    assert.equal(ready.status, "PROPOSAL_READY")
    assert.equal(ready.evidenceId, "ev1")
    assert.ok(ready.proposalFingerprint)

    const noEvidence = JSON.parse(JSON.stringify(doing)) as ProjectBrain
    noEvidence.evidence = noEvidence.evidence.map((item) => item.id === "ev1" ? { ...item, status: "missing" as const } : item)
    const missing = projectDirectorNextActionToGovernedCompleteIntent(noEvidence, projection.result, projection.evaluationTimestamp)
    assert.equal(missing.status, "EVIDENCE_REQUIRED")

    const done = JSON.parse(JSON.stringify(doing)) as ProjectBrain
    const doneAction = done.nextActions.find((action) => action.id === projection.result.nextAction.actionId)
    assert.ok(doneAction)
    doneAction.status = "done"
    assert.equal(projectDirectorNextActionToGovernedCompleteIntent(done, projection.result, projection.evaluationTimestamp).status, "ALREADY_COMPLETED")

    const blocked = JSON.parse(JSON.stringify(doing)) as ProjectBrain
    const blockedAction = blocked.nextActions.find((action) => action.id === projection.result.nextAction.actionId)
    assert.ok(blockedAction)
    blockedAction.status = "blocked"
    assert.equal(projectDirectorNextActionToGovernedCompleteIntent(blocked, projection.result, projection.evaluationTimestamp).status, "ACTION_BLOCKED")
  })
})

test("GOVERNED_COMPLETION_RECEIPT_PROJECTS_TO_READ_ONLY_AUDIT_TRACE", async () => {
  await withTempProjectRepository(async () => {
    const project = await startAct1()
    const projection = buildLiveDirectorProjection(project)
    assert.ok(projection)
    const proposal = createProjectBrainCompleteNextActionProposal(project, {
      actionId: "act1",
      evidenceId: "ev1",
      correlationId: "corr-complete-audit",
      proposedAt: "2026-08-18T13:02:00.000Z",
    }).proposal
    assert.ok(proposal)

    const execution = await executeProjectBrainCompleteNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint: fingerprintGovernedActionProposal(proposal) },
      executedAt: "2026-08-18T13:11:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })
    assert.equal(execution.receipt.executionStatus, "APPLIED")

    const audit = projectGovernedActionReceiptToAuditEvidence(execution.receipt, {
      projectPhase: projection.result.resolvedPhase,
      projectMode: projection.mode,
    })

    assert.equal(audit.valid, true)
    assert.ok(audit.result)
    assert.equal(audit.result.sourceSystem, "AUDIT_EVIDENCE")
    assert.equal(audit.result.targetSystem, "CREATIVE_DIRECTOR")
    assert.equal(audit.result.structuredOutput.persistenceApplied, false)
    assert.equal(audit.result.structuredOutput.mutationApplied, false)
    assert.ok(audit.result.evidenceRefs.includes("project-brain:stated:evidence:ev1"))
    assert.ok(audit.result.evidenceRefs.some((ref) => ref.startsWith("governed-action-receipt:")))
    assert.ok(audit.result.limitations.some((item) => item.includes("not a claim")))
  })
})
