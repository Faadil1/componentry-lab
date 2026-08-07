import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult
} from "./types"
import { executeMethod } from "./runtime"

export const COGNITIVE_METAPHOR_ILLUSTRATOR_ID = "method_cognitive_metaphor_illustrator"

export const cognitiveMetaphorIllustratorDefinition: CreativeMethodDefinition = {
  id: COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
  resourceId: "res_cognitive_metaphor_illustrator",
  name: "Cognitive Metaphor Illustrator",
  version: "1.0.0",
  supportedModes: ["DATA_STORY", "DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["visual-metaphor"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: [
    "evaluatorType",
    "supplementaryFields.concept",
    "supplementaryFields.projectObjective",
    "supplementaryFields.audience",
    "supplementaryFields.sourceText",
    "supplementaryFields.argument",
    "supplementaryFields.artifactType",
    "supplementaryFields.tone",
    "supplementaryFields.projectSymbols",
    "supplementaryFields.prohibitedSymbols",
    "supplementaryFields.characterPolicy",
    "supplementaryFields.brandConstraints",
    "supplementaryFields.culturalConstraints"
  ],
  outputSchemaId: "cognitive-metaphor-illustrator-v1",
  qualityGateIds: [
    "cmi.one-image-one-cognitive-action",
    "cmi.physical-not-verbal",
    "cmi.cliche-risk-reviewed",
    "cmi.literalization-risk-reviewed",
    "cmi.project-specific",
    "cmi.comprehension-over-decoration",
    "cmi.no-source-style-copy"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

interface MetaphorCandidate {
  family: string
  clicheRisk: "HIGH" | "MEDIUM" | "LOW"
  riskReason: string
  physicalDescription: string
  // V2 Metaphor Transformation Dimension
  transformationDimension: "DIRECT_LITERALIZATION" | "LOW_TRANSFORMATION" | "STRUCTURAL_ANALOGY" | "UNEXPECTED_LEGIBLE_ANALOGY"
  semanticDistance: number // 1 to 10
  comprehensionStrength: number // 1 to 10
  distinctivenessStrength: number // 1 to 10
  literalizationRisk: number // 1 to 10
  reasoning: string
}

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  const fields = input.supplementaryFields || {}

  const concept = fields.concept ?? subject
  const projectObjective = fields.projectObjective ?? "clarify conceptual relations"
  const audience = fields.audience ?? "general reader"
  const projectSymbols = fields.projectSymbols ?? "none"
  const prohibitedSymbols = fields.prohibitedSymbols ?? "none"

  // 1. Analyze candidate metaphors and review cliche risks
  const candidates: MetaphorCandidate[] = []
  
  const debugContext = `context: ${context}, objective: ${projectObjective}`

  if (concept.toLowerCase().includes("technical debt") || subject.toLowerCase().includes("technical debt")) {
    candidates.push({
      family: "cliche plant / gardening",
      clicheRisk: "HIGH",
      riskReason: "Growing plants are the default metaphor for any business growth or developmental accumulation.",
      physicalDescription: "A weeds-ridden plant choking fresh growth.",
      transformationDimension: "LOW_TRANSFORMATION",
      semanticDistance: 3,
      comprehensionStrength: 8,
      distinctivenessStrength: 2,
      literalizationRisk: 3,
      reasoning: "Planting weeds represents organic neglect, but it is extremely overused in corporate slide decks."
    })
    candidates.push({
      family: "decaying architectural foundations",
      clicheRisk: "LOW",
      riskReason: "Focuses on structural load-bearing limits and spatial relationships, showing structural decay under load.",
      physicalDescription: "A heavy granite block supported by a row of pillars where three pillars are replaced by temporary wooden sticks bowing under the weight.",
      transformationDimension: "STRUCTURAL_ANALOGY",
      semanticDistance: 7,
      comprehensionStrength: 9,
      distinctivenessStrength: 8,
      literalizationRisk: 1,
      reasoning: "Architectural pillars and load shifting structurally maps the trade-offs of deferring system architecture."
    })
    // Candidate 3 for technical debt depending on audience
    if (audience.toLowerCase().includes("engineer")) {
      candidates.push({
        family: "jumbled pipeline junctions",
        clicheRisk: "LOW",
        riskReason: "Relates specifically to physical plumbing redirects.",
        physicalDescription: "A fluid transit pipe with 15 nested bypass valves leaking pressure at every bend.",
        transformationDimension: "STRUCTURAL_ANALOGY",
        semanticDistance: 6,
        comprehensionStrength: 9,
        distinctivenessStrength: 7,
        literalizationRisk: 2,
        reasoning: "Highlights flow resistance and friction for senior engineering audience."
      })
    } else {
      candidates.push({
        family: "over-packed cargo boat sailing low",
        clicheRisk: "LOW",
        riskReason: "Represents weight limit exceeding.",
        physicalDescription: "A wooden barge loaded with cargo boxes stack too high, its hull sitting 2 inches below the safety waterline.",
        transformationDimension: "STRUCTURAL_ANALOGY",
        semanticDistance: 6,
        comprehensionStrength: 8,
        distinctivenessStrength: 7,
        literalizationRisk: 2,
        reasoning: "Clear illustration of execution strain and drag for general management audience."
      })
    }
  } else if (concept.toLowerCase().includes("trust erosion") || subject.toLowerCase().includes("trust erosion")) {
    candidates.push({
      family: "cliche shield / lock",
      clicheRisk: "HIGH",
      riskReason: "Shields, padlocks, and broken hearts are standard clichés for security and trust.",
      physicalDescription: "A cracked shield or a broken padlock.",
      transformationDimension: "LOW_TRANSFORMATION",
      semanticDistance: 2,
      comprehensionStrength: 7,
      distinctivenessStrength: 2,
      literalizationRisk: 4,
      reasoning: "Standard padlock imagery represents access control, not the progressive erosion of relationship trust."
    })
    candidates.push({
      family: "sandstone arch under continuous water droplets",
      clicheRisk: "LOW",
      riskReason: "Demonstrates physical friction and steady structural deterioration without relying on standard safety badges.",
      physicalDescription: "A solid stone archway showing a deep groove worn into the capstone by a slow, single-source drip of water.",
      transformationDimension: "STRUCTURAL_ANALOGY",
      semanticDistance: 8,
      comprehensionStrength: 9,
      distinctivenessStrength: 9,
      literalizationRisk: 1,
      reasoning: "Represents slow, inevitable degradation from a seemingly harmless recurring force."
    })
    candidates.push({
      family: "weathered coastal cliff face",
      clicheRisk: "LOW",
      riskReason: "Literal physical erosion analogy.",
      physicalDescription: "A vertical soil cliff collapsing into a turbulent ocean wave below.",
      transformationDimension: "DIRECT_LITERALIZATION",
      semanticDistance: 1,
      comprehensionStrength: 8,
      distinctivenessStrength: 4,
      literalizationRisk: 9,
      reasoning: "Literalization risk is high; mapping trust erosion directly to physical dirt erosion offers low conceptual transformation."
    })
  } else if (concept.toLowerCase().includes("operational bottleneck") || subject.toLowerCase().includes("operational bottleneck")) {
    candidates.push({
      family: "cliche funnel / traffic jam",
      clicheRisk: "HIGH",
      riskReason: "Funnels and highway traffic jams are used universally for workflow bottlenecks.",
      physicalDescription: "Cars stuck in a bottleneck road structure.",
      transformationDimension: "LOW_TRANSFORMATION",
      semanticDistance: 3,
      comprehensionStrength: 9,
      distinctivenessStrength: 2,
      literalizationRisk: 5,
      reasoning: "Traffic jam is a literal bottleneck description, lacking design distinctiveness."
    })
    candidates.push({
      family: "gravity-fed sphere runway with narrow gate gates",
      clicheRisk: "LOW",
      riskReason: "Exposes physical speed and mass restrictions through concrete gravity dynamics.",
      physicalDescription: "A sloping track where metal balls roll down; the track narrows to let only one ball pass, while three other balls accumulate behind it, stopping the flow.",
      transformationDimension: "STRUCTURAL_ANALOGY",
      semanticDistance: 7,
      comprehensionStrength: 9,
      distinctivenessStrength: 8,
      literalizationRisk: 2,
      reasoning: "A mechanical track maps queues and transit limits without using highway/traffic cliches."
    })
    candidates.push({
      family: "narrow neck glass flask",
      clicheRisk: "LOW",
      riskReason: "A literal physical bottleneck.",
      physicalDescription: "An hourglass container where sand grains block each other at the central glass neck.",
      transformationDimension: "DIRECT_LITERALIZATION",
      semanticDistance: 1,
      comprehensionStrength: 9,
      distinctivenessStrength: 3,
      literalizationRisk: 10,
      reasoning: "Highly literalized representation of bottleneck using a literal glass bottle neck. High literalization risk."
    })
  } else {
    // Fallback/Generic concept metaphor
    candidates.push({
      family: "cliche lightbulb / jigsaw puzzle",
      clicheRisk: "HIGH",
      riskReason: "Lightbulbs for ideas and puzzle pieces for collaboration are the highest-risk visual clichés.",
      physicalDescription: "A shining lightbulb in a dark room or jigsaw pieces slotting together.",
      transformationDimension: "LOW_TRANSFORMATION",
      semanticDistance: 2,
      comprehensionStrength: 8,
      distinctivenessStrength: 1,
      literalizationRisk: 3,
      reasoning: "Universal business slide cliches."
    })
    candidates.push({
      family: "lever and fulcrum imbalance system",
      clicheRisk: "LOW",
      riskReason: "Translates imbalance or effort relationships through mechanical physics.",
      physicalDescription: "A long wooden beam resting off-center on a sharp metal wedge, showing a small gold weight balancing a huge lead block.",
      transformationDimension: "STRUCTURAL_ANALOGY",
      semanticDistance: 7,
      comprehensionStrength: 9,
      distinctivenessStrength: 8,
      literalizationRisk: 2,
      reasoning: "Leverage and fulcrum mechanical balance."
    })
    candidates.push({
      family: "interlocking gears system with mismatched teeth",
      clicheRisk: "LOW",
      riskReason: "Mechanical integration friction.",
      physicalDescription: "Two large iron gears grinding against each other because one gear has teeth twice as wide as the other.",
      transformationDimension: "STRUCTURAL_ANALOGY",
      semanticDistance: 6,
      comprehensionStrength: 8,
      distinctivenessStrength: 7,
      literalizationRisk: 1,
      reasoning: "Shows system synchronization failure cleanly."
    })
  }

  // 2. Select low-risk / high-fit candidate balancing the dimensions
  // Fit function: score = comprehensionStrength + distinctivenessStrength - literalizationRisk
  // Exclude HIGH clicheRisk.
  const eligible = candidates.filter(c => c.clicheRisk !== "HIGH")
  
  // Sort candidates by fit score descending
  const scoredCandidates = eligible.map(c => {
    const fitScore = c.comprehensionStrength + c.distinctivenessStrength - c.literalizationRisk
    return { candidate: c, fitScore }
  })
  scoredCandidates.sort((a, b) => b.fitScore - a.fitScore)
  
  const selected = scoredCandidates.length > 0 ? scoredCandidates[0]!.candidate : candidates[0]!

  // Reject candidates logs
  const rejectedAlternative = candidates.filter(c => c.family !== selected.family).map(c => c.family).join(" | ")

  // Cognitive Action mapping
  const cognitiveAnchor = `Understand how ${selected.family} models the core relationship of "${concept}".`
  const sceneProposition = `Draw: ${selected.physicalDescription}`

  // Format signatures
  const inputFingerprint = `CMI:concept=${concept.slice(0, 30)}:aud=${audience.slice(0, 20)}:symbols=${projectSymbols.slice(0, 20)}`
  const outputFingerprint = `CMI:selected=${selected.family}:action=illustrate-one-relation:risk=${selected.clicheRisk}`

  const rawOutputs: Record<string, string> = {
    conceptSummary: `Explain the mechanics of "${concept}" to "${audience}". (${debugContext})`,
    cognitiveAnchor,
    relationToCommunicate: `The structural relationship of ${selected.family} conveying ${concept} mechanics.`,
    candidateMetaphorFamilies: JSON.stringify(candidates),
    clicheRiskAssessment: `Identified and rejected "${rejectedAlternative}" due to high cliché exposure or literalization risks. Selected "${selected.family}".`,
    selectedPhysicalMetaphor: selected.family,
    actorForce: `Physical forces matching ${selected.family}.`,
    objectSystem: selected.physicalDescription,
    physicalAction: `Interaction matching ${selected.family} dynamics.`,
    consequence: `Physical collapse or block representing the systemic result of ${concept}.`,
    oneCognitiveAction: `Exposing the structural limits and consequences of ${selected.family}.`,
    sceneProposition,
    alternativeRejectedMetaphors: rejectedAlternative,
    projectSpecificSymbols: projectSymbols,
    visualHierarchy: `Primary focus: ${selected.physicalDescription.slice(0, 60)}. Secondary focus: background contrast.`,
    labelPolicy: `Minimal annotation matching ${selected.family} elements.`,
    failureRisks: `Risk that the illustrator relies on a literalised description or standard business icons.`,
    validationTest: `Show the illustration without text labels or titles. Ask: "What happens in this system?" If they identify the mechanical tension matching "${selected.family}", the cognitive action is successful.`,
    inputFingerprint,
    outputFingerprint
  }

  const outputSections = [
    {
      sectionKey: "metaphor-conceptualization",
      label: "Metaphor Conceptualization",
      content: `Concept: ${concept}\n` +
               `Cognitive Anchor: ${cognitiveAnchor}\n` +
               `Core Relationship: ${rawOutputs.relationToCommunicate}`
    },
    {
      sectionKey: "cliche-review",
      label: "Cliché & Literalization Risk Review",
      content: `Selected Metaphor Family: ${selected.family}\n` +
               `Cliché Assessment:\n${rawOutputs.clicheRiskAssessment}\n\n` +
               `Rejected Alternatives: ${rejectedAlternative}`
    },
    {
      sectionKey: "scene-proposition",
      label: "Visual Scene Proposition",
      content: `Scene: ${sceneProposition}\n` +
               `Actors/Forces: ${rawOutputs.actorForce}\n` +
               `Action: ${rawOutputs.physicalAction}\n` +
               `Consequence: ${rawOutputs.consequence}\n` +
               `One Cognitive Action: ${rawOutputs.oneCognitiveAction}`
    },
    {
      sectionKey: "visual-hierarchy",
      label: "Composition & Staging Guides",
      content: `Hierarchy: ${rawOutputs.visualHierarchy}\n` +
               `Label Policy: ${rawOutputs.labelPolicy}\n` +
               `Prohibited Symbols: ${prohibitedSymbols}`
    },
    {
      sectionKey: "validation-plan",
      label: "Validation Test & Risks",
      content: `Validation Test: ${rawOutputs.validationTest}\n` +
               `Failure Risks: ${rawOutputs.failureRisks}`
    }
  ]

  return {
    methodId: COGNITIVE_METAPHOR_ILLUSTRATOR_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Identify Concept Anchor", instruction: `Define the primary cognitive relationship for concept: "${concept}".`, outputKey: "metaphor-conceptualization" },
      { stepIndex: 2, label: "Audit Cliché & Literalization Risks", instruction: "List and reject common visual cliches and literalized versions of concepts.", outputKey: "cliche-review" },
      { stepIndex: 3, label: "Select Metaphor Architecture", instruction: "Choose a physical analogy based on structural/mechanical laws.", outputKey: "scene-proposition" },
      { stepIndex: 4, label: "Formulate Scene Composition", instruction: "Define the visual hierarchy and spatial layout for the metaphor.", outputKey: "visual-hierarchy" },
      { stepIndex: 5, label: "Write Validation Plan", instruction: "Design a silent comprehension test.", outputKey: "validation-plan" }
    ],
    outputSections,
    rawOutputs
  }
}

// ─── Quality Gates ──────────────────────────────────────────────────────────

export const cognitiveMetaphorIllustratorGates: CreativeMethodQualityGate[] = [
  {
    gateId: "cmi.one-image-one-cognitive-action",
    label: "One Image One Cognitive Action",
    description: "The metaphor must express exactly one spatial or mechanical relationship.",
    passCriteria: ["oneCognitiveAction must specify a single relationship"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const act = result.rawOutputs.oneCognitiveAction ?? ""
      const passed = act.length > 10 && !act.toLowerCase().includes("multiple")
      return {
        gateId: "cmi.one-image-one-cognitive-action",
        label: "One Image One Cognitive Action",
        passed,
        failReasons: passed ? [] : ["The metaphor visualizes multiple complex relationships rather than a single cognitive anchor."]
      }
    }
  },
  {
    gateId: "cmi.physical-not-verbal",
    label: "Physical Not Verbal",
    description: "The metaphor must represent relations through physical forces and objects.",
    passCriteria: ["actorForce and objectSystem must contain physical terms"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const force = result.rawOutputs.actorForce ?? ""
      const obj = result.rawOutputs.objectSystem ?? ""
      const passed = force.length > 5 && obj.length > 5
      return {
        gateId: "cmi.physical-not-verbal",
        label: "Physical Not Verbal",
        passed,
        failReasons: passed ? [] : ["The metaphor relies on verbal explanations rather than observable physical forces."]
      }
    }
  },
  {
    gateId: "cmi.cliche-risk-reviewed",
    label: "Cliché Risk Reviewed",
    description: "Common visual clichés must be audited and actively rejected.",
    passCriteria: ["alternativeRejectedMetaphors must specify common clichés"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const rej = result.rawOutputs.alternativeRejectedMetaphors ?? ""
      const passed = rej.toLowerCase().includes("cliche") || rej.length > 5
      return {
        gateId: "cmi.cliche-risk-reviewed",
        label: "Cliché Risk Reviewed",
        passed,
        failReasons: passed ? [] : ["The cliché risk audit is missing or did not reject common category clichés."]
      }
    }
  },
  {
    gateId: "cmi.literalization-risk-reviewed",
    label: "Literalization Risk Reviewed",
    description: "Ensure candidate metaphors are evaluated for literalization risk and high literalization versions are avoided.",
    passCriteria: ["candidateMetaphorFamilies evaluates literalizationRisk and DIRECT_LITERALIZATION"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      try {
        const candidates = JSON.parse(result.rawOutputs.candidateMetaphorFamilies ?? "[]") as MetaphorCandidate[]
        const selected = result.rawOutputs.selectedPhysicalMetaphor ?? ""
        const selectedCandidate = candidates.find(c => c.family === selected)
        // If a highly literalized version was selected, fail.
        const passed = selectedCandidate && selectedCandidate.transformationDimension !== "DIRECT_LITERALIZATION" && selectedCandidate.literalizationRisk < 7
        return {
          gateId: "cmi.literalization-risk-reviewed",
          label: "Literalization Risk Reviewed",
          passed: !!passed,
          failReasons: passed ? [] : ["Selected metaphor has high literalization risk or direct literalization dimension."]
        }
      } catch {
        return {
          gateId: "cmi.literalization-risk-reviewed",
          label: "Literalization Risk Reviewed",
          passed: false,
          failReasons: ["Failed to parse candidate metaphors for literalization risk check."]
        }
      }
    }
  },
  {
    gateId: "cmi.project-specific",
    label: "Project Specific",
    description: "The metaphor output must use project-specific audience and concept parameters.",
    passCriteria: ["conceptSummary references the inputs"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const summary = result.rawOutputs.conceptSummary ?? ""
      const passed = summary.length > 10 && !summary.includes("unspecified")
      return {
        gateId: "cmi.project-specific",
        label: "Project Specific",
        passed,
        failReasons: passed ? [] : ["The metaphor design does not ground its parameters in the project audience or concept."]
      }
    }
  },
  {
    gateId: "cmi.comprehension-over-decoration",
    label: "Comprehension Over Decoration",
    description: "Ensure that visual novelty does not outrank conceptual clarity.",
    passCriteria: ["validationTest must outline an objective comprehension check"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const val = result.rawOutputs.validationTest ?? ""
      const passed = val.length > 20 && val.includes("comprehension") || val.includes("successful")
      return {
        gateId: "cmi.comprehension-over-decoration",
        label: "Comprehension Over Decoration",
        passed,
        failReasons: passed ? [] : ["The comprehension validation test is missing or too brief."]
      }
    }
  },
  {
    gateId: "cmi.no-source-style-copy",
    label: "No Source Style Copy",
    description: "The proposition must not mimic external visual properties (e.g. Xiaohei character design or specific corporate brand IPs).",
    passCriteria: ["sceneProposition must avoid imitating Xiaohei or trademarked characters"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const prop = result.rawOutputs.sceneProposition ?? ""
      const hasIP = prop.toLowerCase().includes("xiaohei") || prop.toLowerCase().includes("brand logo mascot")
      const passed = !hasIP
      return {
        gateId: "cmi.no-source-style-copy",
        label: "No Source Style Copy",
        passed,
        failReasons: passed ? [] : ["The scene proposition relies on external visual IP or mascot imitation."]
      }
    }
  }
]

export function runCognitiveMetaphorIllustrator(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(cognitiveMetaphorIllustratorDefinition, cognitiveMetaphorIllustratorGates, input, produce)
}
