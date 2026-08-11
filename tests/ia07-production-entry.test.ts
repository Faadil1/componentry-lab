import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import os from "node:os"
import test, { after, beforeEach, describe } from "node:test"

import { buildCommandProjection } from "../lib/command/projection"
import { buildProductionEntryProposal } from "../lib/creative-os/production/entry"
import { dispatchExternalCapabilityPlan } from "../lib/creative-os/film-kit/dispatcher"
import {
  clearPlanningRepositoryForTests,
  getPlanningRepositoryHealth,
  getPlanningRepositoryPath,
  listPlansForProject,
  savePlan,
} from "../lib/creative-os/production/planning-repository"
import { getFilmProductionIntent } from "../lib/film-kit/production-adapter"
import { getFilmProjectById } from "../lib/film-kit/selectors"
import type { ResourceEvaluation } from "../lib/creative-os/types"
import {
  clearProjectRepositoryForTests,
  createProject,
  getProjectRepositoryPath,
} from "../lib/projects/repository"
import type { AuthorityContext } from "../lib/director/types"
import { RESOURCE_REGISTRY } from "../lib/creative-os/registry"
import type { ExternalCapabilityPlanRequest } from "../lib/creative-os/film-kit/types"

const tempRoot = mkdtempSync(join(os.tmpdir(), "ia07-production-entry-"))
const projectRepositoryPath = join(tempRoot, "projects.json")
const planningRepositoryPath = join(tempRoot, "plans.json")

process.env.COMPONENTRY_LAB_DATA_DIR = tempRoot
process.env.COMPONENTRY_LAB_PROJECT_REPOSITORY_PATH = projectRepositoryPath

type PlanningRequest = ExternalCapabilityPlanRequest

const LOCAL_CREATE_AUTHORITY: AuthorityContext = {
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

function resetRepositories() {
  clearProjectRepositoryForTests()
  clearPlanningRepositoryForTests()
  if (existsSync(projectRepositoryPath)) {
    writeFileSync(projectRepositoryPath, JSON.stringify({ runtimeProjects: [] }, null, 2), "utf8")
  }
  if (existsSync(planningRepositoryPath)) {
    writeFileSync(planningRepositoryPath, JSON.stringify({ plans: [] }, null, 2), "utf8")
  }
}

beforeEach(() => {
  resetRepositories()
})

after(() => {
  rmSync(tempRoot, { recursive: true, force: true })
})

function makePlan(projectId: string, request: PlanningRequest, selectedResource: ResourceEvaluation | null) {
  return dispatchExternalCapabilityPlan(request, selectedResource)
}

describe("IA-07A canonical planning truth persistence", () => {
  test("intent alone does not create canonical planning truth", async () => {
    const film = getFilmProjectById("stated")
    assert.ok(film)

    const intent = getFilmProductionIntent(film)

    assert.ok(intent.requestedOutputs.length > 0)
    assert.equal((await listPlansForProject("stated")).length, 0)
    assert.equal(getPlanningRepositoryHealth(), "ABSENT")
  })

  test("page load creates no plan and keeps production intent separate from plan truth", async () => {
    const film = getFilmProjectById("glow-atelier")
    assert.ok(film)

    const proposal = await buildProductionEntryProposal(film as never, film)

    assert.equal((await listPlansForProject("glow-atelier")).length, 0)
    assert.equal(proposal.plan, null)
    assert.equal(proposal.routeTruth, null)
    assert.equal(proposal.routePreview, null)
  })

  test("page-level projection reads persisted plan truth rather than reconstructing it", async () => {
    const project = await createProject({
      title: "IA07 Stated Plan",
      kind: "client-product",
      problem: "Prove canonical planning truth persists separately from Film Kit intent.",
      primaryGoal: "Persist one canonical plan record and keep routes at zero.",
    }, LOCAL_CREATE_AUTHORITY)
    assert.equal(project.status, "CREATED")

    const request: PlanningRequest = {
      capabilityGap: "PROMPT_SHARE_LINK_CREATION",
      artifactType: "product-demo-film",
      projectMode: "DAY_CHALLENGE",
      phase: project.project!.currentPhase as never,
      currentAuthority: "LOCAL_REVERSIBLE",
      frameworkOrSurface: "IA-07A planning review",
      metadata: { projectId: project.project!.id },
    }

    const plan = { ...makePlan(project.project!.id, request, null), projectId: project.project!.id, projectBrainFingerprint: project.project!.id }
    const planResult = await savePlan(plan)
    assert.equal(planResult.status, "SAVED")
    assert.equal((await listPlansForProject(project.project!.id)).length, 1)

    const proposal = await buildProductionEntryProposal(project.project!, getFilmProjectById("stated") ?? null)

    assert.equal(proposal.plan?.planFingerprint, planResult.plan?.planFingerprint)
    assert.equal(proposal.legitimacy, "LEGITIMATE_FILM_KIT_PRODUCTION_NEED_WITH_CANONICAL_MAPPING")
    assert.equal(proposal.routeTruth?.requestedArtifactType, "product-demo-film")
    assert.equal(proposal.routeTruth?.routeType, "NO_MATCH")
    assert.equal(proposal.routePreview?.routeType, "NO_MATCH")
  })

  test("explicit planning action produces an ExternalCapabilityPlan and remains idempotent for the exact same request", async () => {
    const project = await createProject({
      title: "IA07 Idempotent Plan",
      kind: "client-product",
      problem: "Prove the canonical planner is deterministic and persisted once per exact request.",
      primaryGoal: "Persist one plan record and preserve exact-request idempotency.",
    }, LOCAL_CREATE_AUTHORITY)
    assert.equal(project.status, "CREATED")

    const request: PlanningRequest = {
      capabilityGap: "PROMPT_SHARE_LINK_CREATION",
      artifactType: "product-demo-film",
      projectMode: "DAY_CHALLENGE",
      phase: project.project!.currentPhase as never,
      currentAuthority: "LOCAL_REVERSIBLE",
      frameworkOrSurface: "Exact request idempotency",
      metadata: { projectId: project.project!.id, purpose: "idempotency" },
    }

    const firstPlan = { ...makePlan(project.project!.id, request, null), projectId: project.project!.id, projectBrainFingerprint: project.project!.id }
    const first = await savePlan(firstPlan)
    const second = await savePlan(firstPlan)

    assert.equal(first.status, "SAVED")
    assert.ok(first.plan)
    assert.equal(first.plan?.executionMode, "NOT_EXECUTED")
    assert.equal(second.status, "ALREADY_EXISTS")
    assert.equal(second.existingPlan?.planFingerprint, first.plan?.planFingerprint)
    assert.equal((await listPlansForProject(project.project!.id)).length, 1)
  })

  test("materially changed request identity yields a different canonical plan fingerprint", async () => {
    const project = await createProject({
      title: "IA07 Changed Request",
      kind: "creative-experiment",
      problem: "Show that changed requests do not collapse to the same plan.",
      primaryGoal: "Make the request fingerprint change when the requested output changes.",
    }, LOCAL_CREATE_AUTHORITY)
    assert.equal(project.status, "CREATED")

    const firstPlan = { ...makePlan(project.project!.id, {
      capabilityGap: "PROMPT_SHARE_LINK_CREATION",
      artifactType: "product-demo-film",
      projectMode: "MARA",
      phase: project.project!.currentPhase as never,
      currentAuthority: "LOCAL_REVERSIBLE",
      frameworkOrSurface: "Changed request A",
      metadata: { projectId: project.project!.id },
    }, null), projectId: project.project!.id, projectBrainFingerprint: project.project!.id }
    const secondPlan = { ...makePlan(project.project!.id, {
      capabilityGap: "PROMPT_SHARE_LINK_CREATION",
      artifactType: "shotlist",
      projectMode: "MARA",
      phase: project.project!.currentPhase as never,
      currentAuthority: "LOCAL_REVERSIBLE",
      frameworkOrSurface: "Changed request B",
      metadata: { projectId: project.project!.id },
    }, null), projectId: project.project!.id, projectBrainFingerprint: project.project!.id }

    const first = await savePlan(firstPlan)
    const second = await savePlan(secondPlan)

    assert.equal(first.status, "SAVED")
    assert.equal(second.status, "SAVED")
    assert.notEqual(first.plan?.planFingerprint, second.plan?.planFingerprint)
    assert.equal((await listPlansForProject(project.project!.id)).length, 2)
  })

  test("discovery-feed resources are rejected without producing route truth or execution side effects", async () => {
    const project = await createProject({
      title: "IA07 Discovery Feed",
      kind: "creative-experiment",
      problem: "Make discovery feeds fail closed in the planning layer.",
      primaryGoal: "Preserve the no-execution contract.",
    }, LOCAL_CREATE_AUTHORITY)
    assert.equal(project.status, "CREATED")

    const discovery = RESOURCE_REGISTRY.find((resource) => resource.id === "res_awesome_claude_code_skills") as unknown as ResourceEvaluation
    const result = await savePlan({ ...makePlan(project.project!.id, {
      capabilityGap: "skill-discovery",
      artifactType: "skill-feed",
      projectMode: "HACKATHON",
      phase: project.project!.currentPhase as never,
      currentAuthority: "LOCAL_REVERSIBLE",
      frameworkOrSurface: "Discovery feed review",
      metadata: { projectId: project.project!.id },
    }, discovery), projectId: project.project!.id, projectBrainFingerprint: project.project!.id })

    assert.equal(result.status, "SAVED")
    assert.equal(result.plan?.executionStatus, "DISCOVERY_REQUIRED")
    assert.equal(result.plan?.licenseStatus, "UNKNOWN")
    assert.equal(result.plan?.privacyStatus, "UNKNOWN")
    assert.equal(result.plan?.estimatedCost, null)
  })

  test("review projection reads persisted canonical plan truth and does not persist the request payload", async () => {
    const project = await createProject({
      title: "IA07 Review Source",
      kind: "client-product",
      problem: "Show that the review source is the persisted canonical plan, not the request payload.",
      primaryGoal: "Keep request payloads out of persistence.",
    }, LOCAL_CREATE_AUTHORITY)
    assert.equal(project.status, "CREATED")

    const result = await savePlan({ ...makePlan(project.project!.id, {
      capabilityGap: "PROMPT_SHARE_LINK_CREATION",
      artifactType: "product-demo-film",
      projectMode: "DAY_CHALLENGE",
      phase: project.project!.currentPhase as never,
      currentAuthority: "LOCAL_REVERSIBLE",
      frameworkOrSurface: "Review source",
      metadata: { projectId: project.project!.id },
    }, null), projectId: project.project!.id, projectBrainFingerprint: project.project!.id })

    assert.equal(result.status, "SAVED")
    const disk = JSON.parse(readFileSync(getPlanningRepositoryPath(), "utf8")) as { plans: Array<Record<string, unknown>> }
    assert.equal(Array.isArray(disk.plans), true)
    assert.equal(disk.plans[0]?.projectId, project.project!.id)
    assert.equal(Object.prototype.hasOwnProperty.call(disk.plans[0] ?? {}, "request"), false)
    assert.equal(typeof disk.plans[0]?.planFingerprint, "string")
  })

  test("corrupt planning repository blocks writes and preserves prior truth on disk", async () => {
    const project = await createProject({
      title: "IA07 Corrupt Plan",
      kind: "client-product",
      problem: "Guard the canonical planning repository from corruption.",
      primaryGoal: "Fail closed before inventing a new plan truth.",
    }, LOCAL_CREATE_AUTHORITY)

    const saved = await savePlan({ ...makePlan(project.project!.id, {
      capabilityGap: "PROMPT_SHARE_LINK_CREATION",
      artifactType: "product-demo-film",
      projectMode: "DAY_CHALLENGE",
      phase: project.project!.currentPhase as never,
      currentAuthority: "LOCAL_REVERSIBLE",
      frameworkOrSurface: "Stable review",
      metadata: { projectId: project.project!.id },
    }, null), projectId: project.project!.id, projectBrainFingerprint: project.project!.id })
    assert.equal(saved.status, "SAVED")

    writeFileSync(getPlanningRepositoryPath(), "{not-json", "utf8")

    const failed = await savePlan({ ...makePlan(project.project!.id, {
      capabilityGap: "PROMPT_SHARE_LINK_CREATION",
      artifactType: "product-demo-film",
      projectMode: "DAY_CHALLENGE",
      phase: project.project!.currentPhase as never,
      currentAuthority: "LOCAL_REVERSIBLE",
      frameworkOrSurface: "Stable review",
      metadata: { projectId: project.project!.id },
    }, null), projectId: project.project!.id, projectBrainFingerprint: project.project!.id })

    assert.equal(failed.status, "REPOSITORY_CORRUPT")
    assert.equal(getPlanningRepositoryHealth(), "CORRUPT")
  })

  test("stated and glow-atelier resolve the same project identity through command, film kit, and planning truth", async () => {
    const statedProjection = await buildCommandProjection("stated")
    const glowProjection = await buildCommandProjection("glow-atelier")

    assert.ok(statedProjection.activeProject)
    assert.ok(glowProjection.activeProject)
    assert.equal(statedProjection.activeProject?.id, "stated")
    assert.equal(glowProjection.activeProject?.id, "glow-atelier")
    assert.equal(statedProjection.directorAvailability, "AVAILABLE")
    assert.equal(glowProjection.directorAvailability, "AVAILABLE")
    assert.equal(statedProjection.heroDemo?.title.length ?? 0, statedProjection.heroDemo?.title.length ?? 0)
    assert.equal(glowProjection.heroDemo?.title.length ?? 0, glowProjection.heroDemo?.title.length ?? 0)
  })

  test("project and plan repositories stay isolated from route creation", async () => {
    assert.equal(getProjectRepositoryPath().includes("project-repository"), true)
    assert.equal(getPlanningRepositoryPath().includes("planning-repository"), true)
    assert.equal((await listPlansForProject("stated")).length, 0)
    assert.equal((await listPlansForProject("glow-atelier")).length, 0)
  })
})
