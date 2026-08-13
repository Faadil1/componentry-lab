import assert from "node:assert/strict"
import test from "node:test"
import { getActiveNavigationItem, getSurfaceContext, SITE_NAVIGATION } from "../lib/navigation"

test("maps Library to CORE", () => {
  const item = getActiveNavigationItem("/library")
  assert.ok(item)
  assert.equal(item.group, "CORE")
  assert.equal(item.id, "library")
})

test("maps Playbooks to CORE", () => {
  const item = getActiveNavigationItem("/playbooks")
  assert.ok(item)
  assert.equal(item.group, "CORE")
  assert.equal(item.id, "playbooks")
})

test("maps Projects to CORE", () => {
  const item = getActiveNavigationItem("/projects")
  assert.ok(item)
  assert.equal(item.group, "CORE")
  assert.equal(item.id, "projects")
})

test("maps Film Kit to CORE", () => {
  const item = getActiveNavigationItem("/film-kit")
  assert.ok(item)
  assert.equal(item.group, "CORE")
  assert.equal(item.id, "film-kit")
})

test("maps YouTube to WORKSPACE", () => {
  const item = getActiveNavigationItem("/youtube")
  assert.ok(item)
  assert.equal(item.group, "WORKSPACE")
  assert.equal(item.id, "youtube")
})

test("maps /youtube/history to same YouTube workspace", () => {
  const item = getActiveNavigationItem("/youtube/history")
  assert.ok(item)
  assert.equal(item.group, "WORKSPACE")
  assert.equal(item.id, "youtube")
})

test("maps /youtube/episodes/[id] to same YouTube workspace", () => {
  const item = getActiveNavigationItem("/youtube/episodes/1234")
  assert.ok(item)
  assert.equal(item.group, "WORKSPACE")
  assert.equal(item.id, "youtube")
})

test("maps /director to LAB", () => {
  const item = getActiveNavigationItem("/director")
  assert.ok(item)
  assert.equal(item.group, "LAB")
  assert.equal(item.id, "creative-director")
})

test("maps /decisions to LAB", () => {
  const item = getActiveNavigationItem("/decisions")
  assert.ok(item)
  assert.equal(item.group, "LAB")
  assert.equal(item.id, "decision-systems")
})

test("has no Creative OS top-level navigation entry", () => {
  const item = SITE_NAVIGATION.find(i => i.href === "/creative-os" || i.id === "creative-os")
  assert.equal(item, undefined)
})

test("has no Workspaces top-level route", () => {
  const item = SITE_NAVIGATION.find(i => i.href === "/workspaces")
  assert.equal(item, undefined)
})

test("navigation metadata is deterministic", () => {
  assert.ok(SITE_NAVIGATION.length > 10)
  for (const item of SITE_NAVIGATION) {
    assert.ok(item.id)
    assert.ok(item.label)
    assert.ok(item.href)
    assert.ok(item.group)
  }
})

test("returns null for unknown routes safely", () => {
  const item = getActiveNavigationItem("/some/unknown/route")
  assert.equal(item, null)
})

test("shell contextual metadata functions correctly", () => {
  const context = getSurfaceContext("/library")
  assert.equal(context.brand, "Componentry Lab")
  assert.equal(context.title, "Library")
  
  const ytContext = getSurfaceContext("/youtube")
  assert.equal(ytContext.brand, "Componentry Lab")
  assert.equal(ytContext.title, "YouTube")
})
