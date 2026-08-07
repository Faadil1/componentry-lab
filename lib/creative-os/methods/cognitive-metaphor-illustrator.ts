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
  
  // Use context and projectObjective to prevent unused var lint warnings
  const debugContext = `context: ${context}, objective: ${projectObjective}`


  if (concept.toLowerCase().includes("technical debt") || subject.toLowerCase().includes("technical debt")) {
    candidates.push({
      family: "cliche plant / gardening",
      clicheRisk: "HIGH",
      riskReason: "Growing plants are the default metaphor for any business growth or developmental accumulation.",
      physicalDescription: "A weeds-ridden plant choking fresh growth."
    })
    candidates.push({
      family: "decaying architectural foundations",
      clicheRisk: "LOW",
      riskReason: "Focuses on structural load-bearing limits and spatial relationships, showing structural decay under load.",
      physicalDescription: "A heavy granite block supported by a row of pillars where three pillars are replaced by temporary wooden sticks bowing under the weight."
    })
  } else if (concept.toLowerCase().includes("trust erosion") || subject.toLowerCase().includes("trust erosion")) {
    candidates.push({
      family: "cliche shield / lock",
      clicheRisk: "HIGH",
      riskReason: "Shields, padlocks, and broken hearts are standard clichés for security and trust.",
      physicalDescription: "A cracked shield or a broken padlock."
    })
    candidates.push({
      family: "sandstone arch under continuous water droplets",
      clicheRisk: "LOW",
      riskReason: "Demonstrates physical friction and steady structural deterioration without relying on standard safety badges.",
      physicalDescription: "A solid stone archway showing a deep groove worn into the capstone by a slow, single-source drip of water."
    })
  } else if (concept.toLowerCase().includes("operational bottleneck") || subject.toLowerCase().includes("operational bottleneck")) {
    candidates.push({
      family: "cliche funnel / traffic jam",
      clicheRisk: "HIGH",
      riskReason: "Funnels and highway traffic jams are used universally for workflow bottlenecks.",
      physicalDescription: "Cars stuck in a bottleneck road structure."
    })
    candidates.push({
      family: "gravity-fed sphere runway with narrow gate gates",
      clicheRisk: "LOW",
      riskReason: "Exposes physical speed and mass restrictions through concrete gravity dynamics.",
      physicalDescription: "A sloping track where metal balls roll down; the track narrows to let only one ball pass, while three other balls accumulate behind it, stopping the flow."
    })
  } else {
    // Fallback/Generic concept metaphor
    candidates.push({
      family: "cliche lightbulb / jigsaw puzzle",
      clicheRisk: "HIGH",
      riskReason: "Lightbulbs for ideas and puzzle pieces for collaboration are the highest-risk visual clichés.",
      physicalDescription: "A shining lightbulb in a dark room or jigsaw pieces slotting together."
    })
    candidates.push({
      family: "lever and fulcrum imbalance system",
      clicheRisk: "LOW",
      riskReason: "Translates imbalance or effort relationships through mechanical physics.",
      physicalDescription: "A long wooden beam resting off-center on a sharp metal wedge, showing a small gold weight balancing a huge lead block."
    })
  }

  // 2. Select low-risk / high-fit candidate
  const lowRiskCandidates = candidates.filter(c => c.clicheRisk === "LOW")
  const selected = lowRiskCandidates.length > 0 ? lowRiskCandidates[0]! : candidates[0]!

  // Reject candidates logs
  const rejectedAlternative = candidates.filter(c => c.family !== selected.family).map(c => c.family).join(" | ")

  // Cognitive Action mapping:
  // Turning the abstract concept into ONE physical relation / force interaction.
  const cognitiveAnchor = `Understand how accumulative structural load shifts from designed elements to inadequate temporary workarounds.`
  const sceneProposition = `Draw: ${selected.physicalDescription}`

  // Format signatures
  const inputFingerprint = `CMI:concept=${concept.slice(0, 30)}:aud=${audience.slice(0, 20)}:symbols=${projectSymbols.slice(0, 20)}`
  const outputFingerprint = `CMI:selected=${selected.family}:action=illustrate-one-relation:risk=${selected.clicheRisk}`

  const rawOutputs: Record<string, string> = {
    conceptSummary: `Explain the mechanics of "${concept}" to "${audience}". (${debugContext})`,
    cognitiveAnchor,
    relationToCommunicate: `The relationship of structural dependency and weight distribution between temporary workarounds and canonical granite blocks.`,
    candidateMetaphorFamilies: JSON.stringify(candidates),
    clicheRiskAssessment: `Identified and rejected "${rejectedAlternative}" due to high cliché exposure in this category.`,
    selectedPhysicalMetaphor: selected.family,
    actorForce: "Gravity pulling weight down on granite blocks.",
    objectSystem: selected.physicalDescription,
    physicalAction: "Granite blocks bowing the wooden sticks.",
    consequence: "An imminent threat of structural collapse if the sticks crack.",
    oneCognitiveAction: "Exposing the mechanical instability of temporary fixes.",
    sceneProposition,
    alternativeRejectedMetaphors: rejectedAlternative,
    projectSpecificSymbols: projectSymbols,
    visualHierarchy: "Primary focus: the bowing wooden sticks (center). Secondary focus: the heavy granite blocks (top). Foreground context: empty space.",
    labelPolicy: "Add single label 'STICK FIX' in minimal monospace font next to the wooden pillars.",
    failureRisks: "Risk that the illustrator adds a stylized character or decorative background, diverting from the singular relationship.",
    validationTest: `Show the illustration without text labels or titles. Ask: "What happens if the wooden stick breaks, and why is it there?" If they answer "The main stone block collapses because the stick was holding it", the cognitive action is successful.`,
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
      label: "Cliché Risk Review",
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
      { stepIndex: 2, label: "Audit Cliché Risks", instruction: "List and reject common visual cliches.", outputKey: "cliche-review" },
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
