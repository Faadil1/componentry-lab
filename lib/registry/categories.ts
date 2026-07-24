import type { ComponentCategory } from "./types"

export const componentCategories = [
  "Cursor & Pointer",
  "Data & Numbers",
  "Direct Manipulation",
  "Typography",
  "Scroll & Storytelling",
  "Image & Media",
  "3D & WebGL",
  "Transitions",
  "Broadcast & Live",
  "Capture Ready",
] as const satisfies readonly ComponentCategory[]

export const categoryDescriptions: Record<ComponentCategory, string> = {
  "Cursor & Pointer": "Interactions driven by pointer position, hover, focus and spatial cursor intent.",
  "Data & Numbers": "Numerical, financial, status and metric components with capture-stable formatting.",
  "Direct Manipulation": "Controls where dragging or scrubbing directly changes a value or scene.",
  Typography: "Text-led components, kinetic lettering, counters and typographic systems.",
  "Scroll & Storytelling": "Scroll-driven sequences, narrative sections and editorial progression.",
  "Image & Media": "Components centered on images, video, audio, masks and media treatment.",
  "3D & WebGL": "Three-dimensional interfaces, canvas scenes and WebGL-based interactions.",
  Transitions: "Reusable transition primitives for route, state and content changes.",
  "Broadcast & Live": "Components suited for countdowns, launches, live overlays and production moments.",
  "Capture Ready": "Components with deterministic states and stable selectors for Playwright and Remotion.",
}
