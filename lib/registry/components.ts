import type { ComponentCategory, ComponentMaturity, RegistryComponent } from "./types"

export const registryComponents = [
  {
    id: "componentry-spotlight-card",
    name: "Spotlight Card",
    slug: "spotlight-card",
    route: "/",
    description: "Pointer-reactive card surface for B2B, cinematic and editorial interaction studies.",
    category: "Cursor & Pointer",
    interactionModel: "Pointer position, hover, focus and optional 3D tilt drive local light and glare layers.",
    maturity: "Lab Ready",
    dependencies: ["react", "next", "lucide-react", "tailwindcss", "clsx", "tailwind-merge"],
    mobileSupport: "Supported",
    keyboardSupport: "Supported",
    tactileSupport: "Supported",
    reducedMotion: "Supported",
    deterministicCapture: true,
    remotionReady: true,
    playwrightSelectors: {
      root: '[data-spotlight-variant="preserved-original"]',
      variants: [
        '[data-spotlight-variant="b2b"]',
        '[data-spotlight-variant="cinematic"]',
        '[data-spotlight-variant="editorial"]',
      ],
      controls: ['button[aria-pressed]'],
    },
    heroDemoMoment: "Cinematic premium card with beam spotlight and audio-spectrum content.",
    recommendedViewport: { width: 1440, height: 1100, label: "Desktop editorial capture" },
    recommendedCaptureDuration: "5-8 seconds",
    initialState: "Cards idle with subtle border treatment and stable content.",
    finalState: "Pointer or focus activates spotlight, beam or tilt while preserving readable content.",
    limitations: [
      "Visual verification should still be done with Playwright screenshots on mobile and desktop.",
      "Pointer location must be scripted for perfectly repeatable Remotion captures.",
    ],
  },
  {
    id: "componentry-split-flap-display",
    name: "Split Flap Display",
    slug: "split-flap-display",
    route: "/split-flap",
    description: "Mechanical character board for status, financial data and cinematic launch countdowns.",
    category: "Data & Numbers",
    interactionModel: "Button-triggered state changes update deterministic character rows with staggered flap animation.",
    maturity: "Lab Ready",
    dependencies: ["react", "next", "lucide-react", "tailwindcss", "clsx", "tailwind-merge"],
    mobileSupport: "Supported",
    keyboardSupport: "Supported",
    tactileSupport: "Supported",
    reducedMotion: "Supported",
    deterministicCapture: true,
    remotionReady: true,
    playwrightSelectors: {
      root: '[data-split-flap-variant="cinematic"]',
      variants: [
        '[data-split-flap-variant="cinematic-countdown"]',
        '[data-split-flap-variant="product-status-board"]',
        '[data-split-flap-variant="financial-data-board"]',
      ],
      controls: ["button"],
    },
    heroDemoMoment: "Countdown sequence from 05 to LIVE for product reveal and launch footage.",
    recommendedViewport: { width: 1440, height: 1000, label: "Desktop launch capture" },
    recommendedCaptureDuration: "6-10 seconds",
    initialState: "Countdown begins at 05, status boards show deterministic first values.",
    finalState: "Countdown reaches LIVE and data boards settle on selected preset states.",
    limitations: [
      "Long labels require fixed column planning per usage.",
      "Frame-perfect flap timing should be scripted with deterministic button events.",
    ],
  },
  {
    id: "componentry-scrub-input",
    name: "Scrub Input",
    slug: "scrub-input",
    route: "/scrub-input",
    description: "Horizontal direct-manipulation numeric control for financial, product and cinematic parameters.",
    category: "Direct Manipulation",
    interactionModel: "Relative horizontal drag, arrow keys and presets update numeric state immediately.",
    maturity: "Lab Ready",
    dependencies: ["react", "next", "lucide-react", "tailwindcss", "clsx", "tailwind-merge"],
    mobileSupport: "Supported",
    keyboardSupport: "Native",
    tactileSupport: "Supported",
    reducedMotion: "Supported",
    deterministicCapture: true,
    remotionReady: true,
    playwrightSelectors: {
      root: '[data-scrub-input-variant="cinematic"]',
      variants: [
        '[data-scrub-input-variant="financial"]',
        '[data-scrub-input-variant="product"]',
        '[data-scrub-input-variant="cinematic"]',
      ],
      controls: ['[role="slider"]', "button"],
    },
    heroDemoMoment: "Cinematic depth control changes a launch scene while the input is scrubbed horizontally.",
    recommendedViewport: { width: 1440, height: 1100, label: "Desktop interaction capture" },
    recommendedCaptureDuration: "5-7 seconds",
    initialState: "Depth at 58%, revenue at CA$42,000 and product capacity at 64 TB.",
    finalState: "Preset or keyboard input lands on deterministic values for each variant.",
    limitations: [
      "Mobile drag should be verified on real touch hardware for gesture feel.",
      "Very small step sizes may need a tuned scrubSensitivity per product domain.",
    ],
  },
  {
    id: "componentry-kinetic-text-reveal",
    name: "Kinetic Text Reveal",
    slug: "kinetic-text-reveal",
    route: "/kinetic-text",
    description: "Sequenced typographic reveal system for editorial headlines, product statements and cinematic manifestos.",
    category: "Typography",
    interactionModel: "Imperative Replay and Reset controls reveal deterministic text segments with configurable speed presets.",
    maturity: "Lab Ready",
    dependencies: ["react", "next", "framer-motion", "lucide-react", "tailwindcss", "clsx", "tailwind-merge"],
    mobileSupport: "Supported",
    keyboardSupport: "Supported",
    tactileSupport: "Supported",
    reducedMotion: "Supported",
    deterministicCapture: true,
    remotionReady: true,
    playwrightSelectors: {
      root: '[data-kinetic-text-variant="cinematic"]',
      variants: [
        '[data-kinetic-text-variant="editorial"]',
        '[data-kinetic-text-variant="product"]',
        '[data-kinetic-text-variant="cinematic"]',
      ],
      controls: ["button"],
    },
    heroDemoMoment: "Three-step manifesto sequence ending on a strong consequence-focused final frame.",
    recommendedViewport: { width: 1440, height: 1100, label: "Desktop typographic capture" },
    recommendedCaptureDuration: "6-8 seconds",
    initialState: "Cinematic sequence starts in a quiet hidden state with step one selected.",
    finalState: "Final manifesto frame reads: The best systems reveal consequence.",
    limitations: [
      "Very long headlines require viewport checks at 390px width to avoid awkward wrapping.",
      "Frame-perfect captures should trigger Replay and sequence steps through Playwright rather than relying on manual timing.",
    ],
  },
  {
    id: "componentry-scroll-choreography",
    name: "Scroll Choreography",
    slug: "scroll-choreography",
    route: "/scroll-choreography",
    description: "Sticky scroll-driven storytelling system for product stories, evidence walkthroughs and cinematic reveal sequences.",
    category: "Scroll & Storytelling",
    interactionModel: "Vertical scroll progress drives staged panel movement while IntersectionObserver tracks active chapters.",
    maturity: "Lab Ready",
    dependencies: ["react", "next", "framer-motion", "lucide-react", "tailwindcss", "clsx", "tailwind-merge"],
    mobileSupport: "Supported",
    keyboardSupport: "Supported",
    tactileSupport: "Supported",
    reducedMotion: "Supported",
    deterministicCapture: true,
    remotionReady: true,
    playwrightSelectors: {
      root: '[data-scroll-choreography-variant="cinematic"]',
      variants: [
        '[data-scroll-choreography-variant="product"]',
        '[data-scroll-choreography-variant="evidence"]',
        '[data-scroll-choreography-variant="cinematic"]',
      ],
      controls: ["button", "nav button"],
    },
    heroDemoMoment: "Sticky cinematic sequence where four visual fragments align and resolve into a final hero frame.",
    recommendedViewport: { width: 1440, height: 1100, label: "Desktop scroll capture" },
    recommendedCaptureDuration: "8-12 seconds",
    initialState: "Four visual panels begin separated around the sticky stage with chapter progress at the cinematic section.",
    finalState: "Hero panel expands and remains visible at the end of the scroll section.",
    limitations: [
      "Scroll capture should use deterministic wheel or scrollTo increments rather than manual trackpad input.",
      "Real touch hardware should be used to evaluate the feel of long sticky sections on mobile.",
    ],
  },
] as const satisfies readonly RegistryComponent[]

export function getComponentBySlug(slug: string): RegistryComponent | undefined {
  return registryComponents.find((component) => component.slug === slug)
}

export function getComponentsByCategory(category: ComponentCategory): RegistryComponent[] {
  return registryComponents.filter((component) => component.category === category)
}

export function getComponentsByMaturity(maturity: ComponentMaturity): RegistryComponent[] {
  return registryComponents.filter((component) => component.maturity === maturity)
}

export function getCaptureReadyComponents(): RegistryComponent[] {
  return registryComponents.filter(
    (component) => component.deterministicCapture && component.remotionReady
  )
}
