import type {
  CreativeMethodDefinition,
  CreativeMethodInput,
  CreativeMethodResult,
  CreativeMethodQualityGate,
  CreativeMethodQualityResult,
  CreativeMethodExecutionResult
} from "./types"
import { executeMethod } from "./runtime"

export const SACRED_RULES_BREAKER_ID = "method_sacred_rules_breaker"

export const sacredRulesBreakerDefinition: CreativeMethodDefinition = {
  id: SACRED_RULES_BREAKER_ID,
  resourceId: "res_sacred_rules_breaker",
  name: "Sacred Rules Breaker",
  version: "1.0.0",
  supportedModes: ["DAY_CHALLENGE"],
  supportedPhases: ["intake", "clarify", "route", "build", "verify"],
  capabilityGaps: ["category-differentiation", "rules-governance"],
  requiredInputs: ["subjectDescription", "subjectContext"],
  optionalInputs: ["evaluatorType", "supplementaryFields.conventionDomain"],
  outputSchemaId: "sacred-rules-breaker-v1",
  qualityGateIds: [
    "srb.conventions-inventoried",
    "srb.break-candidates-identified",
    "srb.insight-is-domain-specific"
  ],
  authorityRequired: "SUGGEST",
  deterministic: true
}

/**
 * Core production function — deterministic, no external calls.
 * Takes structured input and produces a structured reasoning scaffold
 * by applying Sacred Rules Breaker method logic.
 */
function produce(input: CreativeMethodInput): CreativeMethodResult {
  const subject = input.subjectDescription
  const context = input.subjectContext
  const domain = input.supplementaryFields?.conventionDomain ?? context

  // Step 1: Inventory dominant conventions in this domain
  const conventionInventory = [
    `In "${domain}", it is assumed that all practitioners follow: established visual hierarchy norms.`,
    `In "${domain}", it is assumed that: standard narrative arc (setup, conflict, resolution) is the default structure.`,
    `In "${domain}", it is assumed that: the primary audience evaluation frame is competence, not transformation.`,
    `In "${domain}", it is assumed that: presentation format should conform to category defaults (length, medium, pacing).`,
    `In "${domain}", it is assumed that: differentiation is achieved through quality improvement, not structural deviation.`
  ]

  // Step 2: Classify conventions — truly sacred vs. habit
  const sacredVsHabit = [
    { convention: conventionInventory[0], classification: "HABIT", rationale: "Visual hierarchy conventions shift with platforms and generations — not structurally required." },
    { convention: conventionInventory[1], classification: "HABIT", rationale: "Narrative arc is culturally familiar, not logically necessary — alternative structures exist and resonate." },
    { convention: conventionInventory[2], classification: "SACRED", rationale: "Evaluator alignment is structurally important and cannot be bypassed without trust erosion." },
    { convention: conventionInventory[3], classification: "HABIT", rationale: `Format defaults in "${domain}" are social proof mechanisms, not functional requirements.` },
    { convention: conventionInventory[4], classification: "HABIT", rationale: "Quality-as-differentiation is the most common and most copyable strategy." }
  ]

  const habitConventions = sacredVsHabit.filter((c) => c.classification === "HABIT")

  // Step 3: Propose rule-break candidates from habit conventions
  const breakCandidates = habitConventions.map((c, i) => ({
    candidateIndex: i + 1,
    targetConvention: c.convention,
    proposedBreak: `Deliberately invert or abandon this convention in "${subject}" to create structural differentiation.`,
    rationale: c.rationale
  }))

  // Step 4: Evaluate viability (heuristic, deterministic scoring)
  const viableBreaks = breakCandidates.map((bc) => ({
    ...bc,
    viability: "VIABLE_WITH_POSITIONING",
    risk: "MEDIUM",
    positioningNote: `Breaking this convention in "${subject}" requires an explicit positioning frame that redefines what "success" looks like for the evaluator.`
  }))

  // Step 5: Synthesize differentiation insight
  const topBreak = viableBreaks[0]
  const differentiationInsight = topBreak
    ? `The highest-leverage differentiation opportunity for "${subject}" is to break the convention: "${habitConventions[0]?.convention ?? "standard narrative arc"}". ${topBreak.positioningNote}`
    : `No viable rule-break candidates found. "${subject}" should proceed with standard differentiation through quality.`

  const rawOutputs: Record<string, string> = {
    conventionInventory: conventionInventory.join("\n"),
    sacredVsHabitClassification: sacredVsHabit.map((c) => `[${c.classification}] ${c.convention} — ${c.rationale}`).join("\n"),
    breakCandidates: breakCandidates.map((b) => `#${b.candidateIndex}: ${b.proposedBreak}`).join("\n"),
    viabilityAssessment: viableBreaks.map((b) => `#${b.candidateIndex}: ${b.viability} (Risk: ${b.risk}) — ${b.positioningNote}`).join("\n"),
    differentiationInsight
  }

  const outputSections = [
    {
      sectionKey: "convention-inventory",
      label: "Dominant Conventions Inventoried",
      content: conventionInventory.join("\n")
    },
    {
      sectionKey: "sacred-vs-habit",
      label: "Sacred vs. Habit Classification",
      content: sacredVsHabit.map((c) => `[${c.classification}] ${c.convention} — ${c.rationale}`).join("\n")
    },
    {
      sectionKey: "break-candidates",
      label: "Rule-Break Candidates",
      content: breakCandidates.map((b) => `#${b.candidateIndex}: ${b.proposedBreak}\nRationale: ${b.rationale}`).join("\n\n")
    },
    {
      sectionKey: "viability",
      label: "Viability Assessment",
      content: viableBreaks.map((b) => `#${b.candidateIndex} — ${b.viability} (Risk: ${b.risk})\n${b.positioningNote}`).join("\n\n")
    },
    {
      sectionKey: "differentiation-insight",
      label: "Differentiation Insight",
      content: differentiationInsight
    }
  ]

  return {
    methodId: SACRED_RULES_BREAKER_ID,
    status: "COMPLETE",
    steps: [
      { stepIndex: 1, label: "Inventory Conventions", instruction: `List dominant conventions in "${domain}".`, outputKey: "conventionInventory" },
      { stepIndex: 2, label: "Classify Sacred vs. Habit", instruction: "For each convention, determine if it is structurally sacred or merely habitual.", outputKey: "sacredVsHabitClassification" },
      { stepIndex: 3, label: "Propose Rule-Break Candidates", instruction: "For each habit convention, propose a deliberate break.", outputKey: "breakCandidates" },
      { stepIndex: 4, label: "Assess Viability", instruction: "Evaluate each break candidate for risk and positioning requirements.", outputKey: "viabilityAssessment" },
      { stepIndex: 5, label: "Synthesize Insight", instruction: "Identify the highest-leverage differentiation opportunity.", outputKey: "differentiationInsight" }
    ],
    outputSections,
    rawOutputs
  }
}

export const sacredRulesBreakerGates: CreativeMethodQualityGate[] = [
  {
    gateId: "srb.conventions-inventoried",
    label: "Conventions Inventoried",
    description: "At least 3 domain conventions must be identified.",
    passCriteria: ["conventionInventory output must contain at least 3 entries"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const lines = (result.rawOutputs.conventionInventory ?? "").split("\n").filter((l) => l.trim().length > 0)
      const passed = lines.length >= 3
      return {
        gateId: "srb.conventions-inventoried",
        label: "Conventions Inventoried",
        passed,
        failReasons: passed ? [] : [`Only ${lines.length} convention(s) found; minimum 3 required.`]
      }
    }
  },
  {
    gateId: "srb.break-candidates-identified",
    label: "Break Candidates Identified",
    description: "At least 1 rule-break candidate must be proposed.",
    passCriteria: ["breakCandidates output must be non-empty"],
    evaluate: (result: CreativeMethodResult): CreativeMethodQualityResult => {
      const content = result.rawOutputs.breakCandidates ?? ""
      const passed = content.trim().length > 0
      return {
        gateId: "srb.break-candidates-identified",
        label: "Break Candidates Identified",
        passed,
        failReasons: passed ? [] : ["No rule-break candidates were identified."]
      }
    }
  },
  {
    gateId: "srb.insight-is-domain-specific",
    label: "Differentiation Insight Is Domain-Specific",
    description: "The final insight must reference the actual subject or context, not generic advice.",
    passCriteria: ["differentiationInsight must contain the subject description or context"],
    evaluate: (result: CreativeMethodResult, ): CreativeMethodQualityResult => {
      const insight = result.rawOutputs.differentiationInsight ?? ""
      // Quality check: insight must include a quoted reference (heuristic for domain-specificity)
      const passed = insight.includes('"') && insight.trim().length > 50
      return {
        gateId: "srb.insight-is-domain-specific",
        label: "Differentiation Insight Is Domain-Specific",
        passed,
        failReasons: passed ? [] : ["Differentiation insight appears generic — must reference the specific subject or domain."]
      }
    }
  }
]

/**
 * Public entry point for executing the Sacred Rules Breaker method.
 */
export function runSacredRulesBreaker(input: CreativeMethodInput): CreativeMethodExecutionResult {
  return executeMethod(sacredRulesBreakerDefinition, sacredRulesBreakerGates, input, produce)
}
