import type { SurfaceToken } from "@/lib/foundations/types"

export const surfaceTokens: SurfaceToken[] = [
  { role: "canvas", value: "#f3efe6 / #121110", usage: "The document canvas and the broadest background plane.", recommendedCombinations: ["background", "page-gutter"], limitations: ["Should remain visually quiet."] },
  { role: "inset", value: "#eae6db / #1f1d1a", usage: "Inset fields, utility wells, and grouped control beds.", recommendedCombinations: ["border-subtle", "text-secondary"], limitations: ["Use for support, not main reading surfaces."] },
  { role: "base", value: "#fbfaf6 / #1a1816", usage: "Primary card and content surface.", recommendedCombinations: ["text-primary", "border-default"], limitations: ["Avoid stacking too many base surfaces inside base surfaces."] },
  { role: "raised", value: "#ffffff / #22201d", usage: "Raised panels and focus surfaces.", recommendedCombinations: ["text-primary", "border-strong"], limitations: ["Should not become the default for every module."] },
  { role: "overlay", value: "rgba(18,17,16,0.92) / rgba(18,17,16,0.72)", usage: "Modals, overlays, and transient inspection layers.", recommendedCombinations: ["text-inverse", "border-subtle"], limitations: ["Needs contrast checks against underlying content."] },
  { role: "inverse", value: "#121110 / #f3efe6", usage: "The flipped dark editorial surface.", recommendedCombinations: ["text-inverse", "accent"], limitations: ["Should stay limited to strong sections."] },
  { role: "cinematic", value: "#0b0b0a / #f7f3ec", usage: "High-contrast frames for capture-oriented moments.", recommendedCombinations: ["text-inverse", "accent", "border-strong"], limitations: ["Use only when the composition needs a deliberate pause."] },
]
