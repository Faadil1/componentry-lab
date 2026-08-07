import type { CreativeMethodResult, CreativeMethodQualityGate, CreativeMethodQualityResult } from "./types"

/**
 * Evaluates all quality gates against a method result synchronously and deterministically.
 * Returns a result per gate. Never throws on gate failure — failures are recorded, not raised.
 */
export function evaluateQualityGates(
  result: CreativeMethodResult,
  gates: CreativeMethodQualityGate[]
): CreativeMethodQualityResult[] {
  return gates.map((gate) => {
    try {
      return gate.evaluate(result)
    } catch {
      return {
        gateId: gate.gateId,
        label: gate.label,
        passed: false,
        failReasons: [`Gate evaluator threw unexpectedly for gate ${gate.gateId}`]
      }
    }
  })
}

/**
 * Determines whether all quality results passed.
 */
export function allGatesPassed(results: CreativeMethodQualityResult[]): boolean {
  return results.every((r) => r.passed)
}

/**
 * Extracts advisory evidence strings from a passing quality gate evaluation.
 * Evidence is derived from output sections with non-empty content.
 */
export function extractAdvisoryEvidence(result: CreativeMethodResult): string[] {
  return result.outputSections
    .filter((s) => s.content.trim().length > 0)
    .map((s) => `[${s.label}]: ${s.content.slice(0, 200)}`)
}
