// ─────────────────────────────────────────────────────────────
// Composition Recipes — Core Types
// ─────────────────────────────────────────────────────────────

export type RecipeId =
  | "product-launch"
  | "operational-workspace"
  | "data-story"
  | "broadcast-package"

export type RecipeCategory = "product" | "operational" | "editorial" | "broadcast"

export type RecipeStatus = "specimen" | "reusable" | "production-candidate"

export type RecipeSystemId =
  | "typography"
  | "foundations"
  | "layouts"
  | "player"
  | "decisions"
  | "capture"
  | "split-flap"
  | "kinetic-text"
  | "scrub-input"
  | "scroll-choreography"
  | "spotlight"
  | "image-ripple"
  | "webgl-liquid"

export type RecipeViewport = "desktop" | "laptop" | "tablet" | "mobile" | "broadcast" | "portrait"

export type RecipeInteractionType = "click" | "toggle" | "scroll" | "scrub" | "hover"

export interface RecipeSection {
  id: string
  label: string
  description: string
  time?: number
}

export interface RecipeSystemReference {
  systemId: RecipeSystemId
  label: string
  role: string
  dependencies: RecipeSystemId[]
  optional: boolean
  limitation?: string
}

export interface RecipeInteraction {
  id: string
  label: string
  type: RecipeInteractionType
  description: string
  trigger: string
  effect: string
}

export interface RecipeCaptureState {
  id: string
  label: string
  order: number
  expectedVisualResult: string
  viewport: RecipeViewport
  chromeMode: "full" | "minimal" | "hidden"
  safeArea: "off" | "interface" | "presentation" | "broadcast" | "cinematic"
  currentTime?: number
  frame?: number
  isCapturePoint: boolean
  isSignatureFrame: boolean
  notes?: string
}

export interface RecipeCapturePlan {
  states: RecipeCaptureState[]
}

export interface RecipeLimitation {
  id: string
  description: string
}

export interface RecipePreset {
  id: RecipeId
  label: string
  category: RecipeCategory
  description: string
  memoryHook: string
  audience: string
  primaryGoal: string
  systems: RecipeSystemReference[]
  sections: RecipeSection[]
  interactions: RecipeInteraction[]
  capturePlan: RecipeCapturePlan
  signatureStateId: string
  supportedViewports: RecipeViewport[]
  accessibilityNotes: string[]
  limitations: RecipeLimitation[]
  status: RecipeStatus
}

export interface RecipeSnapshot {
  recipeId: RecipeId
  category: RecipeCategory
  activeSectionId: string
  activeCaptureStateId: string
  viewport: RecipeViewport
  inspectorVisible: boolean
  systemMapVisible: boolean
  cleanView: boolean
}

export interface RecipeState {
  activeRecipeId: RecipeId
  activeRecipe: RecipePreset
  activeSectionId: string
  activeCaptureStateId: string
  inspectorVisible: boolean
  systemMapVisible: boolean
  cleanView: boolean
  viewport: RecipeViewport
  snapshot: RecipeSnapshot
}

export interface RecipeContext {
  state: RecipeState
  actions: {
    setRecipe: (recipeId: RecipeId) => void
    setSection: (sectionId: string) => void
    setCaptureState: (stateId: string) => void
    nextCaptureState: () => void
    previousCaptureState: () => void
    setViewport: (viewport: RecipeViewport) => void
    toggleInspector: () => void
    toggleSystemMap: () => void
    toggleCleanView: () => void
    resetRecipe: () => void
    copySnapshot: () => Promise<void>
    copyCapturePlan: () => Promise<void>
  }
}
