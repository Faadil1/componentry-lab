import type { CreativeProjectMode, CreativeProjectPhase } from "./types"
import { MODE_STATES } from "./modes"

export function resolveDirectorPhase(mode: CreativeProjectMode, phaseContext?: string): CreativeProjectPhase {
  if (phaseContext) {
    switch (phaseContext) {
      case "intake":
      case "qualify":
        return "intake"
      case "research":
      case "position":
      case "differentiate":
        return "clarify"
      case "concept":
      case "design":
      case "prototype":
        return "route"
      case "build":
        return "build"
      case "verify":
      case "audit":
        return "verify"
      case "capture":
      case "present":
        return "review"
      case "submit":
        return "submit"
      case "publish":
        return "publish"
      case "retrospective":
        return "reflect"
      default:
        return "review"
    }
  }
  
  // Fallback for tests/fixtures that didn't provide phaseContext
  const RESOLVED_PHASE_BY_MODE: Record<CreativeProjectMode, CreativeProjectPhase> = {
    DAY_CHALLENGE: "review",
    HACKATHON: "submit",
    MARA: "review",
    DATA_STORY: "publish",
  }
  const modeState = MODE_STATES[mode]
  return RESOLVED_PHASE_BY_MODE[modeState.mode]
}
