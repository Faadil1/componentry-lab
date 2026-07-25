// ─────────────────────────────────────────────────────────────
// Composition Recipes — Presets Definitions
// ─────────────────────────────────────────────────────────────

import type { RecipePreset } from "./types"

// ─────────────────────────────────────────────────────────────
// 1. PRODUCT LAUNCH
// ─────────────────────────────────────────────────────────────
export const productLaunchPreset: RecipePreset = {
  id: "product-launch",
  label: "Product Launch",
  category: "product",
  description: "A premium product launch sequence that guides the audience from quiet framing through dynamic reveal to an interactive confirmation state.",
  memoryHook: "Show the product before explaining the product.",
  audience: "Product designers, marketing teams, clients, portfolio viewers",
  primaryGoal: "Ensure high-impact visual orientation and reveal without decorative overlays.",
  status: "reusable",
  signatureStateId: "primary-interaction",
  supportedViewports: ["desktop", "laptop", "mobile"],
  accessibilityNotes: [
    "Uses semantic landmark headers and main content blocks.",
    "Supports Reduced Motion settings to disable auto-reveal animations.",
    "All trigger options reachable via keyboard Tab loops."
  ],
  systems: [
    {
      systemId: "typography",
      label: "Typography Foundation",
      role: "Establishes bold contrast hierarchy (Outfit / Inter fonts)",
      dependencies: [],
      optional: false
    },
    {
      systemId: "foundations",
      label: "Visual Foundations",
      role: "Colors palettes styling, mineral black backgrounds and cyan accents",
      dependencies: [],
      optional: false
    },
    {
      systemId: "layouts",
      label: "Layout Systems",
      role: "Fluid viewport grids and split presentation frames",
      dependencies: [],
      optional: false
    },
    {
      systemId: "player",
      label: "Interaction Player",
      role: "Synchronizes the step-by-step reveal timeline",
      dependencies: [],
      optional: true
    },
    {
      systemId: "capture",
      label: "Capture Bridge",
      role: "Generates reproducible snapshot capture parameters",
      dependencies: ["player"],
      optional: true
    }
  ],
  sections: [
    { id: "quiet-framing", label: "Quiet Framing", description: "Minimal branding and headline establishing design constraints." },
    { id: "reveal-stage", label: "Reveal Stage", description: "Interface bounds sliding into viewport coordinates." },
    { id: "interaction-cue", label: "Interaction Cue", description: "Primary CTA highlighting interactive capability." },
    { id: "results-display", label: "Results Display", description: "Shows output or transaction success metrics." },
    { id: "final-resolution", label: "Final Resolution", description: "Clean frame ready for marketing capture." }
  ],
  interactions: [
    { id: "reveal-trigger", label: "Slide Reveal", type: "toggle", description: "Transitions layout from empty canvas to operational container.", trigger: "rAF Play / Time 2.0s", effect: "Interface elements enter with smooth translate/opacity." },
    { id: "focus-cta", label: "Focus CTA", type: "hover", description: "Highlights spotlight target buttons.", trigger: "Mouse Hover / Tab Focus", effect: "Spotlight border turns cyan with light halo." },
    { id: "submit-action", label: "Submit Action", type: "click", description: "Triggers mock transaction confirmation.", trigger: "Click primary button", effect: "Displays verified transaction logs within the panel." }
  ],
  limitations: [
    { id: "layout-scale", description: "Simulated viewport scaling might squeeze dense dashboard elements on mobile views." },
    { id: "animations-sync", description: "Relies on requestAnimationFrame which pauses when the browser tab loses focus." }
  ],
  capturePlan: {
    states: [
      { id: "setup", label: "1. Setup Stage", order: 1, expectedVisualResult: "Quiet dark framing, bold minimal typography.", viewport: "desktop", chromeMode: "full", safeArea: "off", currentTime: 0, frame: 0, isCapturePoint: true, isSignatureFrame: false },
      { id: "orientation", label: "2. Orientation", order: 2, expectedVisualResult: "Headline visible, layout borders fade in.", viewport: "desktop", chromeMode: "full", safeArea: "off", currentTime: 1.5, frame: 45, isCapturePoint: false, isSignatureFrame: false },
      { id: "interaction", label: "3. Primary Interaction", order: 3, expectedVisualResult: "Dashboard visible, main CTA button active.", viewport: "desktop", chromeMode: "minimal", safeArea: "off", currentTime: 4.0, frame: 120, isCapturePoint: true, isSignatureFrame: true, notes: "The key signature display containing main value statement." },
      { id: "result", label: "4. Result State", order: 4, expectedVisualResult: "Output validation numbers showing complete confirmation.", viewport: "desktop", chromeMode: "minimal", safeArea: "off", currentTime: 6.5, frame: 195, isCapturePoint: true, isSignatureFrame: false },
      { id: "signature", label: "5. Capture Resolution", order: 5, expectedVisualResult: "Clean viewport stage centered without any external menus.", viewport: "desktop", chromeMode: "hidden", safeArea: "off", currentTime: 8.0, frame: 240, isCapturePoint: true, isSignatureFrame: false }
    ]
  }
}

// ─────────────────────────────────────────────────────────────
// 2. OPERATIONAL WORKSPACE
// ─────────────────────────────────────────────────────────────
export const operationalWorkspacePreset: RecipePreset = {
  id: "operational-workspace",
  label: "Operational Workspace",
  category: "operational",
  description: "An operations command board layout displaying live metrics signals, validation evidence ledgers, and a decision gate.",
  memoryHook: "Operations need evidence, not more panels.",
  audience: "DevOps teams, release engineers, validation operators",
  primaryGoal: "Ensure decision gates are fully traceable to verified evidence logs.",
  status: "production-candidate",
  signatureStateId: "decision-hold",
  supportedViewports: ["desktop", "laptop"],
  accessibilityNotes: [
    "Strict color-contrast borders for warning alerts.",
    "Aria-live announcements on gate transitions (PROCEED / HOLD).",
    "Evidence list keyboard toggle buttons properly labeled."
  ],
  systems: [
    {
      systemId: "layouts",
      label: "Layout Shell & Sidebar",
      role: "Constructs command layout structure with split utility grids",
      dependencies: [],
      optional: false
    },
    {
      systemId: "decisions",
      label: "Data & Decision Components",
      role: "Exposes SignalBand, EvidenceLedger, and DecisionGate logic",
      dependencies: [],
      optional: false
    },
    {
      systemId: "capture",
      label: "Capture Bridge",
      role: "Maintains serializable state restore URLs",
      dependencies: ["decisions"],
      optional: true
    }
  ],
  sections: [
    { id: "obs-baseline", label: "Telemetry Baseline", description: "Initial check where all validation rules pass." },
    { id: "evidence-focus", label: "Evidence Focus", description: "Highlighting specific rollback log requirements." },
    { id: "rollback-excl", label: "Rollback Exclusion", description: "Manually excluding the verification stamp." },
    { id: "gate-hold", label: "Gate Hold State", description: "Gate transitions instantly to HOLD status." },
    { id: "trace-audit", label: "Trace Log Audit", description: "Exposing rules evaluation checklist." }
  ],
  interactions: [
    { id: "toggle-rollback", label: "Exclude Evidence", type: "toggle", description: "Excludes the rollback stamp file from validation criteria.", trigger: "Click 'Exclude' on Rollback Log", effect: "Recalculates decision rules instantly. Gate updates to HOLD." },
    { id: "adjust-threshold", label: "Override Limits", type: "scrub", description: "Adjusts warning bounds limits in real-time.", trigger: "Drag Threshold Sliders", effect: "Re-evaluates SonarQube rules (normal / warning / critical)." },
    { id: "inspect-rule", label: "Inspect Gate", type: "click", description: "Focuses rule criteria parameters.", trigger: "Click Rule Matrix row", effect: "Exposes consequence details and target checklist." }
  ],
  limitations: [
    { id: "non-realtime", description: "Metrics are mock data snapshots. Does not pull live server metrics." }
  ],
  capturePlan: {
    states: [
      { id: "setup", label: "1. Baseline Setup", order: 1, expectedVisualResult: "All checks green, Decision Gate shows PROCEED.", viewport: "desktop", chromeMode: "full", safeArea: "off", isCapturePoint: true, isSignatureFrame: false },
      { id: "orientation", label: "2. Focus Evidence", order: 2, expectedVisualResult: "Rollback log row selected and focused.", viewport: "desktop", chromeMode: "full", safeArea: "off", isCapturePoint: false, isSignatureFrame: false },
      { id: "interaction", label: "3. Exclude Stamp", order: 3, expectedVisualResult: "Rollback log excluded, status changes to Excluded.", viewport: "desktop", chromeMode: "full", safeArea: "off", isCapturePoint: true, isSignatureFrame: false },
      { id: "result", label: "4. Decision HOLD", order: 4, expectedVisualResult: "Gate turns amber with HOLD alert banner.", viewport: "desktop", chromeMode: "minimal", safeArea: "off", isCapturePoint: true, isSignatureFrame: true, notes: "Shows how missing critical proof updates the entire gate outcome." },
      { id: "signature", label: "5. Clean Audit Frame", order: 5, expectedVisualResult: "Decision Gate + Evidence Ledger centered in Clean View.", viewport: "desktop", chromeMode: "hidden", safeArea: "off", isCapturePoint: true, isSignatureFrame: false }
    ]
  }
}

// ─────────────────────────────────────────────────────────────
// 3. DATA STORY
// ─────────────────────────────────────────────────────────────
export const dataStoryPreset: RecipePreset = {
  id: "data-story",
  label: "Data Story",
  category: "editorial",
  description: "An editorial data narrative that guides readers through metrics trend observations, comparisons, and final decisions.",
  memoryHook: "Data becomes useful when the sequence explains the change.",
  audience: "Analysts, technical writers, executives, product presenters",
  primaryGoal: "Explain the story behind warning deviations using sequential panels.",
  status: "reusable",
  signatureStateId: "interpretation-view",
  supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
  accessibilityNotes: [
    "Reading layout width restricted to 65ch to maximize readability.",
    "Keyboard page navigation controls labeled clearly.",
    "Images/charts have high contrast ratios and text labels."
  ],
  systems: [
    {
      systemId: "typography",
      label: "Typography Recipes",
      role: "Renders article titles, quotes, and code fonts blocks",
      dependencies: [],
      optional: false
    },
    {
      systemId: "layouts",
      label: "Layout Split & Containers",
      role: "Splits reading content column from visualization board",
      dependencies: [],
      optional: false
    },
    {
      systemId: "player",
      label: "Interaction Player",
      role: "Drives step-by-step editorial slide transitions",
      dependencies: [],
      optional: true
    }
  ],
  sections: [
    { id: "intro-metric", label: "Main Metric Intro", description: "Shows high level automated checks passed trend." },
    { id: "anomaly-discovery", label: "Anomaly Discovery", description: "Reveals warning defects count deviation." },
    { id: "contextual-audit", label: "Contextual Audit", description: "Compares security audit seals timeline." },
    { id: "logic-resolution", label: "Logic Resolution", description: "Shows how the gate outcome was decided." }
  ],
  interactions: [
    { id: "slide-nav", label: "Step Slide", type: "click", description: "Advances layout panel forward or backward.", trigger: "Click Prev / Next buttons", effect: "Updates reading column and syncs graphic panel." },
    { id: "toggle-details", label: "Expand Details", type: "toggle", description: "Toggles inline documentation cards.", trigger: "Click highlight text", effect: "Expands detailed footnote container." }
  ],
  limitations: [
    { id: "no-charts-lib", description: "Uses lightweight custom SVG/HTML meters. No external chart libraries integrated." }
  ],
  capturePlan: {
    states: [
      { id: "setup", label: "1. Intro Screen", order: 1, expectedVisualResult: "Clean editorial layout, main metric 98.4% visible.", viewport: "desktop", chromeMode: "full", safeArea: "off", isCapturePoint: true, isSignatureFrame: false },
      { id: "orientation", label: "2. Story Contrast", order: 2, expectedVisualResult: "Text reads 'Defect warning levels count has risen'. Anomaly meter active.", viewport: "desktop", chromeMode: "full", safeArea: "off", isCapturePoint: false, isSignatureFrame: false },
      { id: "interaction", label: "3. Interpretation", order: 3, expectedVisualResult: "Highlighting that a single metric doesn't tell the whole story.", viewport: "desktop", chromeMode: "minimal", safeArea: "off", isCapturePoint: true, isSignatureFrame: true, notes: "Main visual combination: text statement next to anomaly chart." },
      { id: "result", label: "4. Conclusion Gate", order: 4, expectedVisualResult: "Decision Gate resolution shown as manually approved review state.", viewport: "desktop", chromeMode: "minimal", safeArea: "off", isCapturePoint: true, isSignatureFrame: false },
      { id: "signature", label: "5. Clean Slide", order: 5, expectedVisualResult: "Clean editorial page without control panels.", viewport: "desktop", chromeMode: "hidden", safeArea: "off", isCapturePoint: true, isSignatureFrame: false }
    ]
  }
}

// ─────────────────────────────────────────────────────────────
// 4. BROADCAST PACKAGE
// ─────────────────────────────────────────────────────────────
export const broadcastPackagePreset: RecipePreset = {
  id: "broadcast-package",
  label: "Broadcast Package",
  category: "broadcast",
  description: "A 16:9 broadcast / livestream layout displaying live status events feeds and a responsive Lower Third overlay.",
  memoryHook: "Every live state needs a clear cue.",
  audience: "Broadcasters, live stream production crews, event coordinators",
  primaryGoal: "Ensure visual information complies with TV broadcast action-safe and title-safe zones.",
  status: "reusable",
  signatureStateId: "lower-third-overlay",
  supportedViewports: ["broadcast", "portrait"],
  accessibilityNotes: [
    "Safe areas overlay borders can be enabled for visual inspection.",
    "Lower Third text scale and contrast optimized for video screens.",
    "Announces title overlays changes to screen readers."
  ],
  systems: [
    {
      systemId: "layouts",
      label: "Layout Stage 16:9",
      role: "Maintains fixed widescreen aspect ratio canvas wrapper",
      dependencies: [],
      optional: false
    },
    {
      systemId: "player",
      label: "Interaction Player",
      role: "Manages live frame timelines and cue markers",
      dependencies: [],
      optional: false
    },
    {
      systemId: "split-flap",
      label: "Split Flap Indicator",
      role: "Simulates retro clock status animations",
      dependencies: [],
      optional: true
    }
  ],
  sections: [
    { id: "standby-feed", label: "Standby Feed", description: "Pre-live broadcast screen with standby ticker." },
    { id: "go-live", label: "Go Live Feed", description: "Widescreen live viewport feed active." },
    { id: "event-marked", label: "Event Marked", description: "Visual cue highlights recent incident timestamp." },
    { id: "lower-third-overlay", label: "Lower Third Active", description: "Lower third overlays name and status text." },
    { id: "clean-stream", label: "Clean Stream View", description: "Hidden controls for final feed output." }
  ],
  interactions: [
    { id: "toggle-live", label: "Toggle Live Status", type: "toggle", description: "Flips standby status feed to active stream feed.", trigger: "Click GO LIVE on header", effect: "Timer starts accumulating timecode. Main overlay mounts." },
    { id: "trigger-overlay", label: "Show Captions", type: "click", description: "Mounts lower third caption text.", trigger: "Click Lower Third button", effect: "Slide-in caption overlay bounds at screen bottom." },
    { id: "set-safety", label: "Toggle Safety Zones", type: "toggle", description: "Toggles broadcast safe-zone lines overlays.", trigger: "Click Safety Areas toggle", effect: "Draws dashed border guidelines (10% action-safe, 5% title-safe)." }
  ],
  limitations: [
    { id: "no-video-streams", description: "Simulates overlays framing only. Does not connect to RTMP cameras feeds." }
  ],
  capturePlan: {
    states: [
      { id: "setup", label: "1. Standby Screen", order: 1, expectedVisualResult: "Standby grid and timecode monitor visible.", viewport: "broadcast", chromeMode: "full", safeArea: "off", isCapturePoint: true, isSignatureFrame: false },
      { id: "orientation", label: "2. Live Feed Active", order: 2, expectedVisualResult: "Go Live feed active, clock ticking.", viewport: "broadcast", chromeMode: "full", safeArea: "broadcast", isCapturePoint: false, isSignatureFrame: false },
      { id: "interaction", label: "3. Event Marked", order: 3, expectedVisualResult: "Event timestamp highlighted inside the tracker feed.", viewport: "broadcast", chromeMode: "minimal", safeArea: "broadcast", isCapturePoint: true, isSignatureFrame: false },
      { id: "result", label: "4. Lower Third overlay", order: 4, expectedVisualResult: "Lower third overlay visible within title-safe bounds.", viewport: "broadcast", chromeMode: "minimal", safeArea: "broadcast", isCapturePoint: true, isSignatureFrame: true, notes: "Main broadcast combination showcasing captions and time codes." },
      { id: "signature", label: "5. Clean Feed Output", order: 5, expectedVisualResult: "Zero chrome broadcast feed ready for live capture.", viewport: "broadcast", chromeMode: "hidden", safeArea: "broadcast", isCapturePoint: true, isSignatureFrame: false }
    ]
  }
}

export const recipePresets = {
  productLaunch: productLaunchPreset,
  operationalWorkspace: operationalWorkspacePreset,
  dataStory: dataStoryPreset,
  broadcastPackage: broadcastPackagePreset,
} as const
