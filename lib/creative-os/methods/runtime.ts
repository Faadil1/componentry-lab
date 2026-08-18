import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodExecutionResult,
  CreativeMethodRuntimeContext
} from "./types"
import { evaluateQualityGates, allGatesPassed, extractAdvisoryEvidence } from "./quality"
import type { CreativeMethodQualityGate } from "./types"

/**
 * The Creative Method Runtime.
 *
 * Deterministic. Read-only. Local. No external calls.
 * Takes a method definition, its quality gates, a structured input,
 * and produces a full advisory execution result.
 */
export function executeMethod(
  definition: CreativeMethodDefinition,
  gates: CreativeMethodQualityGate[],
  input: CreativeMethodInput,
  produce: (input: CreativeMethodInput) => CreativeMethodResult
): CreativeMethodExecutionResult {
  if (!definition.supportedModes.includes(input.projectMode)) {
    const failedResult: CreativeMethodResult = {
      methodId: definition.id,
      status: "BLOCKED",
      steps: [],
      outputSections: [],
      rawOutputs: {}
    }
    return {
      methodId: definition.id,
      resourceId: definition.resourceId,
      input,
      result: failedResult,
      qualityResults: [],
      allGatesPassed: false,
      advisoryEvidence: [],
      status: "BLOCKED",
      isReadOnly: true,
      sideEffects: null
    }
  }

  const result = produce(input)

  const qualityResults = evaluateQualityGates(result, gates)
  const passed = allGatesPassed(qualityResults)
  const advisory = extractAdvisoryEvidence(result)

  return {
    methodId: definition.id,
    resourceId: definition.resourceId,
    input,
    result,
    qualityResults,
    allGatesPassed: passed,
    advisoryEvidence: advisory,
    status: result.status,
    isReadOnly: true,
    sideEffects: null
  }
}

/**
 * Creates a runtime context for method resolution.
 */
export function createRuntimeContext(
  definitions: CreativeMethodDefinition[]
): CreativeMethodRuntimeContext {
  const methods = new Map<string, CreativeMethodDefinition>()
  for (const def of definitions) {
    methods.set(def.id, def)
  }
  return { methods }
}
