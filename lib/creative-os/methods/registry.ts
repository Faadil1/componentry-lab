import type { CreativeMethodDefinition } from "./types"
import { sacredRulesBreakerDefinition } from "./sacred-rules-breaker"
import { somaticResponseDesignDefinition } from "./somatic-response-design"
import { relationshipPreservingAbstractionDefinition } from "./relationship-preserving-abstraction"
import { cognitiveMetaphorIllustratorDefinition } from "./cognitive-metaphor-illustrator"
import { physicalSituationStoryboarderDefinition } from "./physical-situation-storyboarder"
import { libraryFirstCompositionRouterDefinition } from "./library-first-composition-router"
import { creativeDivergenceOrchestratorDefinition } from "./creative-divergence-orchestrator"
import { createRuntimeContext } from "./runtime"
import type { CreativeMethodRuntimeContext } from "./types"

/**
 * Validated production method set. I21 creative divergence remains a TEST_CANDIDATE
 * until its dedicated promotion gate is closed, so the existing validated-count
 * contract stays stable.
 */
export const METHOD_DEFINITIONS: CreativeMethodDefinition[] = [
  sacredRulesBreakerDefinition,
  somaticResponseDesignDefinition,
  relationshipPreservingAbstractionDefinition,
  cognitiveMetaphorIllustratorDefinition,
  physicalSituationStoryboarderDefinition,
  libraryFirstCompositionRouterDefinition
]

export const METHOD_TEST_CANDIDATES: CreativeMethodDefinition[] = [
  creativeDivergenceOrchestratorDefinition
]

/**
 * Runtime discovery includes governed test candidates, while lifecycle metadata
 * prevents them from being misrepresented as validated production methods.
 */
export const METHOD_RUNTIME_CONTEXT: CreativeMethodRuntimeContext = createRuntimeContext([
  ...METHOD_DEFINITIONS,
  ...METHOD_TEST_CANDIDATES
])
