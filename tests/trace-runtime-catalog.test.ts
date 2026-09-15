import assert from "node:assert/strict"
import test from "node:test"

import {
  TRACE_RUNTIME_TARGETS,
  getTraceRuntimeExecutableSkillId,
  getTraceRuntimeTarget,
} from "../lib/trace-runtime/catalog"

test("TRACE runtime target ids are unique per target kind", () => {
  const keys = TRACE_RUNTIME_TARGETS.map((target) => `${target.kind}:${target.id}`)
  assert.equal(new Set(keys).size, keys.length)
})

test("TRACE runtime exposes executable skills and agents across authority levels", () => {
  assert.ok(TRACE_RUNTIME_TARGETS.some((target) => target.kind === "SKILL" && target.authority === "SUGGEST"))
  assert.ok(TRACE_RUNTIME_TARGETS.some((target) => target.kind === "SKILL" && target.authority === "PREPARE"))
  assert.ok(TRACE_RUNTIME_TARGETS.some((target) => target.kind === "AGENT"))
})

test("agent delegation resolves to an executable skill", () => {
  const agent = getTraceRuntimeTarget("AGENT", "agent-art-direction")
  assert.ok(agent)
  assert.equal(getTraceRuntimeExecutableSkillId("AGENT", "agent-art-direction"), "trace-studio-art-direction")
})

test("stable skill aliases resolve to candidate runtime handlers", () => {
  assert.equal(getTraceRuntimeExecutableSkillId("SKILL", "trace-assurance-review"), "trace-studio-assurance-review")
  assert.equal(getTraceRuntimeExecutableSkillId("SKILL", "trace-evidence"), "trace-studio-evidence")
  assert.equal(getTraceRuntimeExecutableSkillId("SKILL", "trace-gate"), "trace-studio-gate")
})
