// Creative Method Runtime — public exports for Slice 3B

export type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodStep,
  CreativeMethodOutputSection,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodRuntimeContext,
  CreativeMethodExecutionResult,
  CreativeMethodStatus,
  CreativeMethodAuthority,
  CreativeMethodEvaluationRecord,
  TrustConventionEffect,
  TrustImpactEvaluation,
  SomaticPerceptualPrinciple,
  StereotypeRiskRating,
  SomaticFormalOption,
  SomaticSelectedDirection
} from "./types"

export { executeMethod, createRuntimeContext } from "./runtime"
export { evaluateQualityGates, allGatesPassed, extractAdvisoryEvidence } from "./quality"
export { METHOD_DEFINITIONS, METHOD_RUNTIME_CONTEXT } from "./registry"

// Fully implemented methods
export {
  SACRED_RULES_BREAKER_ID,
  sacredRulesBreakerDefinition,
  sacredRulesBreakerGates,
  runSacredRulesBreaker
} from "./sacred-rules-breaker"

export {
  SOMATIC_RESPONSE_DESIGN_ID,
  somaticResponseDesignDefinition,
  somaticResponseDesignGates,
  runSomaticResponseDesign
} from "./somatic-response-design"

// Stub methods — contracts only, implementations deferred
export {
  RELATIONSHIP_PRESERVING_ABSTRACTION_ID,
  relationshipPreservingAbstractionDefinition,
  runRelationshipPreservingAbstraction
} from "./relationship-preserving-abstraction"

export {
  COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
  cognitiveMetaphorIllustratorDefinition,
  runCognitiveMetaphorIllustrator
} from "./cognitive-metaphor-illustrator"

export {
  PHYSICAL_SITUATION_STORYBOARDER_ID,
  physicalSituationStoryboarderDefinition,
  runPhysicalSituationStoryboarder
} from "./physical-situation-storyboarder"

export {
  LIBRARY_FIRST_COMPOSITION_ROUTER_ID,
  libraryFirstCompositionRouterDefinition,
  runLibraryFirstCompositionRouter
} from "./library-first-composition-router"
