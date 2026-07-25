// ─────────────────────────────────────────────────────────────
// Registry V2 — Systems Registry
// ─────────────────────────────────────────────────────────────

import type { RegistryEntryId } from "./types"

export interface SystemRegistryInfo {
  id: RegistryEntryId
  label: string
  role: string
  optional: boolean
}

export const systemRegistry: Record<string, SystemRegistryInfo> = {
  typography: {
    id: "typography",
    label: "Typography Foundation",
    role: "Defines typeface pairings (Outfit, Inter) and core scale parameters.",
    optional: false,
  },
  foundations: {
    id: "foundations",
    label: "Visual Foundations",
    role: "Provides colors palettes, margins boundaries, and styling layout tokens.",
    optional: false,
  },
  layouts: {
    id: "layouts",
    label: "Layout Systems",
    role: "Exposes shells, splits, and fixed widescreen aspects stage panels.",
    optional: false,
  },
  player: {
    id: "interaction-player",
    label: "Interaction Player",
    role: "Maintains speed, timeline scrubbing playheads, and marker controls.",
    optional: true,
  },
  decisions: {
    id: "decision-systems",
    label: "Data & Decision Components",
    role: "Exposes compliance status gates, alert indicators, and ledgers.",
    optional: false,
  },
  capture: {
    id: "capture-bridge",
    label: "Capture Bridge",
    role: "Syncs coordinates state parameters with serialize query URLs.",
    optional: true,
  },
}
export default systemRegistry
