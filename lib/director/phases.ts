import type { CreativeProjectMode, CreativeProjectPhase } from "./types"
import { MODE_STATES } from "./modes"

export const RESOLVED_PHASE_BY_MODE: Record<CreativeProjectMode, CreativeProjectPhase> = {
  DAY_CHALLENGE: "review",
  HACKATHON: "submit",
  MARA: "review",
  DATA_STORY: "publish",
}

export function resolveDirectorPhase(mode: CreativeProjectMode): CreativeProjectPhase {
  const modeState = MODE_STATES[mode]
  return RESOLVED_PHASE_BY_MODE[modeState.mode]
}
