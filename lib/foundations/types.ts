export type ColorMode = "light" | "dark"

export type SemanticColorRole =
  | "background"
  | "surface"
  | "surface-raised"
  | "surface-inverse"
  | "text-primary"
  | "text-secondary"
  | "text-muted"
  | "text-inverse"
  | "border-subtle"
  | "border-default"
  | "border-strong"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"

export type ColorToken = {
  role: SemanticColorRole
  light: string
  dark: string
  usage: string
  recommendedCombinations: string[]
  limitations: string[]
}

export type SpacingToken = {
  role: string
  value: string
  usage: string
  recommendedCombinations: string[]
  limitations: string[]
}

export type SurfaceToken = {
  role: string
  value: string
  usage: string
  recommendedCombinations: string[]
  limitations: string[]
}

export type RadiusToken = {
  role: string
  value: string
  usage: string
  recommendedCombinations: string[]
  limitations: string[]
}

export type ElevationToken = {
  role: string
  value: string
  usage: string
  recommendedCombinations: string[]
  limitations: string[]
}

export type MotionDurationToken = {
  role: string
  value: string
  usage: string
  recommendedCombinations: string[]
  limitations: string[]
}

export type MotionEasingToken = {
  role: string
  value: string
  usage: string
  recommendedCombinations: string[]
  limitations: string[]
}

export type FoundationTokens = {
  colors: ColorToken[]
  spacing: SpacingToken[]
  surfaces: SurfaceToken[]
  radii: RadiusToken[]
  elevation: ElevationToken[]
  motionDurations: MotionDurationToken[]
  motionEasings: MotionEasingToken[]
}
