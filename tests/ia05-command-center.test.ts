import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { buildCommandProjection } from "../lib/command/projection"
import { getActiveNavigationItem, SITE_NAVIGATION } from "../lib/navigation"
import { CANONICAL_DEFAULT_PROJECT_ID, getProjectById } from "../lib/projects/selectors"
import { getFilmProjectSource } from "../lib/film-kit/selectors"

test("IA-05 root command center resolves as the canonical CORE surface", async () => {
  const item = getActiveNavigationItem("/")

  assert.ok(item)
  assert.equal(item?.id, "command")
  assert.equal(item?.label, "Command")
  assert.equal(item?.group, "CORE")
})

test("IA-05 preserves Spotlight Lab at /spotlight without reclaiming the root route", async () => {
  const item = getActiveNavigationItem("/spotlight")

  assert.ok(item)
  assert.equal(item?.id, "spotlight-lab")
  assert.equal(item?.label, "Spotlight Lab")
  assert.equal(item?.group, "LAB")
  assert.equal(item?.href, "/spotlight")
})

test("IA-05 command projection reuses the canonical project context and one director next action", async () => {
  const project = await getProjectById("stated")
  assert.ok(project)

  const projection = await buildCommandProjection(project.id)

  assert.ok(projection.activeProject)
  assert.equal(projection.activeProject?.id, project.id)
  assert.equal(projection.directorAvailability, "AVAILABLE")
  assert.ok(projection.directorNextAction)
  assert.equal(projection.directorNextAction?.title.length > 0, true)
  assert.equal(projection.directorNextAction?.rationale.length > 0, true)
  assert.ok(projection.heroDemo)
  assert.equal(projection.blockers.includes("Project context unavailable"), false)
})

test("IA-05 command projection does not invent a second project selector or mutation surface", async () => {
  const source = readFileSync(new URL("../lib/command/projection.ts", import.meta.url), "utf8")

  assert.equal(source.includes("setProject"), false)
  assert.equal(source.includes("createProject"), false)
  assert.equal(source.includes("updateProject"), false)
  assert.equal(source.includes("projectSelector"), false)
  assert.equal(source.includes('projectId ?? "stated"'), false)
})

test("IA-05 command projection keeps production truth separate from production intent", async () => {
  const projection = await buildCommandProjection("stated")

  assert.ok(projection.productionIntentSummary)
  assert.equal(projection.productionIntentSummary?.intentDefined, true)
  assert.ok(projection.canonicalProductionAvailability)
  assert.equal(projection.canonicalProductionAvailability?.availability, "NO_CANONICAL_PRODUCTION_SPINE")
  assert.equal(projection.canonicalProductionAvailability?.routes, 0)
  assert.equal(projection.canonicalProductionAvailability?.artifacts, 0)
  assert.equal(projection.canonicalProductionAvailability?.manifest, "none")
})

test("IA-05 command projection keeps library counts derived from registries", async () => {
  const projection = await buildCommandProjection("stated")

  assert.equal(SITE_NAVIGATION.some((item) => item.id === "command" && item.href === "/"), true)
  assert.equal(projection.librarySummary.components > 0, true)
  assert.equal(projection.librarySummary.creativeResources > 0, true)
})

test("IA-05 command projection fails closed for an invalid project id", async () => {
  const projection = await buildCommandProjection("does-not-exist")

  assert.equal(projection.activeProject, null)
  assert.equal(projection.directorAvailability, "UNAVAILABLE")
  assert.equal(projection.directorNextAction, null)
  assert.equal(projection.canonicalProductionAvailability, null)
})

test("IA-05 navigation keeps Creative OS and dashboard off the public surface", async () => {
  assert.equal(SITE_NAVIGATION.some((item) => item.href === "/creative-os" || item.id === "creative-os"), false)
  assert.equal(SITE_NAVIGATION.some((item) => item.href === "/dashboard" || item.id === "dashboard"), false)
})

test("IA-05 root page source is read-only and avoids provider/render callbacks", async () => {
  const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")

  assert.equal(source.includes("onExecute"), false)
  assert.equal(source.includes("onRender"), false)
  assert.equal(source.includes("setProject"), false)
  assert.equal(source.includes("createProject"), false)
  assert.equal(source.includes("updateProject"), false)
})

test("IA-05 pages pass the canonical active project into shared navigation", async () => {
  const commandSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")
  const projectsSource = readFileSync(new URL("../app/projects/page.tsx", import.meta.url), "utf8")
  const projectsDetailSource = readFileSync(new URL("../app/projects/[projectId]/page.tsx", import.meta.url), "utf8")
  const filmKitSource = readFileSync(new URL("../app/film-kit/[projectId]/page.tsx", import.meta.url), "utf8")

  assert.equal(commandSource.includes("projectId={projectId}"), true)
  assert.equal(projectsSource.includes("CANONICAL_DEFAULT_PROJECT_ID"), true)
  assert.equal(projectsDetailSource.includes("projectId={project.id}"), true)
  assert.equal(filmKitSource.includes("projectId={projectId}"), true)
})

test("IA-05 canonical project default exists and resolves through shared project source", async () => {
  const stated = await getProjectById(CANONICAL_DEFAULT_PROJECT_ID)
  const filmSource = getFilmProjectSource(CANONICAL_DEFAULT_PROJECT_ID)

  assert.ok(stated)
  assert.ok(filmSource)
  assert.equal(stated?.id, CANONICAL_DEFAULT_PROJECT_ID)
  assert.equal(filmSource?.id, CANONICAL_DEFAULT_PROJECT_ID)
})
