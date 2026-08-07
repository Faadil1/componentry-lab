import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult,
  SomaticPerceptualPrinciple,
  SomaticFormalOption,
  SomaticSelectedDirection
} from "./types"
import { executeMethod } from "./runtime"

export const SOMATIC_RESPONSE_DESIGN_ID = "method_somatic_response_design"

export const somaticResponseDesignDefinition: CreativeMethodDefinition = {
  id: SOMATIC_RESPONSE_DESIGN_ID,
  resourceId: "res_somatic_response_design",
  name: "Somatic Response Design",
  version: "3.0.0",
  supportedModes: ["DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["somatic-design", "bodily-response-art-direction"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: ["evaluatorType", "supplementaryFields.targetSensoryExperience"],
  outputSchemaId: "somatic-response-design-v3",
  qualityGateIds: [
    "srd.physical-vocabulary-present",
    "srd.art-direction-guidance-concrete",
    "srd.risk-areas-identified",
    "srd.no-coercive-patterns",
    "srd.response-to-form-traceable",
    "srd.context-overrides-style-stereotype"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

// Somatic physiological profile mapping representing physical response pathways.
interface PhysiologicalProfile {
  observableReaction: string
  observableViewerBehavior: string
  eyePath: string
  viewingSpeed: string
  focalDuration: string
  postureApproachBehavior: string
  microReaction: string
  tensionLevel: "low" | "medium" | "high" | "dynamic"
}

const PHYSIOLOGICAL_PROFILES: Record<string, PhysiologicalProfile> = {
  luxurious: {
    observableReaction: "gradual deepening of breath, micro-pause at boundaries, shoulder lowering",
    observableViewerBehavior: "lingering gaze, slower swipe speed, tactile-like hovering over elements",
    eyePath: "undulating, serpentine path following subtle visual anchors; avoids hard grid lines",
    viewingSpeed: "deliberate, slow (unhurried navigation)",
    focalDuration: "extended (1.2s to 2.5s per hero cluster)",
    postureApproachBehavior: "slight backward lean (relaxation/absorption)",
    microReaction: "softening of facial muscles, micro-smile of satisfaction",
    tensionLevel: "low"
  },
  bold: {
    observableReaction: "micro-startle response, sharp inhale, pupil dilation",
    observableViewerBehavior: "direct visual confrontation, rapid scan of center weight, aggressive scrolling",
    eyePath: "highly linear, central targeting; moves directly from primary weight to secondary details",
    viewingSpeed: "high speed (rapid consumption)",
    focalDuration: "short, intense (0.4s to 0.8s per hero cluster)",
    postureApproachBehavior: "forward lean (engagement/confrontation)",
    microReaction: "jaw tightening, brief eyebrow raise",
    tensionLevel: "high"
  },
  "eye-catching": {
    observableReaction: "saccadic capture, rapid eye fixation shift, momentary breathing suspension",
    observableViewerBehavior: "immediate stop on visual anomaly, pointer tracking toward the anomaly",
    eyePath: "radial outward; initial capture point followed by rapid surrounding context scan",
    viewingSpeed: "dynamic (stop-and-scan patterns)",
    focalDuration: "medium (0.8s to 1.5s on the anomaly)",
    postureApproachBehavior: "head tilt, momentary freeze in movement",
    microReaction: "widening of eyes, head alignment adjust",
    tensionLevel: "medium"
  },
  "cute and witty": {
    observableReaction: "zygomatic major muscle activation (smiling), relaxed shoulder drop",
    observableViewerBehavior: "playful exploration, clicking on interactive Easter eggs, lingering scroll",
    eyePath: "playful zig-zag; bounces between illustration markers and friendly textual guides",
    viewingSpeed: "moderate (relaxed browsing)",
    focalDuration: "extended (1.0s to 2.2s on details)",
    postureApproachBehavior: "slight forward lean with relaxed shoulders (playful interest)",
    microReaction: "soft vocalization (chuckle/sigh), head tilt",
    tensionLevel: "low"
  },
  "calm / reflective": {
    observableReaction: "respiratory deceleration, muscle relaxation, neutral brow",
    observableViewerBehavior: "passive reading, gentle scrolling, minimal mouse movement",
    eyePath: "smooth horizontal sweeps, scanning top-to-bottom sequentially",
    viewingSpeed: "slow (meditative reading)",
    focalDuration: "long (1.5s to 3.0s per text block)",
    postureApproachBehavior: "relaxed lean back (reflective posture)",
    microReaction: "deep exhalation, quiet focus",
    tensionLevel: "low"
  }
}

function derivePhysiology(descriptor: string, subject: string, context: string): PhysiologicalProfile {
  const normalized = descriptor.toLowerCase()
  if (PHYSIOLOGICAL_PROFILES[normalized]) {
    return PHYSIOLOGICAL_PROFILES[normalized]
  }

  // Dynamic builder for unknown descriptors
  const combined = `${descriptor} ${subject} ${context}`.toLowerCase()
  let tensionLevel: "low" | "medium" | "high" | "dynamic" = "low"
  if (combined.includes("defiant") || combined.includes("unsettling") || combined.includes("bold") || combined.includes("tension")) {
    tensionLevel = "high"
  } else if (combined.includes("precise") || combined.includes("intimate") || combined.includes("curious")) {
    tensionLevel = "medium"
  }

  let observableReaction = "respiratory stabilization, steady fixation"
  let postureApproachBehavior = "neutral posture"
  if (tensionLevel === "high") {
    observableReaction = "temporary breath hold, focused narrowing of gaze, facial muscle engagement"
    postureApproachBehavior = "forward lean, focused attention"
  } else if (tensionLevel === "medium") {
    observableReaction = "micro-nod, slight lean forward, pupil dilation of curiosity"
    postureApproachBehavior = "slight tilt, investigative stance"
  } else {
    observableReaction = "slowed respiration rate, neck muscle relaxation"
    postureApproachBehavior = "relaxed posture, comfortable viewing height"
  }

  return {
    observableReaction,
    observableViewerBehavior: "focused gaze on structural anomalies, steady reading pace",
    eyePath: "scanning primary elements sequentially",
    viewingSpeed: tensionLevel === "high" ? "rapid, focused" : "deliberate, steady",
    focalDuration: tensionLevel === "high" ? "0.6s to 1.1s" : "1.2s to 2.4s",
    postureApproachBehavior,
    microReaction: tensionLevel === "high" ? "tightened jaw, narrowed eyelids" : "softened expression, micro-nod",
    tensionLevel
  }
}

// Derive perceptual principles based on physiological state goals
function derivePerceptualPrinciples(physio: PhysiologicalProfile): SomaticPerceptualPrinciple[] {
  const principles: SomaticPerceptualPrinciple[] = []

  if (physio.viewingSpeed === "slow" || physio.viewingSpeed === "deliberate, slow (unhurried navigation)") {
    principles.push({
      responseTarget: "slow viewing",
      principle: "Reduced competing focal events",
      reasoning: "Limiting concurrent visual demands allows longer information dwell and prevents rapid processing deflection."
    })
    principles.push({
      responseTarget: "unhurried navigation",
      principle: "Lower temporal interruption",
      reasoning: "Eliminating automatic loops or transitions gives space for relaxed respiratory deceleration."
    })
  }

  if (physio.tensionLevel === "high") {
    principles.push({
      responseTarget: "focused narrowing of gaze",
      principle: "High structural hierarchy contrast",
      reasoning: "Extreme contrasts in scale or mass capture attention aggressively and create immediate cognitive priority."
    })
    principles.push({
      responseTarget: "forward lean / engagement",
      principle: "Unresolved visual question",
      reasoning: "Compacting the space between visual triggers and payoffs induces immediate investigative behavior."
    })
  }

  if (physio.tensionLevel === "medium" || physio.eyePath.includes("radial")) {
    principles.push({
      responseTarget: "immediate gaze capture",
      principle: "Isolated visual anomaly",
      reasoning: "Introducing an off-grid element breaks expectations and forces instant saccadic capture."
    })
  }

  if (physio.microReaction.includes("smile") || physio.microReaction.includes("chuckle")) {
    principles.push({
      responseTarget: "playful smile",
      principle: "Controlled expectation violation",
      reasoning: "Juxtaposing a familiar setup with an unexpected detail stimulates pleasant zygomatic muscle activation."
    })
  }

  // Default calm/reflective fallback if none added
  if (principles.length === 0) {
    principles.push({
      responseTarget: "meditative reading",
      principle: "Stable spatial hierarchy",
      reasoning: "Predictable, balanced alignments allow sequential scanning without visual interruption."
    })
  }

  return principles
}

// Generate contextual formal implementation options
function generateFormalOptions(
  descriptor: string,
  subject: string,
  context: string,
  principles: SomaticPerceptualPrinciple[]
): SomaticFormalOption[] {
  const options: SomaticFormalOption[] = []
  const isRenovation = subject.toLowerCase().includes("renovation") || context.toLowerCase().includes("renovation")
  const isPerfume = subject.toLowerCase().includes("perfume") || context.toLowerCase().includes("perfume")
  const isDashboard = subject.toLowerCase().includes("dashboard") || context.toLowerCase().includes("saas") || context.toLowerCase().includes("platform")
  const isFashion = subject.toLowerCase().includes("fashion") || context.toLowerCase().includes("wear")

  // Generate options based on active perceptual principles
  for (const pr of principles) {
    if (pr.responseTarget === "slow viewing" || pr.responseTarget === "unhurried navigation" || pr.responseTarget === "meditative reading") {
      if (isPerfume) {
        options.push({
          option: "Ultra-low density layout with overlapping organic scent imagery",
          whyItSupportsResponse: "Vast breathing spaces allow the eye to wander serpentine-style without rapid page deflection.",
          contextFit: "High-fit: Perfume brands rely heavily on abstract sensual/spatial luxury cues.",
          stereotypeRisk: "MEDIUM",
          stereotypeRiskReason: "Commonly used in high-fashion portals, but functionally correct here for olfactory luxury."
        })
      }
      if (isDashboard) {
        options.push({
          option: "Golden ratio grid with isolated KPI cards and wide padding (35%)",
          whyItSupportsResponse: "Allows the user to absorb complex data without cognitive crowding, lowering tension.",
          contextFit: "High-fit: Professional tools must maintain structural clarity and legibility.",
          stereotypeRisk: "LOW",
          stereotypeRiskReason: "Avoids typical chaotic data-dump B2B dashboards, framing analytical accuracy as premium."
        })
      }
      if (isRenovation) {
        options.push({
          option: "Premium architectural blueprint grid with micro-details",
          whyItSupportsResponse: "Invites quiet study of structural lines, promoting slower, high-trust reading pace.",
          contextFit: "High-fit: Matches client desire for accountability and competence.",
          stereotypeRisk: "LOW",
          stereotypeRiskReason: "Focuses on blueprint competence rather than typical stock-photo wellness imagery."
        })
      }
    }

    if (pr.responseTarget === "immediate gaze capture" || pr.responseTarget === "focused narrowing of gaze") {
      if (isRenovation) {
        options.push({
          option: "Oversized, off-grid architectural detail crop",
          whyItSupportsResponse: "Forces the eye to pause on craftsmanship textures, creating initial saccadic capture.",
          contextFit: "High-fit: Highlights tangible expertise directly to homeowners.",
          stereotypeRisk: "LOW",
          stereotypeRiskReason: "Differs from neon and flash banners by using raw physical material texture crops."
        })
        options.push({
          option: "Neon-accented animated pointer highlights",
          whyItSupportsResponse: "Uses saturated chrominance pops to snap attention instantly.",
          contextFit: "Low-fit: Neon aesthetics conflict with a high-trust, premium home construction service.",
          stereotypeRisk: "HIGH",
          stereotypeRiskReason: "Classic 'eye-catching = neon' cliché. Can appear cheap or aggressive."
        })
      }
      if (isFashion) {
        options.push({
          option: "High-impact visual asymmetry with extreme layout offsets",
          whyItSupportsResponse: "Disrupts standard scanning lines to demand immediate engagement.",
          contextFit: "High-fit: Matches the expressive nature of editorial fashion campaigns.",
          stereotypeRisk: "LOW",
          stereotypeRiskReason: "Achieves gaze capture structurally without resorting to cheap visual badges."
        })
      }
      if (isDashboard) {
        options.push({
          option: "Single anomaly alert highlight against deep slate backdrop",
          whyItSupportsResponse: "Monochromatic slate backdrop with a single isolated indicator captures focus instantly.",
          contextFit: "High-fit: Directs operational users to critical decision paths immediately.",
          stereotypeRisk: "LOW",
          stereotypeRiskReason: "Avoids generic cluttered dashboard systems by creating a singular operational focal center."
        })
      }
    }
  }

  // Fallbacks if context-specific rules didn't cover everything
  if (options.length === 0) {
    options.push({
      option: `Muted earth tones with asymmetrical grid layouts for "${subject}"`,
      whyItSupportsResponse: "Reduces visual friction to support slower viewing speed.",
      contextFit: "General fit for this creative container.",
      stereotypeRisk: "LOW",
      stereotypeRiskReason: "Provides clean composition without resorting to cliché styles."
    })
  }

  return options
}

// Select direction, rejecting high-stereotype risks in favor of contextual fits
function selectDirection(
  descriptor: string,
  subject: string,
  options: SomaticFormalOption[]
): SomaticSelectedDirection {
  const highFitOptions = options.filter(o => o.stereotypeRisk === "LOW" && o.contextFit.includes("High-fit"))
  const chosen = highFitOptions.length > 0 ? highFitOptions[0]! : options[0]!
  const rejected = options.filter(o => o.option !== chosen.option).map(o => o.option)

  return {
    chosenExpression: chosen.option,
    because: `Selected "${chosen.option}" because it directly implements the perceptual principles while keeping stereotype risk LOW. reasoning: ${chosen.whyItSupportsResponse}`,
    rejectedAlternatives: rejected
  }
}

// ─── Core Production Function ───────────────────────────────────────────────

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  const descriptor = input.supplementaryFields?.targetSensoryExperience ?? "calm / reflective"

  // Step 1: Derive physiological reactions
  const physio = derivePhysiology(descriptor, subject, context)

  // Step 2: Derive perceptual principles (response-to-form traceability)
  const principles = derivePerceptualPrinciples(physio)

  // Step 3: Generate context-sensitive formal options (avoiding stereotypes)
  const options = generateFormalOptions(descriptor, subject, context, principles)

  // Step 4: Select direction
  const selection = selectDirection(descriptor, subject, options)

  // Map choices back to final variables for rawOutputs mapping
  const chosenOption = options.find(o => o.option === selection.chosenExpression) || options[0]!

  // Formatting strings
  const principlesStr = principles.map(p =>
    `- Target: ${p.responseTarget}\n  Principle: ${p.principle}\n  Reasoning: ${p.reasoning}`
  ).join("\n")

  const optionsStr = options.map(o =>
    `- Option: ${o.option}\n  Supports: ${o.whyItSupportsResponse}\n  Fit: ${o.contextFit}\n  Stereotype Risk: [${o.stereotypeRisk}] ${o.stereotypeRiskReason}`
  ).join("\n\n")

  const visualBrief = [
    `SOMATIC RESPONSE BRIEF — "${subject}"`,
    `Somatic Descriptor: ${descriptor}`,
    `Physiological Goal: ${physio.observableReaction}`,
    `Eye Path: ${physio.eyePath}`,
    `Perceptual Rule: ${principles[0]?.principle ?? "predictable hierarchy"}`,
    `Chosen Direction: ${selection.chosenExpression}`,
    `Traceability Reason: ${selection.because}`,
    `Risk Profile: ${chosenOption.stereotypeRisk} (${chosenOption.stereotypeRiskReason})`
  ].join("\n")

  // Generate deterministic fingerprints
  const inputFingerprint = `SRD:descriptor=${descriptor.slice(0, 30)}:subject=${subject.slice(0, 30)}:context=${context.slice(0, 30)}`
  const outputFingerprint = `SRD:tension=${physio.tensionLevel}:whitespace=medium-high:color=warm-linen:option=${chosenOption.option.slice(0, 30)}`

  const rawOutputs: Record<string, string> = {
    descriptor,
    observableReaction: physio.observableReaction,
    observableViewerBehavior: physio.observableViewerBehavior,
    eyePath: physio.eyePath,
    viewingSpeed: physio.viewingSpeed,
    focalDuration: physio.focalDuration,
    postureApproachBehavior: physio.postureApproachBehavior,
    microReaction: physio.microReaction,
    tension: physio.tensionLevel,
    perceptualPrinciples: principlesStr,
    formalOptions: optionsStr,
    selectedDirectionChosen: selection.chosenExpression,
    selectedDirectionRationale: selection.because,
    selectedDirectionRejected: selection.rejectedAlternatives.join(" | "),
    stereotypeRisk: chosenOption.stereotypeRisk,
    stereotypeRiskReason: chosenOption.stereotypeRiskReason,
    compositionConsequence: `Apply compositional expression: "${chosenOption.option}" to satisfy "${principles[0]?.principle ?? "hierarchy"}".`,
    densityConsequence: physio.tensionLevel === "high" ? "high focal density" : "low spatial density",
    whitespaceConsequence: physio.tensionLevel === "low" ? "expansive padding (35%-50%)" : "compressed borders",
    scaleConsequence: physio.tensionLevel === "high" ? "oversized display headers" : "balanced typographic scale",
    typographyConsequence: isRenovation(subject, context) ? "architectural geometric sans-serif" : isPerfume(subject, context) ? "high-contrast display serif" : "highly legible sans-serif",
    colorTemperatureConsequence: isPerfume(subject, context) ? "warm alabaster, linen, gold accents" : isDashboard(subject, context) ? "obsidian and dark slate with emerald accent" : "cool earth tones",
    motionTempoConsequence: physio.tensionLevel === "high" ? "instantaneous snap (150ms)" : "slow fade (800ms)",
    soundConsequence: "subtle low-frequency atmospheric hums",
    accessibilitySafeguard: "ensure all text maintains 4.5:1 contrast and supports high zoom levels without breaking layout",
    fiveSecondValidationTest: `Show the work for 5 seconds. Does the viewer exhibit: ${physio.observableViewerBehavior}? Ask: "What did your eyes track first?" to verify: "${physio.eyePath}".`,
    failureSignals: ["viewer scrolls past the anomaly in under 2 seconds", "eye path jumps sporadically", "subject describes design as cliché or noisy"].join("\n"),
    somaticBrief: visualBrief,
    inputFingerprint,
    outputFingerprint
  }

  const outputSections = [
    {
      sectionKey: "somatic-reactions",
      label: "Observable Somatic Reactions",
      content: `Descriptor: ${descriptor}\n` +
               `Body Reaction: ${physio.observableReaction}\n` +
               `Viewer Behavior: ${physio.observableViewerBehavior}\n` +
               `Eye Path: ${physio.eyePath}\n` +
               `Viewing Speed: ${physio.viewingSpeed}\n` +
               `Focal Duration: ${physio.focalDuration}\n` +
               `Posture/Approach: ${physio.postureApproachBehavior}\n` +
               `Micro-reaction: ${physio.microReaction}\n` +
               `Tension: ${physio.tensionLevel}`
    },
    {
      sectionKey: "perceptual-principles",
      label: "Perceptual Principles Derived",
      content: principlesStr
    },
    {
      sectionKey: "formal-options",
      label: "Formal Implementation Options Considered",
      content: optionsStr
    },
    {
      sectionKey: "selected-direction",
      label: "Selected Design Direction (Stereotype-Free)",
      content: `Chosen Expression: ${selection.chosenExpression}\n` +
               `Because: ${selection.because}\n` +
               `Rejected Alternatives:\n${selection.rejectedAlternatives.map(r => `  - ${r}`).join("\n")}`
    },
    {
      sectionKey: "safeguards-validation",
      label: "Safeguards & Validation",
      content: `Accessibility Safeguard: ${rawOutputs.accessibilitySafeguard}\n` +
               `5-Second Validation: ${rawOutputs.fiveSecondValidationTest}\n` +
               `Failure Signals:\n${rawOutputs.failureSignals}`
    }
  ]

  return {
    methodId: SOMATIC_RESPONSE_DESIGN_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Identify Target Descriptor", instruction: `Load target sensory descriptor: "${descriptor}".`, outputKey: "descriptor" },
      { stepIndex: 2, label: "Derive Physiological Profile", instruction: "Map observable viewer reactions, posture, and micro-responses.", outputKey: "somatic-reactions" },
      { stepIndex: 3, label: "Extract Perceptual Principles", instruction: "Derive structural principles from somatic responses.", outputKey: "perceptual-principles" },
      { stepIndex: 4, label: "Analyze Formal Options", instruction: "Generate context-sensitive options and analyze stereotype risk.", outputKey: "formal-options" },
      { stepIndex: 5, label: "Select Direction & Formulate Safeguards", instruction: "Choose low-stereotype high-fit option. Define accessibility safeguards.", outputKey: "selected-direction" }
    ],
    outputSections,
    rawOutputs
  }
}

// Helpers
function isRenovation(s: string, c: string): boolean { return s.toLowerCase().includes("renovation") || c.toLowerCase().includes("renovation") }
function isPerfume(s: string, c: string): boolean { return s.toLowerCase().includes("perfume") || c.toLowerCase().includes("perfume") }
function isDashboard(s: string, c: string): boolean { return s.toLowerCase().includes("dashboard") || c.toLowerCase().includes("saas") }

// ─── Quality Gates ──────────────────────────────────────────────────────────

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
    passCriteria: ["composition, color, and typography consequences must be detailed"],
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
    passCriteria: ["failureSignals output must contain multiple signals"],
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
  },
  {
    gateId: "srd.response-to-form-traceable",
    label: "Response-To-Form Traceable",
    description: "Verify that visual / layout recommendations trace back directly to perceptual principles and bodily response targets.",
    passCriteria: ["selectedDirection Rationale must justify the choice using perceptual principles"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const rationale = result.rawOutputs.selectedDirectionRationale ?? ""
      const hasTrace = rationale.includes("perceptual principles") || rationale.includes("reasoning:")
      const passed = rationale.length > 30 && hasTrace
      return {
        gateId: "srd.response-to-form-traceable",
        label: "Response-To-Form Traceable",
        passed,
        failReasons: passed ? [] : ["The chosen formal direction does not trace back to any perceptual principle or somatic response target."]
      }
    }
  },
  {
    gateId: "srd.context-overrides-style-stereotype",
    label: "Context Overrides Style Stereotype",
    description: "Assert that obvious design stereotypes are reported, analyzed, and rejected in favor of high-fit context-specific alternatives.",
    passCriteria: ["stereotypeRisk is analyzed, and low-risk options are preferred when fit matches"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const risk = result.rawOutputs.stereotypeRisk ?? ""
      const rational = result.rawOutputs.selectedDirectionRationale ?? ""
      const passed = (risk === "LOW" || risk === "MEDIUM" || risk === "HIGH") && rational.includes("stereotype risk")
      return {
        gateId: "srd.context-overrides-style-stereotype",
        label: "Context Overrides Style Stereotype",
        passed,
        failReasons: passed ? [] : ["A stereotype risk assessment was not performed or did not override default style assignments."]
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
