import type { RadiusToken } from "@/lib/foundations/types"

export const radiusTokens: RadiusToken[] = [
  { role: "none", value: "0px", usage: "Straight edges for tables, code blocks, and sharp separators.", recommendedCombinations: ["surface-inverse", "border-strong"], limitations: ["Use sparingly on interactive controls."] },
  { role: "control", value: "0.5rem", usage: "Buttons, inputs, and compact interactive elements.", recommendedCombinations: ["surface", "border-default"], limitations: ["Should not dominate large panels."] },
  { role: "panel", value: "0.75rem", usage: "Primary cards and workbench sections.", recommendedCombinations: ["surface", "surface-raised"], limitations: ["Avoid on every nested container."] },
  { role: "feature", value: "1rem", usage: "Hero blocks and featured specimens.", recommendedCombinations: ["surface-inverse", "background"], limitations: ["Reserve for featured compositional moments."] },
  { role: "round", value: "9999px", usage: "Pills, labels, and highly compact chips.", recommendedCombinations: ["accent", "text-primary"], limitations: ["Not for major panels."] },
]
