import { test, describe } from "node:test"
import * as assert from "node:assert"
import {
  WORKFLOW_STAGES,
  isValidWorkflowState,
  isValidTransition,
  getNextWorkflowStage,
} from "../../lib/youtube/commands/workflow-policy.ts"

describe("Workflow Policy", () => {
  test("1. all 16 workflow stages defined", () => {
    assert.strictEqual(WORKFLOW_STAGES.length, 16)
    assert.strictEqual(WORKFLOW_STAGES[0], "TOPIC")
    assert.strictEqual(WORKFLOW_STAGES[WORKFLOW_STAGES.length - 1], "PUBLISH")
  })

  test("2. isValidWorkflowState recognizes valid states", () => {
    assert.ok(isValidWorkflowState("TOPIC"))
    assert.ok(isValidWorkflowState("RESEARCH"))
    assert.ok(isValidWorkflowState("PUBLISH"))
  })

  test("3. isValidWorkflowState rejects invalid states", () => {
    assert.ok(!isValidWorkflowState("INVALID"))
    assert.ok(!isValidWorkflowState(""))
    assert.ok(!isValidWorkflowState("topic"))
  })

  test("4. forward transitions to immediate next stage allowed", () => {
    assert.ok(isValidTransition("TOPIC", "RESEARCH"))
    assert.ok(isValidTransition("RESEARCH", "SCRIPT"))
    assert.ok(isValidTransition("FINAL_RENDER", "PUBLISH"))
  })

  test("5. no-op transition rejected", () => {
    assert.ok(!isValidTransition("RESEARCH", "RESEARCH"))
    assert.ok(!isValidTransition("TOPIC", "TOPIC"))
  })

  test("6. skip stages rejected", () => {
    assert.ok(!isValidTransition("TOPIC", "SCRIPT"))
    assert.ok(!isValidTransition("RESEARCH", "FACT_CHECK"))
    assert.ok(!isValidTransition("RESEARCH", "PUBLISH"))
  })

  test("7. backward transitions rejected", () => {
    assert.ok(!isValidTransition("RESEARCH", "TOPIC"))
    assert.ok(!isValidTransition("SCRIPT", "RESEARCH"))
    assert.ok(!isValidTransition("PUBLISH", "FINAL_RENDER"))
  })

  test("8. invalid source state rejected", () => {
    assert.ok(!isValidTransition("INVALID", "RESEARCH"))
    assert.ok(!isValidTransition("RESEARCH", "INVALID"))
  })

  test("9. getNextWorkflowStage returns next stage", () => {
    assert.strictEqual(getNextWorkflowStage("TOPIC"), "RESEARCH")
    assert.strictEqual(getNextWorkflowStage("RESEARCH"), "SCRIPT")
    assert.strictEqual(getNextWorkflowStage("FINAL_RENDER"), "PUBLISH")
  })

  test("10. getNextWorkflowStage returns null at end", () => {
    assert.strictEqual(getNextWorkflowStage("PUBLISH"), null)
  })

  test("11. getNextWorkflowStage returns null for invalid state", () => {
    assert.strictEqual(getNextWorkflowStage("INVALID"), null)
  })
})
