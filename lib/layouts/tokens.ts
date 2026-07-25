import type { LayoutTokens } from "./types"

export const layoutTokens: LayoutTokens = {
  containers: [
    { name: "compact", value: "480px", usage: "Narrow control or settings sheets." },
    { name: "reading", value: "680px", usage: "Optimal line length (50-75ch) for prose." },
    { name: "standard", value: "1024px", usage: "Default content page alignment." },
    { name: "wide", value: "1440px", usage: "Immersive product layouts and dashboards." },
    { name: "full", value: "100%", usage: "Edge-to-edge workspaces or canvas shells." },
  ],
  gutters: [
    { name: "compact", value: "12px", usage: "Dense mobile environments or mini interfaces." },
    { name: "standard", value: "24px", usage: "Standard web page side paddings." },
    { name: "generous", value: "48px", usage: "Spacious tablet or editorial galleries." },
    { name: "cinematic", value: "96px", usage: "Ultra-wide hero layouts and showpieces." },
  ],
  gaps: [
    { name: "inline", value: "8px", usage: "Spacing between close inline elements like badges or icons." },
    { name: "cluster", value: "16px", usage: "Spacing between interactive button clusters." },
    { name: "stack", value: "24px", usage: "Rythme vertical between sections of content." },
    { name: "grid", value: "32px", usage: "Standard spacing between grid columns and rows." },
    { name: "section", value: "64px", usage: "Large layout boundaries and vertical page breaks." },
  ],
  grids: [
    { name: "2-cols", columns: 2, usage: "Simple split layout patterns." },
    { name: "3-cols", columns: 3, usage: "Card features and product galleries." },
    { name: "4-cols", columns: 4, usage: "Fine data monitoring dashboards." },
    { name: "6-cols", columns: 6, usage: "Advanced operational screens." },
    { name: "12-cols", columns: 12, usage: "Master layout grid for aligning varied spans." },
  ],
  safeAreas: [
    {
      name: "interface",
      top: "16px",
      bottom: "16px",
      left: "16px",
      right: "16px",
      usage: "Standard controls distance from viewport edges.",
    },
    {
      name: "presentation",
      top: "32px",
      bottom: "32px",
      left: "32px",
      right: "32px",
      usage: "Generous safety zone for slides or video elements.",
    },
    {
      name: "broadcast",
      top: "48px",
      bottom: "48px",
      left: "48px",
      right: "48px",
      usage: "Television or live broadcast standard safe margins.",
    },
    {
      name: "cinematic",
      top: "64px",
      bottom: "64px",
      left: "64px",
      right: "64px",
      usage: "Ultra-wide safety margins for fullscreen artwork.",
    },
  ],
}

export const layoutTokensCss = `
:root {
  --layout-container-compact: 480px;
  --layout-container-reading: 680px;
  --layout-container-standard: 1024px;
  --layout-container-wide: 1440px;
  --layout-container-full: 100%;

  --layout-gutter-compact: 12px;
  --layout-gutter-standard: 24px;
  --layout-gutter-generous: 48px;
  --layout-gutter-cinematic: 96px;

  --layout-gap-inline: 8px;
  --layout-gap-cluster: 16px;
  --layout-gap-stack: 24px;
  --layout-gap-grid: 32px;
  --layout-gap-section: 64px;

  --layout-safe-interface-top: 16px;
  --layout-safe-interface-bottom: 16px;
  --layout-safe-interface-left: 16px;
  --layout-safe-interface-right: 16px;

  --layout-safe-broadcast-top: 48px;
  --layout-safe-broadcast-bottom: 48px;
  --layout-safe-broadcast-left: 48px;
  --layout-safe-broadcast-right: 48px;
}
`.trim()
