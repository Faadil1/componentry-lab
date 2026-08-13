import type { CreativeMethodDefinition } from "./types"
import { sacredRulesBreakerDefinition } from "./sacred-rules-breaker"
import { somaticResponseDesignDefinition } from "./somatic-response-design"
import { relationshipPreservingAbstractionDefinition } from "./relationship-preserving-abstraction"
import { cognitiveMetaphorIllustratorDefinition } from "./cognitive-metaphor-illustrator"
import { physicalSituationStoryboarderDefinition } from "./physical-situation-storyboarder"
import { libraryFirstCompositionRouterDefinition } from "./library-first-composition-router"
import { createRuntimeContext } from "./runtime"
import type { CreativeMethodRuntimeContext } from "./types"

export const METHOD_DEFINITIONS: CreativeMethodDefinition[] = [
  sacredRulesBreakerDefinition,
  somaticResponseDesignDefinition,
  relationshipPreservingAbstractionDefinition,
  cognitiveMetaphorIllustratorDefinition,
  physicalSituationStoryboarderDefinition,
  libraryFirstCompositionRouterDefinition
]

/**
 * Singleton runtime context for all registered Creative Methods.
 * Immutable after initialization.
 */
export const METHOD_RUNTIME_CONTEXT: CreativeMethodRuntimeContext = createRuntimeContext(METHOD_DEFINITIONS)
