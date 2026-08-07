import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult
} from "./types"
import { executeMethod } from "./runtime"

export const SOMATIC_RESPONSE_DESIGN_ID = "method_somatic_response_design"

export const somaticResponseDesignDefinition: CreativeMethodDefinition = {
  id: SOMATIC_RESPONSE_DESIGN_ID,
  resourceId: "res_somatic_response_design",
  name: "Somatic Response Design",
  version: "2.0.0",
  supportedModes: ["DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["somatic-design", "bodily-response-art-direction"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: ["evaluatorType", "supplementaryFields.targetSensoryExperience"],
  outputSchemaId: "somatic-response-design-v2",
  qualityGateIds: [
    "srd.physical-vocabulary-present",
    "srd.art-direction-guidance-concrete",
    "srd.risk-areas-identified",
    "srd.no-coercive-patterns"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

// Somatic profile mapping representing physical-response-to-art-direction pathways.
interface SomaticProfile {
  observableReaction: string
  observableViewerBehavior: string
  eyePath: string
  viewingSpeed: string
  focalDuration: string
  postureApproachBehavior: string
  microReaction: string
  tensionLevel: "low" | "medium" | "high" | "dynamic"
  compositionConsequence: string
  densityConsequence: string
  whitespaceConsequence: string
  scaleConsequence: string
  typographyConsequence: string
  colorTemperatureConsequence: string
  motionTempoConsequence: string
  soundConsequence: string
  accessibilitySafeguard: string
  fiveSecondValidationTest: string
  failureSignals: string[]
}

const SOMATIC_PROFILES: Record<string, SomaticProfile> = {
  luxurious: {
    observableReaction: "gradual deepening of breath, micro-pause at boundaries, shoulder lowering",
    observableViewerBehavior: "lingering gaze, slower swipe speed, tactile-like hovering over elements",
    eyePath: "undulating, serpentine path following subtle visual anchors; avoids hard grid lines",
    viewingSpeed: "deliberate, slow (unhurried navigation)",
    focalDuration: "extended (1.2s to 2.5s per hero cluster)",
    postureApproachBehavior: "slight backward lean (relaxation/absorption)",
    microReaction: "softening of facial muscles, micro-smile of satisfaction",
    tensionLevel: "low",
    compositionConsequence: "asymmetric balance, floating hero alignments, organic alignment deviations",
    densityConsequence: "very low density; focus on singular hero element per viewpoint",
    whitespaceConsequence: "expansive, luxurious breathing margins (45%+ of total screen area)",
    scaleConsequence: "extreme contrast; very large scale headlines paired with tiny metadata tags",
    typographyConsequence: "high-contrast editorial serifs (e.g. Outfit, Display font) with wide letter-spacing",
    colorTemperatureConsequence: "warm, muted neutrals; ivory, champagne, charcoal, gold-tinged borders",
    motionTempoConsequence: "slow, continuous ease-in-out transforms; 1.2s-2.0s duration transitions",
    soundConsequence: "low-frequency atmospheric pads, delicate organic instrumentation",
    accessibilitySafeguard: "preserve 4.5:1 contrast on active interactive boundaries despite low density",
    fiveSecondValidationTest: "Show for 5 seconds: does the viewer describe the interface as 'premium' or 'refined' rather than 'busy'?",
    failureSignals: ["viewer swipes rapidly within 2 seconds", "eye path jumps sporadically", "subject describes it as 'sterile'"]
  },
  bold: {
    observableReaction: "micro-startle response, sharp inhale, pupil dilation",
    observableViewerBehavior: "direct visual confrontation, rapid scan of center weight, aggressive scrolling",
    eyePath: "highly linear, central targeting; moves directly from primary weight to secondary details",
    viewingSpeed: "high speed (rapid consumption)",
    focalDuration: "short, intense (0.4s to 0.8s per hero cluster)",
    postureApproachBehavior: "forward lean (engagement/confrontation)",
    microReaction: "jaw tightening, brief eyebrow raise",
    tensionLevel: "high",
    compositionConsequence: "brutal block layout, heavy margins, hard borders",
    densityConsequence: "medium-high; high-contrast elements stacked directly",
    whitespaceConsequence: "functional, compressed margins; negative space serves as sharp borders",
    scaleConsequence: "maximal scale; oversized display titles (96px+) occupying major screen blocks",
    typographyConsequence: "ultra-bold geometric sans-serifs, compressed widths",
    colorTemperatureConsequence: "high-contrast saturation; pure blacks, acid yellow, vermilion, cool grey base",
    motionTempoConsequence: "instantaneous transitions (0ms-150ms), hard-cut reveals, spring-loaded step animations",
    soundConsequence: "percussive, sharp transients, fast-decay envelopes",
    accessibilitySafeguard: "prevent flashing indicators above 3Hz; enforce legible subtitle tracks",
    fiveSecondValidationTest: "Show for 5 seconds: does the viewer remember the central core claim exactly? (Boldness must focus attention, not scatter it.)",
    failureSignals: ["viewer squints or looks away", "viewer fails to recall the primary action", "subject describes it as 'noisy'"]
  },
  "eye-catching": {
    observableReaction: "saccadic capture, rapid eye fixation shift, momentary breathing suspension",
    observableViewerBehavior: "immediate stop on visual anomaly, pointer tracking toward the anomaly",
    eyePath: "radial outward; initial capture point followed by rapid surrounding context scan",
    viewingSpeed: "dynamic (stop-and-scan patterns)",
    focalDuration: "medium (0.8s to 1.5s on the anomaly)",
    postureApproachBehavior: "head tilt, momentary freeze in movement",
    microReaction: "widening of eyes, head alignment adjust",
    tensionLevel: "medium",
    compositionConsequence: "off-grid focal point, overlapping elements, visual anomaly breaking the pattern",
    densityConsequence: "medium; isolated visual interest center in a clean grid",
    whitespaceConsequence: "high surrounding whitespace to isolate the visual capture element",
    scaleConsequence: "moderate baseline scale, high relative scale for the capture trigger",
    typographyConsequence: "stylized custom glyphs, neon-styled headers",
    colorTemperatureConsequence: "vibrant accent pops (electric blue, lime green) against dark slate or deep grey backdrop",
    motionTempoConsequence: "playful micro-animations, ripple effects, scroll-linked rotation",
    soundConsequence: "rising tone sweeps, subtle high-frequency bells",
    accessibilitySafeguard: "ensure all motion can be disabled via standard reduced-motion preferences",
    fiveSecondValidationTest: "Show for 5 seconds: does the visual anomaly capture the first 2 seconds of gaze?",
    failureSignals: ["viewer misses the capture element entirely", "viewer describes it as 'gimmicky'", "loss of reading flow"]
  },
  "cute and witty": {
    observableReaction: "zygomatic major muscle activation (smiling), relaxed shoulder drop",
    observableViewerBehavior: "playful exploration, clicking on interactive Easter eggs, lingering scroll",
    eyePath: "playful zig-zag; bounces between illustration markers and friendly textual guides",
    viewingSpeed: "moderate (relaxed browsing)",
    focalDuration: "extended (1.0s to 2.2s on details)",
    postureApproachBehavior: "slight forward lean with relaxed shoulders (playful interest)",
    microReaction: "soft vocalization (chuckle/sigh), head tilt",
    tensionLevel: "low",
    compositionConsequence: "rounded components, offset alignments, soft overlapping layers",
    densityConsequence: "moderate; curated moments of detail (illustrations/micro-interactions)",
    whitespaceConsequence: "generous, friendly spacing; soft margins",
    scaleConsequence: "friendly proportions; oversized icons, rounded button labels",
    typographyConsequence: "rounded sans-serif (e.g. Outfit) or soft friendly display fonts",
    colorTemperatureConsequence: "warm, pastel-infused palette; peach, soft mint, butter yellow, warm grey background",
    motionTempoConsequence: "bouncy spring dynamics, squash-and-stretch transitions (300ms-500ms)",
    soundConsequence: "soft acoustic cues, round marimba transients",
    accessibilitySafeguard: "ensure touch targets are at least 48px to support relaxed interaction",
    fiveSecondValidationTest: "Show for 5 seconds: does the viewer smile or experience a positive emotional lift?",
    failureSignals: ["viewer navigates dryly without interaction", "viewer describes it as 'childish' instead of 'clever'"]
  },
  "calm / reflective": {
    observableReaction: "respiratory deceleration, muscle relaxation, neutral brow",
    observableViewerBehavior: "passive reading, gentle scrolling, minimal mouse movement",
    eyePath: "smooth horizontal sweeps, scanning top-to-bottom sequentially",
    viewingSpeed: "slow (meditative reading)",
    focalDuration: "long (1.5s to 3.0s per text block)",
    postureApproachBehavior: "relaxed lean back (reflective posture)",
    microReaction: "deep exhalation, quiet focus",
    tensionLevel: "low",
    compositionConsequence: "balanced symmetry, horizontal bands, aligned blocks",
    densityConsequence: "low density; limited options per view, clear priority",
    whitespaceConsequence: "very high; open space acting as silence",
    scaleConsequence: "consistent, gentle scale steps (no loud visual hierarchy jumps)",
    typographyConsequence: "highly legible classic serif (e.g. Georgia, Lora) or clean neutral sans-serif",
    colorTemperatureConsequence: "cool, low-saturation earth tones; slate, moss, sage, warm cream backing",
    motionTempoConsequence: "slow fade-in/out transitions, 800ms ease duration (no sudden translates)",
    soundConsequence: "continuous ambient textures, silence-dominated soundscapes",
    accessibilitySafeguard: "ensure high contrast for body copy; absolute avoidance of moving elements behind text",
    fiveSecondValidationTest: "Show for 5 seconds: does the viewer feel an absence of pressure to act immediately?",
    failureSignals: ["viewer feels bored or drops off", "viewer describes it as 'clinical' or 'sad'"]
  }
}

// ─── Semantic Dynamic Generation ──────────────────────────────────────────

function synthesizeSomaticProfile(descriptor: string, subject: string, context: string): SomaticProfile {
  // If we have a direct match in our baseline profiles, start with that.
  const baseProfile = SOMATIC_PROFILES[descriptor.toLowerCase()]
  
  if (baseProfile) {
    // Contextualize the baseline profile to ensure luxury perfume vs luxury financial dashboard differ.
    const isPerfume = subject.toLowerCase().includes("perfume") || context.toLowerCase().includes("perfume")
    const isFinancial = subject.toLowerCase().includes("financ") || context.toLowerCase().includes("dashboard") || context.toLowerCase().includes("saas")

    if (descriptor === "luxurious" && isFinancial) {
      return {
        ...baseProfile,
        compositionConsequence: "understated classic grid with golden ratio division, refined borders",
        densityConsequence: "low-medium; key performance indicators isolated in high-breathing space",
        whitespaceConsequence: "generous padding around key figures (35% screen area) to signal importance",
        typographyConsequence: "elegant modern geometric sans-serif (e.g. Outfit) to preserve analytical precision",
        colorTemperatureConsequence: "deep obsidian backdrops, platinum accents, charcoal, precise emerald-green indicators",
        fiveSecondValidationTest: "Show for 5 seconds: does the user feel the dashboard represents institutional quality and high-trust custody?",
      }
    } else if (descriptor === "luxurious" && isPerfume) {
      return {
        ...baseProfile,
        compositionConsequence: "highly asymmetric, fluid visual flow with overlapping scent-story imagery",
        densityConsequence: "ultra-low density; single scent bottle and raw ingredient shot per screen height",
        whitespaceConsequence: "vast breathing margins (55%+ screen area) acting as physical vacuum of elegance",
        typographyConsequence: "high-contrast classic editorial serif with extreme vertical character ratio",
        colorTemperatureConsequence: "soft alabaster, warm linen, gold accents, glass-like reflection details",
        fiveSecondValidationTest: "Show for 5 seconds: does the user feel the design evokes an olfactory and tactile sensory premium?",
      }
    }
    return baseProfile
  }

  // Dynamic profile generator for unknown/combined adjectives
  const combined = `${descriptor} ${subject} ${context}`.toLowerCase()
  
  let tensionLevel: "low" | "medium" | "high" | "dynamic" = "low"
  if (combined.includes("defiant") || combined.includes("unsettling") || combined.includes("bold") || combined.includes("tension")) {
    tensionLevel = "high"
  } else if (combined.includes("precise") || combined.includes("intimate") || combined.includes("curious")) {
    tensionLevel = "medium"
  }

  // Derive reactions based on tension
  let observableReaction = "respiratory stabilization, steady fixation"
  let postureApproachBehavior = "neutral posture"
  let colorTemperatureConsequence = "neutral warm cream and slate"
  let typographyConsequence = "clean, high-legibility sans-serif"

  if (tensionLevel === "high") {
    observableReaction = "temporary breath hold, focused narrowing of gaze, facial muscle engagement"
    postureApproachBehavior = "forward lean, focused attention"
    colorTemperatureConsequence = "striking contrast (deep slate vs stark warning-red or yellow accents)"
    typographyConsequence = "strong, high-weight sans-serif (Outfit Bold) with minimal letter spacing"
  } else if (tensionLevel === "medium") {
    observableReaction = "micro-nod, slight lean forward, pupil dilation of curiosity"
    postureApproachBehavior = "slight tilt, investigative stance"
    colorTemperatureConsequence = "sophisticated duotone, soft amber accents, deep charcoal"
    typographyConsequence = "warm editorial serif paired with highly legible monospace numerals"
  } else {
    observableReaction = "slowed respiration rate, neck muscle relaxation"
    postureApproachBehavior = "relaxed posture, comfortable viewing height"
    colorTemperatureConsequence = "cool, low-saturation earth tones (sage, warm sand, slate)"
    typographyConsequence = "humanist sans-serif or classic, low-contrast serif"
  }

  return {
    observableReaction,
    observableViewerBehavior: `focused gaze on structural anomalies, steady reading pace without rapid scrolling`,
    eyePath: `scanning primary structural elements sequentially; resting on dynamic anomalies`,
    viewingSpeed: tensionLevel === "high" ? "rapid, focused" : "deliberate, steady",
    focalDuration: tensionLevel === "high" ? "0.6s to 1.1s" : "1.2s to 2.4s",
    postureApproachBehavior,
    microReaction: tensionLevel === "high" ? "tightened jaw, narrowed eyelids" : "softened expression, micro-nod",
    tensionLevel,
    compositionConsequence: `aligned layout with intentional offsets in "${subject}" to prevent default scanning patterns`,
    densityConsequence: `low-medium density, prioritizing structured content columns`,
    whitespaceConsequence: `generous breathing margins (30-40% of screen) to preserve focus on the core objective`,
    scaleConsequence: `moderate scale steps aligned with "${context}" delivery guidelines`,
    typographyConsequence,
    colorTemperatureConsequence,
    motionTempoConsequence: tensionLevel === "high" ? "abrupt spring-loaded reveals (150ms)" : "smooth ease-out transitions (600ms)",
    soundConsequence: "subtle, low-frequency atmospheric hums",
    accessibilitySafeguard: "ensure all text maintains 4.5:1 contrast and supports high zoom levels without breaking layout",
    fiveSecondValidationTest: `Show for 5 seconds: does the evaluator describe the experience as embodying "${descriptor}" without prompt guidance?`,
    failureSignals: ["gaze wanders aimlessly", `user fails to associate experience with "${descriptor}"`, "layout breaks legibility guidelines"]
  }
}

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  
  // Use targetSensoryExperience as the primary adjective descriptor
  const descriptor = input.supplementaryFields?.targetSensoryExperience ?? "calm / reflective"
  
  // Generate the somatic profile (contextual and category aware)
  const profile = synthesizeSomaticProfile(descriptor, subject, context)

  const somaticBrief = [
    `SOMATIC RESPONSE DESIGN BRIEF — "${subject}"`,
    `Descriptor: ${descriptor}`,
    `Observable body reaction: ${profile.observableReaction}`,
    `Posture & Approach: ${profile.postureApproachBehavior}`,
    `Tension Level: ${profile.tensionLevel}`,
    `Whitespace consequence: ${profile.whitespaceConsequence}`,
    `Visual implications: Typography [${profile.typographyConsequence}]; Color [${profile.colorTemperatureConsequence}]`,
    `Motion Tempo: ${profile.motionTempoConsequence}`,
    `Safeguard: ${profile.accessibilitySafeguard}`,
    `Validation: ${profile.fiveSecondValidationTest}`
  ].join("\n")

  // Generate deterministic fingerprints
  const inputFingerprint = `SRD:descriptor=${descriptor.slice(0, 30)}:subject=${subject.slice(0, 30)}:context=${context.slice(0, 30)}`
  const outputFingerprint = `SRD:tension=${profile.tensionLevel}:whitespace=${profile.whitespaceConsequence.slice(0, 20)}:color=${profile.colorTemperatureConsequence.slice(0, 20)}`

  const rawOutputs: Record<string, string> = {
    descriptor,
    observableReaction: profile.observableReaction,
    observableViewerBehavior: profile.observableViewerBehavior,
    eyePath: profile.eyePath,
    viewingSpeed: profile.viewingSpeed,
    focalDuration: profile.focalDuration,
    postureApproachBehavior: profile.postureApproachBehavior,
    microReaction: profile.microReaction,
    tension: profile.tensionLevel,
    compositionConsequence: profile.compositionConsequence,
    densityConsequence: profile.densityConsequence,
    whitespaceConsequence: profile.whitespaceConsequence,
    scaleConsequence: profile.scaleConsequence,
    typographyConsequence: profile.typographyConsequence,
    colorTemperatureConsequence: profile.colorTemperatureConsequence,
    motionTempoConsequence: profile.motionTempoConsequence,
    soundConsequence: profile.soundConsequence,
    accessibilitySafeguard: profile.accessibilitySafeguard,
    fiveSecondValidationTest: profile.fiveSecondValidationTest,
    failureSignals: profile.failureSignals.join("\n"),
    somaticBrief,
    inputFingerprint,
    outputFingerprint
  }

  const outputSections = [
    {
      sectionKey: "somatic-reactions",
      label: "Observable Somatic Reactions",
      content: `Descriptor: ${descriptor}\n` +
               `Body Reaction: ${profile.observableReaction}\n` +
               `Viewer Behavior: ${profile.observableViewerBehavior}\n` +
               `Eye Path: ${profile.eyePath}\n` +
               `Viewing Speed: ${profile.viewingSpeed}\n` +
               `Focal Duration: ${profile.focalDuration}\n` +
               `Posture/Approach: ${profile.postureApproachBehavior}\n` +
               `Micro-reaction: ${profile.microReaction}\n` +
               `Tension: ${profile.tensionLevel}`
    },
    {
      sectionKey: "layout-consequences",
      label: "Layout & Composition Consequences",
      content: `Composition: ${profile.compositionConsequence}\n` +
               `Density: ${profile.densityConsequence}\n` +
               `Whitespace: ${profile.whitespaceConsequence}\n` +
               `Scale: ${profile.scaleConsequence}`
    },
    {
      sectionKey: "sensory-consequences",
      label: "Sensory & Typographic Consequences",
      content: `Typography: ${profile.typographyConsequence}\n` +
               `Color Temperature: ${profile.colorTemperatureConsequence}\n` +
               `Motion Tempo: ${profile.motionTempoConsequence}\n` +
               `Sound: ${profile.soundConsequence}`
    },
    {
      sectionKey: "safeguards-validation",
      label: "Safeguards & Validation",
      content: `Accessibility Safeguard: ${profile.accessibilitySafeguard}\n` +
               `5-Second Validation: ${profile.fiveSecondValidationTest}\n` +
               `Failure Signals:\n${profile.failureSignals.join("\n")}`
    },
    {
      sectionKey: "somatic-brief",
      label: "Somatic Design Brief Summary",
      content: somaticBrief
    }
  ]

  return {
    methodId: SOMATIC_RESPONSE_DESIGN_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Identify Target Sensory Descriptor", instruction: `Load target sensory descriptor: "${descriptor}".`, outputKey: "descriptor" },
      { stepIndex: 2, label: "Map Physiological Reactions", instruction: `Derive observable viewer body reactions, eye path, viewing speed, and focal duration.`, outputKey: "somatic-reactions" },
      { stepIndex: 3, label: "Translate to Compositional Consequences", instruction: "Calculate layout consequences (composition, density, whitespace, scale).", outputKey: "layout-consequences" },
      { stepIndex: 4, label: "Derive Sensory & Typographic Assets", instruction: "Define typography, color temperature, and motion tempo consequences.", outputKey: "sensory-consequences" },
      { stepIndex: 5, label: "Formulate Safeguards & Validation", instruction: "Establish accessibility safeguards, validation tests, and failure signals.", outputKey: "safeguards-validation" }
    ],
    outputSections,
    rawOutputs
  }
}

export const somaticResponseDesignGates: CreativeMethodQualityGate[] = [
  {
    gateId: "srd.physical-vocabulary-present",
    label: "Physical Vocabulary Present",
    description: "Output must include concrete physical/bodily response vocabulary.",
    passCriteria: ["observableReaction must contain detailed anatomical or biological markers"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const reaction = result.rawOutputs.observableReaction ?? ""
      const words = ["breath", "pupil", "eyebrow", "muscle", "shoulder", "jaw", "gaze", "body", "saccadic", "respiratory"]
      const passed = words.some(w => reaction.toLowerCase().includes(w))
      return {
        gateId: "srd.physical-vocabulary-present",
        label: "Physical Vocabulary Present",
        passed,
        failReasons: passed ? [] : ["observableReaction lacks detailed anatomical or biological markers."]
      }
    }
  },
  {
    gateId: "srd.art-direction-guidance-concrete",
    label: "Art Direction Guidance Is Concrete",
    description: "Art direction must contain actionable instructions, not abstract descriptions.",
    passCriteria: ["layout and sensory consequences must contain actionable cues"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const comp = result.rawOutputs.compositionConsequence ?? ""
      const color = result.rawOutputs.colorTemperatureConsequence ?? ""
      const typography = result.rawOutputs.typographyConsequence ?? ""
      const passed = comp.length > 10 && color.length > 10 && typography.length > 10
      return {
        gateId: "srd.art-direction-guidance-concrete",
        label: "Art Direction Guidance Is Concrete",
        passed,
        failReasons: passed ? [] : ["Layout, color, or typographic consequences are too brief or abstract."]
      }
    }
  },
  {
    gateId: "srd.risk-areas-identified",
    label: "Risk Areas Identified",
    description: "At least one risk area (failure signals) must be identified.",
    passCriteria: ["failureSignals output must be non-empty"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const content = result.rawOutputs.failureSignals ?? ""
      const passed = content.trim().split("\n").filter(Boolean).length >= 2
      return {
        gateId: "srd.risk-areas-identified",
        label: "Risk Areas Identified",
        passed,
        failReasons: passed ? [] : ["Fewer than 2 failure signals identified for somatic design."]
      }
    }
  },
  {
    gateId: "srd.no-coercive-patterns",
    label: "No Coercive Dark-Pattern Behavior",
    description: "Ensure that safeguards explicitly protect readability, contrast, and user controls.",
    passCriteria: ["accessibilitySafeguard must address contrast, motion control, or legibility"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const safeguard = result.rawOutputs.accessibilitySafeguard ?? ""
      const passed = safeguard.toLowerCase().includes("contrast") || safeguard.toLowerCase().includes("motion") || safeguard.toLowerCase().includes("zoom")
      return {
        gateId: "srd.no-coercive-patterns",
        label: "No Coercive Dark-Pattern Behavior",
        passed,
        failReasons: passed ? [] : ["Accessibility safeguard does not address contrast, motion control, or legibility."]
      }
    }
  }
]

/**
 * Public entry point for executing the Somatic Response Design method.
 */
export function runSomaticResponseDesign(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(somaticResponseDesignDefinition, somaticResponseDesignGates, input, produce)
}
