// ─────────────────────────────────────────────────────────────
// Registry V2 — Component Entries
// ─────────────────────────────────────────────────────────────

import type { RegistryEntry } from "./types"

export const registryComponents: RegistryEntry[] = [
  // ── INTERACTIONS ───────────────────────────────────────────
  {
    id: "spotlight",
    slug: "spotlight-card",
    label: "Spotlight Card",
    shortLabel: "Spotlight",
    kind: "interaction",
    categoryId: "interaction",
    maturity: "experimental",
    summary: "Pointer-reactive card surface with dynamic lighting hover effects.",
    description: "Features relative glare tracking and proximity lighting shaders for cinematic dashboards cards layout.",
    route: "/",
    sourcePaths: ["components/foundations/spotlight-card.tsx"],
    tags: ["cursor", "spotlight", "pointer", "interactive"],
    capabilities: ["responsive", "css-driven", "keyboard-accessible"],
    runtimes: ["react", "css"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
    deterministic: false,
    captureReady: false,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["article", "button"],
      screenReaderAnnouncements: false,
      contrastRatio: "4.5:1"
    },
    dependencies: [{ name: "react", optional: false }, { name: "clsx", optional: false }],
    relations: [{ type: "composes", targetId: "product-launch-recipe" }],
    usageExamples: [
      {
        title: "Spotlight Card basic setup",
        code: `<SpotlightCard className="p-6">\n  <h3>Card Title</h3>\n</SpotlightCard>`
      }
    ],
    limitations: [
      "Spotlight positions must be scripted for deterministic Remotion captures.",
      "CSS gradients require GPU acceleration on heavy rendering loops."
    ],
    recommendedFor: ["Cinematic features highlights grids", "Sleek landing sections"],
    avoidFor: ["High density logs tables", "Forms input structures"],
    memoryHook: "Show the lighting where focus rests.",
    signatureInteraction: "Mouse cursor relative position coordinates."
  },
  {
    id: "split-flap",
    slug: "split-flap-display",
    label: "Split Flap Display",
    shortLabel: "Split Flap",
    kind: "interaction",
    categoryId: "interaction",
    maturity: "reusable",
    summary: "Mechanical counter rows simulating airport flap boards.",
    description: "Uses CSS staggered translates to render characters flip transitions with stable sizing layouts.",
    route: "/split-flap",
    sourcePaths: ["components/split-flap/split-flap-board.tsx"],
    tags: ["flap", "split", "ticker", "counter"],
    capabilities: ["deterministic", "capture-ready", "stateful"],
    runtimes: ["react", "css"],
    supportedViewports: ["desktop", "laptop", "broadcast"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: ["status", "timer"],
      screenReaderAnnouncements: true,
      contrastRatio: "7:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "broadcast-package-recipe" }],
    usageExamples: [
      {
        title: "Split Flap board rendering status",
        code: `<SplitFlapBoard value="ARRIVED" />`
      }
    ],
    limitations: [
      "Fixed letter height required to avoid jumping layouts.",
      "String length changes require manual layout adjustments."
    ],
    recommendedFor: ["Launch countdown countdowns", "Airport status tables"],
    avoidFor: ["Long form text descriptions", "User keyboard inputs"],
    memoryHook: "Stagger the mechanical flip.",
    signatureInteraction: "Trigger characters update button event."
  },
  {
    id: "scrub-input",
    slug: "scrub-input-control",
    label: "Scrub Input Control",
    shortLabel: "Scrub Input",
    kind: "interaction",
    categoryId: "interaction",
    maturity: "reusable",
    summary: "Horizontal drag value increment control for dials.",
    description: "Permits scrubbing numeric parameters directly by dragging mouse pointer or arrow keys triggers.",
    route: "/scrub-input",
    sourcePaths: ["components/scrub-input/scrub-slider.tsx"],
    tags: ["scrub", "slider", "drag", "input"],
    capabilities: ["responsive", "stateful", "keyboard-accessible"],
    runtimes: ["react", "browser-api"],
    supportedViewports: ["desktop", "laptop", "tablet"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["slider"],
      screenReaderAnnouncements: true,
      contrastRatio: "5.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "product-launch-recipe" }],
    usageExamples: [
      {
        title: "Numeric scrub slider component",
        code: `<ScrubSlider min={0} max={100} value={58} onChange={val => console.log(val)} />`
      }
    ],
    limitations: [
      "Relative movement scaling requires device pixel ratio offsets adjustments.",
      "Needs specific touch handlers on mobile screen scrolls."
    ],
    recommendedFor: ["Canvas coordinates control", "Sound frequency control dials"],
    avoidFor: ["Text fields input forms", "Boolean checkboxes"],
    memoryHook: "Relative drag drives absolute values.",
    signatureInteraction: "Drag scrub horizontal action."
  },
  {
    id: "kinetic-text",
    slug: "kinetic-text-reveal",
    label: "Kinetic Text Reveal",
    shortLabel: "Kinetic Text",
    kind: "interaction",
    categoryId: "interaction",
    maturity: "experimental",
    summary: "Sequenced typographical text lettering reveal system.",
    description: "Slides characters on time intervals to display cinematic manifestos.",
    route: "/kinetic-text",
    sourcePaths: ["components/kinetic-text/kinetic-revealer.tsx"],
    tags: ["kinetic", "letters", "reveal", "manifesto"],
    capabilities: ["deterministic", "timeline-controlled", "reduced-motion"],
    runtimes: ["react", "css"],
    supportedViewports: ["desktop", "laptop"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: ["status"],
      screenReaderAnnouncements: true,
      contrastRatio: "6:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "product-launch-recipe" }],
    usageExamples: [
      {
        title: "Typographical kinetic manifesto",
        code: `<KineticRevealer text="Consequence" activeIndex={1} />`
      }
    ],
    limitations: [
      "Avoid using paragraphs that require viewport wrap adjustments.",
      "High CPU footprint if dozens of letters animate concurrently."
    ],
    recommendedFor: ["Intro product launches statement screens", "Hero headers"],
    avoidFor: ["Dense documentation layout", "Inline link sentences"],
    memoryHook: "Delay letters dynamically.",
    signatureInteraction: "rAF ticks triggers next step."
  },
  {
    id: "scroll-choreography",
    slug: "scroll-choreography-stage",
    label: "Scroll Choreography Stage",
    shortLabel: "Scroll Choreography",
    kind: "interaction",
    categoryId: "interaction",
    maturity: "experimental",
    summary: "Sticky scroll visual narrative storyboard system.",
    description: "Aligns structural panels depending on container scroll boundaries thresholds.",
    route: "/scroll-choreography",
    sourcePaths: ["components/scroll-choreography/scroll-timeline.tsx"],
    tags: ["scroll", "sticky", "timeline", "storyboard"],
    capabilities: ["deterministic", "timeline-controlled", "responsive"],
    runtimes: ["react", "browser-api"],
    supportedViewports: ["desktop", "laptop", "tablet"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "partial",
      ariaRoles: ["feed", "navigation"],
      screenReaderAnnouncements: false,
      contrastRatio: "4.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "data-story-recipe" }],
    usageExamples: [
      {
        title: "Scroll storyboard layout",
        code: `<ScrollChoreographyStage activeStep={1} totalSteps={4} />`
      }
    ],
    limitations: [
      "Requires explicit trackpad scroll wheel simulator in Remotion context.",
      "Touch screen gesture bounce interferes with sticky heights."
    ],
    recommendedFor: ["Product narrative story screens", "Technical case studies"],
    avoidFor: ["Simple footer contact info pages", "Data tables"],
    memoryHook: "Anchor position coordinates.",
    signatureInteraction: "Scroll mouse wheel step index trigger."
  },
  {
    id: "webgl-liquid",
    slug: "webgl-liquid-shader",
    label: "WebGL Liquid Shader",
    shortLabel: "WebGL Liquid",
    kind: "interaction",
    categoryId: "interaction",
    maturity: "experimental",
    summary: "Fluid dynamic uniforms shader backdrop field.",
    description: "Updates fluid texture uniforms relative to canvas interaction loops.",
    route: "/webgl-liquid",
    sourcePaths: ["components/webgl-liquid/liquid-canvas.tsx"],
    tags: ["webgl", "liquid", "shader", "uniforms"],
    capabilities: ["webgl"],
    runtimes: ["react", "webgl"],
    supportedViewports: ["desktop", "laptop"],
    deterministic: false,
    captureReady: false,
    ssrSafe: false,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: ["presentation"],
      screenReaderAnnouncements: false,
      contrastRatio: "3:1"
    },
    dependencies: [{ name: "three", optional: false }],
    relations: [{ type: "alternative-to", targetId: "image-ripple" }],
    usageExamples: [
      {
        title: "WebGL background canvas mount",
        code: `<LiquidCanvas density={0.8} />`
      }
    ],
    limitations: [
      "Requires WebGL 2 capabilities in host browser environment.",
      "Cannot render fallback states efficiently on server-side pre-builds."
    ],
    recommendedFor: ["Ambient login backing scenes", "Visual focus screens"],
    avoidFor: ["Critical data graphs backing", "Interactive lists overlays"],
    memoryHook: "Disturb the uniform grid.",
    signatureInteraction: "Shader time clock tick."
  },
  {
    id: "image-ripple",
    slug: "image-ripple-effect",
    label: "Image Ripple Effect",
    shortLabel: "Image Ripple",
    kind: "interaction",
    categoryId: "interaction",
    maturity: "experimental",
    summary: "WebGL image surface wave texture distortion.",
    description: "Draws concentric waves coordinates over loaded image maps.",
    route: "/image-ripple",
    sourcePaths: ["components/image-ripple/ripple-canvas.tsx"],
    tags: ["ripple", "webgl", "image", "distortion"],
    capabilities: ["webgl", "deterministic"],
    runtimes: ["react", "webgl"],
    supportedViewports: ["desktop", "laptop", "tablet"],
    deterministic: true,
    captureReady: true,
    ssrSafe: false,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: ["img"],
      screenReaderAnnouncements: false,
      contrastRatio: "4.5:1"
    },
    dependencies: [{ name: "three", optional: false }],
    relations: [{ type: "alternative-to", targetId: "webgl-liquid" }],
    usageExamples: [
      {
        title: "Image ripple canvas setup",
        code: `<RippleCanvas imageSrc="/images/product.jpg" />`
      }
    ],
    limitations: [
      "Image assets must serve CORS parameters to avoid WebGL cross-origin leaks.",
      "Performance drops on high resolution displays if texture bounds are large."
    ],
    recommendedFor: ["Product feature banner reveal", "Creative profile cards"],
    avoidFor: ["Raw text layout blocks", "Inline links"],
    memoryHook: "Distort the image grids.",
    signatureInteraction: "Seeded cursor coordinate sweep."
  },

  // ── FOUNDATIONS ────────────────────────────────────────────
  {
    id: "typography",
    slug: "typography-foundation",
    label: "Typography Foundation",
    shortLabel: "Typography",
    kind: "foundation",
    categoryId: "typography",
    maturity: "production-candidate",
    summary: "Clean font scaling and type variables system.",
    description: "Applies Outfit sans headers paired with Inter details fonts.",
    route: "/typography",
    sourcePaths: ["app/typography/page.tsx"],
    tags: ["fonts", "typography", "css", "layout"],
    capabilities: ["responsive", "css-driven"],
    runtimes: ["css", "react"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: [],
      screenReaderAnnouncements: false,
      contrastRatio: "7:1"
    },
    dependencies: [{ name: "tailwindcss", optional: false }],
    relations: [{ type: "composes", targetId: "data-story-recipe" }],
    usageExamples: [
      {
        title: "Typographical hierarchy styling classes",
        code: `<h1 className="text-3xl font-black Outfit tracking-tight">Title</h1>`
      }
    ],
    limitations: [
      "Outfit google font files must load early to prevent layout shifts."
    ],
    recommendedFor: ["Sleek text-heavy layouts", "Marketing headlines grids"],
    avoidFor: ["Retro mechanical logs grids"],
    memoryHook: "Pair headers with structural details."
  },
  {
    id: "foundations",
    slug: "visual-foundations",
    label: "Visual Foundations",
    shortLabel: "Foundations",
    kind: "foundation",
    categoryId: "visual-foundation",
    maturity: "production-candidate",
    summary: "Dark/light palettes tokens and spacing layouts foundations.",
    description: "Maintains warm ivory, graphite blacks, and cyan/amber warning system accent variables.",
    route: "/foundations",
    sourcePaths: ["app/foundations/page.tsx"],
    tags: ["colors", "foundations", "tokens", "theme"],
    capabilities: ["css-driven", "responsive"],
    runtimes: ["css"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: [],
      screenReaderAnnouncements: false,
      contrastRatio: "4.5:1"
    },
    dependencies: [{ name: "tailwindcss", optional: false }],
    relations: [{ type: "composes", targetId: "product-launch-recipe" }],
    usageExamples: [
      {
        title: "Applying visual foundation backgrounds",
        code: `<div className="bg-[#0a0a09] text-stone-100 border border-stone-850">Content</div>`
      }
    ],
    limitations: [
      "Custom color hexes must register in Tailwind config scope to prevent bundle loss."
    ],
    recommendedFor: ["Brand visual consistency layouts", "Specimen portfolios"],
    avoidFor: ["Legacy corporate templates"],
    memoryHook: "Stick to mineral blacks and warm ivories."
  },
  {
    id: "layouts",
    slug: "layout-systems",
    label: "Layout Systems",
    shortLabel: "Layouts",
    kind: "layout",
    categoryId: "layout",
    maturity: "production-candidate",
    summary: "Widescreen Stage, splits, and shell layout systems.",
    description: "Coordinates workspace boundaries layouts (LayoutShell, LayoutSidebar, LayoutGrid, LayoutStage).",
    route: "/layouts",
    sourcePaths: ["components/layouts/layout-shell.tsx", "components/layouts/layout-stage.tsx"],
    tags: ["layouts", "stage", "split", "sidebar"],
    capabilities: ["responsive", "clean-view"],
    runtimes: ["react", "css"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile", "broadcast"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["banner", "main", "navigation"],
      screenReaderAnnouncements: false,
      contrastRatio: "4.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [
      { type: "uses", targetId: "layout-shell" },
      { type: "uses", targetId: "layout-stage" },
      { type: "uses", targetId: "layout-split" }
    ],
    usageExamples: [
      {
        title: "Dashboard shell composition",
        code: `<LayoutShell>\n  <LayoutSidebar>Menu</LayoutSidebar>\n  <LayoutMain>Content</LayoutMain>\n</LayoutShell>`
      }
    ],
    limitations: [
      "Fixed 16:9 stage constraints clip overflow elements if scrollbar is hidden."
    ],
    recommendedFor: ["Professional admin control desks", "Clean broadcast feeds"],
    avoidFor: ["Single-column text articles"],
    memoryHook: "Structure coordinates before mounting panels."
  },

  // ── REUSABLE SYSTEMS ───────────────────────────────────────
  {
    id: "interaction-player",
    slug: "universal-interaction-player",
    label: "Universal Interaction Player",
    shortLabel: "Interaction Player",
    kind: "system",
    categoryId: "playback",
    maturity: "reusable",
    summary: "Staged sequence engine for timeline scrubbing control.",
    description: "Features speed control, markers index jump, and frame-by-frame steps control.",
    route: "/player",
    sourcePaths: ["components/player/interaction-player.tsx"],
    tags: ["player", "playback", "timeline", "scrub"],
    capabilities: ["deterministic", "timeline-controlled", "exportable"],
    runtimes: ["react", "browser-api"],
    supportedViewports: ["desktop", "laptop", "tablet"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["application", "toolbar"],
      screenReaderAnnouncements: true,
      contrastRatio: "5.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "controlled-by", targetId: "capture-bridge" }],
    usageExamples: [
      {
        title: "Interaction player timeline setup",
        code: `<InteractionPlayer sceneId="product-reveal" />`
      }
    ],
    limitations: [
      "External video streams are not supported; timeline coordinates apply strictly to react state states."
    ],
    recommendedFor: ["Interactive product tutorials", "Frame validation tools"],
    avoidFor: ["Standard audio/video file playback"],
    memoryHook: "Expose chronological frames deterministically."
  },
  {
    id: "decision-systems",
    slug: "decision-components",
    label: "Data & Decision Components",
    shortLabel: "Decision Systems",
    kind: "system",
    categoryId: "decision",
    maturity: "production-candidate",
    summary: "Traceable decision logic components transforming telemetry signals.",
    description: "Includes SignalBand metrics, EvidenceLedger checkcards, and DecisionGate evaluation status indicators.",
    route: "/decisions",
    sourcePaths: ["components/decisions/decision-gate.tsx", "components/decisions/evidence-ledger.tsx"],
    tags: ["decisions", "telemetry", "gate", "evidence"],
    capabilities: ["deterministic", "evidence-driven", "decision-traceable"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop", "tablet"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["group", "status", "list"],
      screenReaderAnnouncements: true,
      contrastRatio: "6:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [
      { type: "uses", targetId: "signal-band" },
      { type: "uses", targetId: "evidence-ledger" },
      { type: "uses", targetId: "decision-gate" },
      { type: "uses", targetId: "decision-trace" }
    ],
    usageExamples: [
      {
        title: "Decision provider wrapping telemetry components",
        code: `<DecisionProvider>\n  <SignalBand />\n  <DecisionGate />\n</DecisionProvider>`
      }
    ],
    limitations: [
      "Evaluation rules are processed locally. Does not parse backend rules schemas."
    ],
    recommendedFor: ["Traceable compliance deployment gates", "Continuous integration logs command desks"],
    avoidFor: ["Pure presentation graphs pages", "Generic SaaS layouts"],
    memoryHook: "Operations need evidence, not more panels."
  },
  {
    id: "capture-bridge",
    slug: "demo-capture-bridge",
    label: "Demo & Capture Bridge",
    shortLabel: "Capture Bridge",
    kind: "system",
    categoryId: "capture",
    maturity: "reusable",
    summary: "URL parameters state bridge for automated grabbers.",
    description: "Syncs layout dimensions, frame counts, and toolbar visibility to Restore URLs.",
    route: "/capture",
    sourcePaths: ["components/capture/capture-provider.tsx", "components/capture/capture-workbench.tsx"],
    tags: ["capture", "bridge", "remotion", "playwright"],
    capabilities: ["deterministic", "capture-ready", "url-restorable", "clean-view"],
    runtimes: ["react", "browser-api"],
    supportedViewports: ["desktop", "laptop"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["application"],
      screenReaderAnnouncements: true,
      contrastRatio: "5.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [
      { type: "uses", targetId: "capture-workbench" },
      { type: "supports", targetId: "interaction-player" }
    ],
    usageExamples: [
      {
        title: "Mounting capture bridge workbench",
        code: `<CaptureWorkbench sceneId="decision-sequence" />`
      }
    ],
    limitations: [
      "Requires browser environment supporting window.history APIs for URL sync."
    ],
    recommendedFor: ["Perfect repeatable video footage creation", "Visual regression testing pipelines"],
    avoidFor: ["General client side application state routers"],
    memoryHook: "Sync coordinates directly to URLs."
  },

  // ── RECIPES ────────────────────────────────────────────────
  {
    id: "product-launch-recipe",
    slug: "product-launch-composition",
    label: "Product Launch Recipe",
    shortLabel: "Product Launch",
    kind: "recipe",
    categoryId: "product-composition",
    maturity: "reusable",
    summary: "Product landing page launch composition.",
    description: "Features progressive text reveal, spotlight details, and interactive logs verification panels.",
    route: "/recipes?recipe=product-launch",
    sourcePaths: ["components/recipes/product-launch-recipe.tsx"],
    tags: ["recipe", "landing", "reveal", "spotlight"],
    capabilities: ["responsive", "clean-view", "composition-ready", "product"],
    runtimes: ["react", "css"],
    supportedViewports: ["desktop", "laptop", "mobile"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["banner", "main", "button"],
      screenReaderAnnouncements: true,
      contrastRatio: "5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [
      { type: "composes", targetId: "typography" },
      { type: "composes", targetId: "spotlight" }
    ],
    usageExamples: [
      {
        title: "Product Launch Recipe mounting inside workbench",
        code: `<RecipeWorkbench initialRecipeId="product-launch" />`
      }
    ],
    limitations: [
      "Large dashboard blocks inside reveal boundaries might wrap oddly on small screens."
    ],
    recommendedFor: ["Marketing showcase pages", "Interactive portfolio templates"],
    avoidFor: ["Heavy diagnostic data command dashboards"],
    memoryHook: "Show the product before explaining the product."
  },
  {
    id: "operational-workspace-recipe",
    slug: "operational-workspace-composition",
    label: "Operational Workspace Recipe",
    shortLabel: "Operational Workspace",
    kind: "recipe",
    categoryId: "operational-composition",
    maturity: "production-candidate",
    summary: "Telemetry readiness gate command room composition.",
    description: "Integrates signals bands, validation ledger checkcards, and gate decision traces.",
    route: "/recipes?recipe=operational-workspace",
    sourcePaths: ["components/recipes/operational-workspace-recipe.tsx"],
    tags: ["recipe", "operational", "gate", "telemetry"],
    capabilities: ["deterministic", "evidence-driven", "decision-traceable", "operational"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["group", "status", "list"],
      screenReaderAnnouncements: true,
      contrastRatio: "6:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [
      { type: "composes", targetId: "layouts" },
      { type: "composes", targetId: "decision-systems" }
    ],
    usageExamples: [
      {
        title: "Operational Workspace Recipe setup",
        code: `<RecipeWorkbench initialRecipeId="operational-workspace" />`
      }
    ],
    limitations: [
      "Requires widescreen monitor space to align sidebar grids cleanly."
    ],
    recommendedFor: ["Site Reliability command tables", "Pipeline release checks"],
    avoidFor: ["Editorial blog articles"],
    memoryHook: "Operations need evidence, not more panels."
  },
  {
    id: "data-story-recipe",
    slug: "data-story-composition",
    label: "Data Story Recipe",
    shortLabel: "Data Story",
    kind: "recipe",
    categoryId: "editorial-composition",
    maturity: "reusable",
    summary: "Typographic case study storytelling composition.",
    description: "Locks reading width to 65ch with side layout split exposing warning meters.",
    route: "/recipes?recipe=data-story",
    sourcePaths: ["components/recipes/data-story-recipe.tsx"],
    tags: ["recipe", "editorial", "story", "typography"],
    capabilities: ["responsive", "editorial", "svg"],
    runtimes: ["react", "svg"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["article", "document"],
      screenReaderAnnouncements: false,
      contrastRatio: "7:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [
      { type: "composes", targetId: "typography" },
      { type: "composes", targetId: "scroll-choreography" }
    ],
    usageExamples: [
      {
        title: "Data Story Recipe mounting",
        code: `<RecipeWorkbench initialRecipeId="data-story" />`
      }
    ],
    limitations: [
      "Custom visual meters are HTML/SVG; heavy charts libraries are not integrated."
    ],
    recommendedFor: ["Technical case summaries", "Annual audit narrative pages"],
    avoidFor: ["Live video livestream tickers"],
    memoryHook: "Data becomes useful when the sequence explains the change."
  },
  {
    id: "broadcast-package-recipe",
    slug: "broadcast-package-composition",
    label: "Broadcast Package Recipe",
    shortLabel: "Broadcast Package",
    kind: "recipe",
    categoryId: "broadcast-composition",
    maturity: "reusable",
    summary: "16:9 widescreen livestream overlay composition.",
    description: "Draws timecode ticks counters, lower-third popups, and safe margin indicators.",
    route: "/recipes?recipe=broadcast-package",
    sourcePaths: ["components/recipes/broadcast-package-recipe.tsx"],
    tags: ["recipe", "broadcast", "ticker", "timecode"],
    capabilities: ["broadcast", "deterministic", "clean-view"],
    runtimes: ["react", "css"],
    supportedViewports: ["broadcast", "portrait-video"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "partial",
      ariaRoles: ["application", "status"],
      screenReaderAnnouncements: true,
      contrastRatio: "5.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [
      { type: "composes", targetId: "split-flap" },
      { type: "composes", targetId: "layout-stage" }
    ],
    usageExamples: [
      {
        title: "Broadcast Package Recipe workbench setup",
        code: `<RecipeWorkbench initialRecipeId="broadcast-package" />`
      }
    ],
    limitations: [
      "Intended for fixed widescreen displays. Will distort on vertical mobile feeds if safe boundaries are ignored."
    ],
    recommendedFor: ["Livestream video overlays", "Product release stage counters"],
    avoidFor: ["Dense operational config tables"],
    memoryHook: "Every live state needs a clear cue."
  },

  // ── SUB-ENTRIES / PRIMITIVES ───────────────────────────────
  {
    id: "layout-shell",
    slug: "layout-shell-primitive",
    label: "Layout Shell Primitive",
    shortLabel: "Layout Shell",
    kind: "layout",
    categoryId: "layout",
    maturity: "production-candidate",
    summary: "Flexible grid sidebar shell coordinator.",
    description: "Lays out main sidebar, panels grids, and headers.",
    route: "/layouts",
    sourcePaths: ["components/layouts/layout-shell.tsx"],
    tags: ["layout", "shell", "sidebar", "grid"],
    capabilities: ["responsive"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["banner", "main", "navigation"],
      screenReaderAnnouncements: false,
      contrastRatio: "4.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "operational-workspace-recipe" }],
    usageExamples: [
      {
        title: "LayoutShell wrapper",
        code: `<LayoutShell>\n  <LayoutSidebar>Left</LayoutSidebar>\n  <LayoutMain>Right</LayoutMain>\n</LayoutShell>`
      }
    ],
    limitations: ["Needs CSS flex parent container set to full viewport height."],
    recommendedFor: ["Admin command dashboards layouts", "Studio settings workspaces"],
    avoidFor: ["Minimal text pages"]
  },
  {
    id: "layout-stage",
    slug: "layout-stage-primitive",
    label: "Layout Stage Primitive",
    shortLabel: "Layout Stage",
    kind: "layout",
    categoryId: "layout",
    maturity: "production-candidate",
    summary: "Fixed widescreen aspect-ratio stage wrapper.",
    description: "Enforces 16:9 bounds for video frame capture environments.",
    route: "/layouts",
    sourcePaths: ["components/layouts/layout-stage.tsx"],
    tags: ["layout", "stage", "aspect", "widescreen"],
    capabilities: ["responsive", "clean-view"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "broadcast"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: ["region"],
      screenReaderAnnouncements: false,
      contrastRatio: "4.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "broadcast-package-recipe" }],
    usageExamples: [
      {
        title: "Widescreen video stage wrapper",
        code: `<LayoutStage aspectRatio="16:9">\n  <div>Stage Content</div>\n</LayoutStage>`
      }
    ],
    limitations: ["Horizontal boundaries clip elements if overflow coordinates are exceeded."],
    recommendedFor: ["Video frame captures", "Livestream overlays containers"],
    avoidFor: ["Responsive client documentation lists"]
  },
  {
    id: "layout-split",
    slug: "layout-split-primitive",
    label: "Layout Split Primitive",
    shortLabel: "Layout Split",
    kind: "layout",
    categoryId: "layout",
    maturity: "production-candidate",
    summary: "Responsive columns split screen organizer.",
    description: "Maintains side-by-side splits that stack nicely on mobile views.",
    route: "/layouts",
    sourcePaths: ["components/layouts/layout-split.tsx"],
    tags: ["layout", "split", "columns", "responsive"],
    capabilities: ["responsive"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: [],
      screenReaderAnnouncements: false,
      contrastRatio: "4.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "data-story-recipe" }],
    usageExamples: [
      {
        title: "Splitting screen components",
        code: `<LayoutSplit left={<div>Left text</div>} right={<div>Right graphic</div>} />`
      }
    ],
    limitations: ["Responsive stack defaults to mobile 1-column layout at 768px width."],
    recommendedFor: ["Landing page reveal splits", "Editorial narrative columns"],
    avoidFor: ["Dense dashboard metrics controls grids"]
  },
  {
    id: "signal-band",
    slug: "signal-band-primitive",
    label: "Signal Band Primitive",
    shortLabel: "Signal Band",
    kind: "system",
    categoryId: "decision",
    maturity: "production-candidate",
    summary: "Horizontal metrics alert telemetry indicator band.",
    description: "Draws warnings badges and critical thresholds indicators.",
    route: "/decisions",
    sourcePaths: ["components/decisions/signal-band.tsx"],
    tags: ["metrics", "signals", "alerts", "telemetry"],
    capabilities: ["deterministic", "evidence-driven", "decision-traceable"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop", "tablet"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["group", "list"],
      screenReaderAnnouncements: true,
      contrastRatio: "6:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "operational-workspace-recipe" }],
    usageExamples: [
      {
        title: "Signal band setup",
        code: `<SignalBand />`
      }
    ],
    limitations: ["Displays warning badges. Requires DecisionProvider wrapping."],
    recommendedFor: ["DevOps status telemetry bars", "Release diagnostics checklists"],
    avoidFor: ["Standard SaaS pie charts graphics"]
  },
  {
    id: "evidence-ledger",
    slug: "evidence-ledger-primitive",
    label: "Evidence Ledger Primitive",
    shortLabel: "Evidence Ledger",
    kind: "system",
    categoryId: "decision",
    maturity: "production-candidate",
    summary: "Checklist ledger tracking verification files.",
    description: "Features toggle buttons to include or exclude specific verification logs.",
    route: "/decisions",
    sourcePaths: ["components/decisions/evidence-ledger.tsx"],
    tags: ["ledger", "evidence", "checks", "checklist"],
    capabilities: ["deterministic", "evidence-driven", "decision-traceable"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop", "tablet"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["list", "group"],
      screenReaderAnnouncements: true,
      contrastRatio: "5.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "operational-workspace-recipe" }],
    usageExamples: [
      {
        title: "Evidence ledger checks checklist",
        code: `<EvidenceLedger />`
      }
    ],
    limitations: ["Action state depends on provider state variables."],
    recommendedFor: ["Continuous integration logs auditing", "Gate verification boards"],
    avoidFor: ["Minimal marketing layouts"]
  },
  {
    id: "decision-gate",
    slug: "decision-gate-primitive",
    label: "Decision Gate Primitive",
    shortLabel: "Decision Gate",
    kind: "system",
    categoryId: "decision",
    maturity: "production-candidate",
    summary: "Status outcome banner (PROCEED / HOLD / OVERRIDE).",
    description: "Flips background colors based on ledger checks rules evaluations.",
    route: "/decisions",
    sourcePaths: ["components/decisions/decision-gate.tsx"],
    tags: ["gate", "decision", "status", "outcome"],
    capabilities: ["deterministic", "decision-traceable"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: ["status"],
      screenReaderAnnouncements: true,
      contrastRatio: "6:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "operational-workspace-recipe" }],
    usageExamples: [
      {
        title: "Decision gate status block",
        code: `<DecisionGate />`
      }
    ],
    limitations: ["Changes status outcome instantly. Cannot run multi-step timelines."],
    recommendedFor: ["DevOps deployment gate boards", "Compliance checklists"],
    avoidFor: ["Pure numerical charts grids"]
  },
  {
    id: "decision-trace",
    slug: "decision-trace-primitive",
    label: "Decision Trace Primitive",
    shortLabel: "Decision Trace",
    kind: "system",
    categoryId: "decision",
    maturity: "production-candidate",
    summary: "Chronological evaluation console output log.",
    description: "Lists parsed gate rules criteria and parameters checks.",
    route: "/decisions",
    sourcePaths: ["components/decisions/decision-trace.tsx"],
    tags: ["trace", "logs", "console", "audit"],
    capabilities: ["deterministic", "decision-traceable"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "none",
      ariaRoles: ["log"],
      screenReaderAnnouncements: false,
      contrastRatio: "5.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "operational-workspace-recipe" }],
    usageExamples: [
      {
        title: "Decision trace log output",
        code: `<DecisionTrace />`
      }
    ],
    limitations: ["Console outputs are mock traces. Does not hook to real browser consoles."],
    recommendedFor: ["Compliance auditing logs", "DevOps debugging desks"],
    avoidFor: ["Minimal text articles"]
  },
  {
    id: "capture-workbench",
    slug: "capture-workbench-primitive",
    label: "Capture Workbench Primitive",
    shortLabel: "Capture Workbench",
    kind: "system",
    categoryId: "capture",
    maturity: "production-candidate",
    summary: "Workspace containing safe zones stage, toolbar, and plan.",
    description: "Integrates playhead controllers next to inspectors.",
    route: "/capture",
    sourcePaths: ["components/capture/capture-workbench.tsx"],
    tags: ["workbench", "capture", "tools", "dashboard"],
    capabilities: ["deterministic", "capture-ready", "clean-view", "exportable"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["application"],
      screenReaderAnnouncements: true,
      contrastRatio: "5.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "capture-bridge" }],
    usageExamples: [
      {
        title: "Mounting capture workbench component",
        code: `<CaptureWorkbench />`
      }
    ],
    limitations: ["Expects fullscreen container layout coordinates spacing."],
    recommendedFor: [" repetir visual testing desks", "Frame-perfect timeline capture consoles"],
    avoidFor: ["Mobile presentation landing screens"]
  },
  {
    id: "recipe-workbench",
    slug: "recipe-workbench-primitive",
    label: "Recipe Workbench Primitive",
    shortLabel: "Recipe Workbench",
    kind: "system",
    categoryId: "product-composition",
    maturity: "production-candidate",
    summary: "Studio page layout matching presets selector.",
    description: "Displays system map diagrams, inspectors, and export panels.",
    route: "/recipes",
    sourcePaths: ["components/recipes/recipe-workbench.tsx"],
    tags: ["workbench", "recipe", "composition", "studio"],
    capabilities: ["deterministic", "exportable", "clean-view"],
    runtimes: ["react"],
    supportedViewports: ["desktop", "laptop"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["application"],
      screenReaderAnnouncements: true,
      contrastRatio: "5.5:1"
    },
    dependencies: [{ name: "react", optional: false }],
    relations: [{ type: "composes", targetId: "product-launch-recipe" }],
    usageExamples: [
      {
        title: "Mounting recipes workbench",
        code: `<RecipeWorkbench initialRecipeId="product-launch" />`
      }
    ],
    limitations: ["Requires large display space to render sidebar map details."],
    recommendedFor: ["Composition studios", "Specimen portfolios index"],
    avoidFor: ["Standard article text pages"]
  },

  // ── WORKFLOW ───────────────────────────────────────────────
  {
    id: "episode-state-card",
    slug: "episode-state-card",
    label: "Episode State Card",
    shortLabel: "Episode State",
    kind: "workflow",
    categoryId: "workflow",
    maturity: "production-candidate",
    summary: "Read-only card displaying canonical episode workflow state across 6 discriminated variants.",
    description: "Renders the authoritative production state of a WealthDecoded episode via a 6-member discriminated union on variant. Each variant enforces distinct prop contracts at compile time using TypeScript never types. Respects system prefers-reduced-motion via framer-motion.",
    route: "/episode-state-card",
    sourcePaths: ["components/workflow/episode-state-card.tsx"],
    tags: ["workflow", "state", "episode", "production", "status"],
    capabilities: ["responsive", "keyboard-accessible", "reduced-motion", "editorial"],
    runtimes: ["react", "css"],
    supportedViewports: ["desktop", "laptop", "tablet", "mobile"],
    deterministic: true,
    captureReady: true,
    ssrSafe: true,
    accessibility: {
      keyboardNav: "full",
      ariaRoles: ["article", "status"],
      screenReaderAnnouncements: true,
      contrastRatio: "4.5:1"
    },
    dependencies: [
      { name: "react", optional: false },
      { name: "framer-motion", optional: false },
      { name: "clsx", optional: false }
    ],
    relations: [],
    usageExamples: [
      {
        title: "Default variant",
        code: `<EpisodeStateCard\n  variant="default"\n  channelName="Wealth Decoded"\n  title="Dividend Investing Explained"\n  workflowState="EDITORIAL"\n  humanReviewStatus="not-required"\n/>`
      },
      {
        title: "Unavailable variant",
        code: `<EpisodeStateCard variant="unavailable" unavailableReason="Manifest fetch failed" />`
      }
    ],
    limitations: [
      "Read-only — does not emit workflow transition events.",
      "workflowState is a free-form string; validation is the caller's responsibility.",
      "All canonical props (channelName, title, etc.) are forbidden in the unavailable variant."
    ],
    recommendedFor: ["Production pipeline dashboards", "Episode status pages", "Ops command views"],
    avoidFor: ["Editable workflow forms", "Inline editing surfaces"],
    memoryHook: "Six variants, one source of truth for episode state.",
    primaryExport: "EpisodeStateCard",
    componentExports: [
      "EpisodeStateCard",
      "EpisodeStateCardProps",
      "EpisodeStateCardVariant",
      "HumanReviewStatus",
      "EpisodeStateDecision",
      "EpisodeStateBlocker",
      "DefaultEpisodeStateCardProps",
      "BlockedEpisodeStateCardProps",
      "HumanReviewRequiredEpisodeStateCardProps",
      "ApprovedEpisodeStateCardProps",
      "PublishedEpisodeStateCardProps",
      "UnavailableEpisodeStateCardProps"
    ]
  }
]
