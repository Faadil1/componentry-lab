import assert from "node:assert/strict"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

import {
  createProjectBrainNextActionProposal,
  executeProjectBrainNextActionProposal,
  fingerprintGovernedActionProposal,
  validateGovernedActionProposal,
} from "../lib/creative-os/action-plane"
import type { AuthorityContext } from "../lib/director/types"
import { fingerprintProjectBrain } from "../lib/projects/fingerprint"
import {
  appendProjectNextAction,
  PROJECT_NEXT_ACTION_APPEND_SCOPE,
  PROJECT_NEXT_ACTION_AUTHORITY_TARGET,
} from "../lib/projects/next-action-writer"
import { clearProjectRepositoryForTests, getProjectById } from "../lib/projects/repository"
import type { ProjectAction } from "../lib/projects/types"

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

function action(id = "gact-test-action"): ProjectAction {
  return {
    id,
    label: "Verify governed write",
    description: "Prove that an explicitly approved action can enter Project Brain.",
    phase: "verify",
    status: "todo",
  }
}

const directAppendAuthority: AuthorityContext = {
  authorityLevel: "local-reversible-execution",
  requestedAction: "Append governed next action",
  target: PROJECT_NEXT_ACTION_AUTHORITY_TARGET,
  reversibility: "reversible",
  risk: "low",
  approvalRequirement: "explicit",
  grantedScope: [PROJECT_NEXT_ACTION_APPEND_SCOPE],
  grantedBy: "owner-123",
  grantedAt: "2026-08-18T12:00:00.000Z",
  expiration: null,
  status: "granted",
}

async function withTempProjectRepository<T>(callback: () => Promise<T>): Promise<T> {
  const previousDataDir = process.env.COMPONENTRY_LAB_DATA_DIR
  const previousStorageMode = process.env.COMPONENTRY_LAB_STORAGE_MODE
  const root = join(tmpdir(), `governed-action-${Date.now()}-${Math.random().toString(16).slice(2)}`)
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

async function statedProject() {
  const project = await getProjectById("stated")
  assert.ok(project)
  return project
}

test("GOVERNED_ACTION_PROPOSAL_IS_VALID_AND_PURE", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const before = fingerprintProjectBrain(project)
    const projection = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-001",
      action: action(),
      proposedAt: "2026-08-18T12:00:00.000Z",
      evidenceRefs: ["evidence:director-next-action"],
      provenanceRefs: ["director:live"],
    })

    assert.equal(projection.valid, true)
    assert.ok(projection.proposal)
    assert.equal(projection.proposal.effectClass, "OWNER_STATE_MUTATION")
    assert.equal(projection.proposal.requiredAuthority, "LOCAL_REVERSIBLE")
    assert.equal(projection.proposal.humanReviewRequired, true)
    assert.deepEqual(projection.proposal.requiredScopes, [PROJECT_NEXT_ACTION_APPEND_SCOPE])
    assert.equal(fingerprintProjectBrain(await statedProject()), before)
  })
})

test("GOVERNED_ACTION_PROPOSAL_IS_DETERMINISTIC_FOR_THE_SAME_CANONICAL_INPUT", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const options = {
      correlationId: "corr-write-deterministic",
      action: action("deterministic-action"),
      proposedAt: "2026-08-18T12:00:00.000Z",
      evidenceRefs: ["evidence:b", "evidence:a"],
      provenanceRefs: ["director:live"],
    }
    const first = createProjectBrainNextActionProposal(project, options).proposal
    const second = createProjectBrainNextActionProposal(project, options).proposal
    assert.ok(first)
    assert.ok(second)
    assert.equal(first.actionId, second.actionId)
    assert.equal(fingerprintGovernedActionProposal(first), fingerprintGovernedActionProposal(second))
  })
})

test("ARBITRARY_OR_EXTERNAL_MUTATION_SHAPES_FAIL_CLOSED", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const proposal = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-invalid",
      action: action("invalid-effect"),
      proposedAt: "2026-08-18T12:00:00.000Z",
    }).proposal
    assert.ok(proposal)

    const external = validateGovernedActionProposal({
      ...proposal,
      effectClass: "EXTERNAL_SIDE_EFFECT",
      requiredAuthority: "EXPLICIT_EXTERNAL",
    })
    assert.equal(external.valid, false)
    assert.ok(external.errors.some((error) => error.includes("OWNER_STATE_MUTATION")))
    assert.ok(external.errors.some((error) => error.includes("LOCAL_REVERSIBLE")))

    const wrongSource = validateGovernedActionProposal({ ...proposal, sourceSystem: "CREATIVE_METHOD_RUNTIME" })
    assert.equal(wrongSource.valid, false)
    assert.ok(wrongSource.errors.some((error) => error.includes("CREATIVE_DIRECTOR")))

    const extraScope = validateGovernedActionProposal({
      ...proposal,
      requiredScopes: [PROJECT_NEXT_ACTION_APPEND_SCOPE, "project:phase:update"],
    })
    assert.equal(extraScope.valid, false)
    assert.ok(extraScope.errors.some((error) => error.includes("must contain only")))
  })
})

test("NEW_NEXT_ACTION_MUST_START_AS_TODO", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const projection = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-status",
      action: { ...action("already-doing"), status: "doing" },
      proposedAt: "2026-08-18T12:00:00.000Z",
    })
    assert.equal(projection.valid, false)
    assert.ok(projection.errors.some((error) => error.includes("must append a todo action")))
  })
})

test("ANONYMOUS_AND_NON_OWNER_APPROVALS_CAUSE_ZERO_MUTATION", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const projection = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-auth",
      action: action("auth-protected-action"),
      proposedAt: "2026-08-18T12:00:00.000Z",
    })
    assert.ok(projection.proposal)
    const proposal = projection.proposal
    const fingerprint = fingerprintGovernedActionProposal(proposal)

    const anonymous = await executeProjectBrainNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint: fingerprint },
      executedAt: "2026-08-18T12:01:00.000Z",
      sessionLoader: async () => null,
      authState: ownerAuthState,
    })
    assert.equal(anonymous.receipt.executionStatus, "REJECTED")
    assert.equal(anonymous.receipt.mutationApplied, false)

    const nonOwner = await executeProjectBrainNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint: fingerprint },
      executedAt: "2026-08-18T12:02:00.000Z",
      sessionLoader: async () => nonOwnerSession() as never,
      authState: ownerAuthState,
    })
    assert.equal(nonOwner.receipt.executionStatus, "REJECTED")
    assert.equal(nonOwner.receipt.mutationApplied, false)

    const after = await statedProject()
    assert.equal(after.nextActions.some((item) => item.id === "auth-protected-action"), false)
  })
})

test("APPROVAL_MUST_BIND_TO_THE_EXACT_PROPOSAL_FINGERPRINT", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const proposal = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-fingerprint",
      action: action("fingerprint-protected-action"),
      proposedAt: "2026-08-18T12:00:00.000Z",
    }).proposal
    assert.ok(proposal)

    const result = await executeProjectBrainNextActionProposal(proposal, {
      approvalIntent: { decision: "APPROVE", proposalFingerprint: "0".repeat(64) },
      executedAt: "2026-08-18T12:01:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })

    assert.equal(result.receipt.executionStatus, "REJECTED")
    assert.equal(result.receipt.mutationApplied, false)
    assert.equal((await statedProject()).nextActions.some((item) => item.id === "fingerprint-protected-action"), false)
  })
})

test("AUTHORIZED_OWNER_CAN_APPEND_EXACTLY_ONE_GOVERNED_NEXT_ACTION", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const beforeFingerprint = fingerprintProjectBrain(project)
    const proposal = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-apply",
      action: action("approved-next-action"),
      proposedAt: "2026-08-18T12:00:00.000Z",
      evidenceRefs: ["evidence:approved"],
    }).proposal
    assert.ok(proposal)

    const result = await executeProjectBrainNextActionProposal(proposal, {
      approvalIntent: {
        decision: "APPROVE",
        proposalFingerprint: fingerprintGovernedActionProposal(proposal),
      },
      executedAt: "2026-08-18T12:03:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })

    assert.equal(result.receipt.executionStatus, "APPLIED")
    assert.equal(result.receipt.mutationApplied, true)
    assert.equal(result.receipt.beforeFingerprint, beforeFingerprint)
    assert.ok(result.receipt.afterFingerprint)
    assert.notEqual(result.receipt.afterFingerprint, beforeFingerprint)
    assert.equal(result.approval?.approvedBy, "owner-123")
    assert.deepEqual(result.approval?.grantedScopes, [PROJECT_NEXT_ACTION_APPEND_SCOPE])

    const after = await statedProject()
    assert.equal(after.nextActions.filter((item) => item.id === "approved-next-action").length, 1)
    assert.equal(fingerprintProjectBrain(after), result.receipt.afterFingerprint)
  })
})

test("STALE_PROJECT_FINGERPRINT_BLOCKS_AN_ALREADY_APPROVED_SHAPE", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const proposal = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-stale",
      action: action("stale-proposal-action"),
      proposedAt: "2026-08-18T12:00:00.000Z",
    }).proposal
    assert.ok(proposal)

    const intervening = await appendProjectNextAction(
      {
        projectId: project.id,
        action: action("intervening-action"),
        expectedProjectFingerprint: fingerprintProjectBrain(project),
        executedAt: "2026-08-18T12:01:00.000Z",
      },
      directAppendAuthority,
    )
    assert.equal(intervening.status, "APPENDED")

    const stale = await executeProjectBrainNextActionProposal(proposal, {
      approvalIntent: {
        decision: "APPROVE",
        proposalFingerprint: fingerprintGovernedActionProposal(proposal),
      },
      executedAt: "2026-08-18T12:02:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })

    assert.equal(stale.receipt.executionStatus, "BLOCKED")
    assert.equal(stale.receipt.mutationApplied, false)
    const after = await statedProject()
    assert.equal(after.nextActions.some((item) => item.id === "intervening-action"), true)
    assert.equal(after.nextActions.some((item) => item.id === "stale-proposal-action"), false)
  })
})

test("DUPLICATE_ACTION_ID_WITH_DIFFERENT_CONTENT_FAILS_CLOSED", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    assert.ok(project.nextActions.some((item) => item.id === "act1"))
    const proposal = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-duplicate",
      action: {
        id: "act1",
        label: "Conflicting replacement",
        description: "This must never overwrite an existing canonical next action.",
        phase: "verify",
        status: "todo",
      },
      proposedAt: "2026-08-18T12:00:00.000Z",
    }).proposal
    assert.ok(proposal)

    const result = await executeProjectBrainNextActionProposal(proposal, {
      approvalIntent: {
        decision: "APPROVE",
        proposalFingerprint: fingerprintGovernedActionProposal(proposal),
      },
      executedAt: "2026-08-18T12:01:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })

    assert.equal(result.receipt.executionStatus, "BLOCKED")
    assert.equal(result.receipt.mutationApplied, false)
    assert.ok(result.receipt.error?.includes("different content"))
  })
})

test("EXACT_DUPLICATE_IS_IDEMPOTENT_NO_CHANGE", async () => {
  await withTempProjectRepository(async () => {
    const project = await statedProject()
    const existing = project.nextActions.find((item) => item.id === "act1")
    assert.ok(existing)
    const proposal = createProjectBrainNextActionProposal(project, {
      correlationId: "corr-write-idempotent",
      action: existing,
      proposedAt: "2026-08-18T12:00:00.000Z",
    }).proposal
    assert.ok(proposal)

    const result = await executeProjectBrainNextActionProposal(proposal, {
      approvalIntent: {
        decision: "APPROVE",
        proposalFingerprint: fingerprintGovernedActionProposal(proposal),
      },
      executedAt: "2026-08-18T12:01:00.000Z",
      sessionLoader: async () => ownerSession() as never,
      authState: ownerAuthState,
    })

    assert.equal(result.receipt.executionStatus, "NO_CHANGE")
    assert.equal(result.receipt.mutationApplied, false)
    assert.equal(result.receipt.beforeFingerprint, result.receipt.afterFingerprint)
    assert.equal((await statedProject()).nextActions.filter((item) => item.id === "act1").length, 1)
  })
})
