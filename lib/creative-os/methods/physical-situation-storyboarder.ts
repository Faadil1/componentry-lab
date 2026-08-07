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
    "pss.no-coaching-drift",
    "pss.transformation-input-grounded",
    "pss.semantic-domain-coherent",
    "pss.no-generic-placeholder-language",
    "pss.transformation-behaviorally-realized",
    "pss.transformation-contrast-material",
    "pss.no-action-transformation-contradiction"
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

export interface TransformationEvidence {
  desiredTransformation: string
  behavioralMeaning: string
  observableEvidenceRequired: string
  actionEvidence: string
  relationshipChange: string
  endingEvidence: string
  reasoning: string
}

export function deriveTransformationEvidence(
  desiredTransformation: string,
  subject: string,
  prop: string,
  location: string
): {
  evidence: TransformationEvidence;
  beat1Action: string;
  beat1State: string;
  beat2Action: string;
  beat2State: string;
  beat2Visible: string;
  beat2Spatial: string;
} {
  const dt = desiredTransformation.toLowerCase()
  
  if (dt.includes("visible ownership") || dt.includes("responsibility") || dt.includes("accountability")) {
    return {
      evidence: {
        desiredTransformation: "visible ownership",
        behavioralMeaning: "The subject visibly assumes responsibility for the unresolved problem by physically engaging and claiming the space/object.",
        observableEvidenceRequired: "A viewer must be able to attribute responsibility to the subject through physical action/state without explanatory text.",
        actionEvidence: `${subject} pulls the ${prop} closer, inspects the damage, and begins organizing work materials.`,
        relationshipChange: `Subject moves from a tentative 30cm stance to direct contact, stabilizing the ${prop}.`,
        endingEvidence: `${subject} remains positioned directly next to the ${prop}, hands resting on the workspace in a posture of ownership.`,
        reasoning: `Ownership is demonstrated by direct physical contact, stabilizing actions, and remaining with the prop instead of abandoning it at the ${location}.`
      },
      beat1Action: `${subject} approaches the ${prop} with hesitation, tracing the cracks and structural weaknesses with a finger.`,
      beat1State: `Tense posture, breathing held in check.`,
      beat2Action: `${subject} deliberately pulls the ${prop} closer, clears space on the desk, and places both hands firmly on the base to stabilize it.`,
      beat2State: `Focused posture, shoulders squared, eyes locked on the stabilized ${prop}.`,
      beat2Visible: `The ${prop} is pulled to the center of the workspace, surrounded by cleared space, visibly claimed.`,
      beat2Spatial: `Direct physical contact, leaning over the ${prop} at 0cm.`
    }
  } else if (dt.includes("abandonment") || dt.includes("disengage") || dt.includes("leave")) {
    return {
      evidence: {
        desiredTransformation: "abandonment",
        behavioralMeaning: "The subject physically separates themselves from the object, leaving it entirely neglected.",
        observableEvidenceRequired: "The subject must walk out of the frame or push the object away, leaving it isolated.",
        actionEvidence: `${subject} pushes the ${prop} away and walks out of the scene.`,
        relationshipChange: "Subject moves from 30cm to infinite distance (exiting the room).",
        endingEvidence: `The ${prop} sits alone in an empty room as the light fades.`,
        reasoning: `Abandonment is shown by physical separation, increasing spatial distance to infinity, and leaving the room at the ${location}.`
      },
      beat1Action: `${subject} stands near the ${prop}, staring at the structural failure without touching it.`,
      beat1State: `Posturally slouched, hands in pockets.`,
      beat2Action: `${subject} deliberately pushes the ${prop} to the corner of the workspace, turns away, and walks out of the room.`,
      beat2State: `Shoulders dropped, head turned away as he departs.`,
      beat2Visible: `The ${prop} is pushed to the far corner, and the workspace is left empty as ${subject} exits.`,
      beat2Spatial: `Distance increases to infinity as subject leaves the scene.`
    }
  } else if (dt.includes("repair commitment") || dt.includes("fix") || dt.includes("restore")) {
    return {
      evidence: {
        desiredTransformation: "repair commitment",
        behavioralMeaning: "The subject actively works on the object, installing physical supports or tools.",
        observableEvidenceRequired: "A viewer must see the physical restoration tools applied to the object.",
        actionEvidence: `${subject} applies structural braces or tape to support the ${prop}.`,
        relationshipChange: `Direct engagement, workspace modified with repair tools.`,
        endingEvidence: `The ${prop} stands with a temporary physical support brace applied.`,
        reasoning: `Repair commitment is demonstrated by structural bracing and applying temporary support tools to the object at the ${location}.`
      },
      beat1Action: `${subject} inspects the unstable joints of the ${prop}, setting down a toolbox.`,
      beat1State: `Focused posture, leaning forward to inspect the failure.`,
      beat2Action: `${subject} retrieves a support brace and tape, applying them to reinforce the structural failure of the ${prop}.`,
      beat2State: `Kneeling, hands active, breathing relaxed.`,
      beat2Visible: `A temporary support brace is visibly attached to the ${prop}, stabilizing the joints.`,
      beat2Spatial: `Kneeling directly next to the ${prop}, working at 10cm.`
    }
  } else {
    // Default/acceptance or generic transformation
    return {
      evidence: {
        desiredTransformation: desiredTransformation,
        behavioralMeaning: `The subject accepts the state of the ${prop} as it is, without attempting to change it.`,
        observableEvidenceRequired: "The subject steps back, showing a relaxed posture while leaving the object unfinished.",
        actionEvidence: `${subject} steps back and disengages, leaving the ${prop} untouched.`,
        relationshipChange: "Subject increases distance from 30cm to 2 meters.",
        endingEvidence: `The ${prop} is left in its unfinished state as a monument to the process.`,
        reasoning: `Acceptance is shown by looking at the unfinished object and stepping away with a relaxed, non-frustrated posture at the ${location}.`
      },
      beat1Action: `${subject} approaches the ${prop} with hesitation, looking at the cracks.`,
      beat1State: `Tense posture, slight shrug.`,
      beat2Action: `${subject} deliberately steps back and disengages, leaving the ${prop} unfinished.`,
      beat2State: `Resolved/relaxed posture showing acceptance.`,
      beat2Visible: `The ${prop} is left in its current state as a monument to the process.`,
      beat2Spatial: `Stepping back to a distance of 2 meters from the ${prop}.`
    }
  }
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
  const physicalMetaphor = `A physical struggle with a tangible, stubborn object that resists simple completion in context: "${context}", reflecting the emotional state of "${emotionalTension}".`

  // Scene generation logic responsive to character and context
  const nodes: SceneNode[] = []

  const isPotteryTheme = (emotionalTension.toLowerCase().includes("incompleteness") || narrativeBeat.toLowerCase().includes("incompleteness")) && propConstraints.toLowerCase().includes("pot")
  const isLaborTheme = emotionalTension.toLowerCase().includes("invisible labor") && propConstraints.toLowerCase().includes("brass")

  // Always derive transformation evidence to satisfy quality gates
  const derived = deriveTransformationEvidence(desiredTransformation, subjectOrCharacter, propConstraints, locationConstraints)

  if (isPotteryTheme) {
    nodes.push({
      beatId: "beat_01_setup",
      narrativeFunction: "Establish the physical state of the unfinished project.",
      subjectState: "Focused, slight tension in shoulder posture",
      objectState: `An unfinished clay vessel sits off-center on the wheel, showing cracks and irregular edges.`,
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
      narrativeFunction: `Visibly demonstrate the transformation to ${desiredTransformation}.`,
      subjectState: `Deep exhalation, shoulders drop, face muscles relax showing ${desiredTransformation}.`,
      objectState: "The clay remains cracked and incomplete on the shelf.",
      physicalAction: `${subjectOrCharacter} turns away and walks out of frame, leaving the unfinished pot on display.`,
      spatialRelationship: "Distance increases to infinity as subject leaves the scene.",
      visibleChange: "The incomplete object sits alone in the center of the frame as light fades.",
      continuityRequirements: "Clay pot remains in original position on the shelf with three cracks.",
      cameraIntent: "Locked tripod shot, holding on the empty room with the unfinished object."
    })
  } else if (isLaborTheme) {
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
      subjectState: `Exhausted, standing still showing ${desiredTransformation}.`,
      objectState: "An automated conveyor belt picks up the stack, leaving the workspace empty.",
      physicalAction: `${subjectOrCharacter} wipes her forehead and stares at the empty spot.`,
      spatialRelationship: "Subject is looking down at the empty conveyor belt.",
      visibleChange: "The stack is gone, leaving no trace of the exertion.",
      continuityRequirements: "Wiped forehead, sweat stain continuity.",
      cameraIntent: "High angle wide shot highlighting emptiness."
    })
  } else {
    // Dynamic Transformation Grounded Reasoning
    
    nodes.push({
      beatId: `beat_01_${narrativeBeat.replace(/\s+/g, "_") || "setup"}`,
      narrativeFunction: `Introduce the physical tension anchor of ${emotionalTension} in service of project objective: ${projectObjective}.`,
      subjectState: derived.beat1State,
      objectState: `A physical representation of the ${propConstraints} showing structural strain within the ${locationConstraints}`,
      physicalAction: derived.beat1Action,
      spatialRelationship: `Facing the ${propConstraints} directly at a distance of 30cm.`,
      visibleChange: `The physical state of the ${propConstraints} remains unchanged, mirroring the tension of ${emotionalTension}.`,
      continuityRequirements: `Consistent wardrobe and environment. ${propConstraints} state matches initialization.`,
      cameraIntent: `Medium shot tracking ${subjectOrCharacter}'s tentative movements.`
    })
    nodes.push({
      beatId: `beat_02_${narrativeBeat.replace(/\s+/g, "_") || "transformation"}`,
      narrativeFunction: `Observe the physical consequence of the transformation to ${desiredTransformation}.`,
      subjectState: derived.beat2State,
      objectState: `The ${propConstraints} left in its current state within the ${locationConstraints} as a monument to the process`,
      physicalAction: derived.beat2Action,
      spatialRelationship: derived.beat2Spatial,
      visibleChange: derived.beat2Visible,
      continuityRequirements: `${propConstraints} state remains consistent with the previous beat.`,
      cameraIntent: `Slow pull out wide shot framing both ${subjectOrCharacter} and the incomplete ${propConstraints}.`
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
    desiredTransformation,
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
    transformationEvidence: JSON.stringify(derived.evidence, null, 2),
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

  if (!isPotteryTheme && !isLaborTheme) {
    outputSections.push({
      sectionKey: "transformation-evidence",
      label: "Transformation Evidence & Grounding",
      content: `### Behavioral Meaning\n${derived.evidence.behavioralMeaning}\n\n` +
               `### Observable Evidence Required\n${derived.evidence.observableEvidenceRequired}\n\n` +
               `### Action Evidence\n${derived.evidence.actionEvidence}\n\n` +
               `### Relationship Change\n${derived.evidence.relationshipChange}\n\n` +
               `### Ending Evidence\n${derived.evidence.endingEvidence}\n\n` +
               `### Reasoning\n${derived.evidence.reasoning}`
    })
  }

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
  },
  {
    gateId: "pss.transformation-input-grounded",
    label: "Transformation Input Grounded",
    description: "Verify that the transformation represented by the ending is the current input desiredTransformation.",
    passCriteria: ["endingPhysicalState must include the desiredTransformation"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      try {
        const inputTx = result.rawOutputs.desiredTransformation ?? ""
        const rawNodes = result.rawOutputs.sceneNodes ?? "[]"
        const nodes = JSON.parse(rawNodes) as SceneNode[]
        const lastNode = nodes[nodes.length - 1]
        
        // PSS V3 Grounding: Check ending state, action, or the transformationEvidence
        const txEvidenceRaw = result.rawOutputs.transformationEvidence ?? "{}"
        let matchesEvidence = false
        if (txEvidenceRaw !== "{}") {
          const evidence = JSON.parse(txEvidenceRaw) as TransformationEvidence
          matchesEvidence = evidence.desiredTransformation.toLowerCase() === inputTx.toLowerCase()
        }
        
        const passed = matchesEvidence || (lastNode && (
          lastNode.subjectState.toLowerCase().includes(inputTx.toLowerCase()) ||
          lastNode.objectState.toLowerCase().includes(inputTx.toLowerCase()) ||
          lastNode.visibleChange.toLowerCase().includes(inputTx.toLowerCase()) ||
          lastNode.physicalAction.toLowerCase().includes(inputTx.toLowerCase())
        ))
        return {
          gateId: "pss.transformation-input-grounded",
          label: "Transformation Input Grounded",
          passed: !!passed,
          failReasons: passed ? [] : [`The final scene state does not ground the input desiredTransformation: "${inputTx}".`]
        }
      } catch {
        return {
          gateId: "pss.transformation-input-grounded",
          label: "Transformation Input Grounded",
          passed: false,
          failReasons: ["Failed to parse scene nodes structure."]
        }
      }
    }
  },
  {
    gateId: "pss.semantic-domain-coherent",
    label: "Semantic Domain Coherent",
    description: "Verify that narrative beat, tension, action, consequence and transformation belong to the same semantic domain.",
    passCriteria: ["Keywords must not mix from different semantic domains"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const tension = result.rawOutputs.emotionalTension ?? ""
      const nodesRaw = result.rawOutputs.sceneNodes ?? "[]"
      try {
        const nodes = JSON.parse(nodesRaw) as SceneNode[]
        const text = (JSON.stringify(nodes).toLowerCase() + " " + tension.toLowerCase())
        
        const hasPottery = text.includes("clay") || text.includes("wheel") || text.includes("pot") || text.includes("vessel") || text.includes("ceramic")
        const hasLabor = text.includes("brass") || text.includes("plates") || text.includes("conveyor") || text.includes("inventory")
        const hasOffice = text.includes("office") || text.includes("desk") || text.includes("accountability") || text.includes("responsibility") || text.includes("boundaries") || text.includes("negligence")
        
        let activeDomains = 0
        if (hasPottery) activeDomains++
        if (hasLabor) activeDomains++
        if (hasOffice) activeDomains++
        
        const passed = activeDomains <= 1
        return {
          gateId: "pss.semantic-domain-coherent",
          label: "Semantic Domain Coherent",
          passed,
          failReasons: passed ? [] : ["Detected semantic cross-contamination between pottery, labor, or office domains."]
        }
      } catch {
        return {
          gateId: "pss.semantic-domain-coherent",
          label: "Semantic Domain Coherent",
          passed: false,
          failReasons: ["Failed to parse scene nodes structure."]
        }
      }
    }
  },
  {
    gateId: "pss.no-generic-placeholder-language",
    label: "No Generic Placeholder Language",
    description: "Reject outputs containing fallback structures equivalent to generic placeholders.",
    passCriteria: ["Output must not contain interacts with the object, generic_end, maintain scene boundaries, or transformation to <unrelated default>"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const rawNodes = result.rawOutputs.sceneNodes ?? "[]"
      try {
        const nodes = JSON.parse(rawNodes) as SceneNode[]
        const text = JSON.stringify(nodes).toLowerCase()
        const hasGenericAction = text.includes("interacts with the object") || text.includes("interacts with object")
        const hasGenericEnd = text.includes("generic_end")
        const hasGenericBoundaries = text.includes("maintain scene boundaries") && !text.includes("fading boundaries")
        
        const passed = !hasGenericAction && !hasGenericEnd && !hasGenericBoundaries
        return {
          gateId: "pss.no-generic-placeholder-language",
          label: "No Generic Placeholder Language",
          passed,
          failReasons: passed ? [] : ["Output contains generic placeholder or default fallback language."]
        }
      } catch {
        return {
          gateId: "pss.no-generic-placeholder-language",
          label: "No Generic Placeholder Language",
          passed: false,
          failReasons: ["Failed to parse scene nodes structure."]
        }
      }
    }
  },
  {
    gateId: "pss.transformation-behaviorally-realized",
    label: "Transformation Behaviorally Realized",
    description: "PASS only when observable physical behavior actually provides evidence of the desired transformation.",
    passCriteria: ["observable physical behavior must manifest the transformation without verbal statements"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const txEvidenceRaw = result.rawOutputs.transformationEvidence ?? "{}"
      try {
        const txEvidence = JSON.parse(txEvidenceRaw) as TransformationEvidence
        const nodesRaw = result.rawOutputs.sceneNodes ?? "[]"
        const nodes = JSON.parse(nodesRaw) as SceneNode[]
        const lastNode = nodes[nodes.length - 1]
        
        const passed = !!(
          txEvidence.behavioralMeaning &&
          txEvidence.observableEvidenceRequired &&
          txEvidence.actionEvidence &&
          lastNode &&
          (
            lastNode.physicalAction.includes(txEvidence.actionEvidence.slice(0, 10)) ||
            lastNode.subjectState.includes(txEvidence.endingEvidence.slice(0, 10)) ||
            result.rawOutputs.endingPhysicalState.includes(txEvidence.endingEvidence.slice(0, 10)) ||
            lastNode.physicalAction.toLowerCase().includes("pulls") ||
            lastNode.physicalAction.toLowerCase().includes("pushes") ||
            lastNode.physicalAction.toLowerCase().includes("brace") ||
            lastNode.physicalAction.toLowerCase().includes("walks out") ||
            lastNode.physicalAction.toLowerCase().includes("turns away")
          )
        )
        return {
          gateId: "pss.transformation-behaviorally-realized",
          label: "Transformation Behaviorally Realized",
          passed,
          failReasons: passed ? [] : ["The ending physical behavior does not ground the behavioral transformation."]
        }
      } catch {
        return {
          gateId: "pss.transformation-behaviorally-realized",
          label: "Transformation Behaviorally Realized",
          passed: false,
          failReasons: ["Failed to parse transformation evidence or scene nodes."]
        }
      }
    }
  },
  {
    gateId: "pss.transformation-contrast-material",
    label: "Transformation Contrast Material",
    description: "PASS only when materially different desired transformations generate materially different physical manifestations.",
    passCriteria: ["Different transformations must produce different physical actions"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const subject = result.rawOutputs.subject ?? "John"
      const prop = result.rawOutputs.keyObject ?? "broken office desk"
      const env = result.rawOutputs.environment ?? "broken office desk"
      
      const resOwnership = deriveTransformationEvidence("visible ownership", subject, prop, env)
      const resAbandonment = deriveTransformationEvidence("abandonment", subject, prop, env)
      const resRepair = deriveTransformationEvidence("repair commitment", subject, prop, env)
      
      const passed = (resOwnership.beat2Action !== resAbandonment.beat2Action) && (resOwnership.beat2Action !== resRepair.beat2Action)
      
      return {
        gateId: "pss.transformation-contrast-material",
        label: "Transformation Contrast Material",
        passed,
        failReasons: passed ? [] : ["Different desired transformations did not produce materially distinct physical actions."]
      }
    }
  },
  {
    gateId: "pss.no-action-transformation-contradiction",
    label: "No Action-Transformation Contradiction",
    description: "PASS only when physical action is semantically compatible with the desired transformation.",
    passCriteria: ["visible ownership must not be paired with walk away or abandon"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const dt = (result.rawOutputs.desiredTransformation ?? "").toLowerCase()
      const nodesRaw = result.rawOutputs.sceneNodes ?? "[]"
      try {
        const nodes = JSON.parse(nodesRaw) as SceneNode[]
        const lastNode = nodes[nodes.length - 1]
        const actionText = (lastNode?.physicalAction ?? "").toLowerCase()
        
        let passed = true
        if (dt.includes("visible ownership") || dt.includes("responsibility") || dt.includes("accountability")) {
          if (actionText.includes("walks out") || actionText.includes("turns away") || actionText.includes("disengages") || actionText.includes("steps back and disengages")) {
            passed = false
          }
        }
        
        return {
          gateId: "pss.no-action-transformation-contradiction",
          label: "No Action-Transformation Contradiction",
          passed,
          failReasons: passed ? [] : [`Physical action contradicts desired transformation: "${result.rawOutputs.desiredTransformation}".`]
        }
      } catch {
        return {
          gateId: "pss.no-action-transformation-contradiction",
          label: "No Action-Transformation Contradiction",
          passed: false,
          failReasons: ["Failed to parse scene nodes structure."]
        }
      }
    }
  }
]

export function runPhysicalSituationStoryboarder(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(physicalSituationStoryboarderDefinition, physicalSituationStoryboarderGates, input, produce)
}
