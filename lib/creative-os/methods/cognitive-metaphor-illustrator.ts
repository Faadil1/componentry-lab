import type { CreativeMethodDefinition, CreativeMethodInput, CreativeMethodExecutionResult } from "./types"
import { executeMethod } from "./runtime"

export const COGNITIVE_METAPHOR_ILLUSTRATOR_ID = "method_cognitive_metaphor_illustrator"

export const cognitiveMetaphorIllustratorDefinition: CreativeMethodDefinition = {
  id: COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
  resourceId: "res_cognitive_metaphor_illustrator",
  name: "Cognitive Metaphor Illustrator",
  version: "0.1.0-stub",
  supportedModes: ["DATA_STORY"],
  supportedPhases: ["clarify", "build"],
  capabilityGaps: ["visual-metaphor"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: [],
  outputSchemaId: "cognitive-metaphor-illustrator-v0",
  qualityGateIds: [],
  authorityRequired: "SUGGEST",
  deterministic: true
}

/** Stub — not yet implemented. Returns BLOCKED. Full implementation deferred to a future slice. */
export function runCognitiveMetaphorIllustrator(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(cognitiveMetaphorIllustratorDefinition, [], input, () => ({
    methodId: COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
    status: "BLOCKED",
    steps: [],
    outputSections: [{ sectionKey: "stub", label: "Not Implemented", content: "Cognitive Metaphor Illustrator is a contract stub. Full implementation is deferred." }],
    rawOutputs: { stub: "not-implemented" }
  }))
}
