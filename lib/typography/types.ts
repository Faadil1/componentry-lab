export type FontRole =
  | "display"
  | "editorial-heading"
  | "section-heading"
  | "body"
  | "label"
  | "numeric"

export type FontSource = "system" | "local" | "google-font" | "licensed"

export type FontLicenseStatus = "confirmed" | "unconfirmed" | "unknown"

export type FontProfile = {
  family: string
  displayName: string
  role: FontRole
  source: FontSource
  licenseStatus: FontLicenseStatus
  licenseName: string
  provenance: string
  variable: string
  weights: number[]
  styles: Array<"normal" | "italic">
  fallbackStack: string
  supportedScripts: string[]
  recommendedUses: string[]
  limitations: string[]
  cssVariable: string
}

export type TypographyRecipe = {
  id: string
  name: string
  summary: string
  scale: TypographyScale
  display: string
  headings: string
  body: string
  notes: string[]
}

export type TypographyScale = {
  display: string
  h1: string
  h2: string
  h3: string
  body: string
  small: string
  label: string
  numeric: string
}

export type TypographyTokens = {
  fontRoles: Record<FontRole, string>
  scale: TypographyScale
  lineHeights: Record<keyof TypographyScale, string>
  tracking: {
    loose: string
    normal: string
    tight: string
    label: string
  }
  paragraphMeasures: {
    narrow: string
    medium: string
    wide: string
  }
  fallbackStacks: Record<FontRole, string>
}
