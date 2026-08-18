import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const globals = readFileSync("app/globals.css", "utf8")
const layout = readFileSync("app/layout.tsx", "utf8")
const navigation = readFileSync("components/navigation/lab-navigation.tsx", "utf8")
const director = readFileSync("app/director/live/page.tsx", "utf8")
const actionPanel = readFileSync("components/director/governed-action-panel.tsx", "utf8")

test("SITEWIDE_EDITORIAL_TECHNICAL_SYSTEM_HAS_LOCKED_FOUNDATION_TOKENS", () => {
  for (const token of [
    "--componentry-paper",
    "--componentry-surface",
    "--componentry-ink",
    "--componentry-cobalt",
    "--componentry-danger",
    "--componentry-success",
  ]) {
    assert.ok(globals.includes(token), `missing design token ${token}`)
  }

  assert.ok(globals.includes(".cl-display"))
  assert.ok(globals.includes(".cl-frontier"))
  assert.ok(globals.includes("prefers-reduced-motion"))
  assert.ok(layout.includes("Newsreader"))
  assert.ok(layout.includes("componentry-system"))
})

test("SITEWIDE_NAVIGATION_USES_RULE_BASED_NAV_NOT_PRIMARY_PILL_GRAMMAR", () => {
  assert.ok(navigation.includes("border-b-2"))
  assert.ok(navigation.includes("Labs / reference surfaces"))
  assert.equal(navigation.includes("inline-flex items-center justify-center rounded-full"), false)
})

test("LIVE_DIRECTOR_VISUAL_SYSTEM_EXPOSES_CANONICAL_FRONTIER_WITHOUT_CHANGING_WRITE_BOUNDARY", () => {
  assert.ok(director.includes("Canonical frontier"))
  assert.ok(director.includes("sideEffectPayload: <strong className=\"text-neutral-950\">null</strong>"))
  assert.ok(director.includes("PROJECT_BRAIN_APPEND_NEXT_ACTION"))
  assert.ok(director.includes("PROJECT_BRAIN_START_NEXT_ACTION"))
  assert.ok(director.includes("PROJECT_BRAIN_COMPLETE_NEXT_ACTION"))
  assert.ok(actionPanel.includes("Rendering this proposal does not mutate Project Brain"))
  assert.ok(actionPanel.includes("Exact typed mutation only."))
})
