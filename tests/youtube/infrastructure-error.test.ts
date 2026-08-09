import { test, describe } from "node:test"
import * as assert from "node:assert"
import type { CommandFailureReason } from "../../lib/youtube/commands/command-result.ts"
import type { CommandResult } from "../../lib/youtube/commands/command-result.ts"

describe("Infrastructure Error Classification", () => {
  test("CommandFailureReason includes infrastructure_error", () => {
    const reason: CommandFailureReason = "infrastructure_error"
    assert.strictEqual(reason, "infrastructure_error")
  })

  test("business errors are distinct from infrastructure", () => {
    // List of business validation error reasons
    const businessReasons = [
      "not_found",
      "conflict",
      "invalid_transition",
      "invalid_input",
      "already_resolved",
      "already_published",
    ]

    // infrastructure_error is the only non-business error
    const infrastructureReason = "infrastructure_error"

    // Verify infrastructure_error is not in business errors list
    assert.strictEqual(businessReasons.includes(infrastructureReason), false)

    // Verify all business errors are distinct
    const uniqueReasons = new Set(businessReasons)
    assert.strictEqual(uniqueReasons.size, businessReasons.length)
  })

  test("error results have correct failure reason", () => {
    const businessError: CommandResult<void> = {
      success: false,
      reason: "conflict",
      message: "Version mismatch",
    }

    assert.strictEqual(businessError.success, false)
    assert.strictEqual(businessError.reason, "conflict")
  })
})
