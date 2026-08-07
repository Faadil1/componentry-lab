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
  version: "1.0.0",
  supportedModes: ["DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["somatic-design", "bodily-response-art-direction"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: ["evaluatorType", "supplementaryFields.targetSensoryExperience"],
  outputSchemaId: "somatic-response-design-v1",
  qualityGateIds: [
    "srd.physical-vocabulary-present",
    "srd.art-direction-guidance-concrete",
    "srd.risk-areas-identified"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

// Somatic response vocabulary mapped to experience types
const SOMATIC_VOCABULARY: Record<string, string[]> = {
  tension:    ["tightening in the chest", "bracing, held breath", "forward lean and stillness"],
  release:    ["exhale of relief", "shoulder drop", "unclenching of jaw"],
  surprise:   ["micro-startle response", "eyebrow raise", "involuntary vocalization"],
  warmth:     ["softening of facial muscles", "slight smile activation", "open posture"],
  unease:     ["skin crawl sensation", "weight in the stomach", "desire to look away"],
  curiosity:  ["head tilt", "pupil dilation", "leaning forward"],
  awe:        ["held breath", "goosebumps", "arrested movement"]
}

function deriveTargetExperiences(subject: string, context: string): string[] {
  const combined = `${subject} ${context}`.toLowerCase()
  const experiences: string[] = []
  if (combined.includes("compet") || combined.includes("challenge") || combined.includes("judg"))  experiences.push("tension", "release")
  if (combined.includes("story") || combined.includes("music") || combined.includes("film"))        experiences.push("awe", "warmth")
  if (combined.includes("data") || combined.includes("insight") || combined.includes("analysis"))   experiences.push("curiosity", "surprise")
  if (combined.includes("danger") || combined.includes("risk") || combined.includes("unknown"))     experiences.push("unease", "tension")
  if (experiences.length === 0) experiences.push("curiosity", "warmth")
  return [...new Set(experiences)]
}

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  const targetExperience = input.supplementaryFields?.targetSensoryExperience

  // Step 1: Identify target sensory experiences
  const targetExperiences = targetExperience
    ? [targetExperience]
    : deriveTargetExperiences(subject, context)

  // Step 2: Map physical responses
  const physicalResponseMap = targetExperiences.map((exp) => ({
    experience: exp,
    physicalResponses: SOMATIC_VOCABULARY[exp] ?? [`unspecified somatic markers for "${exp}"`]
  }))

  // Step 3: Translate to art direction vocabulary
  const artDirectionGuides = physicalResponseMap.map((pm) => ({
    experience: pm.experience,
    artDirectionInstructions: [
      `To evoke "${pm.experience}" in "${subject}": design pacing and visual rhythm to provoke ${pm.physicalResponses[0]}.`,
      `Supporting physical response: aim to trigger ${pm.physicalResponses[1] ?? pm.physicalResponses[0]}.`,
      `Compositional cue: ${pm.physicalResponses[2] ?? "hold silence or stillness for at least 3 seconds"} should be observable from the audience.`
    ]
  }))

  // Step 4: Identify risk areas (numbing, dissonance)
  const riskAreas: string[] = []
  if (targetExperiences.includes("tension") && targetExperiences.includes("warmth")) {
    riskAreas.push("Tension and warmth combined without a clear release arc can produce emotional dissonance that numbs rather than engages.")
  }
  if (targetExperiences.includes("awe")) {
    riskAreas.push("Awe depends on earned build — applying awe-inducing techniques too early or too frequently causes desensitization.")
  }
  if (targetExperiences.length > 3) {
    riskAreas.push("More than 3 targeted somatic experiences risk incoherence — the audience cannot hold multiple physical states simultaneously.")
  }
  if (riskAreas.length === 0) {
    riskAreas.push("No critical somatic conflicts identified for this subject/context combination.")
  }

  // Step 5: Produce somatic design brief
  const primaryExperience = targetExperiences[0]
  const primaryPhysical = physicalResponseMap[0]?.physicalResponses ?? []
  const somaticBrief = [
    `SOMATIC DESIGN BRIEF — "${subject}"`,
    `Context: ${context}`,
    `Primary target somatic experience: ${primaryExperience}`,
    `Key physical markers to design toward: ${primaryPhysical.join("; ")}`,
    `Art direction priority: ${artDirectionGuides[0]?.artDirectionInstructions[0] ?? "No specific instruction."}`,
    `Risk mitigation: ${riskAreas[0]}`
  ].join("\n")

  const rawOutputs: Record<string, string> = {
    targetExperiences: targetExperiences.join(", "),
    physicalResponseMap: physicalResponseMap.map((p) => `${p.experience}: ${p.physicalResponses.join("; ")}`).join("\n"),
    artDirectionGuides: artDirectionGuides.map((g) => `${g.experience}:\n${g.artDirectionInstructions.join("\n")}`).join("\n\n"),
    riskAreas: riskAreas.join("\n"),
    somaticBrief
  }

  const outputSections = [
    {
      sectionKey: "target-experiences",
      label: "Target Somatic Experiences",
      content: `Primary experiences identified for "${subject}" in "${context}": ${targetExperiences.join(", ")}`
    },
    {
      sectionKey: "physical-response-map",
      label: "Physical Response Mapping",
      content: physicalResponseMap.map((p) => `${p.experience.toUpperCase()}: ${p.physicalResponses.join(" / ")}`).join("\n")
    },
    {
      sectionKey: "art-direction-guides",
      label: "Art Direction Guidance",
      content: artDirectionGuides.map((g) => `[${g.experience.toUpperCase()}]\n${g.artDirectionInstructions.join("\n")}`).join("\n\n")
    },
    {
      sectionKey: "risk-areas",
      label: "Risk Areas (Numbing / Dissonance)",
      content: riskAreas.join("\n")
    },
    {
      sectionKey: "somatic-brief",
      label: "Somatic Design Brief",
      content: somaticBrief
    }
  ]

  return {
    methodId: SOMATIC_RESPONSE_DESIGN_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Identify Target Sensory Experiences", instruction: `Derive primary somatic targets for "${subject}" in "${context}".`, outputKey: "targetExperiences" },
      { stepIndex: 2, label: "Map Physical Responses", instruction: "For each target experience, map the bodily/physical response markers.", outputKey: "physicalResponseMap" },
      { stepIndex: 3, label: "Translate to Art Direction", instruction: "Convert each physical response to concrete art direction instructions.", outputKey: "artDirectionGuides" },
      { stepIndex: 4, label: "Identify Risk Areas", instruction: "Check for numbing risks, dissonance, or overloading.", outputKey: "riskAreas" },
      { stepIndex: 5, label: "Produce Somatic Design Brief", instruction: "Synthesize a concise somatic brief for this project.", outputKey: "somaticBrief" }
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
    passCriteria: ["physicalResponseMap must contain at least one physical response description"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const content = result.rawOutputs.physicalResponseMap ?? ""
      const passed = content.trim().length > 20
      return {
        gateId: "srd.physical-vocabulary-present",
        label: "Physical Vocabulary Present",
        passed,
        failReasons: passed ? [] : ["physicalResponseMap is empty or too short — concrete somatic vocabulary is required."]
      }
    }
  },
  {
    gateId: "srd.art-direction-guidance-concrete",
    label: "Art Direction Guidance Is Concrete",
    description: "Art direction must contain actionable instructions, not abstract descriptions.",
    passCriteria: ["artDirectionGuides must contain action verbs and specific sensory cues"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const content = result.rawOutputs.artDirectionGuides ?? ""
      const actionWords = ["design", "aim", "hold", "trigger", "provoke", "observable"]
      const hasActionWords = actionWords.some((w) => content.toLowerCase().includes(w))
      const passed = content.trim().length > 30 && hasActionWords
      return {
        gateId: "srd.art-direction-guidance-concrete",
        label: "Art Direction Guidance Is Concrete",
        passed,
        failReasons: passed ? [] : ["Art direction guidance lacks concrete action verbs or specific somatic cues."]
      }
    }
  },
  {
    gateId: "srd.risk-areas-identified",
    label: "Risk Areas Identified",
    description: "At least one risk area (numbing, dissonance, or overloading) must be identified.",
    passCriteria: ["riskAreas output must be non-empty"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const content = result.rawOutputs.riskAreas ?? ""
      const passed = content.trim().length > 10
      return {
        gateId: "srd.risk-areas-identified",
        label: "Risk Areas Identified",
        passed,
        failReasons: passed ? [] : ["No risk areas were identified for this somatic design."]
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
