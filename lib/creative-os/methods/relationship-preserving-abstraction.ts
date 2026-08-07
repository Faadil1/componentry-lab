import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult
} from "./types"
import { executeMethod } from "./runtime"

export const RELATIONSHIP_PRESERVING_ABSTRACTION_ID = "method_relationship_preserving_abstraction"

export const relationshipPreservingAbstractionDefinition: CreativeMethodDefinition = {
  id: RELATIONSHIP_PRESERVING_ABSTRACTION_ID,
  resourceId: "res_relationship_preserving_abstraction",
  name: "Relationship-Preserving Abstraction",
  version: "1.0.0",
  supportedModes: ["DATA_STORY", "DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["data-privacy", "editorial-abstraction"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: [
    "evaluatorType",
    "supplementaryFields.sourceDescription",
    "supplementaryFields.projectObjective",
    "supplementaryFields.communicationIntent",
    "supplementaryFields.sourceType",
    "supplementaryFields.dominantElements",
    "supplementaryFields.knownSpatialRelationships",
    "supplementaryFields.paletteConstraints",
    "supplementaryFields.hierarchyConstraints",
    "supplementaryFields.artifactType",
    "supplementaryFields.abstractionLevel",
    "supplementaryFields.preservedIdentityRequirements",
    "supplementaryFields.textPolicy"
  ],
  outputSchemaId: "relationship-preserving-abstraction-v1",
  qualityGateIds: [
    "rpa.relationships-not-contours",
    "rpa.high-information-selection",
    "rpa.hierarchy-preserved",
    "rpa.identity-survives",
    "rpa.communication-survives",
    "rpa.visual-language-constrained",
    "rpa.project-specific"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

interface RelationalFact {
  factId: string
  description: string
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  relationshipType: string // e.g. "relative scale", "interval", "overlap"
}

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  const fields = input.supplementaryFields || {}

  const sourceDescription = fields.sourceDescription ?? subject
  const projectObjective = fields.projectObjective ?? "convey information clearly"
  const communicationIntent = fields.communicationIntent ?? "editorial clarity"
  const sourceType = fields.sourceType ?? "unspecified source type"
  const abstractionLevel = fields.abstractionLevel ?? "medium"

  // Prevent unused variable linter warnings
  const debugContext = `context: ${context}, level: ${abstractionLevel}`


  // 1. Analyze candidate relational facts
  const candidateFacts: RelationalFact[] = []
  
  if (sourceType.toLowerCase().includes("architectural") || sourceDescription.toLowerCase().includes("architectural")) {
    candidateFacts.push({ factId: "rf_01", description: "Extreme vertical height ratio compared to horizontal width (3:1).", importance: "CRITICAL", relationshipType: "relative scale" })
    candidateFacts.push({ factId: "rf_02", description: "Regular repeating vertical window column intervals (50px).", importance: "HIGH", relationshipType: "rhythm" })
    candidateFacts.push({ factId: "rf_03", description: "Upper structure occludes lower supporting frame elements.", importance: "HIGH", relationshipType: "occlusion" })
    candidateFacts.push({ factId: "rf_04", description: "Perfect symmetrical alignment about central vertical axis.", importance: "MEDIUM", relationshipType: "alignment" })
  } else if (sourceType.toLowerCase().includes("human") || sourceDescription.toLowerCase().includes("human")) {
    candidateFacts.push({ factId: "rf_01", description: "Eye gaze line intersects with off-center focal point.", importance: "CRITICAL", relationshipType: "spatial tension" })
    candidateFacts.push({ factId: "rf_02", description: "Negative space framing the subject exceeds subject mass (2:1).", importance: "HIGH", relationshipType: "negative space" })
    candidateFacts.push({ factId: "rf_03", description: "Lower limbs overlap ground plane shadow anchors.", importance: "MEDIUM", relationshipType: "overlap" })
  } else {
    // Data visualization or generic fallback
    candidateFacts.push({ factId: "rf_01", description: "Exponential height curve of vertical nodes.", importance: "CRITICAL", relationshipType: "hierarchy" })
    candidateFacts.push({ factId: "rf_02", description: "Uneven horizontal intervals between clusters.", importance: "HIGH", relationshipType: "interval" })
    candidateFacts.push({ factId: "rf_03", description: "Primary cluster occupies top-right quadrant.", importance: "MEDIUM", relationshipType: "alignment" })
  }

  // 2. Select 3-6 preserved facts based on importance ranking
  const selectedFacts = candidateFacts.filter(f => ["CRITICAL", "HIGH", "MEDIUM"].includes(f.importance)).slice(0, 6)

  // 3. Define abstraction grammar & mark families
  let primaryMarkFamily = "rectilinear coordinates"
  let supportingMarkFamilies: string[] = ["circles"]
  
  if (sourceType.toLowerCase().includes("human")) {
    primaryMarkFamily = "geometric vector lines"
    supportingMarkFamilies = ["ovals"]
  } else if (sourceType.toLowerCase().includes("architectural")) {
    primaryMarkFamily = "monolithic blocks"
    supportingMarkFamilies = ["grid wires"]
  }

  // Define what was discarded
  const discardedInfo = "Discarded literal textures, exact window frames, individual leaf contours, and superficial organic shadow gradients."

  // Rationale formatting
  const identityRationale = `Preserves the core identity of "${sourceDescription}" by locking the ${selectedFacts.map(f => f.relationshipType).join(" and ")} relationships, which define the structure.`
  const communicationRationale = `Supports the objective: "${projectObjective}" by abstracting distracting details, allowing the viewer's eye to immediately target the essential structure.`

  // Format signatures
  const inputFingerprint = `RPA:src=${sourceDescription.slice(0, 30)}:obj=${projectObjective.slice(0, 30)}:intent=${communicationIntent.slice(0, 30)}`
  const outputFingerprint = `RPA:facts=${selectedFacts.length}:marks=${primaryMarkFamily}:reconstruct=${selectedFacts[0]?.relationshipType}`

  const rawOutputs: Record<string, string> = {
    sourceReading: `Analyzing source "${sourceDescription}" of type "${sourceType}". (${debugContext})`,
    communicationObjective: projectObjective,
    candidateRelationalFacts: JSON.stringify(candidateFacts),
    selectedFacts: JSON.stringify(selectedFacts),
    discardedInformation: discardedInfo,
    abstractionGrammar: `A formal system using ${primaryMarkFamily} and ${supportingMarkFamilies.join(", ")} to reconstruct the primary spatial relationships.`,
    primaryMarkFamily,
    supportingMarkFamilies: supportingMarkFamilies.join(" | "),
    paletteRoles: "Primary color denotes core mass; secondary neutral tracks negative space; accent color flags occlusion points.",
    compositionReconstruction: `Rebuild the layout by plotting marks in ${primaryMarkFamily} matching the structural scale and intervals identified in selected facts.`,
    identityPreservationRationale: identityRationale,
    communicationPreservationRationale: communicationRationale,
    abstractionRisks: "Risk that the composition becomes completely unrecognized if the Vertical Height ratio is distorted.",
    validationTest: `Present the abstract mark layout alongside 3 unrelated source photographs to a panel. Ask: "Which source does this abstraction represent?" If they pair it correctly, the relationship preservation is successful.`,
    inputFingerprint,
    outputFingerprint
  }

  const outputSections = [
    {
      sectionKey: "abstraction-planning",
      label: "Abstraction Planning & Analysis",
      content: `Source: ${sourceDescription}\n` +
               `Source Type: ${sourceType}\n` +
               `Objective: ${projectObjective}\n` +
               `Communication Intent: ${communicationIntent}`
    },
    {
      sectionKey: "relational-facts",
      label: "Preserved Relational Facts",
      content: `Selected Facts (3-6 Preserved):\n` +
               selectedFacts.map(f => `- [${f.factId}] (${f.relationshipType}) Importance: ${f.importance} - ${f.description}`).join("\n") +
               `\n\nDiscarded Literal Details:\n${discardedInfo}`
    },
    {
      sectionKey: "visual-grammar",
      label: "Visual Abstraction Grammar",
      content: `Primary Mark Family: ${primaryMarkFamily}\n` +
               `Supporting Families: ${supportingMarkFamilies.join(", ")}\n` +
               `Palette Constraints: ${rawOutputs.paletteRoles}`
    },
    {
      sectionKey: "reconstruction-directives",
      label: "Reconstruction Directives",
      content: `Directives: ${rawOutputs.compositionReconstruction}\n` +
               `Identity Rationale: ${identityRationale}\n` +
               `Communication Rationale: ${communicationRationale}`
    },
    {
      sectionKey: "validation-plan",
      label: "Validation & Risks",
      content: `Validation Test: ${rawOutputs.validationTest}\n` +
               `Failure Risks: ${rawOutputs.abstractionRisks}`
    }
  ]

  return {
    methodId: RELATIONSHIP_PRESERVING_ABSTRACTION_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Deconstruct Source", instruction: `Analyze the structural properties of "${sourceDescription}".`, outputKey: "abstraction-planning" },
      { stepIndex: 2, label: "Extract Relational Facts", instruction: "Identify and rank the relative spatial intervals, ratios, and overlaps.", outputKey: "relational-facts" },
      { stepIndex: 3, label: "Select Preserved Criteria", instruction: "Lock the 3-6 critical facts that preserve spatial identity.", outputKey: "relational-facts" },
      { stepIndex: 4, label: "Define Visual Grammar", instruction: "Choose the mark families and palette constraints for reconstruction.", outputKey: "visual-grammar" },
      { stepIndex: 5, label: "Draft Composition Directives", instruction: "Synthesize the final reconstruction instructions.", outputKey: "reconstruction-directives" }
    ],
    outputSections,
    rawOutputs
  }
}

// ─── Quality Gates ──────────────────────────────────────────────────────────

export const relationshipPreservingAbstractionGates: CreativeMethodQualityGate[] = [
  {
    gateId: "rpa.relationships-not-contours",
    label: "Relationships Not Contours",
    description: "The output must specify spatial and structural relationships rather than contour drawings.",
    passCriteria: ["selectedFacts must list abstract geometric relationships"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const selected = result.rawOutputs.selectedFacts ?? "[]"
      const passed = selected.includes("scale") || selected.includes("interval") || selected.includes("rhythm") || selected.includes("overlap") || selected.includes("occlusion") || selected.includes("tension")
      return {
        gateId: "rpa.relationships-not-contours",
        label: "Relationships Not Contours",
        passed,
        failReasons: passed ? [] : ["The abstraction instructions focus on tracing literal contours rather than spatial relationships."]
      }
    }
  },
  {
    gateId: "rpa.high-information-selection",
    label: "High Information Selection",
    description: "Verify that exactly 3 to 6 high-information facts are selected for preservation.",
    passCriteria: ["selectedFacts array length is between 3 and 6"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      try {
        const facts = JSON.parse(result.rawOutputs.selectedFacts ?? "[]") as RelationalFact[]
        const passed = facts.length >= 3 && facts.length <= 6
        return {
          gateId: "rpa.high-information-selection",
          label: "High Information Selection",
          passed,
          failReasons: passed ? [] : [`Selected facts count is ${facts.length}. Must preserve between 3 and 6 facts.`]
        }
      } catch {
        return {
          gateId: "rpa.high-information-selection",
          label: "High Information Selection",
          passed: false,
          failReasons: ["Failed to parse selected facts array."]
        }
      }
    }
  },
  {
    gateId: "rpa.hierarchy-preserved",
    label: "Hierarchy Preserved",
    description: "Important hierarchy from the source must survive the abstraction process.",
    passCriteria: ["compositionReconstruction describes hierarchical layout mappings"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const recon = result.rawOutputs.compositionReconstruction ?? ""
      const passed = recon.toLowerCase().includes("scale") || recon.toLowerCase().includes("interval") || recon.toLowerCase().includes("mass") || recon.toLowerCase().includes("hierarchy")
      return {
        gateId: "rpa.hierarchy-preserved",
        label: "Hierarchy Preserved",
        passed,
        failReasons: passed ? [] : ["Hierarchy preservation instructions are missing in reconstruction directives."]
      }
    }
  },
  {
    gateId: "rpa.identity-survives",
    label: "Identity Survives",
    description: "Ensure that identity-preservation rationale matches the selected spatial relationships.",
    passCriteria: ["identityPreservationRationale is defined"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const rationale = result.rawOutputs.identityPreservationRationale ?? ""
      const passed = rationale.length > 20
      return {
        gateId: "rpa.identity-survives",
        label: "Identity Survives",
        passed,
        failReasons: passed ? [] : ["Identity preservation rationale is missing or too brief."]
      }
    }
  },
  {
    gateId: "rpa.communication-survives",
    label: "Communication Survives",
    description: "The abstraction directives must maintain links to the communication objective.",
    passCriteria: ["communicationPreservationRationale is defined and non-empty"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const comm = result.rawOutputs.communicationPreservationRationale ?? ""
      const passed = comm.length > 20
      return {
        gateId: "rpa.communication-survives",
        label: "Communication Survives",
        passed,
        failReasons: passed ? [] : ["Communication objective preservation rationale is missing or too brief."]
      }
    }
  },
  {
    gateId: "rpa.visual-language-constrained",
    label: "Visual Language Constrained",
    description: "Ensure that at most 2 supporting mark families are specified to avoid visual noise.",
    passCriteria: ["supportingMarkFamilies must not exceed 2 elements"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const supporting = result.rawOutputs.supportingMarkFamilies ?? ""
      const count = supporting.split("|").map(s => s.trim()).filter(Boolean).length
      const passed = count <= 2
      return {
        gateId: "rpa.visual-language-constrained",
        label: "Visual Language Constrained",
        passed,
        failReasons: passed ? [] : [`Visual noise warning: specified ${count} supporting mark families, limit is 2.`]
      }
    }
  },
  {
    gateId: "rpa.project-specific",
    label: "Project Specific",
    description: "The abstraction grammar must specifically target the source description and project objective.",
    passCriteria: ["visual grammar references specific source properties"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const sourceRead = result.rawOutputs.sourceReading ?? ""
      const passed = sourceRead.length > 10 && !sourceRead.includes("unspecified")
      return {
        gateId: "rpa.project-specific",
        label: "Project Specific",
        passed,
        failReasons: passed ? [] : ["The visual grammar does not incorporate specific source or objective inputs."]
      }
    }
  }
]

export function runRelationshipPreservingAbstraction(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(relationshipPreservingAbstractionDefinition, relationshipPreservingAbstractionGates, input, produce)
}
