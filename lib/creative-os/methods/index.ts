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

// Methods 3–6 implementations
export {
  RELATIONSHIP_PRESERVING_ABSTRACTION_ID,
  relationshipPreservingAbstractionDefinition,
  relationshipPreservingAbstractionGates,
  runRelationshipPreservingAbstraction
} from "./relationship-preserving-abstraction"

export {
  COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
  cognitiveMetaphorIllustratorDefinition,
  cognitiveMetaphorIllustratorGates,
  runCognitiveMetaphorIllustrator
} from "./cognitive-metaphor-illustrator"

export {
  PHYSICAL_SITUATION_STORYBOARDER_ID,
  physicalSituationStoryboarderDefinition,
  physicalSituationStoryboarderGates,
  runPhysicalSituationStoryboarder
} from "./physical-situation-storyboarder"

export {
  LIBRARY_FIRST_COMPOSITION_ROUTER_ID,
  libraryFirstCompositionRouterDefinition,
  libraryFirstCompositionRouterGates,
  runLibraryFirstCompositionRouter
} from "./library-first-composition-router"

export {
  CREATIVE_DIVERGENCE_ORCHESTRATOR_ID,
  DIVERGENCE_OPERATOR_FAMILIES,
  creativeDivergenceOrchestratorDefinition,
  creativeDivergenceOrchestratorGates,
  runCreativeDivergenceOrchestrator
} from "./creative-divergence-orchestrator"

export type {
  DivergenceScoutRole,
  DivergenceOperatorFamily
} from "./creative-divergence-orchestrator"
