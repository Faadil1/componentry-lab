import assert from "node:assert/strict"
import { existsSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

import { createProject, clearProjectRepositoryForTests } from "../lib/projects/repository"
import { guardCanonicalProjectWrite } from "../lib/projects/project-write-gate"
import { guardCanonicalPlanWrite } from "../lib/creative-os/production/plan-write-gate"
import { savePlan, clearPlanningRepositoryForTests, listPlansForProject } from "../lib/creative-os/production/planning-repository"
import { requireCanonicalWriteAccess } from "../lib/security/canonical-write-access"
import type { AuthorityContext } from "../lib/director/types"
import type { ExternalCapabilityPlan } from "../lib/creative-os/film-kit/types"

const ownerAuthState = {
  getOwnerGithubAccountId: () => "owner-123",
  canAuthorizeOwnerGithubAccount: (providerAccountId: string | undefined | null) => providerAccountId === "owner-123",
}

const validProjectAuthority: AuthorityContext = {
  authorityLevel: "local-reversible-execution",
  requestedAction: "Create project",
  target: "project-repository",
  reversibility: "reversible",
  risk: "low",
  approvalRequirement: "explicit",
  grantedScope: ["project:create"],
  grantedBy: "system",
  grantedAt: new Date().toISOString(),
  expiration: null,
  status: "granted",
}

const invalidProjectAuthority: AuthorityContext = {
  ...validProjectAuthority,
  status: "denied",
}

function makeOwnerSession() {
  return { user: { id: "owner-123" } }
}

function makeNonOwnerSession() {
  return { user: { id: "someone-else" } }
}

function makeProjectInput() {
  return {
    title: "Owner Protected Project",
    kind: "website" as const,
    problem: "Protect canonical writes",
    primaryGoal: "Require owner authorization",
    successDefinition: "Gate write access",
    brief: "Security gate proof",
  }
}

function makePlan(projectId: string): ExternalCapabilityPlan {
  return {
    projectId,
    projectBrainFingerprint: `${projectId}-brain`,
    resourceId: "res_video_shotcraft",
    capabilityId: "PROMPT_SHARE_LINK_CREATION",
    decomposedCapabilities: ["CINEMATIC_PROMPTING"],
    requestedArtifact: "product-demo-film",
    compatibilityStatus: "VERIFIED",
    compatibilityEvidence: "fixture",
    lifecycleState: "VALIDATED",
    currentAuthority: "LOCAL_REVERSIBLE",
    requiredAuthority: "LOCAL_REVERSIBLE",
    requiredHumanApproval: true,
    humanApprovalState: "GRANTED",
    costStatus: "FREE",
    estimatedCost: null,
    privacyStatus: "ZERO_RETENTION",
    licenseStatus: "CLEARED",
    requiredInputs: ["project-brain"],
    expectedOutputs: ["film-plan"],
    executionMode: "NOT_EXECUTED",
    executionStatus: "HUMAN_APPROVAL_REQUIRED",
    blockers: [],
    missingEvidence: [],
    planFingerprint: `${projectId}-plan`,
  }
}

async function withTempProjectDataDir<T>(callback: () => Promise<T> | T): Promise<T> {
  const previous = process.env.COMPONENTRY_LAB_DATA_DIR
  const tempRoot = join(tmpdir(), `release-01d-b-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  process.env.COMPONENTRY_LAB_DATA_DIR = tempRoot
  clearProjectRepositoryForTests()
  clearPlanningRepositoryForTests()
  try {
    return await callback()
  } finally {
    clearProjectRepositoryForTests()
    clearPlanningRepositoryForTests()
    if (previous === undefined) {
      delete process.env.COMPONENTRY_LAB_DATA_DIR
    } else {
      process.env.COMPONENTRY_LAB_DATA_DIR = previous
    }
    rmSync(tempRoot, { recursive: true, force: true })
  }
}

test("RELEASE-01D-B write gate rejects anonymous project writes", async () => {
  let persisted = 0
  const result = await guardCanonicalProjectWrite({
    sessionLoader: async () => null,
    authState: ownerAuthState,
    persistProject: async () => {
      persisted += 1
      return { status: "CREATED" }
    },
  })

  assert.equal("ok" in result && result.ok, false)
  assert.equal(persisted, 0)
})

test("RELEASE-01D-B write gate rejects authenticated non-owner project writes", async () => {
  let persisted = 0
  const result = await guardCanonicalProjectWrite({
    sessionLoader: async () => makeNonOwnerSession() as never,
    authState: ownerAuthState,
    persistProject: async () => {
      persisted += 1
      return { status: "CREATED" }
    },
  })

  assert.equal("ok" in result && result.ok, false)
  assert.equal(persisted, 0)
})

test("RELEASE-01D-B project writes require owner auth before canonical persistence", async () => {
  await withTempProjectDataDir(async () => {
    const result = await guardCanonicalProjectWrite({
      sessionLoader: async () => makeOwnerSession() as never,
      authState: ownerAuthState,
      persistProject: async () => createProject(makeProjectInput(), validProjectAuthority),
    })

    assert.equal("status" in result ? result.status : undefined, "CREATED")
  })
})

test("RELEASE-01D-B owner auth does not grant project domain authority", async () => {
  await withTempProjectDataDir(async () => {
    const result = await guardCanonicalProjectWrite({
      sessionLoader: async () => makeOwnerSession() as never,
      authState: ownerAuthState,
      persistProject: async () => createProject(makeProjectInput(), invalidProjectAuthority),
    })

    assert.equal("status" in result ? result.status : undefined, "INSUFFICIENT_AUTHORITY")
  })
})

test("RELEASE-01D-B auth rejection causes zero project persistence writes", async () => {
  await withTempProjectDataDir(async () => {
    let persisted = 0
    const result = await guardCanonicalProjectWrite({
      sessionLoader: async () => null,
      authState: ownerAuthState,
      persistProject: async () => {
        persisted += 1
        return { status: "CREATED" }
      },
    })

    assert.equal("ok" in result && result.ok, false)
    assert.equal(persisted, 0)
  })
})

test("RELEASE-01D-B write gate rejects anonymous plan writes", async () => {
  let persisted = 0
  const result = await guardCanonicalPlanWrite({
    sessionLoader: async () => null,
    authState: ownerAuthState,
    persistPlan: async () => {
      persisted += 1
      return { status: "SAVED" }
    },
  })

  assert.equal("ok" in result && result.ok, false)
  assert.equal(persisted, 0)
})

test("RELEASE-01D-B write gate rejects authenticated non-owner plan writes", async () => {
  let persisted = 0
  const result = await guardCanonicalPlanWrite({
    sessionLoader: async () => makeNonOwnerSession() as never,
    authState: ownerAuthState,
    persistPlan: async () => {
      persisted += 1
      return { status: "SAVED" }
    },
  })

  assert.equal("ok" in result && result.ok, false)
  assert.equal(persisted, 0)
})

test("RELEASE-01D-B plan writes require owner auth before canonical persistence", async () => {
  await withTempProjectDataDir(async () => {
    const plan = makePlan("owner-plan-project")
    const result = await guardCanonicalPlanWrite({
      sessionLoader: async () => makeOwnerSession() as never,
      authState: ownerAuthState,
      persistPlan: async () => savePlan(plan),
    })

    assert.equal("status" in result ? result.status : undefined, "SAVED")
    assert.ok(plan.projectId)
    assert.equal((await listPlansForProject(plan.projectId)).length, 1)
  })
})

test("RELEASE-01D-B owner auth does not grant plan domain authority", async () => {
  await withTempProjectDataDir(async () => {
    const plan = makePlan("owner-invalid-plan")
    const invalidPlan: ExternalCapabilityPlan = { ...plan, planFingerprint: "" }
    const result = await guardCanonicalPlanWrite({
      sessionLoader: async () => makeOwnerSession() as never,
      authState: ownerAuthState,
      persistPlan: async () => savePlan(invalidPlan),
    })

    assert.equal("status" in result ? result.status : undefined, "INVALID_INPUT")
  })
})

test("RELEASE-01D-B auth rejection causes zero plan persistence writes", async () => {
  await withTempProjectDataDir(async () => {
    let persisted = 0
    const result = await guardCanonicalPlanWrite({
      sessionLoader: async () => null,
      authState: ownerAuthState,
      persistPlan: async () => {
        persisted += 1
        return { status: "SAVED" }
      },
    })

    assert.equal("ok" in result && result.ok, false)
    assert.equal(persisted, 0)
  })
})

test("RELEASE-01D-B project write auth check happens before persistence callback", async () => {
  let checked = 0
  let persisted = 0
  await guardCanonicalProjectWrite({
    sessionLoader: async () => {
      checked += 1
      return null
    },
    authState: ownerAuthState,
    persistProject: async () => {
      persisted += 1
      return { status: "CREATED" }
    },
  })

  assert.equal(checked, 1)
  assert.equal(persisted, 0)
})

test("RELEASE-01D-B plan write auth check happens before persistence callback", async () => {
  let checked = 0
  let persisted = 0
  await guardCanonicalPlanWrite({
    sessionLoader: async () => {
      checked += 1
      return null
    },
    authState: ownerAuthState,
    persistPlan: async () => {
      persisted += 1
      return { status: "SAVED" }
    },
  })

  assert.equal(checked, 1)
  assert.equal(persisted, 0)
})

test("RELEASE-01D-B public read surfaces remain public and require no global middleware", () => {
  const root = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
  const projectsNew = readFileSync(new URL("../app/projects/new/page.tsx", import.meta.url), "utf8")
  const filmKit = readFileSync(new URL("../app/film-kit/[projectId]/page.tsx", import.meta.url), "utf8")

  assert.equal(existsSync(new URL("../middleware.ts", import.meta.url)), false)
  assert.equal(root.includes("requireCanonicalWriteAccess"), false)
  assert.equal(projectsNew.includes("requireCanonicalWriteAccess"), true)
  assert.equal(filmKit.includes("requireCanonicalWriteAccess"), true)
})

test("RELEASE-01D-B client-supplied identity cannot authorize writes", async () => {
  const result = await requireCanonicalWriteAccess(
    async () => ({ user: { id: "client-supplied-id" } }) as never,
    {
      getOwnerGithubAccountId: () => "owner-123",
      canAuthorizeOwnerGithubAccount: () => false,
    },
  )

  assert.equal(result.ok, false)
  assert.equal(result.principal.reason, "non-owner")
})

test("RELEASE-01D-B no development bypass is present in the write gate", () => {
  const source = readFileSync(new URL("../lib/security/canonical-write-access.ts", import.meta.url), "utf8")
  assert.equal(source.includes("NODE_ENV"), false)
  assert.equal(source.includes("development anonymous"), false)
})
