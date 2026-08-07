import type { CreativeMethodDefinition, CreativeMethodInput, CreativeMethodExecutionResult } from "./types"
import { executeMethod } from "./runtime"

export const PHYSICAL_SITUATION_STORYBOARDER_ID = "method_physical_situation_storyboarder"

export const physicalSituationStoryboarderDefinition: CreativeMethodDefinition = {
  id: PHYSICAL_SITUATION_STORYBOARDER_ID,
  resourceId: "res_physical_situation_storyboarder",
  name: "Physical Situation Storyboarder",
  version: "0.1.0-stub",
  supportedModes: ["MARA"],
  supportedPhases: ["clarify", "build", "verify"],
  capabilityGaps: ["physical-space-mapping", "narrative-staging"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: ["supplementaryFields.locationDescription"],
  outputSchemaId: "physical-situation-storyboarder-v0",
  qualityGateIds: [],
  authorityRequired: "SUGGEST",
  deterministic: true
}

/** Stub — not yet implemented. Returns BLOCKED. Full implementation deferred to a future slice. */
export function runPhysicalSituationStoryboarder(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(physicalSituationStoryboarderDefinition, [], input, () => ({
    methodId: PHYSICAL_SITUATION_STORYBOARDER_ID,
    status: "BLOCKED",
    steps: [],
    outputSections: [{ sectionKey: "stub", label: "Not Implemented", content: "Physical Situation Storyboarder is a contract stub. Full implementation is deferred." }],
    rawOutputs: { stub: "not-implemented" }
  }))
}
