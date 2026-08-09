import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import os from "node:os"
import test, { describe, beforeEach, afterEach, after } from "node:test"

import { buildCommandProjection } from "../lib/command/projection"
import { getFilmProjectById, getFilmProjectSource } from "../lib/film-kit/selectors"
import { getFilmProductionTruth } from "../lib/film-kit/production-adapter"
import { CANONICAL_DEFAULT_PROJECT_ID, getProjectById } from "../lib/projects/selectors"
import type { AuthorityContext } from "../lib/director/types"
import {
  clearProjectRepositoryForTests,
  createProject,
  getProjectById as getRuntimeProjectById,
  getProjectBySlug,
  getProjectRepositoryPath,
  listProjects as listRuntimeProjects,
  resolveProjectMode,
  getProjectDataDirResolution,
  getProjectRepositoryHealth,
} from "../lib/projects/repository"

const tempRoot = mkdtempSync(join(os.tmpdir(), "ia06-project-repo-"))
const repositoryFilePath = join(tempRoot, "projects.json")
process.env.COMPONENTRY_LAB_PROJECT_REPOSITORY_PATH = repositoryFilePath

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

function resetRepository() {
  clearProjectRepositoryForTests()
  if (existsSync(repositoryFilePath)) {
    writeFileSync(repositoryFilePath, JSON.stringify({ runtimeProjects: [] }, null, 2), "utf8")
  }
}

beforeEach(() => {
  resetRepository()
})

afterEach(() => {
  resetRepository()
})

after(() => {
  rmSync(tempRoot, { recursive: true, force: true })
})

describe("IA-06 governed project intake", () => {
  test("creates a runtime project without mutating presets", () => {
    const result = createProject({
      title: "Glow Atelier Launch Intake",
      kind: "client-product",
      problem: "Centralize the intake for a new beauty service workflow.",
      primaryGoal: "Preserve the project identity through projects, command, and film kit.",
      brief: "Brief for a governed intake flow.",
      successDefinition: "The runtime repository stores a stable project record.",
    }, LOCAL_CREATE_AUTHORITY)

    assert.equal(result.status, "CREATED")
    assert.ok(result.project)
    assert.equal(result.project?.id, "glow-atelier-launch-intake")
    assert.equal(getRuntimeProjectById(result.project!.id)?.id, result.project!.id)
    assert.equal(getProjectBySlug("glow-atelier-launch-intake")?.id, result.project!.id)
    assert.equal(getProjectById(CANONICAL_DEFAULT_PROJECT_ID)?.id, CANONICAL_DEFAULT_PROJECT_ID)
    assert.equal(listRuntimeProjects().some((project) => project.id === result.project!.id), true)
  })

  test("does not silently overwrite an existing project id", () => {
    const first = createProject({
      title: "Shared Intake",
      kind: "client-product",
      problem: "First record.",
      primaryGoal: "Persist the first record.",
    }, LOCAL_CREATE_AUTHORITY)
    const second = createProject({
      title: "Shared Intake",
      kind: "client-product",
      problem: "Second record.",
      primaryGoal: "Persist the second record.",
    }, LOCAL_CREATE_AUTHORITY)

    assert.equal(first.status, "CREATED")
    assert.equal(second.status, "CREATED")
    assert.equal(first.project?.id, "shared-intake")
    assert.equal(second.project?.id, "shared-intake-2")
    assert.equal(listRuntimeProjects().filter((project) => project.slug.startsWith("shared-intake")).length, 2)
  })

  test("fails closed on unsupported kind and invalid input", () => {
    const unsupported = createProject({
      title: "Unsupported",
      kind: "not-a-kind" as never,
      problem: "Problem",
      primaryGoal: "Goal",
    }, LOCAL_CREATE_AUTHORITY)
    const missing = createProject({
      title: "",
      kind: "client-product",
      problem: "",
      primaryGoal: "",
    }, LOCAL_CREATE_AUTHORITY)

    assert.equal(unsupported.status, "UNSUPPORTED_KIND")
    assert.equal(missing.status, "VALIDATION_FAILED")
  })

  test("preserves the canonical default project and does not replace it", () => {
    const stated = getProjectById(CANONICAL_DEFAULT_PROJECT_ID)
    const created = createProject({
      title: "Stated Followup",
      kind: "product-prototype",
      problem: "Follow-up intake",
      primaryGoal: "Keep canonical default intact.",
    }, LOCAL_CREATE_AUTHORITY)

    assert.ok(stated)
    assert.equal(stated?.id, CANONICAL_DEFAULT_PROJECT_ID)
    assert.equal(created.status, "CREATED")
    assert.equal(getProjectById(CANONICAL_DEFAULT_PROJECT_ID)?.id, CANONICAL_DEFAULT_PROJECT_ID)
  })

  test("persists created projects across reloads and cleanly reloads the repository", () => {
    const created = createProject({
      title: "Repository Reload Test",
      kind: "internal-tool",
      problem: "Need persistence after restart.",
      primaryGoal: "Prove the JSON repository reloads from disk.",
    }, LOCAL_CREATE_AUTHORITY)

    assert.equal(created.status, "CREATED")
    assert.ok(existsSync(getProjectRepositoryPath()))

    assert.equal(listRuntimeProjects().some((project) => project.id === created.project!.id), true)
  })

  test("new projects stay truthfully empty without fabricated evidence or hero demo state", () => {
    const created = createProject({
      title: "Empty Truth Project",
      kind: "creative-experiment",
      problem: "Need a new governed record.",
      primaryGoal: "Prove the initializer does not invent proof.",
    }, LOCAL_CREATE_AUTHORITY)

    assert.equal(created.status, "CREATED")
    assert.ok(created.project)
    assert.equal(created.project?.evidence.length, 0)
    assert.equal(created.project?.selectedPlaybookIds.length, 0)
    assert.equal(created.project?.selectedRegistryIds.length, 0)
    assert.equal(created.project?.heroDemoMoment, "")
    assert.equal(created.project?.capturePlan.states.length, 0)
    assert.equal(created.project?.videoPlan.purpose, "")
    assert.equal(created.project?.publicationGate, false)
  })

  test("project kind maps deterministically to runtime mode", () => {
    assert.equal(resolveProjectMode("client-product"), "DAY_CHALLENGE")
    assert.equal(resolveProjectMode("internal-tool"), "DAY_CHALLENGE")
    assert.equal(resolveProjectMode("creative-experiment"), "MARA")
    assert.equal(resolveProjectMode("data-story"), "DATA_STORY")
  })

  test("command, film kit, and production truth preserve the same stated project id", () => {
    const projection = buildCommandProjection("stated")
    const filmProject = getFilmProjectById("stated")
    const filmSource = getFilmProjectSource("stated")
    const productionTruth = getFilmProductionTruth("stated")

    assert.ok(projection.activeProject)
    assert.equal(projection.activeProject?.id, "stated")
    assert.equal(projection.activeProject?.id, filmProject?.id)
    assert.equal(projection.activeProject?.id, filmSource?.id)
    assert.equal(projection.directorAvailability, "AVAILABLE")
    assert.ok(projection.heroDemo?.title.length ?? 0)
    assert.equal(projection.productionIntentSummary?.intentDefined, true)
    assert.equal(productionTruth.availability, "NO_CANONICAL_PRODUCTION_SPINE")
    assert.equal(productionTruth.routes.length, 0)
    assert.equal(productionTruth.artifacts.length, 0)
    assert.equal(productionTruth.manifest, null)
  })

  test("northstar preserves identity while film kit fails closed without fabrication", () => {
    const created = createProject({
      title: "Northstar",
      kind: "client-product",
      problem: "Create a shared project identity that survives refresh and restart.",
      primaryGoal: "Prove canonical project context persists across Projects, Command, and Film Kit.",
      brief: "Northstar is the IA-06 review project.",
      successDefinition: "The same project ID remains visible after navigation and restart.",
    }, LOCAL_CREATE_AUTHORITY)
    const projection = buildCommandProjection(created.project!.id)
    const filmProject = getFilmProjectById(created.project!.id)
    const productionTruth = getFilmProductionTruth(created.project!.id)

    assert.ok(projection.activeProject)
    assert.equal(projection.activeProject?.id, created.project!.id)
    assert.equal(projection.activeProject?.kind, "client-product")
    assert.equal(projection.directorAvailability, "AVAILABLE")
    assert.equal(projection.heroDemo?.readinessStatus, "not-ready")
    assert.equal(projection.heroDemo?.title ?? "", "")
    assert.equal(projection.directorNextAction?.title, "Validate single-day hero proof")
    assert.equal(projection.productionIntentSummary, null)
    assert.equal(projection.canonicalProductionAvailability?.availability, "NO_CANONICAL_PRODUCTION_SPINE")
    assert.equal(projection.canonicalProductionAvailability?.routes, 0)
    assert.equal(projection.canonicalProductionAvailability?.artifacts, 0)
    assert.equal(projection.canonicalProductionAvailability?.manifest, "none")
    assert.equal(projection.canonicalProductionAvailability?.nextAssemblyStep, null)
    assert.equal(filmProject, undefined)
    assert.equal(productionTruth.availability, "NO_CANONICAL_PRODUCTION_SPINE")
    assert.equal(productionTruth.routes.length, 0)
    assert.equal(productionTruth.artifacts.length, 0)
    assert.equal(productionTruth.manifest, null)
  })

  test("duplicate Northstar creation auto-suffixes and preserves the original", () => {
    const first = createProject({
      title: "Northstar",
      kind: "client-product",
      problem: "Create a shared project identity that survives refresh and restart.",
      primaryGoal: "Prove canonical project context persists across Projects, Command, and Film Kit.",
      brief: "Northstar is the IA-06 review project.",
      successDefinition: "The same project ID remains visible after navigation and restart.",
    }, LOCAL_CREATE_AUTHORITY)
    const second = createProject({
      title: "Northstar",
      kind: "client-product",
      problem: "Create a shared project identity that survives refresh and restart.",
      primaryGoal: "Prove canonical project context persists across Projects, Command, and Film Kit.",
      brief: "Northstar is the IA-06 review project.",
      successDefinition: "The same project ID remains visible after navigation and restart.",
    }, LOCAL_CREATE_AUTHORITY)

    assert.equal(first.status, "CREATED")
    assert.equal(second.status, "CREATED")
    assert.equal(first.project?.id, "northstar")
    assert.equal(second.project?.id, "northstar-2")
    assert.equal(getRuntimeProjectById("northstar")?.title, "Northstar")
    assert.equal(getRuntimeProjectById("northstar-2")?.title, "Northstar")
    assert.equal(listRuntimeProjects().some((project) => project.id === "northstar"), true)
    assert.equal(listRuntimeProjects().some((project) => project.id === "northstar-2"), true)
  })

  test("duplicate success notice persists in source and exposes open action", () => {
    const source = readFileSync(new URL("../components/projects/project-create-form.tsx", import.meta.url), "utf8")

    assert.equal(source.includes("duplicateSucceeded"), true)
    assert.equal(source.includes("Open "), true)
    assert.equal(source.includes("router.replace(`/projects/${createdProjectId}`)"), true)
    assert.equal(source.includes("Project created as"), true)
  })
  test("create form source makes duplicate auto-suffix explicit to the human", () => {
    const source = readFileSync(new URL("../components/projects/project-create-form.tsx", import.meta.url), "utf8")

    assert.equal(source.includes("already exists"), true)
    assert.equal(source.includes("Project created as"), true)
    assert.equal(source.includes("Creating..."), true)
  })
  test("runtime-created project readiness matches between Projects and Command", () => {
    const created = createProject({
      title: "Northstar Freeze",
      kind: "client-product",
      problem: "Create a shared project identity that survives refresh and restart.",
      primaryGoal: "Prove canonical project context persists across Projects, Command, and Film Kit.",
      brief: "Northstar Freeze is the IA-06E review project.",
      successDefinition: "The same project ID remains visible after navigation and restart.",
    }, LOCAL_CREATE_AUTHORITY)

    const projection = buildCommandProjection(created.project!.id)
    const runtimeProject = getRuntimeProjectById(created.project!.id)

    assert.ok(runtimeProject)
    assert.equal(projection.activeProject?.id, runtimeProject?.id)
    assert.equal(projection.readiness, 75)
  })
  test("command, film kit, and production truth preserve the same glow-atelier project id", () => {
    const projection = buildCommandProjection("glow-atelier")
    const filmProject = getFilmProjectById("glow-atelier")
    const filmSource = getFilmProjectSource("glow-atelier")
    const productionTruth = getFilmProductionTruth("glow-atelier")

    assert.ok(projection.activeProject)
    assert.equal(projection.activeProject?.id, "glow-atelier")
    assert.equal(projection.activeProject?.id, filmProject?.id)
    assert.equal(projection.activeProject?.id, filmSource?.id)
    assert.equal(projection.directorAvailability, "AVAILABLE")
    assert.ok(projection.heroDemo?.title.length ?? 0)
    assert.equal(productionTruth.availability, "NO_CANONICAL_PRODUCTION_SPINE")
  })

  test("command fails closed when project context is missing", () => {
    const projection = buildCommandProjection("does-not-exist")

    assert.equal(projection.activeProject, null)
    assert.equal(projection.directorAvailability, "UNAVAILABLE")
    assert.equal(projection.blockers.includes("Project context unavailable"), true)
    assert.equal(projection.canonicalProductionAvailability, null)
  })

  test("repository source does not define a command-specific stated fallback", () => {
    const source = readFileSync(new URL("../lib/command/projection.ts", import.meta.url), "utf8")

    assert.equal(source.includes('?? "stated"'), false)
    assert.equal(source.includes("projectSelector"), false)
    assert.equal(source.includes("setProject"), false)
    assert.equal(source.includes("createProject("), false)
  })

  test("provider and runtime projections remain read-only over the canonical project list", () => {
    const providerSource = readFileSync(new URL("../components/projects/project-provider.tsx", import.meta.url), "utf8")

    assert.equal(providerSource.includes('"use client"'), true)
    assert.equal(providerSource.includes("initialProjects"), true)
    assert.equal(providerSource.includes("getProjectById"), false)
  })

  test("canonical project source remains available in the runtime list and the readonly source", () => {
    const sourceProject = getProjectById(CANONICAL_DEFAULT_PROJECT_ID)
    const runtimeProject = getRuntimeProjectById(CANONICAL_DEFAULT_PROJECT_ID)

    assert.ok(sourceProject)
    assert.ok(runtimeProject)
    assert.equal(sourceProject?.id, runtimeProject?.id)
    assert.equal(listRuntimeProjects().some((project) => project.id === CANONICAL_DEFAULT_PROJECT_ID), true)
  })

  test("repository reports application-owned data directory and vendor independence", () => {
    const resolution = getProjectDataDirResolution()

    assert.equal(resolution.runtimeVendorCoupled, false)
    assert.equal(resolution.envOverrideSupported, true)
    assert.equal(resolution.repositoryFilePath.includes(".codex"), false)
  })

  test("repository health distinguishes absent from corrupt data", () => {
    assert.equal(getProjectRepositoryHealth(), "ABSENT")
  })
})
