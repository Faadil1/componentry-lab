import type { CreativeMethodDefinition, CreativeMethodInput, CreativeMethodExecutionResult } from "./types"
import { executeMethod } from "./runtime"

export const LIBRARY_FIRST_COMPOSITION_ROUTER_ID = "method_library_first_composition_router"

export const libraryFirstCompositionRouterDefinition: CreativeMethodDefinition = {
  id: LIBRARY_FIRST_COMPOSITION_ROUTER_ID,
  resourceId: "res_library_first_composition_router",
  name: "Library-First Composition Router",
  version: "0.1.0-stub",
  supportedModes: ["HACKATHON"],
  supportedPhases: ["route", "build"],
  capabilityGaps: ["library-composition"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: ["supplementaryFields.targetLibrary"],
  outputSchemaId: "library-first-composition-router-v0",
  qualityGateIds: [],
  authorityRequired: "SUGGEST",
  deterministic: true
}

/** Stub — not yet implemented. Returns BLOCKED. Full implementation deferred to a future slice. */
export function runLibraryFirstCompositionRouter(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(libraryFirstCompositionRouterDefinition, [], input, () => ({
    methodId: LIBRARY_FIRST_COMPOSITION_ROUTER_ID,
    status: "BLOCKED",
    steps: [],
    outputSections: [{ sectionKey: "stub", label: "Not Implemented", content: "Library-First Composition Router is a contract stub. Full implementation is deferred." }],
    rawOutputs: { stub: "not-implemented" }
  }))
}
