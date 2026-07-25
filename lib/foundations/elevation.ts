import type { ElevationToken } from "@/lib/foundations/types"

export const elevationTokens: ElevationToken[] = [
  { role: "flat", value: "none", usage: "Neutral surfaces without lift.", recommendedCombinations: ["canvas", "base"], limitations: ["No sense of depth."] },
  { role: "raised", value: "0 1px 2px rgba(0,0,0,0.08)", usage: "Small lift for cards and controls.", recommendedCombinations: ["base", "control"], limitations: ["Keep light to preserve editorial restraint."] },
  { role: "floating", value: "0 8px 20px rgba(0,0,0,0.12)", usage: "Floating utility panels and hover-relevant blocks.", recommendedCombinations: ["raised", "overlay"], limitations: ["Should not stack with multiple other shadows."] },
  { role: "overlay", value: "0 20px 60px rgba(0,0,0,0.22)", usage: "Modal overlays and elevated inspectors.", recommendedCombinations: ["overlay", "inverse"], limitations: ["Use sparingly; can flatten when overused."] },
  { role: "cinematic", value: "0 24px 80px rgba(0,0,0,0.28)", usage: "Only for the strongest capture moments.", recommendedCombinations: ["cinematic", "accent"], limitations: ["Avoid if the page needs to stay quiet and functional."] },
]
