// ─────────────────────────────────────────────────────────────
// Data & Decision Components — Deterministic Evaluator
// Pure functions with no side effects or non-deterministic operations.
// ─────────────────────────────────────────────────────────────

import type {
  DecisionSignal,
  DecisionEvidence,
  DecisionRule,
  DecisionCondition,
  DecisionOutcome,
  DecisionStatus,
  DecisionTraceEntry,
  DecisionEvaluation,
  DecisionScenario,
  DecisionMode,
  RuleStatus,
  DecisionReason,
} from "./types"

/**
 * Checks if a condition is met given a signal's value.
 */
export function evaluateCondition(
  condition: DecisionCondition,
  signal: DecisionSignal | undefined,
  thresholdOverrides: Record<string, number> = {}
): boolean | "unknown" {
  if (!signal || signal.value === null || signal.value === undefined) {
    if (condition.operator === "not-exists") return true
    if (condition.operator === "exists") return false
    return "unknown"
  }

  const sigValue = signal.value
  // Support dynamically overridden threshold values if applicable
  const targetThreshold = condition.signalId in thresholdOverrides
    ? thresholdOverrides[condition.signalId]
    : condition.value

  const compareVal = typeof targetThreshold === "number" ? targetThreshold : condition.value

  switch (condition.operator) {
    case "greater-than":
      return typeof sigValue === "number" && typeof compareVal === "number"
        ? sigValue > compareVal
        : false
    case "greater-than-or-equal":
      return typeof sigValue === "number" && typeof compareVal === "number"
        ? sigValue >= compareVal
        : false
    case "less-than":
      return typeof sigValue === "number" && typeof compareVal === "number"
        ? sigValue < compareVal
        : false
    case "less-than-or-equal":
      return typeof sigValue === "number" && typeof compareVal === "number"
        ? sigValue <= compareVal
        : false
    case "equals":
      return sigValue === compareVal
    case "not-equals":
      return sigValue !== compareVal
    case "between":
      if (typeof sigValue === "number" && typeof compareVal === "number" && typeof condition.secondValue === "number") {
        return sigValue >= compareVal && sigValue <= condition.secondValue
      }
      return false
    case "includes":
      if (typeof sigValue === "string" && typeof compareVal === "string") {
        return sigValue.includes(compareVal)
      }
      if (Array.isArray(sigValue)) {
        return sigValue.includes(compareVal)
      }
      return false
    case "exists":
      return true
    case "not-exists":
      return false
    default:
      throw new Error(`Unsupported rule operator: ${condition.operator}`)
  }
}

/**
 * Evaluates a single rule using current signals, evidence, and overrides.
 */
export function evaluateRule(
  rule: DecisionRule,
  signals: DecisionSignal[],
  excludedEvidenceIds: string[],
  thresholdOverrides: Record<string, number> = {}
): RuleStatus {
  // If all evidence required by this rule is excluded/missing, the rule might be unknown or skipped
  const hasExclusions = rule.affectedEvidenceIds.length > 0 &&
    rule.affectedEvidenceIds.every(id => excludedEvidenceIds.includes(id))

  if (hasExclusions) {
    return "skipped"
  }

  const signal = signals.find(s => s.id === rule.condition.signalId)
  const result = evaluateCondition(rule.condition, signal, thresholdOverrides)

  if (result === "unknown") return "unknown"
  return result ? "pass" : "fail"
}

/**
 * Returns missing evidence IDs (required by rules but not in active evidence or excluded)
 */
export function getMissingEvidence(
  scenario: DecisionScenario,
  activeEvidence: DecisionEvidence[],
  excludedEvidenceIds: string[]
): string[] {
  const activeIds = activeEvidence.map(e => e.id)
  const missing: string[] = []

  // Check all rules for evidence ids that are not present in activeEvidence
  for (const rule of scenario.rules) {
    for (const evId of rule.affectedEvidenceIds) {
      if (!activeIds.includes(evId) && !excludedEvidenceIds.includes(evId) && !missing.includes(evId)) {
        missing.push(evId)
      }
    }
  }

  // Also check if any active evidence is flagged as 'missing' status
  for (const ev of activeEvidence) {
    if (ev.status === "missing" && !excludedEvidenceIds.includes(ev.id) && !missing.includes(ev.id)) {
      missing.push(ev.id)
    }
  }

  return missing
}

/**
 * Checks for contradictions, e.g. evidence that contradicts each other, or contradicts passing rules.
 */
export function getContradictions(
  activeEvidence: DecisionEvidence[],
  excludedEvidenceIds: string[],
  ruleResults: Record<string, RuleStatus>
): string[] {
  const contradictions: string[] = []
  const nonExcluded = activeEvidence.filter(e => !excludedEvidenceIds.includes(e.id))

  // Find contradictory evidence (direction: contradicts) that relates to rules that passed
  for (const ev of nonExcluded) {
    if (ev.direction === "contradicts") {
      const relatedPassed = ev.affectedRuleIds.some(ruleId => ruleResults[ruleId] === "pass")
      if (relatedPassed) {
        contradictions.push(`Evidence "${ev.label}" contradicts passing rules but is active.`)
      }
    }
  }

  return contradictions
}

/**
 * Computes decision confidence based on evidence coverage and consistency.
 * Excludes excluded evidence.
 */
export function computeDecisionConfidence(
  activeEvidence: DecisionEvidence[],
  excludedEvidenceIds: string[]
): { confidence: number; coverage: number; consistency: number } {
  const nonExcluded = activeEvidence.filter(e => !excludedEvidenceIds.includes(e.id))
  if (nonExcluded.length === 0) {
    return { confidence: 0, coverage: 0, consistency: 0 }
  }

  // Coverage: Available evidence / Total non-excluded evidence
  const available = nonExcluded.filter(e => e.status === "available")
  const coverage = available.length / nonExcluded.length

  // Consistency: Strength-weighted ratio of supporting vs contradictory evidence
  let supportWeight = 0
  let totalWeight = 0

  const strengthWeights = { weak: 1, moderate: 2, strong: 3 }

  for (const ev of nonExcluded) {
    if (ev.status !== "available") continue
    const weight = strengthWeights[ev.strength] || 1
    totalWeight += weight

    if (ev.direction === "supports" || ev.direction === "contextual") {
      supportWeight += weight
    }
  }

  const consistency = totalWeight > 0 ? supportWeight / totalWeight : 1

  // Final synthetic confidence is a combination of coverage and consistency
  // Expressed as an integer score 0 to 100
  const confidenceScore = Math.round(coverage * 60 + consistency * 40)

  return {
    confidence: confidenceScore,
    coverage: Math.round(coverage * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
  }
}

/**
 * Builds chronological execution trace of the decision process.
 */
export function buildDecisionTrace(
  signals: DecisionSignal[],
  activeEvidence: DecisionEvidence[],
  excludedEvidenceIds: string[],
  rules: DecisionRule[],
  ruleResults: Record<string, RuleStatus>,
  outcome: DecisionOutcome
): DecisionTraceEntry[] {
  const trace: DecisionTraceEntry[] = []
  let order = 1

  // 1. Trace signal reads
  for (const sig of signals) {
    trace.push({
      order: order++,
      type: "signal_read",
      label: sig.label,
      description: `Observed value: ${sig.value !== null && sig.value !== undefined ? `${sig.value}${sig.unit || ""}` : "UNKNOWN"} via ${sig.source}.`,
      effect: sig.status === "critical" ? "Flags critical concern" : sig.status === "warning" ? "Raises moderate warning" : "Establishes baseline status",
    })
  }

  // 2. Trace evidence evaluations
  for (const ev of activeEvidence) {
    const isExcluded = excludedEvidenceIds.includes(ev.id)
    trace.push({
      order: order++,
      type: "evidence_check",
      label: ev.label,
      description: `Evidence source ${ev.source} is ${ev.status}${isExcluded ? " (EXCLUDED)" : ""}. Direction: ${ev.direction}, Strength: ${ev.strength}.`,
      effect: isExcluded
        ? "Neutralized (no effect on outcome)"
        : ev.direction === "contradicts"
          ? "Injects friction / contradiction"
          : ev.direction === "supports"
            ? "Fortifies decision parameters"
            : "Adds context",
    })
  }

  // 3. Trace rule evaluations
  for (const rule of rules) {
    const status = ruleResults[rule.id] || "unknown"
    trace.push({
      order: order++,
      type: "rule_evaluated",
      label: rule.label,
      description: `Evaluated rule with status: ${status.toUpperCase()}. Consequence: ${rule.consequence}.`,
      sourceOrRuleId: rule.id,
      effect: status === "pass"
        ? "Satisfies compliance condition"
        : status === "fail"
          ? `Triggers failure: ${rule.consequence}`
          : "Yields unknown or skipped status",
    })
  }

  // 4. Trace contradictions & uncertainty
  const nonExcluded = activeEvidence.filter(e => !excludedEvidenceIds.includes(e.id))
  for (const ev of nonExcluded) {
    if (ev.direction === "contradicts" && ev.affectedRuleIds.some(rid => ruleResults[rid] === "pass")) {
      trace.push({
        order: order++,
        type: "contradiction_detected",
        label: `Conflict: ${ev.label}`,
        description: `Evidence "${ev.label}" contradicts passing rules.`,
        effect: "Reduces decision consistency and caps confidence",
      })
    }
  }

  const missingIds = getMissingEvidence({ rules } as unknown as DecisionScenario, activeEvidence, excludedEvidenceIds)
  if (missingIds.length > 0) {
    trace.push({
      order: order++,
      type: "uncertainty_flagged",
      label: "Incomplete Evidence Set",
      description: `${missingIds.length} critical proof point(s) missing or excluded: ${missingIds.join(", ")}.`,
      effect: "Forces decision status to hold or insufficient-evidence",
    })
  }

  // 5. Final outcome entry
  trace.push({
    order: order++,
    type: "outcome_produced",
    label: `Outcome: ${outcome.toUpperCase()}`,
    description: `Deterministic evaluation produced decision state: ${outcome.toUpperCase()}.`,
    effect: `Final gate resolution`,
  })

  return trace
}

/**
 * Returns dynamic conditions that would change the decision outcome.
 */
export function getDecisionChangeConditions(
  outcome: DecisionOutcome,
  rules: DecisionRule[],
  ruleResults: Record<string, RuleStatus>,
  missingEvidenceIds: string[],
  contradictions: string[]
): string[] {
  const conditions: string[] = []

  if (outcome === "proceed") {
    // What would make it change to hold/review?
    conditions.push("Any critical defect signal exceeding tolerance limit.")
    conditions.push("Excluding required compliance approvals or verification logs.")
    conditions.push("Detection of contradictory evidence from automated checkpoints.")
  } else {
    // Current outcome is blocked/hold/review/insufficient. How to get back to proceed?
    if (missingEvidenceIds.length > 0) {
      conditions.push(`Re-incorporate or resolve missing evidence: ${missingEvidenceIds.join(", ")}.`)
    }
    if (contradictions.length > 0) {
      conditions.push("Resolve active evidence contradictions (dispute status or exclusions).")
    }
    // List failed rules that need correction
    const failedRules = rules.filter(r => ruleResults[r.id] === "fail")
    for (const rule of failedRules) {
      conditions.push(`Fulfill rule "${rule.label}": ${rule.changeConditionDescription}.`)
    }
  }

  return conditions
}

/**
 * Evaluates the full scenario state. Recalculates everything deterministically.
 */
export function evaluateScenario(
  scenario: DecisionScenario,
  mode: DecisionMode,
  thresholdOverrides: Record<string, number> = {},
  excludedEvidenceIds: string[] = []
): DecisionEvaluation {
  const modeData = scenario.modes[mode]
  const signals = modeData.signals
  const activeEvidence = modeData.evidence

  // 1. Evaluate rules
  const ruleResults: Record<string, RuleStatus> = {}
  const reasons: DecisionReason[] = []

  for (const rule of scenario.rules) {
    const status = evaluateRule(rule, signals, excludedEvidenceIds, thresholdOverrides)
    ruleResults[rule.id] = status

    if (status === "fail") {
      reasons.push({
        ruleId: rule.id,
        message: `Rule "${rule.label}" failed. Consequence: ${rule.consequence}`,
        type: "error",
      })
    }
  }

  // 2. Identify missing evidence and contradictions
  const missingEvidenceIds = getMissingEvidence(scenario, activeEvidence, excludedEvidenceIds)
  const contradictions = getContradictions(activeEvidence, excludedEvidenceIds, ruleResults)

  for (const missingId of missingEvidenceIds) {
    reasons.push({
      evidenceId: missingId,
      message: `Critical evidence component "${missingId}" is missing or excluded.`,
      type: "warning",
    })
  }

  for (const cont of contradictions) {
    reasons.push({
      message: cont,
      type: "warning",
    })
  }

  const { confidence, coverage, consistency } = computeDecisionConfidence(
    activeEvidence,
    excludedEvidenceIds
  )

  // 4. Map rules and missing evidence to a final decision outcome
  let outcome: DecisionOutcome = "proceed"
  let status: DecisionStatus = "approved"

  // Logic map for outcome gating:
  // If any rule fails:
  //   If rule has high weight, we block. Otherwise review.
  // If critical evidence is missing:
  //   insufficient-evidence / hold
  // If consistency is too low or contradictions exist:
  //   review / hold

  const failedRules = scenario.rules.filter(r => ruleResults[r.id] === "fail")
  const hasFailedHighWeight = failedRules.some(r => r.weight >= 2)

  if (missingEvidenceIds.length > 0) {
    outcome = "insufficient-evidence"
    status = "insufficient"
  } else if (hasFailedHighWeight) {
    outcome = "reject"
    status = "blocked"
  } else if (failedRules.length > 0) {
    outcome = "review"
    status = "review"
  } else if (contradictions.length > 0) {
    outcome = "hold"
    status = "pending"
  }

  // Allow custom outcome mapping from scenario if defined
  const mappingKey = `${outcome}:${status}`
  if (scenario.outcomeMapping[mappingKey]) {
    outcome = scenario.outcomeMapping[mappingKey].outcome
    status = scenario.outcomeMapping[mappingKey].status
  }

  // 5. Build trace
  const trace = buildDecisionTrace(
    signals,
    activeEvidence,
    excludedEvidenceIds,
    scenario.rules,
    ruleResults,
    outcome
  )

  return {
    outcome,
    status,
    confidence,
    coverage,
    consistency,
    ruleResults,
    trace,
    missingEvidenceIds,
    contradictions,
    reasons,
  }
}
