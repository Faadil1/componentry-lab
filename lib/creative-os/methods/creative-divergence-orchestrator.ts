import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult
} from "./types"
import { executeMethod } from "./runtime"

export const CREATIVE_DIVERGENCE_ORCHESTRATOR_ID = "method_creative_divergence_orchestrator"

export type DivergenceScoutRole =
  | "FRAME_SCOUT"
  | "ANALOGY_SCOUT"
  | "INVERSION_SCOUT"
  | "CROSS_DOMAIN_SCOUT"
  | "MECHANISM_MUTATION_SCOUT"

export type DivergenceOperatorFamily =
  | "CONVENTION_INVERSION"
  | "STRUCTURAL_ANALOGY"
  | "ANALOGICAL_TRANSFER"
  | "CONSTRAINT_INVERSION"
  | "DESIGN_HEURISTIC_VARIATION"
  | "SCAMPER_TRANSFORMATION"
  | "CONTRADICTION_RESOLUTION"
  | "CROSS_DOMAIN_RECOMBINATION"
  | "ANTI_TROPE_OPPOSITION"
  | "SCALE_TIME_ROLE_SHIFT"

export const DIVERGENCE_OPERATOR_FAMILIES: readonly DivergenceOperatorFamily[] = [
  "CONVENTION_INVERSION",
  "STRUCTURAL_ANALOGY",
  "ANALOGICAL_TRANSFER",
  "CONSTRAINT_INVERSION",
  "DESIGN_HEURISTIC_VARIATION",
  "SCAMPER_TRANSFORMATION",
  "CONTRADICTION_RESOLUTION",
  "CROSS_DOMAIN_RECOMBINATION",
  "ANTI_TROPE_OPPOSITION",
  "SCALE_TIME_ROLE_SHIFT"
]

const DEFAULT_SCOUTS: readonly DivergenceScoutRole[] = [
  "FRAME_SCOUT",
  "ANALOGY_SCOUT",
  "INVERSION_SCOUT",
  "CROSS_DOMAIN_SCOUT",
  "MECHANISM_MUTATION_SCOUT"
]

const EXISTING_METHOD_ROUTES: Record<string, string> = {
  CONVENTION_INVERSION: "method_sacred_rules_breaker",
  STRUCTURAL_ANALOGY: "method_cognitive_metaphor_illustrator",
  ANALOGICAL_TRANSFER: "method_cognitive_metaphor_illustrator",
  ANTI_TROPE_OPPOSITION: "method_sacred_rules_breaker"
}

export const creativeDivergenceOrchestratorDefinition: CreativeMethodDefinition = {
  id: CREATIVE_DIVERGENCE_ORCHESTRATOR_ID,
  resourceId: "res_creative_divergence_orchestrator",
  name: "Creative Divergence Orchestrator",
  version: "1.0.0",
  supportedModes: ["DAY_CHALLENGE", "HACKATHON", "MARA", "DATA_STORY"],
  supportedPhases: ["clarify", "route", "build", "verify"],
  capabilityGaps: ["creative-divergence", "generic-convergence-risk", "concept-breadth"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: [
    "evaluatorType",
    "supplementaryFields.problemFrame",
    "supplementaryFields.projectObjective",
    "supplementaryFields.humanSeed",
    "supplementaryFields.knownTropes",
    "supplementaryFields.requestedScoutCount",
    "supplementaryFields.preferredOperators",
    "supplementaryFields.prohibitedOperators",
    "supplementaryFields.trustConstraints",
    "supplementaryFields.feasibilityConstraints",
    "supplementaryFields.domain"
  ],
  outputSchemaId: "creative-divergence-orchestrator-v1",
  qualityGateIds: [
    "cdo.first-pass-isolation",
    "cdo.delayed-critic",
    "cdo.agent-count-not-diversity-proxy",
    "cdo.human-seed-preserved",
    "cdo.no-random-default",
    "cdo.no-frankenstein-default",
    "cdo.method-boundary-preserved"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

function parseScoutCount(raw?: string): number {
  const parsed = Number.parseInt(raw ?? "4", 10)
  if (Number.isNaN(parsed)) return 4
  return Math.max(3, Math.min(5, parsed))
}

function parseCsv(raw?: string): string[] {
  if (!raw) return []
  return raw
    .split(/[,|]/g)
    .map(value => value.trim())
    .filter(Boolean)
}

function selectOperators(preferred: string[], prohibited: string[]): DivergenceOperatorFamily[] {
  const prohibitedSet = new Set(prohibited.map(v => v.toUpperCase()))
  const preferredValid = preferred
    .map(v => v.toUpperCase())
    .filter((v): v is DivergenceOperatorFamily => DIVERGENCE_OPERATOR_FAMILIES.includes(v as DivergenceOperatorFamily))
    .filter(v => !prohibitedSet.has(v))

  const fallback = DIVERGENCE_OPERATOR_FAMILIES.filter(v => !prohibitedSet.has(v))
  return (preferredValid.length > 0 ? preferredValid : fallback).slice(0, 6)
}

function produce(input: CreativeMethodInput): CreativeMethodResult {
  const fields = input.supplementaryFields ?? {}
  const scoutCount = parseScoutCount(fields.requestedScoutCount)
  const selectedScouts = DEFAULT_SCOUTS.slice(0, scoutCount)
  const preferredOperators = parseCsv(fields.preferredOperators)
  const prohibitedOperators = parseCsv(fields.prohibitedOperators)
  const selectedOperators = selectOperators(preferredOperators, prohibitedOperators)
  const humanSeed = fields.humanSeed?.trim() || "NONE_PROVIDED"
  const knownTropes = fields.knownTropes?.trim() || "NONE_PROVIDED"

  const routedExistingMethods = selectedOperators
    .map(operator => ({ operator, method: EXISTING_METHOD_ROUTES[operator] }))
    .filter((entry): entry is { operator: DivergenceOperatorFamily; method: string } => Boolean(entry.method))

  const rawOutputs: Record<string, string> = {
    divergenceMateriality: "MATERIAL",
    scoutCount: String(scoutCount),
    selectedScouts: JSON.stringify(selectedScouts),
    selectedOperators: JSON.stringify(selectedOperators),
    routedExistingMethods: JSON.stringify(routedExistingMethods),
    firstPassPeerVisibility: "FORBIDDEN",
    firstPassCommunicationTopology: "ISOLATED_PARALLEL_BRANCHES",
    criticTiming: "AFTER_DIVERGENCE_ONLY",
    criticRoles: JSON.stringify(["COLLISION_CRITIC", "UTILITY_FIT_CRITIC"]),
    lateSynthesisRole: "LATE_SYNTHESIS_CLUSTERER",
    lateSynthesisRule: "CLUSTER_BY_MECHANISM_PRESERVE_OUTLIERS_NO_DEFAULT_AVERAGING",
    frankensteinMergeDefault: "FORBIDDEN",
    agentCountIsDiversityProxy: "false",
    humanSeed,
    humanSeedPreservation: humanSeed === "NONE_PROVIDED" ? "NOT_APPLICABLE" : "REQUIRED_AND_TRACEABLE",
    knownTropes,
    pureRandomStimulusDefault: "REJECTED",
    analogyDistancePolicy: "CONTROLLED_NEAR_MEDIUM_FAR_WITH_FUNCTIONAL_MAPPING",
    trizPolicy: "OPTIONAL_ONLY_WHEN_GENUINE_CONTRADICTION_EXISTS",
    scamperPolicy: "AVAILABLE_AS_LIGHTWEIGHT_TRANSFORMATION_NOT_NOVELTY_PROOF",
    externalDependenciesAdopted: "NONE",
    externalReferencesRole: "PATTERN_REFERENCE_ONLY_UNLESS_SEPARATELY_GOVERNED",
    creativeOsOwnsOperators: "true",
    pbpdOwnsDivergencePrerequisite: "true",
    sourceClaims: "NO_EXTERNAL_BENCHMARK_CLAIM_PROMOTED_BY_THIS_METHOD"
  }

  const outputSections = [
    {
      sectionKey: "divergence-contract",
      label: "Divergence Contract",
      content: `Run ${scoutCount} isolated scouts. First-pass peer visibility is forbidden. Agent count is not evidence of diversity.`
    },
    {
      sectionKey: "operator-plan",
      label: "Operator Plan",
      content: selectedOperators.map(operator => {
        const routed = EXISTING_METHOD_ROUTES[operator]
        return routed ? `- ${operator} → reuse ${routed}` : `- ${operator} → bounded operator family`
      }).join("\n")
    },
    {
      sectionKey: "blind-pool",
      label: "Blind Idea Pool",
      content: `Human seed: ${humanSeed}. Known tropes: ${knownTropes}. Preserve provenance for every branch and hide peer outputs until the initial pool is complete.`
    },
    {
      sectionKey: "delayed-critique",
      label: "Delayed Critique",
      content: "After initial divergence only, run COLLISION_CRITIC and UTILITY_FIT_CRITIC. Criticism must not suppress first-pass breadth."
    },
    {
      sectionKey: "late-synthesis",
      label: "Late Synthesis",
      content: "Cluster by underlying mechanism, preserve outliers, and carry distinct survivors forward. Do not Frankenstein-merge concepts by default."
    }
  ]

  return {
    methodId: CREATIVE_DIVERGENCE_ORCHESTRATOR_ID,
    status: "COMPLETE",
    steps: [
      {
        stepIndex: 1,
        label: "Freeze divergence contract",
        instruction: "Preserve the problem frame, constraints, human seed, and provenance before branching.",
        outputKey: "divergence-contract"
      },
      {
        stepIndex: 2,
        label: "Fan out isolated scouts",
        instruction: "Assign distinct cognitive/operator frames to 3–5 isolated branches with no peer visibility.",
        outputKey: "operator-plan"
      },
      {
        stepIndex: 3,
        label: "Build blind idea pool",
        instruction: "Collect branch outputs before any critic or synthesis agent can inspect them.",
        outputKey: "blind-pool"
      },
      {
        stepIndex: 4,
        label: "Run delayed critics",
        instruction: "After breadth exists, evaluate collision/genericity and utility/fit separately from generation.",
        outputKey: "delayed-critique"
      },
      {
        stepIndex: 5,
        label: "Cluster without flattening",
        instruction: "Cluster by mechanism, preserve outliers, and return distinct survivors without default averaging.",
        outputKey: "late-synthesis"
      }
    ],
    outputSections,
    rawOutputs
  }
}

export const creativeDivergenceOrchestratorGates: CreativeMethodQualityGate[] = [
  {
    gateId: "cdo.first-pass-isolation",
    label: "First-pass isolation",
    description: "Divergence branches cannot see one another before the blind pool is complete.",
    passCriteria: ["firstPassPeerVisibility = FORBIDDEN", "firstPassCommunicationTopology = ISOLATED_PARALLEL_BRANCHES"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const passed = result.rawOutputs.firstPassPeerVisibility === "FORBIDDEN" &&
        result.rawOutputs.firstPassCommunicationTopology === "ISOLATED_PARALLEL_BRANCHES"
      return { gateId: "cdo.first-pass-isolation", label: "First-pass isolation", passed, failReasons: passed ? [] : ["Initial scouts are structurally coupled."] }
    }
  },
  {
    gateId: "cdo.delayed-critic",
    label: "Delayed critic",
    description: "Critics run only after first-pass divergence.",
    passCriteria: ["criticTiming = AFTER_DIVERGENCE_ONLY"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const passed = result.rawOutputs.criticTiming === "AFTER_DIVERGENCE_ONLY"
      return { gateId: "cdo.delayed-critic", label: "Delayed critic", passed, failReasons: passed ? [] : ["Critic is active during first-pass generation."] }
    }
  },
  {
    gateId: "cdo.agent-count-not-diversity-proxy",
    label: "Agent count is not diversity",
    description: "The topology must not treat number of agents as evidence of semantic diversity.",
    passCriteria: ["agentCountIsDiversityProxy = false"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const passed = result.rawOutputs.agentCountIsDiversityProxy === "false"
      return { gateId: "cdo.agent-count-not-diversity-proxy", label: "Agent count is not diversity", passed, failReasons: passed ? [] : ["Agent count was treated as a diversity proxy."] }
    }
  },
  {
    gateId: "cdo.human-seed-preserved",
    label: "Human seed preserved",
    description: "Any human-origin concept seed remains explicit and traceable through divergence.",
    passCriteria: ["humanSeedPreservation = REQUIRED_AND_TRACEABLE or NOT_APPLICABLE"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const value = result.rawOutputs.humanSeedPreservation
      const passed = value === "REQUIRED_AND_TRACEABLE" || value === "NOT_APPLICABLE"
      return { gateId: "cdo.human-seed-preserved", label: "Human seed preserved", passed, failReasons: passed ? [] : ["Human-origin seed provenance was lost."] }
    }
  },
  {
    gateId: "cdo.no-random-default",
    label: "No pure-random default",
    description: "Pure random stimuli are not the default divergence mechanism.",
    passCriteria: ["pureRandomStimulusDefault = REJECTED"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const passed = result.rawOutputs.pureRandomStimulusDefault === "REJECTED"
      return { gateId: "cdo.no-random-default", label: "No pure-random default", passed, failReasons: passed ? [] : ["Pure random stimulus was used as the default divergence mechanism."] }
    }
  },
  {
    gateId: "cdo.no-frankenstein-default",
    label: "No Frankenstein merge",
    description: "Late synthesis preserves distinct mechanisms instead of averaging them by default.",
    passCriteria: ["frankensteinMergeDefault = FORBIDDEN"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const passed = result.rawOutputs.frankensteinMergeDefault === "FORBIDDEN"
      return { gateId: "cdo.no-frankenstein-default", label: "No Frankenstein merge", passed, failReasons: passed ? [] : ["Distinct concepts were merged by default."] }
    }
  },
  {
    gateId: "cdo.method-boundary-preserved",
    label: "Method boundary preserved",
    description: "Creative OS owns divergence operators; PBPD owns the prerequisite and selection governance.",
    passCriteria: ["creativeOsOwnsOperators = true", "pbpdOwnsDivergencePrerequisite = true", "externalDependenciesAdopted = NONE"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const passed = result.rawOutputs.creativeOsOwnsOperators === "true" &&
        result.rawOutputs.pbpdOwnsDivergencePrerequisite === "true" &&
        result.rawOutputs.externalDependenciesAdopted === "NONE"
      return { gateId: "cdo.method-boundary-preserved", label: "Method boundary preserved", passed, failReasons: passed ? [] : ["PBPD/Creative OS ownership boundary or dependency boundary was violated."] }
    }
  }
]

export function runCreativeDivergenceOrchestrator(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(creativeDivergenceOrchestratorDefinition, creativeDivergenceOrchestratorGates, input, produce)
}
