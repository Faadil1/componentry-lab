import type { MotionDurationToken, MotionEasingToken } from "@/lib/foundations/types"

export const motionDurationTokens: MotionDurationToken[] = [
  { role: "instant", value: "0ms", usage: "State changes that must not animate.", recommendedCombinations: ["reduce motion", "toggle state"], limitations: ["No easing applies."] },
  { role: "fast", value: "120ms", usage: "Tiny affordances and utility feedback.", recommendedCombinations: ["enter", "exit"], limitations: ["Too quick for explanatory transitions."] },
  { role: "standard", value: "180ms", usage: "Default UI transitions.", recommendedCombinations: ["standard", "enter"], limitations: ["May feel abrupt for larger layout shifts."] },
  { role: "deliberate", value: "260ms", usage: "Section state changes and layered reveals.", recommendedCombinations: ["emphasized", "exit"], limitations: ["Use when the change deserves notice."] },
  { role: "cinematic", value: "420ms", usage: "Capture-oriented composition changes.", recommendedCombinations: ["cinematic", "emphasized"], limitations: ["Should not become the default for routine interaction."] },
]

export const motionEasingTokens: MotionEasingToken[] = [
  { role: "enter", value: "cubic-bezier(0.2, 0.8, 0.2, 1)", usage: "Incoming affordances and panel reveals.", recommendedCombinations: ["fast", "standard"], limitations: ["Avoid on exit motion."] },
  { role: "exit", value: "cubic-bezier(0.4, 0, 1, 1)", usage: "Departing or collapsing motion.", recommendedCombinations: ["fast", "standard"], limitations: ["Can feel abrupt if paired with large distances."] },
  { role: "standard", value: "cubic-bezier(0.3, 0, 0.2, 1)", usage: "Balanced default easing for interface motion.", recommendedCombinations: ["standard", "deliberate"], limitations: ["Not expressive enough for hero moments."] },
  { role: "emphasized", value: "cubic-bezier(0.16, 1, 0.3, 1)", usage: "Primary emphasis and stronger reveals.", recommendedCombinations: ["deliberate", "cinematic"], limitations: ["Can feel over-eager on tiny controls."] },
  { role: "cinematic", value: "cubic-bezier(0.22, 1, 0.36, 1)", usage: "Slow, controlled, capture-friendly motion.", recommendedCombinations: ["cinematic", "deliberate"], limitations: ["Keep to a small number of motion paths."] },
]
