import {
  COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
  LIBRARY_FIRST_COMPOSITION_ROUTER_ID,
  PHYSICAL_SITUATION_STORYBOARDER_ID,
  RELATIONSHIP_PRESERVING_ABSTRACTION_ID,
  SACRED_RULES_BREAKER_ID,
  SOMATIC_RESPONSE_DESIGN_ID,
  runCognitiveMetaphorIllustrator,
  runLibraryFirstCompositionRouter,
  runPhysicalSituationStoryboarder,
  runRelationshipPreservingAbstraction,
  runSacredRulesBreaker,
  runSomaticResponseDesign,
  type CreativeMethodExecutionResult,
  type CreativeMethodInput
} from "../methods"
import type { SkillMetadata } from "../../director/types"
import type {
  CollaborationJsonValue,
  CollaborationRequest,
  CollaborationResult,
  CollaborationValidationReport
} from "./types"
import { COLLABORATION_SCHEMA_VERSION } from "./types"
import { validateCollaborationRequest, validateCollaborationResult } from "./validation"

export interface GovernedMethodCollaborationExecution {
  valid: boolean
  errors: readonly string[]
  execution: CreativeMethodExecutionResult | null
  result: CollaborationResult | null
}

type MethodRunner = (input: CreativeMethodInput) => CreativeMethodExecutionResult

const GOVERNED_METHOD_RUNNERS: Readonly<Record<string, MethodRunner>> = {
  [SACRED_RULES_BREAKER_ID]: runSacredRulesBreaker,
  [SOMATIC_RESPONSE_DESIGN_ID]: runSomaticResponseDesign,
  [RELATIONSHIP_PRESERVING_ABSTRACTION_ID]: runRelationshipPreservingAbstraction,
  [COGNITIVE_METAPHOR_ILLUSTRATOR_ID]: runCognitiveMetaphorIllustrator,
  [PHYSICAL_SITUATION_STORYBOARDER_ID]: runPhysicalSituationStoryboarder,
  [LIBRARY_FIRST_COMPOSITION_ROUTER_ID]: runLibraryFirstCompositionRouter
}

function jsonValue(value: unknown): CollaborationJsonValue {
  const serialized = JSON.stringify(value)
  if (serialized === undefined) throw new Error("Creative Method output is not JSON serializable")
  return JSON.parse(serialized) as CollaborationJsonValue
}

function mapResultStatus(status: CreativeMethodExecutionResult["status"]): CollaborationResult["resultStatus"] {
  switch (status) {
    case "COMPLETE":
      return "COMPLETE"
    case "PARTIAL":
      return "PARTIAL"
    case "BLOCKED":
      return "BLOCKED"
    case "FAILED":
      return "REJECTED"
    case "NOT_RUN":
      return "NO_MATCH"
  }
}

function validateRuntimeRequest(
  request: CollaborationRequest,
  skill: SkillMetadata,
  input: CreativeMethodInput
): CollaborationValidationReport {
  const base = validateCollaborationRequest(request)
  const errors = [...base.errors]

  if (request.sourceSystem !== "CREATIVE_DIRECTOR") {
    errors.push("Creative Method collaboration request must originate from CREATIVE_DIRECTOR")
  }
  if (request.targetSystem !== "CREATIVE_METHOD_RUNTIME") {
    errors.push("Creative Method collaboration request must target CREATIVE_METHOD_RUNTIME")
  }
  if (request.intent !== "REQUEST_ADVISORY_WORK") {
    errors.push("Creative Method collaboration request intent must be REQUEST_ADVISORY_WORK")
  }
  if (request.requestedEffectClass !== "NONE") {
    errors.push("Creative Method collaboration execution requires effect class NONE")
  }
  if (request.authorityContext.requestedAuthority !== "READ_ONLY" && request.authorityContext.requestedAuthority !== "SUGGEST") {
    errors.push("Creative Method collaboration execution requires READ_ONLY or SUGGEST authority")
  }
  if (skill.sourceEntityKind !== "METHOD") {
    errors.push("selected Director skill must originate from a METHOD entity")
  }
  if (!skill.canonicalCapabilityRef || skill.skillId !== skill.canonicalCapabilityRef) {
    errors.push("selected Director skill must preserve canonical capability identity")
  }
  if (!skill.runtimeMethodId) {
    errors.push("selected Director skill is missing runtimeMethodId")
  }
  if (skill.runtimeMethodId && !GOVERNED_METHOD_RUNNERS[skill.runtimeMethodId]) {
    errors.push(`runtime method is not in governed dispatcher: ${skill.runtimeMethodId}`)
  }
  if (!request.capabilityRefs.includes(skill.skillId)) {
    errors.push("collaboration request capabilityRefs must include the selected canonical skill")
  }
  if (input.methodId !== skill.runtimeMethodId) {
    errors.push("Creative Method input methodId must match selected runtimeMethodId")
  }
  if (input.projectMode !== request.projectMode) {
    errors.push("Creative Method input projectMode must match collaboration request")
  }
  if (input.phase !== request.projectPhase) {
    errors.push("Creative Method input phase must match collaboration request")
  }
  if (!skill.supportedModes.includes(input.projectMode)) {
    errors.push("selected method does not support requested project mode")
  }
  if (!skill.supportedPhases.includes(input.phase)) {
    errors.push("selected method does not support requested phase")
  }
  if (skill.capabilityGaps && !skill.capabilityGaps.includes(input.capabilityGap)) {
    errors.push("Creative Method capabilityGap is not declared by selected skill")
  }
  if (skill.sourceMethodAuthorityRequired !== "READ_ONLY" && skill.sourceMethodAuthorityRequired !== "SUGGEST") {
    errors.push("selected method source authority is not advisory")
  }

  return { valid: errors.length === 0, errors }
}

export function executeGovernedMethodCollaboration(
  request: CollaborationRequest,
  skill: SkillMetadata,
  input: CreativeMethodInput
): GovernedMethodCollaborationExecution {
  const requestValidation = validateRuntimeRequest(request, skill, input)
  if (!requestValidation.valid || !skill.runtimeMethodId) {
    return {
      valid: false,
      errors: requestValidation.errors,
      execution: null,
      result: null
    }
  }

  const runner = GOVERNED_METHOD_RUNNERS[skill.runtimeMethodId]
  if (!runner) {
    return {
      valid: false,
      errors: [`runtime method is not in governed dispatcher: ${skill.runtimeMethodId}`],
      execution: null,
      result: null
    }
  }

  const execution = runner(input)
  if (execution.isReadOnly !== true || execution.sideEffects !== null) {
    return {
      valid: false,
      errors: ["Creative Method Runtime violated read-only side-effect-free contract"],
      execution: null,
      result: null
    }
  }
  if (execution.methodId !== skill.runtimeMethodId) {
    return {
      valid: false,
      errors: ["Creative Method Runtime returned a different method identity"],
      execution: null,
      result: null
    }
  }

  const advisoryEvidenceRefs = execution.advisoryEvidence.map(
    (_, index) => `creative-method-runtime:${execution.methodId}:advisory:${index + 1}`
  )

  const result: CollaborationResult = {
    schemaVersion: COLLABORATION_SCHEMA_VERSION,
    projectId: request.projectId,
    correlationId: request.correlationId,
    sourceSystem: "CREATIVE_METHOD_RUNTIME",
    targetSystem: "CREATIVE_DIRECTOR",
    capabilityUsed: skill.skillId,
    resultStatus: mapResultStatus(execution.status),
    structuredOutput: {
      runtimeMethodId: execution.methodId,
      resourceId: execution.resourceId,
      status: execution.status,
      allGatesPassed: execution.allGatesPassed,
      methodResult: jsonValue(execution.result),
      advisoryEvidence: jsonValue(execution.advisoryEvidence)
    },
    qualityResults: execution.qualityResults.map((quality) => jsonValue(quality)),
    evidenceRefs: [...request.evidenceRefs, ...advisoryEvidenceRefs],
    provenanceRefs: [
      skill.canonicalCapabilityRef ?? skill.skillId,
      `creative-method-runtime:${execution.methodId}`,
      ...(skill.evidenceRefs ?? [])
    ],
    limitations: ["Advisory only; Creative Method Runtime applied no side effects."],
    recommendedNextStep: "Return method evidence to Creative Director for canonical next-action reasoning.",
    sideEffectRequest: null
  }

  const resultValidation = validateCollaborationResult(result)
  if (!resultValidation.valid) {
    return {
      valid: false,
      errors: resultValidation.errors,
      execution: null,
      result: null
    }
  }

  return {
    valid: true,
    errors: [],
    execution,
    result
  }
}

export const GOVERNED_METHOD_RUNTIME_IDS = Object.freeze(Object.keys(GOVERNED_METHOD_RUNNERS).sort())
