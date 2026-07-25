import type { SpacingToken } from "@/lib/foundations/types"

export const spacingTokens: SpacingToken[] = [
  { role: "inline-1", value: "0.25rem", usage: "Dense icon-label gaps and tiny inline separations.", recommendedCombinations: ["surface", "border-subtle"], limitations: ["Too small for body rhythm."] },
  { role: "inline-2", value: "0.5rem", usage: "Tight inline spacing between tokens and chips.", recommendedCombinations: ["surface", "text-secondary"], limitations: ["Use only for compact UI fragments."] },
  { role: "inline-3", value: "0.75rem", usage: "Default inline spacing for labels and controls.", recommendedCombinations: ["surface", "border-default"], limitations: ["Not enough for section separation."] },
  { role: "stack-2", value: "0.5rem", usage: "Compact vertical stacks in dense panels.", recommendedCombinations: ["surface", "text-muted"], limitations: ["Avoid in long-form content."] },
  { role: "stack-3", value: "0.75rem", usage: "Default vertical rhythm for grouped metadata.", recommendedCombinations: ["surface", "border-subtle"], limitations: ["Should not govern page layout."] },
  { role: "stack-4", value: "1rem", usage: "Comfortable body adjacency and simple cards.", recommendedCombinations: ["surface", "border-default"], limitations: ["Can feel tight at large type sizes."] },
  { role: "stack-6", value: "1.5rem", usage: "Section clustering and panel separation.", recommendedCombinations: ["surface", "surface-raised"], limitations: ["Use with breathing room."] },
  { role: "stack-8", value: "2rem", usage: "Default section spacing in workbench layouts.", recommendedCombinations: ["background", "surface"], limitations: ["May over-space compact data rows."] },
  { role: "stack-12", value: "3rem", usage: "Large section breaks and editorial pacing.", recommendedCombinations: ["background", "surface-inverse"], limitations: ["Should be reserved for major transitions."] },
  { role: "layout-16", value: "4rem", usage: "Layout gutters between major page regions.", recommendedCombinations: ["background", "surface"], limitations: ["Can dominate small screens if repeated too often."] },
  { role: "layout-24", value: "6rem", usage: "Wide editorial separation and page-level breathing room.", recommendedCombinations: ["background", "surface-inverse"], limitations: ["Not for compact dashboards."] },
  { role: "page-gutter", value: "clamp(1rem, 2vw, 2rem)", usage: "Adaptive page-side padding for mobile through desktop.", recommendedCombinations: ["background", "surface"], limitations: ["Keep consistent across routes."] },
]
