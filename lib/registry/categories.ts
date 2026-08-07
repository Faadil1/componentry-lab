// ─────────────────────────────────────────────────────────────
// Registry V2 — Categories Taxonomy
// ─────────────────────────────────────────────────────────────

import type { RegistryCategory } from "./types"

export const registryCategories: Record<string, RegistryCategory> = {
  interaction: {
    id: "interaction",
    label: "Direct Interaction",
    shortDescription: "High-fidelity micro-interactions and gestural inputs for custom dashboard dials.",
    order: 1,
    accent: "cyan",
    relatedKinds: ["interaction"],
    recommendedAudience: "Creative Developers, UI Designers"
  },
  typography: {
    id: "typography",
    label: "Typographic Systems",
    shortDescription: "Clean Outfit and Inter pairings, scales, and sequential letter animations.",
    order: 2,
    accent: "stone",
    relatedKinds: ["foundation"],
    recommendedAudience: "Editorial Designers, Technical Writers"
  },
  "visual-foundation": {
    id: "visual-foundation",
    label: "Visual Foundations",
    shortDescription: "Color palettes tokens (mineral black, warm ivory) and fluid density scales.",
    order: 3,
    accent: "stone",
    relatedKinds: ["foundation"],
    recommendedAudience: "Brand Engineers, Design System Leads"
  },
  layout: {
    id: "layout",
    label: "Structural Layouts",
    shortDescription: "Flexible grids, sidebars, shells, and widescreen stage wrappers.",
    order: 4,
    accent: "stone",
    relatedKinds: ["layout"],
    recommendedAudience: "Application Architects, Product Designers"
  },
  playback: {
    id: "playback",
    label: "Sequence Playback",
    shortDescription: "Deterministic runtime engines capable of stepping and scrub playheads.",
    order: 5,
    accent: "cyan",
    relatedKinds: ["system"],
    recommendedAudience: "Demos Engineers, Presentation Teams"
  },
  decision: {
    id: "decision",
    label: "Data & Decisions",
    shortDescription: "Traceable decision logic components transforming telemetry signals into gates.",
    order: 6,
    accent: "amber",
    relatedKinds: ["system"],
    recommendedAudience: "DevOps Crew, Validation Engineers"
  },
  capture: {
    id: "capture",
    label: "Capture Frameworks",
    shortDescription: "Bridges synchronizing canvas state parameters into serialize query urls.",
    order: 7,
    accent: "cyan",
    relatedKinds: ["system"],
    recommendedAudience: "Automation Engineers, Video Creators"
  },
  "product-composition": {
    id: "product-composition",
    label: "Product Launches",
    shortDescription: "Compositions tailored to premium product reveals and cinematic CTAs.",
    order: 8,
    accent: "cyan",
    relatedKinds: ["recipe"],
    recommendedAudience: "Marketing Teams, Product Managers"
  },
  "operational-composition": {
    id: "operational-composition",
    label: "Operational Command",
    shortDescription: "High-density workspace recipe showing alert indicators and decisions.",
    order: 9,
    accent: "amber",
    relatedKinds: ["recipe"],
    recommendedAudience: "Site Reliability Engineers, Ops Operators"
  },
  "editorial-composition": {
    id: "editorial-composition",
    label: "Editorial Narratives",
    shortDescription: "Narrative readability layout split next to active deviation meters.",
    order: 10,
    accent: "stone",
    relatedKinds: ["recipe"],
    recommendedAudience: "Analysts, Data Storytellers"
  },
  "broadcast-composition": {
    id: "broadcast-composition",
    label: "Broadcast Graphics",
    shortDescription: "16:9 widescreen package containing clock tickers and safe overlays.",
    order: 11,
    accent: "red",
    relatedKinds: ["recipe"],
    recommendedAudience: "Livestream Producers, Event Hosts"
  },
  workflow: {
    id: "workflow",
    label: "Workflow Components",
    shortDescription: "Read-only state display components for content production pipeline visibility.",
    order: 12,
    accent: "indigo",
    relatedKinds: ["workflow"],
    recommendedAudience: "Content Operations, Production Coordinators"
  }
}
export default registryCategories
