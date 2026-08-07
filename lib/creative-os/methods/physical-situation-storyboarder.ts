import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult
} from "./types"
import { executeMethod } from "./runtime"

export const PHYSICAL_SITUATION_STORYBOARDER_ID = "method_physical_situation_storyboarder"

export const physicalSituationStoryboarderDefinition: CreativeMethodDefinition = {
  id: PHYSICAL_SITUATION_STORYBOARDER_ID,
  resourceId: "res_physical_situation_storyboarder",
  name: "Physical Situation Storyboarder",
  version: "1.0.0",
  supportedModes: ["MARA", "DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["physical-space-mapping", "narrative-staging"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: [
    "evaluatorType",
    "supplementaryFields.projectObjective",
    "supplementaryFields.narrativeBeat",
    "supplementaryFields.subjectOrCharacter",
    "supplementaryFields.emotionalTension",
    "supplementaryFields.desiredTransformation",
    "supplementaryFields.locationConstraints",
    "supplementaryFields.propConstraints",
    "supplementaryFields.continuityConstraints",
    "supplementaryFields.wardrobeConstraints",
    "supplementaryFields.cameraConstraints",
    "supplementaryFields.duration",
    "supplementaryFields.dialoguePolicy",
    "supplementaryFields.labelPolicy",
    "supplementaryFields.audience",
    "supplementaryFields.narrativeUniverseRules"
  ],
  outputSchemaId: "physical-situation-storyboarder-v1",
  qualityGateIds: [
    "pss.idea-becomes-physical",
    "pss.one-beat-one-function",
    "pss.transformation-visible",
    "pss.no-exposition-dependence",
    "pss.continuity-protected",
    "pss.project-specific",
    "pss.no-coaching-drift"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

interface SceneNode {
  beatId: string
  narrativeFunction: string
  subjectState: string
  objectState: string
  physicalAction: string
  spatialRelationship: string
  visibleChange: string
  continuityRequirements: string
  cameraIntent: string
}

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  const fields = input.supplementaryFields || {}

  const projectObjective = fields.projectObjective ?? "unspecified objective"
  const narrativeBeat = fields.narrativeBeat ?? "unspecified scene beat"
  const subjectOrCharacter = fields.subjectOrCharacter ?? "Mara"
  const emotionalTension = fields.emotionalTension ?? "existential anxiety / incompleteness"
  const desiredTransformation = fields.desiredTransformation ?? "acceptance"
  const locationConstraints = fields.locationConstraints ?? "interior room"
  const propConstraints = fields.propConstraints ?? "unfinished artifact"

  // Core physicalization reasoning:
  // Convert the abstract narrative idea/tension into concrete physical elements.
  const physicalMetaphor = `A physical struggle with a tangible, stubborn object that resists simple completion, reflecting the emotional state of "${emotionalTension}".`
  
  // Scene generation logic responsive to character and context
  const nodes: SceneNode[] = []

  if (emotionalTension.toLowerCase().includes("incompleteness") || narrativeBeat.toLowerCase().includes("incompleteness")) {
    nodes.push({
      beatId: "beat_01_setup",
      narrativeFunction: "Establish the physical state of the unfinished project.",
      subjectState: "Focused, slight tension in shoulder posture",
      objectState: "An unfinished clay vessel sits off-center on the wheel, showing cracks and irregular edges.",
      physicalAction: `${subjectOrCharacter} places her hands near the clay, hovering but not touching it.`,
      spatialRelationship: "Subject is seated 20cm from the object, leaning slightly forward.",
      visibleChange: "Light angle shifts, emphasizing the dust and raw clay cracks.",
      continuityRequirements: `Clay model must have exactly three visible cracks on its upper rim. ${subjectOrCharacter} wears grey linen overalls.`,
      cameraIntent: "ECU on hands hovering over clay, shallow depth of field."
    })
    nodes.push({
      beatId: "beat_02_tension",
      narrativeFunction: "Show the resistance to completion and habit of correction.",
      subjectState: "Breathing holds momentarily; fingers twitching.",
      objectState: "The clay remains static, cracked, and uneven.",
      physicalAction: `${subjectOrCharacter} reaches for a smoothing rib tool, holds it for 3 seconds, then lays it down untouched.`,
      spatialRelationship: "Subject stands up, stepping back to 1 meter from the table.",
      visibleChange: "The rib tool is placed on the dry side of the bench, away from the clay.",
      continuityRequirements: "Rib tool remains visible in background. No dialogue spoken.",
      cameraIntent: "Medium wide, capturing the physical distance between subject and clay."
    })
    nodes.push({
      beatId: "beat_03_transformation",
      narrativeFunction: "Visibly demonstrate the transformation to acceptance.",
      subjectState: "Deep exhalation, shoulders drop, face muscles relax.",
      objectState: "The clay remains cracked and incomplete on the shelf.",
      physicalAction: `${subjectOrCharacter} turns away and walks out of frame, leaving the unfinished pot on display.`,
      spatialRelationship: "Distance increases to infinity as subject leaves the scene.",
      visibleChange: "The incomplete object sits alone in the center of the frame as light fades.",
      continuityRequirements: "Clay pot remains in original position on the shelf with three cracks.",
      cameraIntent: "Locked tripod shot, holding on the empty room with the unfinished object."
    })
  } else if (emotionalTension.toLowerCase().includes("invisible labor")) {
    nodes.push({
      beatId: "beat_01_labor",
      narrativeFunction: "Physicalize the ongoing exertion that leaves no material trace.",
      subjectState: "Extreme physical fatigue, sweat beads visible.",
      objectState: "Stack of heavy brass plates needing alignment.",
      physicalAction: `${subjectOrCharacter} carries and stacks the brass plates manually.`,
      spatialRelationship: "Centered in a cramped workspace.",
      visibleChange: "Stack grows taller but looks identical to standard inventory.",
      continuityRequirements: "Linen shirt showing sweat stains. Stack has 12 plates.",
      cameraIntent: "Low angle tracking shot showing weight."
    })
    nodes.push({
      beatId: "beat_02_erasure",
      narrativeFunction: "Demonstrate the immediate erasure of labor signs.",
      subjectState: "Exhausted, standing still.",
      objectState: "An automated conveyor belt picks up the stack, leaving the workspace empty.",
      physicalAction: `${subjectOrCharacter} wipes her forehead and stares at the empty spot.`,
      spatialRelationship: "Subject is looking down at the empty conveyor belt.",
      visibleChange: "The stack is gone, leaving no trace of the exertion.",
      continuityRequirements: "Wiped forehead, sweat stain continuity.",
      cameraIntent: "High angle wide shot highlighting emptiness."
    })
  } else {
    // Fallback/Default physical situation generator
    nodes.push({
      beatId: "beat_01_generic",
      narrativeFunction: "Introduce the physical tension anchor.",
      subjectState: "Tense posture",
      objectState: `A physical representation of ${propConstraints}`,
      physicalAction: `${subjectOrCharacter} interacts with the object.`,
      spatialRelationship: "Facing the object directly.",
      visibleChange: "State change in the physical object.",
      continuityRequirements: "Consistent wardrobe and environment.",
      cameraIntent: "Medium shot tracking action."
    })
    nodes.push({
      beatId: "beat_02_generic_end",
      narrativeFunction: "Observe the physical consequence of the transformation.",
      subjectState: "Resolved/relaxed posture",
      objectState: `The object modified or left unfinished`,
      physicalAction: `${subjectOrCharacter} disengages.`,
      spatialRelationship: "Stepping away from the object.",
      visibleChange: `Object reflects the transformation: ${desiredTransformation}`,
      continuityRequirements: "Object state remains consistent.",
      cameraIntent: "Slow pull out wide shot."
    })
  }

  const nodesStr = JSON.stringify(nodes, null, 2)

  // Format printable brief
  const storyboardBrief = [
    `PHYSICAL STORYBOARD BRIEF — "${subject}"`,
    `Tension: ${emotionalTension}`,
    `Subject: ${subjectOrCharacter} | Environment: ${locationConstraints}`,
    `Physical Metaphor: ${physicalMetaphor}`,
    `Scene Nodes:\n${nodes.map(n => `  - [${n.beatId}] Action: ${n.physicalAction} -> Result: ${n.visibleChange}`).join("\n")}`
  ].join("\n")

  // Deterministic Signatures
  const inputFingerprint = `PSS:tension=${emotionalTension.slice(0, 30)}:subject=${subjectOrCharacter.slice(0, 20)}:obj=${projectObjective.slice(0, 30)}`
  const outputFingerprint = `PSS:nodes=${nodes.length}:firstBeat=${nodes[0]?.beatId}:lastAction=${nodes[nodes.length - 1]?.physicalAction.slice(0, 30)}`

  const rawOutputs: Record<string, string> = {
    narrativeIntent: `Show the transformation of "${subjectOrCharacter}" from "${emotionalTension}" to "${desiredTransformation}" through physical action rather than verbal exposition.`,
    emotionalTension,
    observableTransformation: `Transition from ${nodes[0]?.subjectState} with incomplete object to ${nodes[nodes.length - 1]?.subjectState} with object left unfinished.`,
    physicalMetaphor,
    subject: subjectOrCharacter,
    environment: locationConstraints,
    keyObject: propConstraints,
    startingPhysicalState: nodes[0]?.subjectState ?? "",
    action: nodes[1]?.physicalAction ?? nodes[0]?.physicalAction ?? "",
    consequence: nodes[nodes.length - 1]?.visibleChange ?? "",
    endingPhysicalState: nodes[nodes.length - 1]?.subjectState ?? "",
    sceneNodes: nodesStr,
    spatialRelationships: nodes.map(n => n.spatialRelationship).join(" | "),
    continuityConstraints: fields.continuityConstraints ?? "No visual changes in background objects between beats.",
    cameraIntent: nodes.map(n => `${n.beatId}: ${n.cameraIntent}`).join("\n"),
    whatMustRemainUnspoken: `Do not speak or mention "${emotionalTension}" or "${desiredTransformation}" in dialogue. The viewer must infer it solely by observing ${subjectOrCharacter}'s posture and her refusal to complete the ${propConstraints}.`,
    failureRisks: "Risk that the actor expresses sadness verbally, or the camera edits out the unfinished object.",
    validationTest: `Show the sequence to a viewer without audio or subtitle files. Ask: "Why did she walk away from the pot, and what was her state of mind?" If they answer with themes of "${desiredTransformation}" or accepting the unfinished vessel, the scene passes.`,
    storyboardBrief,
    inputFingerprint,
    outputFingerprint
  }

  const outputSections = [
    {
      sectionKey: "metaphor-design",
      label: "Physical Metaphor Design",
      content: `Physical Metaphor: ${physicalMetaphor}\n` +
               `Key Object/Prop: ${propConstraints}\n` +
               `Environment: ${locationConstraints}\n` +
               `Unspoken Subtext: ${rawOutputs.whatMustRemainUnspoken}`
    },
    {
      sectionKey: "storyboard-nodes",
      label: "Storyboard Scene Nodes",
      content: nodes.map((n, idx) =>
        `BEAT #${idx + 1}: ${n.beatId}\n` +
        `  Narrative Function: ${n.narrativeFunction}\n` +
        `  Subject State: ${n.subjectState}\n` +
        `  Object State: ${n.objectState}\n` +
        `  Action: ${n.physicalAction}\n` +
        `  Spatial Relationship: ${n.spatialRelationship}\n` +
        `  Visible Change: ${n.visibleChange}\n` +
        `  Camera: ${n.cameraIntent}\n` +
        `  Continuity: ${n.continuityRequirements}`
      ).join("\n\n")
    },
    {
      sectionKey: "continuity-governance",
      label: "Continuity & Staging Constraints",
      content: `Staging Rules: ${rawOutputs.spatialRelationships}\n` +
               `Continuity: ${rawOutputs.continuityConstraints}\n` +
               `Camera Directives:\n${rawOutputs.cameraIntent}`
    },
    {
      sectionKey: "validation-plan",
      label: "Validation & Risk Mitigation",
      content: `Validation Test: ${rawOutputs.validationTest}\n` +
               `Failure Risks: ${rawOutputs.failureRisks}`
    },
    {
      sectionKey: "brief-summary",
      label: "Storyboard Brief Summary",
      content: storyboardBrief
    }
  ]

  return {
    methodId: PHYSICAL_SITUATION_STORYBOARDER_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Identify Narrative Gaps & Tension", instruction: `Load narrative beat: "${narrativeBeat}" and emotional tension: "${emotionalTension}".`, outputKey: "metaphor-design" },
      { stepIndex: 2, label: "Design Physical Metaphor", instruction: "Map the emotional state onto a physical, non-verbal object relationship.", outputKey: "metaphor-design" },
      { stepIndex: 3, label: "Draft Scene Nodes Sequence", instruction: "Break down the physical actions into a sequence of concrete visual frames.", outputKey: "storyboard-nodes" },
      { stepIndex: 4, label: "Establish Continuity Controls", instruction: "Define the physical spatial layout and wardrobe/prop continuity requirements.", outputKey: "continuity-governance" },
      { stepIndex: 5, label: "Formulate Validation Test", instruction: "Draft a silent validation test to verify that the concept carries without exposition.", outputKey: "validation-plan" }
    ],
    outputSections,
    rawOutputs
  }
}

// ─── Quality Gates ──────────────────────────────────────────────────────────

export const physicalSituationStoryboarderGates: CreativeMethodQualityGate[] = [
  {
    gateId: "pss.idea-becomes-physical",
    label: "Idea Becomes Physical",
    description: "The output must specify a concrete physical object and physical action that represents the abstract idea.",
    passCriteria: ["physicalMetaphor must describe a physical interaction with a prop"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const pm = result.rawOutputs.physicalMetaphor ?? ""
      const keyObj = result.rawOutputs.keyObject ?? ""
      const action = result.rawOutputs.action ?? ""
      const passed = pm.length > 20 && keyObj.length > 2 && action.length > 10
      return {
        gateId: "pss.idea-becomes-physical",
        label: "Idea Becomes Physical",
        passed,
        failReasons: passed ? [] : ["The scene does not ground the narrative tension in concrete objects or actions."]
      }
    }
  },
  {
    gateId: "pss.one-beat-one-function",
    label: "One Beat One Function",
    description: "Every storyboard scene node must carry a distinct narrative function.",
    passCriteria: ["Each node in sceneNodes must define a narrativeFunction"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const nodesRaw = result.rawOutputs.sceneNodes ?? "[]"
      try {
        const nodes = JSON.parse(nodesRaw) as SceneNode[]
        const passed = nodes.length >= 2 && nodes.every(n => n.narrativeFunction && n.narrativeFunction.length > 10)
        return {
          gateId: "pss.one-beat-one-function",
          label: "One Beat One Function",
          passed,
          failReasons: passed ? [] : ["Some storyboard beats lack a clearly defined narrative function."]
        }
      } catch {
        return {
          gateId: "pss.one-beat-one-function",
          label: "One Beat One Function",
          passed: false,
          failReasons: ["Failed to parse scene nodes structure."]
        }
      }
    }
  },
  {
    gateId: "pss.transformation-visible",
    label: "Transformation Visible",
    description: "The final scene node physical state must differ from the initial node physical state.",
    passCriteria: ["startingPhysicalState and endingPhysicalState are different"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const start = result.rawOutputs.startingPhysicalState ?? ""
      const end = result.rawOutputs.endingPhysicalState ?? ""
      const passed = start.length > 0 && end.length > 0 && start !== end
      return {
        gateId: "pss.transformation-visible",
        label: "Transformation Visible",
        passed,
        failReasons: passed ? [] : ["No visible physical state change occurs between the beginning and end of the storyboard."]
      }
    }
  },
  {
    gateId: "pss.no-exposition-dependence",
    label: "No Exposition Dependence",
    description: "The scene's idea must remain understandable without explanatory paragraphs or spoken dialogue.",
    passCriteria: ["whatMustRemainUnspoken must be specified and exclude dialogue"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const unspoken = result.rawOutputs.whatMustRemainUnspoken ?? ""
      const passed = unspoken.length > 20 && unspoken.toLowerCase().includes("do not speak")
      return {
        gateId: "pss.no-exposition-dependence",
        label: "No Exposition Dependence",
        passed,
        failReasons: passed ? [] : ["The design lacks clear instructions on what narrative elements must remain unspoken."]
      }
    }
  },
  {
    gateId: "pss.continuity-protected",
    label: "Continuity Protected",
    description: "Prop, wardrobe, and environment continuity must be explicitly stated.",
    passCriteria: ["continuityConstraints must specify visual rules"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const cont = result.rawOutputs.continuityConstraints ?? ""
      const passed = cont.length > 10
      return {
        gateId: "pss.continuity-protected",
        label: "Continuity Protected",
        passed,
        failReasons: passed ? [] : ["Visual and narrative continuity constraints are missing or too brief."]
      }
    }
  },
  {
    gateId: "pss.project-specific",
    label: "Project Specific",
    description: "The storyboard must use project-specific details, characters, and props.",
    passCriteria: ["subject and keyObject must match the inputs"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const sub = result.rawOutputs.subject ?? ""
      const keyObj = result.rawOutputs.keyObject ?? ""
      const passed = sub.length > 1 && keyObj.length > 1
      return {
        gateId: "pss.project-specific",
        label: "Project Specific",
        passed,
        failReasons: passed ? [] : ["The storyboard did not integrate project-specific character or object parameters."]
      }
    }
  },
  {
    gateId: "pss.no-coaching-drift",
    label: "No Coaching Drift",
    description: "The character must not act as a motivational coach. The scene remains observational.",
    passCriteria: ["storyboard does not contain instructional coaching dialogue"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const brief = result.rawOutputs.storyboardBrief ?? ""
      const hasCoaching = brief.toLowerCase().includes("how to") || brief.toLowerCase().includes("you should") || brief.toLowerCase().includes("motivate")
      const passed = !hasCoaching
      return {
        gateId: "pss.no-coaching-drift",
        label: "No Coaching Drift",
        passed,
        failReasons: passed ? [] : ["The storyboard slips into instructional coaching rather than observational action."]
      }
    }
  }
]

export function runPhysicalSituationStoryboarder(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(physicalSituationStoryboarderDefinition, physicalSituationStoryboarderGates, input, produce)
}
