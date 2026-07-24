export type ComponentCategory =
  | "Cursor & Pointer"
  | "Data & Numbers"
  | "Direct Manipulation"
  | "Typography"
  | "Scroll & Storytelling"
  | "Image & Media"
  | "3D & WebGL"
  | "Transitions"
  | "Broadcast & Live"
  | "Capture Ready"

export type ComponentMaturity = "Experimental" | "Lab Ready" | "Production Ready"

export type SupportLevel = "Native" | "Supported" | "Partial" | "Not Applicable"

export interface PlaywrightSelectors {
  root: string
  variants?: string[]
  controls?: string[]
}

export interface RecommendedViewport {
  width: number
  height: number
  label: string
}

export interface RegistryComponent {
  id: string
  name: string
  slug: string
  route: string
  description: string
  category: ComponentCategory
  interactionModel: string
  maturity: ComponentMaturity
  dependencies: string[]
  mobileSupport: SupportLevel
  keyboardSupport: SupportLevel
  tactileSupport: SupportLevel
  reducedMotion: SupportLevel
  deterministicCapture: boolean
  remotionReady: boolean
  playwrightSelectors: PlaywrightSelectors
  heroDemoMoment: string
  recommendedViewport: RecommendedViewport
  recommendedCaptureDuration: string
  initialState: string
  finalState: string
  limitations: string[]
}
