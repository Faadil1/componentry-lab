import type { LayoutPreset } from "./types"

export const layoutPresets: LayoutPreset[] = [
  {
    category: "editorial",
    name: "Editorial Brief",
    description: "Designed for content-heavy pages like articles, long-form reviews, case studies, or reading briefs.",
    structure: {
      primitives: ["container", "stack", "split"],
      density: "spacious",
      container: "reading",
    },
  },
  {
    category: "workspace",
    name: "Product Workspace",
    description: "Tailored for administrative SaaS screens, editing tools, and side-by-side control interfaces.",
    structure: {
      primitives: ["shell", "sidebar", "cluster", "grid"],
      density: "compact",
      container: "full",
    },
  },
  {
    category: "command-center",
    name: "Data Command Center",
    description: "Optimized for dense status monitoring, KPI metrics panels, real-time logs, and tabular data tables.",
    structure: {
      primitives: ["grid", "rail", "stack", "cluster"],
      density: "compact",
      container: "wide",
    },
  },
  {
    category: "broadcast",
    name: "Broadcast Stage",
    description: "Engineered for immersive video streams, slides, television broadcast spaces, and capture-ready heroes.",
    structure: {
      primitives: ["stage", "rail", "split"],
      density: "standard",
      container: "wide",
    },
  },
]
